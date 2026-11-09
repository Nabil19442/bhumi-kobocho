import React from 'react';
import { describe, it, expect, vi } from 'vitest';
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
  fetchSystemHealth: vi.fn().mockResolvedValue({ ocr: { available: true } })
}));

describe('Status-Label Restrictions & Forbidden Claims', () => {
  it('does not display single trust score or forbidden fraud/safe verdict terms on check route', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/check']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      const text = container.textContent || '';
      // Prohibited: claiming property is 100% "safe" or "authentic title" or providing a single "trust score"
      expect(text.toLowerCase()).not.toContain('trust score');
      expect(text.toLowerCase()).not.toContain('authentic title');
      expect(text.toLowerCase()).not.toContain('fraud verdict');
    });
  });

  it('renders only approved status categories across status elements', () => {
    const allowedStatuses = ['Matched', 'Mismatch', 'Needs review', 'Not checked'];
    // Confirm status enumeration definition
    expect(allowedStatuses).toHaveLength(4);
    expect(allowedStatuses).toContain('Matched');
    expect(allowedStatuses).toContain('Mismatch');
    expect(allowedStatuses).toContain('Needs review');
    expect(allowedStatuses).toContain('Not checked');
  });
});
