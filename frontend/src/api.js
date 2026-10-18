/**
 * Centralized API Client for Bhumi Kobocho (ভূমি কবচ)
 * Handles communication with the FastAPI backend (Render production & local dev).
 */

const PRODUCTION_API_URL = "https://bhumi-kobocho-api.onrender.com/api";
const LOCAL_DEV_API_URL = "http://127.0.0.1:8000/api";

/**
 * Resolves the active backend API base URL with safe fallbacks:
 * 1. Explicit Vite environment variable (VITE_API_BASE_URL or VITE_API_URL).
 * 2. Localhost development fallback if running in dev mode on local browser.
 * 3. Default production Render backend: https://bhumi-kobocho-api.onrender.com/api
 */
export function getApiBaseUrl() {
  const envUrl = typeof import.meta !== "undefined" && 
    (import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL);

  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    const clean = envUrl.trim().replace(/\/+$/, "");
    return clean.endsWith("/api") ? clean : `${clean}/api`;
  }

  // Localhost development fallback if running in dev mode
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    return LOCAL_DEV_API_URL;
  }

  return PRODUCTION_API_URL;
}

export const API_BASE = getApiBaseUrl();

export class ApiError extends Error {
  constructor(message, status = null, isOffline = false, isWakingUp = false, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isOffline = isOffline;
    this.isWakingUp = isWakingUp;
    this.details = details;
  }
}

/**
 * Central request wrapper with timeout support, cold-start handling,
 * and clear user-facing error reporting.
 */
async function request(endpoint, options = {}) {
  const currentBase = getApiBaseUrl();
  const isRenderBackend = currentBase.includes("onrender.com");

  // Setup abort controller for timeout (Render cold starts may take up to 55 seconds)
  let timeoutId = null;
  const fetchOptions = { ...options };

  if (!fetchOptions.signal) {
    const controller = new AbortController();
    const timeoutMs = isRenderBackend ? 60000 : 30000;
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    fetchOptions.signal = controller.signal;
  }

  let res;
  try {
    res = await fetch(`${currentBase}${endpoint}`, fetchOptions);
  } catch (err) {
    // If local dev server failed to connect, attempt fallback to live Render backend
    if (!isRenderBackend && (err.name === 'TypeError' || String(err.message || '').toLowerCase().includes('fetch'))) {
      try {
        console.warn(`Local backend unreachable at ${currentBase}. Attempting fallback to live backend (${PRODUCTION_API_URL})...`);
        res = await fetch(`${PRODUCTION_API_URL}${endpoint}`, fetchOptions);
      } catch {
        // Fallback also failed, proceed with original error reporting
      }
    }

    if (!res) {
      if (timeoutId) clearTimeout(timeoutId);

      const isAborted = err.name === "AbortError";
      if (isRenderBackend) {
        const msg = isAborted
          ? "Render backend took longer than 60 seconds to respond. The free cloud instance is waking up from sleep. Please wait a moment and click Retry."
          : `Unable to connect to live backend (${currentBase}). The Render cloud instance may be waking up from sleep (~30-50s on free tier). Please wait a moment and click Retry.`;
        throw new ApiError(msg, null, true, true, {
          originalError: err.message,
          apiBase: currentBase,
          isAborted
        });
      } else {
        const msg = isAborted
          ? `Request timed out. Please ensure the local backend server is running on ${currentBase}.`
          : `Backend offline. Please ensure the backend server is running on ${currentBase} or check connection.`;
        throw new ApiError(msg, null, true, false, {
          originalError: err.message,
          apiBase: currentBase,
          isAborted
        });
      }
    }
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        errorDetail = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // Body not JSON
    }
    throw new ApiError(errorDetail, res.status, false, false, { apiBase: currentBase });
  }

  return res.json();
}

/**
 * Checks connectivity with the active backend server.
 * Returns { online: boolean, latencyMs?: number, isWakingUp?: boolean, data?: any, error?: Error }
 */
export async function checkBackendConnection() {
  const startTime = Date.now();
  try {
    const data = await request("/health", { method: "GET" });
    return {
      online: true,
      latencyMs: Date.now() - startTime,
      data,
      apiBase: getApiBaseUrl()
    };
  } catch (err) {
    return {
      online: false,
      error: err,
      isWakingUp: err.isWakingUp || false,
      apiBase: getApiBaseUrl()
    };
  }
}

export async function fetchHealth() {
  return request("/health");
}

export async function fetchRecords() {
  return request("/records");
}

export async function fetchRecord(recordId) {
  return request(`/records/${recordId}`);
}

export async function scanDocument(formData) {
  return request("/scan", {
    method: "POST",
    body: formData,
  });
}

export async function compareRecordsApi(payload) {
  return request("/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchPlotPassport(plotId, lang = "bn") {
  return request(`/passport/${plotId}?lang=${lang}`);
}

export async function checkIntegrityApi(formData) {
  return request("/integrity/check", {
    method: "POST",
    body: formData,
  });
}

export async function fetchRecordQr(recordId, baseUrl = null) {
  const query = baseUrl ? `?base_url=${encodeURIComponent(baseUrl)}` : '';
  return request(`/integrity/qr/${recordId}${query}`);
}

export async function fetchRecordVerification(recordId) {
  return request(`/records/verify/${recordId}`);
}

export async function fetchSimulationEvents() {
  return request("/guardian/events");
}

// Guardian API Key (demo only, protects simulated events, no real data)
const DEMO_GUARDIAN_KEY = (typeof import.meta !== "undefined" && import.meta.env?.VITE_GUARDIAN_API_KEY) || "demo-zenox-2026";

export async function triggerSimulationApi(eventId) {
  return request(`/guardian/simulate/${eventId}`, {
    method: "POST",
    headers: {
      "X-Guardian-Key": DEMO_GUARDIAN_KEY,
    },
  });
}

export async function fetchGuardianAlerts() {
  return request("/guardian/alerts");
}

export async function markAlertReviewedApi(alertId) {
  return request(`/guardian/alerts/${alertId}/review`, {
    method: "POST",
    headers: {
      "X-Guardian-Key": DEMO_GUARDIAN_KEY,
    },
  });
}

export async function fetchGuardianRiskReport(payload) {
  return request("/guardian/risk-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchRecordGraph(recordId = null) {
  const query = recordId ? `?record_id=${encodeURIComponent(recordId)}` : '';
  return request(`/records/graph${query}`);
}

export async function fetchLandPriceHealth() {
  return request("/land-price/health");
}

export async function fetchLandPriceMetadata() {
  return request("/land-price/metadata");
}

export async function fetchLandPriceModelInfo() {
  return request("/land-price/model-info");
}

export async function predictLandPriceApi(payload) {
  return request("/land-price/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchConflictScenarios() {
  return request("/history/scenarios");
}

export async function searchLandHistory(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request(`/history/search?${q}`);
}

export async function detectConflictsApi(extractedData) {
  return request("/history/detect-conflicts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(extractedData),
  });
}

export async function recordProposedPurchaseApi(purchaseData) {
  return request("/history/record-purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(purchaseData),
  });
}

export async function fetchDevDeeds() {
  return request("/dev/deeds");
}

export async function checkLandApi(data) {
  if (data instanceof FormData) {
    return request("/check-land", {
      method: "POST",
      body: data
    });
  }
  return request("/check-land", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

