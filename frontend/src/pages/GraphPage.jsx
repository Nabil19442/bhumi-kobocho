import React, { useState, useEffect } from 'react';
import { 
  Network, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  Filter, 
  Info,
  ExternalLink,
  RefreshCw,
  Eye
} from 'lucide-react';
import { fetchRecordGraph, fetchRecords } from '../api';

export default function GraphPage({ lang = 'bn', initialRecordId = null, onNavigatePassport }) {
  const isBn = lang === 'bn';

  const [graphData, setGraphData] = useState(null);
  const [selectedRecordId, setSelectedRecordId] = useState(initialRecordId || '');
  const [selectedNode, setSelectedNode] = useState(null);
  const [allRecords, setAllRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load records for dropdown
  useEffect(() => {
    fetchRecords()
      .then((res) => {
        if (res && res.records) {
          setAllRecords(res.records);
        }
      })
      .catch((err) => console.error('Failed to load records for graph filter', err));
  }, []);

  // Fetch graph data
  const loadGraph = async (recId = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRecordGraph(recId || null);
      setGraphData(data);
      // Auto-select first record node or focused node
      if (data && data.nodes && data.nodes.length > 0) {
        const defaultNode = recId 
          ? data.nodes.find((n) => n.id === recId) || data.nodes[0]
          : data.nodes[0];
        setSelectedNode(defaultNode);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load relationship graph');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGraph(selectedRecordId);
  }, [selectedRecordId]);

  const handleSelectFilter = (id) => {
    setSelectedRecordId(id);
  };

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];
  const findings = graphData?.findings || [];
  const summary = graphData?.summary || { total_nodes: 0, total_edges: 0, missing_references_count: 0 };

  return (
    <div className="app-viewport">
      {/* Page Header */}
      <div className="page-header-block" style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            background: 'var(--accent-tint)',
            color: 'var(--primary-accent)',
            padding: '8px',
            borderRadius: 'var(--radius-std)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Network size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-heading)',
                margin: 0
              }}>
                {isBn ? 'জমির রেকর্ড সম্পর্ক গ্রাফ' : 'Land Record Relationship Graph'}
              </h1>
              <span className="demo-badge">
                {isBn ? 'স্বয়ংক্রিয় রেফারেন্স নিরীক্ষা' : 'Automated Reference Audit'}
              </span>
            </div>
            <p style={{
              fontSize: '0.92rem',
              color: 'var(--text-body)',
              marginTop: '4px',
              marginBottom: 0
            }}>
              {isBn 
                ? 'দলিল ও খতিয়ানের বায়া উদ্ধৃতি, মিউটেশন ও রেফারেন্স শৃঙ্খলের স্পষ্ট দৃশ্যমান সম্পর্ক মানচিত্র।' 
                : 'Deterministic title chain visualization connecting prior deeds, parent khatians, and simulated alerts.'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter / Focus Control Bar */}
      <div style={{
        background: 'var(--paper)',
        border: '1px solid #CAD7CF',
        borderRadius: 'var(--radius-std)',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
            <Filter size={16} color="var(--primary-accent)" />
            <span>{isBn ? 'গ্রাফ প্রদর্শন মোড:' : 'Graph Scope:'}</span>
          </div>

          <button
            type="button"
            className={`btn-subtle ${selectedRecordId === '' ? 'active' : ''}`}
            onClick={() => handleSelectFilter('')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: selectedRecordId === '' ? 'var(--primary-accent)' : '#EAEFE9',
              color: selectedRecordId === '' ? '#FFFFFF' : 'var(--text-main)',
              border: 'none'
            }}
          >
            {isBn ? 'সকল রেকর্ড (পূর্ণাঙ্গ গ্রাফ)' : 'All Records (Full Graph)'}
          </button>

          {allRecords.map((r) => {
            const isSelected = selectedRecordId === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectFilter(r.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: isSelected ? 'var(--primary-accent)' : '#EAEFE9',
                  color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                  border: 'none'
                }}
              >
                {r.id} ({r.mouza?.split('(')[0]?.trim() || r.id})
              </button>
            );
          })}
        </div>

        {/* Quick Summary Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
          <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7', fontWeight: 700 }}>
            {summary.status_counts?.Matched || 0} {isBn ? 'সংযুক্ত' : 'Resolved'}
          </span>
          <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#FEF9E7', color: '#B78103', border: '1px solid #F9E79F', fontWeight: 700 }}>
            {summary.missing_references_count || 0} {isBn ? 'অনুপস্থিত বায়া' : 'Missing Ref'}
          </span>
        </div>
      </div>

      {/* Main Content Grid: Graph Canvas + Inspector Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(300px, 1fr)',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* LEFT COLUMN: Visual Graph Canvas & Mobile Card View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Visual Graph Container */}
          <div style={{
            background: 'var(--paper)',
            border: '1px solid #CAD7CF',
            borderRadius: 'var(--radius-std)',
            padding: '24px',
            position: 'relative',
            minHeight: '440px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                {isBn ? 'সম্পর্ক সংযোগ মানচিত্র (Visual Graph)' : 'Relationship Diagram'}
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {isBn ? 'যেকোনো নোডে ক্লিক করে বিবরণ দেখুন' : 'Click any node to inspect evidence'}
              </span>
            </div>

            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '340px', color: 'var(--text-muted)' }}>
                <RefreshCw className="spin" size={24} style={{ marginRight: '8px' }} />
                <span>{isBn ? 'গ্রাফ ডাটা লোড হচ্ছে...' : 'Loading relationship graph...'}</span>
              </div>
            ) : error ? (
              <div style={{ padding: '24px', color: '#C62828', textAlign: 'center' }}>
                <AlertTriangle size={32} style={{ margin: '0 auto 8px' }} />
                <p>{error}</p>
              </div>
            ) : (
              <div>
                {/* SVG Graph View */}
                <div style={{
                  border: '1px dashed #CAD7CF',
                  borderRadius: 'var(--radius-std)',
                  background: '#F9FBF8',
                  padding: '20px 12px',
                  marginBottom: '16px'
                }}>
                  {/* Grid of interactive Node Cards */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    justifyContent: 'center',
                    marginBottom: '24px'
                  }}>
                    {nodes.map((node) => {
                      const isSelected = selectedNode?.id === node.id;
                      const isUnresolved = node.node_type === 'unresolved_reference';
                      const isEvent = node.node_type === 'simulated_event';

                      return (
                        <div
                          key={node.id}
                          tabIndex={0}
                          role="button"
                          aria-pressed={isSelected}
                          onClick={() => setSelectedNode(node)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedNode(node);
                            }
                          }}
                          style={{
                            minWidth: '220px',
                            maxWidth: '280px',
                            padding: '14px 16px',
                            borderRadius: 'var(--radius-std)',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            background: isSelected 
                              ? (isUnresolved ? '#FFF4E5' : '#EBF3FE') 
                              : (isUnresolved ? '#FFFDF8' : '#FFFFFF'),
                            border: isSelected 
                              ? `2px solid ${isUnresolved ? '#E65100' : 'var(--primary-accent)'}`
                              : `1px solid ${isUnresolved ? '#FFB74D' : '#CAD7CF'}`,
                            boxShadow: isSelected ? '0 4px 14px rgba(39,66,160,0.18)' : '0 2px 6px rgba(0,0,0,0.04)',
                            transform: isSelected ? 'scale(1.02)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: isUnresolved ? '#E65100' : (isEvent ? '#D32F2F' : 'var(--primary-accent)')
                            }}>
                              {node.id}
                            </span>
                            {isUnresolved ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.70rem',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                background: '#FFE0B2',
                                color: '#E65100',
                                fontWeight: 700
                              }}>
                                <AlertTriangle size={10} />
                                {isBn ? 'অনুপস্থিত' : 'Missing'}
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.70rem',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                background: '#E8F5E9',
                                color: '#2E7D32',
                                fontWeight: 700
                              }}>
                                <CheckCircle2 size={10} />
                                {isBn ? 'সংরক্ষিত' : 'Verified'}
                              </span>
                            )}
                          </div>

                          <strong style={{
                            display: 'block',
                            fontSize: '0.90rem',
                            color: 'var(--text-main)',
                            marginBottom: '4px',
                            fontFamily: 'var(--font-heading)'
                          }}>
                            {node.label}
                          </strong>

                          {node.owner_name && (
                            <div style={{ fontSize: '0.80rem', color: 'var(--text-body)', marginBottom: '2px' }}>
                              {node.owner_name}
                            </div>
                          )}

                          {node.mouza && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {node.mouza}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Relationship Edges Flow Cards */}
                  <div style={{ borderTop: '1px solid #E2EAE5', paddingTop: '16px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                      {isBn ? 'সনাক্তকৃত দলিল শৃঙ্খল ও রেফারেন্স সংযোগ (Edges):' : 'Identified Relationships & Edges:'}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {edges.map((edge) => (
                        <div
                          key={edge.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-std)',
                            background: edge.is_resolved ? '#FFFFFF' : '#FFF8E1',
                            border: `1px solid ${edge.is_resolved ? '#CAD7CF' : '#FFE082'}`,
                            fontSize: '0.84rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-main)' }}>
                              {edge.source}
                            </span>
                            <ArrowRight size={14} color="var(--primary-accent)" />
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color: edge.is_resolved ? 'var(--primary-accent)' : '#E65100'
                            }}>
                              {edge.target}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontSize: '0.74rem',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontWeight: 700,
                              background: edge.is_resolved ? '#E8F5E9' : '#FEF9E7',
                              color: edge.is_resolved ? '#2E7D32' : '#B78103'
                            }}>
                              {isBn ? edge.label_bn : edge.label_en}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile / Linear Chain View */}
                <div style={{ marginTop: '16px' }}>
                  <h3 style={{ fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                    {isBn ? 'ধারাবাহিক মালিকানা শৃঙ্খল বিবরণ (Chain of Title)' : 'Sequential Title Chain Summary'}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.5, margin: 0 }}>
                    {isBn
                      ? 'বাস্তব ক্ষেত্রে প্রতিটি সাব-কবলা দলিল তার পূর্ববর্তী বায়া দলিলের উদ্ধৃতি বহন করে। বায়া দলিলের অনুপস্থিতি থাকলে তা অসম্পূর্ণ রেকর্ড শৃঙ্খল নির্দেশ করে।'
                      : 'Each Saf-Kabala deed cites its predecessor Baya deed. Missing predecessor documents indicate unindexed archive gaps.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Node Inspector & Findings Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Node Inspector Card */}
          <div style={{
            background: 'var(--paper)',
            border: '1px solid #CAD7CF',
            borderRadius: 'var(--radius-std)',
            padding: '22px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #EAEFE9', paddingBottom: '10px' }}>
              <Eye size={18} color="var(--primary-accent)" />
              <h2 style={{ fontSize: '1.02rem', margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                {isBn ? 'নোড বিবরণ ও প্রমাণপত্র (Inspector)' : 'Node Inspector & Evidence'}
              </h2>
            </div>

            {selectedNode ? (
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    ID: {selectedNode.id}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: '4px 0 6px', fontFamily: 'var(--font-heading)' }}>
                    {selectedNode.label}
                  </h3>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: selectedNode.status === 'Matched' ? '#E8F5E9' : '#FEF9E7',
                      color: selectedNode.status === 'Matched' ? '#2E7D32' : '#B78103',
                      fontWeight: 700
                    }}>
                      {selectedNode.status}
                    </span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', background: '#F1F5F0', color: 'var(--text-body)' }}>
                      {selectedNode.node_type}
                    </span>
                  </div>
                </div>

                {/* Evidence & Record Fields */}
                <div style={{
                  background: '#F9FBF8',
                  border: '1px solid #CAD7CF',
                  borderRadius: 'var(--radius-std)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.84rem',
                  marginBottom: '16px'
                }}>
                  {selectedNode.owner_name && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'মালিক:' : 'Owner:'}</span>
                      <strong style={{ color: 'var(--text-main)' }}>{selectedNode.owner_name}</strong>
                    </div>
                  )}

                  {selectedNode.deed_no && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'দলিল নং:' : 'Deed No:'}</span>
                      <strong style={{ color: 'var(--text-main)' }}>{selectedNode.deed_no}</strong>
                    </div>
                  )}

                  {selectedNode.document_date && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'রেজিস্ট্রেশন তারিখ:' : 'Date:'}</span>
                      <strong style={{ color: 'var(--text-main)' }}>{selectedNode.document_date}</strong>
                    </div>
                  )}

                  {selectedNode.khatian_no && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'খতিয়ান নং:' : 'Khatian:'}</span>
                      <strong style={{ color: 'var(--text-main)' }}>{selectedNode.khatian_no}</strong>
                    </div>
                  )}

                  {selectedNode.dag_no && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'দাগ নং:' : 'Dag No:'}</span>
                      <strong style={{ color: 'var(--text-main)' }}>{selectedNode.dag_no}</strong>
                    </div>
                  )}

                  {selectedNode.area_decimal !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'জমির পরিমাণ:' : 'Area:'}</span>
                      <strong style={{ color: 'var(--text-main)' }}>{selectedNode.area_decimal} {isBn ? 'শতাংশ' : 'dec'}</strong>
                    </div>
                  )}

                  {selectedNode.mouza && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'মৌজা:' : 'Mouza:'}</span>
                      <strong style={{ color: 'var(--text-main)' }}>{selectedNode.mouza}</strong>
                    </div>
                  )}

                  {selectedNode.reference_field && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2EAE5', paddingTop: '6px' }}>
                      <span style={{ color: '#E65100', fontWeight: 600 }}>{isBn ? 'অনুপস্থিত রেফারেন্স:' : 'Missing Ref:'}</span>
                      <strong style={{ color: '#E65100' }}>{selectedNode.reference_field}: {selectedNode.reference_value}</strong>
                    </div>
                  )}
                </div>

                {/* Passport Navigation Button */}
                {selectedNode.node_type === 'record' && (
                  <button
                    type="button"
                    onClick={() => onNavigatePassport && onNavigatePassport(selectedNode.id)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'var(--accent-tint)',
                      color: 'var(--primary-accent)',
                      border: '1px solid #C4D6F5',
                      borderRadius: 'var(--radius-std)',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{isBn ? 'এই রেকর্ডের সম্পূর্ণ পাসপোর্ট দেখুন' : 'View Full Plot Passport'}</span>
                    <ExternalLink size={14} />
                  </button>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {isBn ? 'কোনো নোড নির্বাচিত নেই।' : 'No node selected.'}
              </div>
            )}
          </div>

          {/* Deterministic Findings Panel */}
          <div style={{
            background: 'var(--paper)',
            border: '1px solid #CAD7CF',
            borderRadius: 'var(--radius-std)',
            padding: '22px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #EAEFE9', paddingBottom: '10px' }}>
              <ShieldCheck size={18} color="var(--primary-accent)" />
              <h2 style={{ fontSize: '1.02rem', margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                {isBn ? 'সম্পর্ক নিরীক্ষা সিদ্ধান্ত (Findings)' : 'Deterministic Findings'}
              </h2>
            </div>

            {findings.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {isBn ? 'এই গ্রাফে কোনো বিশেষ ফাইন্ডিং নেই।' : 'No findings for this selection.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {findings.map((finding) => {
                  const isNeedsReview = finding.status === 'Needs review';
                  return (
                    <div
                      key={finding.finding_id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-std)',
                        background: isNeedsReview ? '#FFF9E6' : '#F1F9F1',
                        border: `1px solid ${isNeedsReview ? '#FFE082' : '#C8E6C9'}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: isNeedsReview ? '#FEF9E7' : '#E8F5E9',
                          color: isNeedsReview ? '#B78103' : '#2E7D32'
                        }}>
                          {finding.status}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: 'var(--text-muted)' }}>
                          {finding.finding_id}
                        </span>
                      </div>

                      <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                        {isBn ? finding.title_bn : finding.title_en}
                      </strong>

                      <p style={{ fontSize: '0.80rem', color: 'var(--text-body)', margin: '0 0 6px', lineHeight: 1.45 }}>
                        {isBn ? finding.explanation_bn : finding.explanation_en}
                      </p>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Evidence: {finding.evidence_field} = {finding.evidence_value}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
