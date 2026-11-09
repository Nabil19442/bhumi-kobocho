import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

vi.mock('../api', () => ({
  fetchRecords: vi.fn().mockResolvedValue({ records: [] }),
  fetchPlotPassport: vi.fn().mockResolvedValue({
    parcel: { parcel_id: 'PCL-DHK-SAV-045-0558', mouza: 'সাভার', dag_no: '558', khatian_no: '128' },
    ownership_history: [],
    timeline: [],
    conflict_analysis: { status: 'Needs review' },
    risk_summary: { flag_count: 0 }
  }),
  fetchGuardianAlerts: vi.fn().mockResolvedValue({ alerts: [] }),
  fetchSimulationEvents: vi.fn().mockResolvedValue({ events: [] }),
  fetchGuardianRiskReport: vi.fn().mockResolvedValue({
    risk_status: 'No Conflict Found in Available Records',
    evidence_trail: []
  }),
  fetchLandPriceModelInfo: vi.fn().mockResolvedValue({
    model_type: 'HistGradientBoostingRegressor',
    features: [],
    test_r2: 0.97
  }),
  fetchDevDeeds: vi.fn().mockResolvedValue({ deeds: [] }),
  fetchSystemHealth: vi.fn().mockResolvedValue({ ocr: { available: true } }),
  fetchRecordVerification: vi.fn().mockResolvedValue({
    record_id: 'rec-demo-001',
    hash: 'dummyhash',
    canonical_url: 'http://localhost/verify/rec-demo-001'
  }),
  fetchRecordQr: vi.fn().mockResolvedValue({ qr_base64: 'data:image/png;base64,123' }),
  checkIntegrityApi: vi.fn().mockResolvedValue({ status: 'Matched' })
}));

describe('Banner Presence Across Routes', () => {
  const routesToTest = [
    '/',
    '/check',
    '/passport/PCL-DHK-SAV-045-0558',
    '/guardian',
    '/compare',
    '/history',
    '/integrity',
    '/landprice',
    '/overview'
  ];

  for (const route of routesToTest) {
    it(`renders demo banner on route ${route}`, async () => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        // Banner text must appear (either Bengali or English version)
        const bannerMatches = screen.getAllByText((content, element) => {
          return (
            content.includes('ডেমো তথ্য') ||
            content.includes('DEMO DATA') ||
            content.includes('কোনো আইনি সিদ্ধান্ত') ||
            content.includes('not a legal verdict')
          );
        });
        expect(bannerMatches.length).toBeGreaterThan(0);
      });
    });
  }
});
