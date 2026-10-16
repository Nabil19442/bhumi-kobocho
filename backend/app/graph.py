import re
from typing import Dict, Any, List, Optional, Set

ALLOWED_STATUSES = {"Matched", "Mismatch", "Needs review", "Not checked"}

def build_relationship_graph(
    records: List[Dict[str, Any]],
    events: Optional[List[Dict[str, Any]]] = None,
    focus_record_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Constructs a deterministic, auditable relationship graph for synthetic land records.
    - Resolves explicit references (e.g. prior_deed_no, parent_khatian_no).
    - Detects missing references and emits deterministic findings.
    - Omits dummy NIDs and unnecessary personal identifiers from graph nodes.
    - If focus_record_id is provided, scopes the output to only the focused record's connected component.
    """
    if events is None:
        events = []

    # Map records by ID, deed_no, and khatian_no for deterministic lookup
    record_map: Dict[str, Dict[str, Any]] = {}
    deed_map: Dict[str, Dict[str, Any]] = {}
    khatian_map: Dict[str, List[Dict[str, Any]]] = {}

    for r in records:
        r_id = r.get("id")
        if r_id:
            record_map[r_id] = r
        deed_no = r.get("deed_no")
        if deed_no:
            deed_map[str(deed_no).strip()] = r
        khatian_no = r.get("khatian_no")
        if khatian_no:
            k_key = str(khatian_no).strip()
            khatian_map.setdefault(k_key, []).append(r)

    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    findings: List[Dict[str, Any]] = []

    # 1. Generate Record Nodes (omitting dummy NIDs for privacy & safety)
    for r in records:
        nodes.append({
            "id": r["id"],
            "node_type": "record",
            "label": f"দলিল {r.get('deed_no', 'N/A')} (দাগ {r.get('dag_no', 'N/A')})",
            "owner_name": r.get("owner_name_bn"),
            "owner_name_en": r.get("owner_name_en"),
            "dag_no": str(r.get("dag_no", "")),
            "khatian_no": str(r.get("khatian_no", "")),
            "mouza": r.get("mouza", ""),
            "area_decimal": r.get("area_decimal"),
            "document_date": r.get("document_date"),
            "deed_no": r.get("deed_no"),
            "status": "Matched",
            "is_synthetic": True,
            "disclaimer": "DEMO DATA — not a legal verdict"
        })

    # Track virtual nodes so we do not duplicate them
    unresolved_nodes_set: Set[str] = set()

    # 2. Derive Explicit Edges & Deterministic Findings
    for r in records:
        src_id = r["id"]

        # A. Prior Deed Reference (বায়া দলিল / Baya Deed)
        prior_deed = r.get("prior_deed_no")
        if prior_deed and str(prior_deed).strip():
            prior_deed_clean = str(prior_deed).strip()
            target_record = deed_map.get(prior_deed_clean)

            if target_record:
                tgt_id = target_record["id"]

                # Defined comparison conditions for reference consistency:
                # 1. If parent_record_id is declared on r, it must match target_record ID.
                # 2. If parent_khatian_no is declared on r, target_record khatian must match.
                # 3. If both have mouza, mouzas must match.
                # 4. If both have document_date, prior deed date must be chronologically <= citing deed date.
                parent_rec_id = r.get("parent_record_id")
                parent_khatian = r.get("parent_khatian_no")
                
                is_consistent = True
                inconsistency_reasons = []

                if parent_rec_id and parent_rec_id != tgt_id:
                    is_consistent = False
                    inconsistency_reasons.append(f"parent_record_id mismatch ({parent_rec_id} != {tgt_id})")

                if parent_khatian and target_record.get("khatian_no") and str(parent_khatian).strip() != str(target_record.get("khatian_no")).strip():
                    is_consistent = False
                    inconsistency_reasons.append(f"parent_khatian mismatch ({parent_khatian} != {target_record.get('khatian_no')})")

                if r.get("mouza") and target_record.get("mouza") and r.get("mouza") != target_record.get("mouza"):
                    is_consistent = False
                    inconsistency_reasons.append("mouza mismatch")

                if r.get("document_date") and target_record.get("document_date"):
                    if str(target_record.get("document_date")) > str(r.get("document_date")):
                        is_consistent = False
                        inconsistency_reasons.append("chronological order conflict")

                edge_status = "Matched" if is_consistent else "Needs review"

                edges.append({
                    "id": f"edge-{src_id}-baya-{tgt_id}",
                    "source": src_id,
                    "target": tgt_id,
                    "relationship_type": "CITES_BAYA_DEED",
                    "label_bn": "বায়া দলিল উদ্ধৃতি (সংযুক্ত)",
                    "label_en": "Cites Prior Title Deed (Resolved)",
                    "evidence_field": "prior_deed_no",
                    "evidence_value": prior_deed_clean,
                    "is_resolved": True,
                    "status": edge_status,
                    "is_synthetic": True
                })

                if is_consistent:
                    findings.append({
                        "finding_id": f"find-{src_id}-ref-consistent",
                        "source_record_id": src_id,
                        "finding_type": "REFERENCE_CONSISTENT",
                        "status": "Matched",
                        "evidence_field": "prior_deed_no",
                        "evidence_value": prior_deed_clean,
                        "explanation_bn": f"দলিল {r.get('deed_no')} এ উল্লিখিত বায়া দলিল নং {prior_deed_clean} সংরক্ষিত ডাটাবেজ রেকর্ডে ({tgt_id}) সঙ্গতিপূর্ণভাবে মিলেছে (ডেমো রেফারেন্স)।",
                        "explanation_en": f"Prior deed {prior_deed_clean} cited in deed {r.get('deed_no')} consistently matches indexed database record {tgt_id} under comparison conditions.",
                        "is_synthetic": True,
                        "disclaimer": "DEMO DATA — not a legal verdict"
                    })
                else:
                    findings.append({
                        "finding_id": f"find-{src_id}-ref-inconsistent",
                        "source_record_id": src_id,
                        "finding_type": "MISSING_REFERENCE",
                        "status": "Needs review",
                        "evidence_field": "prior_deed_no",
                        "evidence_value": prior_deed_clean,
                        "explanation_bn": f"দলিল {r.get('deed_no')} এর বায়া দলিল নং {prior_deed_clean} পাওয়া গেলেও তুলনামূলক শর্তে অসঙ্গতি রয়েছে: {', '.join(inconsistency_reasons)}।",
                        "explanation_en": f"Prior deed reference {prior_deed_clean} was found ({tgt_id}), but comparison conditions were not satisfied: {', '.join(inconsistency_reasons)}.",
                        "is_synthetic": True,
                        "disclaimer": "DEMO DATA — not a legal verdict"
                    })
            else:
                # Unresolved reference node
                slug = re.sub(r"[^\w]", "-", prior_deed_clean)
                virt_id = f"unresolved-deed-{slug}"
                if virt_id not in unresolved_nodes_set:
                    nodes.append({
                        "id": virt_id,
                        "node_type": "unresolved_reference",
                        "label": f"অনুপস্থিত বায়া দলিল: {prior_deed_clean}",
                        "reference_field": "prior_deed_no",
                        "reference_value": prior_deed_clean,
                        "status": "Needs review",
                        "is_synthetic": True,
                        "disclaimer": "DEMO DATA — not a legal verdict"
                    })
                    unresolved_nodes_set.add(virt_id)

                edges.append({
                    "id": f"edge-{src_id}-baya-missing",
                    "source": src_id,
                    "target": virt_id,
                    "relationship_type": "CITES_BAYA_DEED",
                    "label_bn": "বায়া দলিল উদ্ধৃতি (অনুপস্থিত)",
                    "label_en": "Cites Prior Title Deed (Unresolved)",
                    "evidence_field": "prior_deed_no",
                    "evidence_value": prior_deed_clean,
                    "is_resolved": False,
                    "status": "Needs review",
                    "is_synthetic": True
                })
                findings.append({
                    "finding_id": f"find-{src_id}-missing-baya",
                    "source_record_id": src_id,
                    "finding_type": "MISSING_REFERENCE",
                    "status": "Needs review",
                    "evidence_field": "prior_deed_no",
                    "evidence_value": prior_deed_clean,
                    "explanation_bn": f"দলিল {r.get('deed_no')} এ বায়া দলিল নং {prior_deed_clean} উদ্ধৃত আছে, কিন্তু সিস্টেমে এই দলিলের কোনো রেকর্ড নেই।",
                    "explanation_en": f"Deed {r.get('deed_no')} cites prior title deed {prior_deed_clean}, but no such document exists in the database.",
                    "is_synthetic": True,
                    "disclaimer": "DEMO DATA — not a legal verdict"
                })

        # B. Parent Khatian Reference (মূল/প্যারেন্ট খতিয়ান)
        parent_khatian = r.get("parent_khatian_no")
        if parent_khatian and str(parent_khatian).strip():
            pk_clean = str(parent_khatian).strip()
            
            # Resolve via explicit parent_record_id or matching khatian in same mouza
            tgt_rec = None
            parent_rec_id = r.get("parent_record_id")
            if parent_rec_id and parent_rec_id in record_map:
                cand = record_map[parent_rec_id]
                if str(cand.get("khatian_no", "")).strip() == pk_clean:
                    tgt_rec = cand
            elif pk_clean in khatian_map:
                candidates = [k for k in khatian_map[pk_clean] if k["id"] != src_id]
                if candidates and candidates[0].get("mouza") == r.get("mouza"):
                    tgt_rec = candidates[0]

            if tgt_rec:
                tgt_id = tgt_rec["id"]
                edges.append({
                    "id": f"edge-{src_id}-khatian-{tgt_id}",
                    "source": src_id,
                    "target": tgt_id,
                    "relationship_type": "MUTATED_FROM_KHATIAN",
                    "label_bn": "মূল খতিয়ান হতে নামজারি (সংযুক্ত)",
                    "label_en": "Mutated from Parent Khatian (Resolved)",
                    "evidence_field": "parent_khatian_no",
                    "evidence_value": pk_clean,
                    "is_resolved": True,
                    "status": "Matched",
                    "is_synthetic": True
                })
            else:
                slug_k = re.sub(r"[^\w]", "-", pk_clean)
                virt_k_id = f"unresolved-khatian-{slug_k}"
                if virt_k_id not in unresolved_nodes_set:
                    nodes.append({
                        "id": virt_k_id,
                        "node_type": "unresolved_reference",
                        "label": f"অনুপস্থিত মূল খতিয়ান: {pk_clean}",
                        "reference_field": "parent_khatian_no",
                        "reference_value": pk_clean,
                        "status": "Needs review",
                        "is_synthetic": True,
                        "disclaimer": "DEMO DATA — not a legal verdict"
                    })
                    unresolved_nodes_set.add(virt_k_id)

                edges.append({
                    "id": f"edge-{src_id}-khatian-missing",
                    "source": src_id,
                    "target": virt_k_id,
                    "relationship_type": "MUTATED_FROM_KHATIAN",
                    "label_bn": "মূল খতিয়ান উদ্ধৃতি (অনুপস্থিত)",
                    "label_en": "Parent Khatian Reference (Unresolved)",
                    "evidence_field": "parent_khatian_no",
                    "evidence_value": pk_clean,
                    "is_resolved": False,
                    "status": "Needs review",
                    "is_synthetic": True
                })
                findings.append({
                    "finding_id": f"find-{src_id}-missing-khatian",
                    "source_record_id": src_id,
                    "finding_type": "MISSING_REFERENCE",
                    "status": "Needs review",
                    "evidence_field": "parent_khatian_no",
                    "evidence_value": pk_clean,
                    "explanation_bn": f"রেকর্ড {src_id} এ মূল খতিয়ান নং {pk_clean} উদ্ধৃত আছে, কিন্তু সিস্টেমে এই খতিয়ানের কোনো রেকর্ড নেই।",
                    "explanation_en": f"Record {src_id} cites parent khatian {pk_clean}, but no matching khatian record exists in the database.",
                    "is_synthetic": True,
                    "disclaimer": "DEMO DATA — not a legal verdict"
                })

    # 3. Connect Simulation Events (only when explicit record_id reference exists)
    for e in events:
        target_rec_id = e.get("record_id")
        if target_rec_id and target_rec_id in record_map:
            evt_id = e["event_id"]
            nodes.append({
                "id": evt_id,
                "node_type": "simulated_event",
                "label": e.get("title_bn", "সিমুলেটেড সতর্কতা"),
                "event_type": e.get("event_type"),
                "status": "Needs review",
                "is_synthetic": True,
                "disclaimer": "DEMO DATA — not a legal verdict"
            })
            edges.append({
                "id": f"edge-{evt_id}-affects-{target_rec_id}",
                "source": evt_id,
                "target": target_rec_id,
                "relationship_type": "AFFECTED_BY_EVENT",
                "label_bn": "সিমুলেটেড সতর্কতা সংকেত",
                "label_en": "Simulated Alert Signal",
                "evidence_field": "event_id",
                "evidence_value": evt_id,
                "is_resolved": True,
                "status": "Needs review",
                "is_synthetic": True
            })

    # 4. Filter for Focused Graph (if focus_record_id provided)
    if focus_record_id:
        # Collect focus record and all directly connected neighbors (both in and out)
        connected_node_ids: Set[str] = {focus_record_id}
        focused_edges: List[Dict[str, Any]] = []

        for edge in edges:
            if edge["source"] == focus_record_id or edge["target"] == focus_record_id:
                connected_node_ids.add(edge["source"])
                connected_node_ids.add(edge["target"])
                focused_edges.append(edge)

        focused_nodes = [n for n in nodes if n["id"] in connected_node_ids]
        focused_findings = [f for f in findings if f["source_record_id"] == focus_record_id]

        final_nodes = focused_nodes
        final_edges = focused_edges
        final_findings = focused_findings
    else:
        final_nodes = nodes
        final_edges = edges
        final_findings = findings

    # 5. Calculate Status Counts adhering strictly to allowed statuses
    status_counts = {
        "Matched": sum(1 for e in final_edges if e.get("status") == "Matched"),
        "Mismatch": sum(1 for e in final_edges if e.get("status") == "Mismatch"),
        "Needs review": sum(1 for e in final_edges if e.get("status") == "Needs review"),
        "Not checked": sum(1 for e in final_edges if e.get("status") == "Not checked")
    }

    return {
        "disclaimer": "DEMO DATA — not a legal verdict",
        "focus_record_id": focus_record_id,
        "nodes": final_nodes,
        "edges": final_edges,
        "findings": final_findings,
        "summary": {
            "total_nodes": len(final_nodes),
            "total_edges": len(final_edges),
            "missing_references_count": sum(1 for f in final_findings if f["finding_type"] == "MISSING_REFERENCE"),
            "status_counts": status_counts
        }
    }
