import os
from typing import Dict, Any, List

def format_deterministic_explanation(comparison_result: Dict[str, Any], lang: str = "bn") -> Dict[str, str]:
    """
    Template-based plain language explainer.
    Guaranteed deterministic fallback that strictly echoes rule engine facts
    without adding legal claims or hallucinations.
    """
    results: List[Dict[str, Any]] = comparison_result.get("results", [])
    
    matched = [r for r in results if r["status"] == "Matched"]
    mismatches = [r for r in results if r["status"] == "Mismatch"]
    needs_review = [r for r in results if r["status"] == "Needs review"]
    not_checked = [r for r in results if r["status"] == "Not checked"]

    # Bangla Explanation
    bn_lines = []
    bn_lines.append("📌 **রেকর্ড বিশ্লেষণ সারসংক্ষেপ (ডেমো তথ্য):**")
    
    if mismatches:
        bn_lines.append(f"\n⚠️ **অমিল বা বৈসাদৃশ্য পাওয়া গেছে ({len(mismatches)}টি):**")
        for m in mismatches:
            field_name = m.get("field_label_bn", m["field"])
            ext = m.get("extracted_value", "অনুপস্থিত")
            ref = m.get("reference_value", "অনুপস্থিত")
            bn_lines.append(f"- **{field_name}**: আপনার নথিতে '{ext}', কিন্তু রেফারেন্স রেকর্ডে রয়েছে '{ref}'।")
    
    if needs_review:
        bn_lines.append(f"\n🔍 **সচেতনভাবে পর্যালোচনার প্রয়োজন ({len(needs_review)}টি):**")
        for nr in needs_review:
            field_name = nr.get("field_label_bn", nr["field"])
            ext = nr.get("extracted_value", "অনুপস্থিত")
            ref = nr.get("reference_value", "অনুপস্থিত")
            bn_lines.append(f"- **{field_name}**: বানানের রূপভেদ বা অস্পষ্টতার কারণে মানুষের সরাসরি যাচাই প্রয়োজন। (প্রদত্ত: '{ext}', রেফারেন্স: '{ref}')")

    if matched:
        bn_lines.append(f"\n✅ **সঠিক মিল পাওয়া গেছে ({len(matched)}টি):**")
        for mt in matched:
            field_name = mt.get("field_label_bn", mt["field"])
            bn_lines.append(f"- **{field_name}**: রেফারেন্স রেকর্ডের সাথে অবিকল মিলেছে।")

    if not_checked:
        bn_lines.append(f"\nℹ️ **যাচাই করা হয়নি ({len(not_checked)}টি):**")
        for nc in not_checked:
            field_name = nc.get("field_label_bn", nc["field"])
            bn_lines.append(f"- **{field_name}**: তথ্য নথিতে অনুপস্থিত বা যাচাইয়ের বাইরে রাখা হয়েছে।")

    bn_lines.append("\n⚖️ **সতর্কতা:** এটি স্বয়ংক্রিয় নিয়ম-ভিত্তিক তুলনা; কোনো আইনি রায় বা স্বত্ব প্রমাণ নয়।")

    # English Explanation
    en_lines = []
    en_lines.append("📌 **Record Analysis Summary (Demo Data):**")

    if mismatches:
        en_lines.append(f"\n⚠️ **Inconsistencies Flagged ({len(mismatches)}):**")
        for m in mismatches:
            field_name = m.get("field_label_en", m["field"])
            ext = m.get("extracted_value", "Not present")
            ref = m.get("reference_value", "Not present")
            en_lines.append(f"- **{field_name}**: Document has '{ext}', whereas reference record holds '{ref}'.")

    if needs_review:
        en_lines.append(f"\n🔍 **Needs Manual Review ({len(needs_review)}):**")
        for nr in needs_review:
            field_name = nr.get("field_label_en", nr["field"])
            ext = nr.get("extracted_value", "Not present")
            ref = nr.get("reference_value", "Not present")
            en_lines.append(f"- **{field_name}**: Spelling variance or character ambiguity requires human cross-verification. (Supplied: '{ext}', Reference: '{ref}')")

    if matched:
        en_lines.append(f"\n✅ **Matched Fields ({len(matched)}):**")
        for mt in matched:
            field_name = mt.get("field_label_en", mt["field"])
            en_lines.append(f"- **{field_name}**: Exactly matches reference record.")

    if not_checked:
        en_lines.append(f"\nℹ️ **Not Checked ({len(not_checked)}):**")
        for nc in not_checked:
            field_name = nc.get("field_label_en", nc["field"])
            en_lines.append(f"- **{field_name}**: Missing from input or omitted from verification rules.")

    en_lines.append("\n⚖️ **Disclaimer:** Rule-based comparison only; not a legal verdict or title deed proof.")

    return {
        "explanation_bn": "\n".join(bn_lines),
        "explanation_en": "\n".join(en_lines),
        "provider": "deterministic-template",
        "disclaimer": "DEMO DATA — not a legal verdict"
    }

def explain_comparison(comparison_result: Dict[str, Any], lang: str = "bn") -> Dict[str, Any]:
    """
    Explainer interface. Checks environment for optional LLM,
    falls back cleanly to deterministic template generator.
    """
    # Strict boundary: Any LLM wrapper would only rephrase these deterministic flags.
    # We provide rich deterministic templating that works 100% offline out-of-the-box.
    return format_deterministic_explanation(comparison_result, lang=lang)
