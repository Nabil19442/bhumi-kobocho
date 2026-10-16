const API_BASE = "http://127.0.0.1:8000/api";

export class ApiError extends Error {
  constructor(message, status = null, isOffline = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isOffline = isOffline;
  }
}

async function request(endpoint, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, options);
  } catch (err) {
    throw new ApiError(
      "Backend offline. Please ensure the backend server is running on http://127.0.0.1:8000.",
      null,
      true
    );
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
    throw new ApiError(errorDetail, res.status, false);
  }

  return res.json();
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

export async function fetchRecordQr(recordId) {
  return request(`/integrity/qr/${recordId}`);
}

export async function fetchSimulationEvents() {
  return request("/guardian/events");
}

export async function triggerSimulationApi(eventId) {
  return request(`/guardian/simulate/${eventId}`, {
    method: "POST",
  });
}

export async function fetchGuardianAlerts() {
  return request("/guardian/alerts");
}

export async function markAlertReviewedApi(alertId) {
  return request(`/guardian/alerts/${alertId}/review`, {
    method: "POST",
  });
}

