const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend health check failed:", err.message);
    return null;
  }
}

export async function analyzeSafetyImage(file, projectId = "PRJ-101", zoneName = "General Work Zone", cameraId = "CAM-01") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("project_id", projectId);
  formData.append("zone_name", zoneName);
  formData.append("camera_id", cameraId);

  const res = await fetch(`${API_BASE_URL}/api/safety/analyze-image`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Analysis failed with HTTP ${res.status}`);
  }

  const data = await res.json();
  // Ensure image URLs point to backend host if relative
  if (data.original_image_url && data.original_image_url.startsWith('/')) {
    data.original_image_url = `${API_BASE_URL}${data.original_image_url}`;
  }
  if (data.annotated_image_url && data.annotated_image_url.startsWith('/')) {
    data.annotated_image_url = `${API_BASE_URL}${data.annotated_image_url}`;
  }

  return data;
}

export async function fetchViolations(filters = {}) {
  const params = new URLSearchParams();
  if (filters.projectId) params.append("project_id", filters.projectId);
  if (filters.zone) params.append("zone", filters.zone);
  if (filters.severity) params.append("severity", filters.severity);
  if (filters.status) params.append("status", filters.status);
  if (filters.violationType) params.append("violation_type", filters.violationType);

  const res = await fetch(`${API_BASE_URL}/api/safety/violations?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch violations (HTTP ${res.status})`);
  const data = await res.json();

  return data.map(item => ({
    ...item,
    original_image_path: item.original_image_path?.startsWith('/') ? `${API_BASE_URL}${item.original_image_path}` : item.original_image_path,
    annotated_image_path: item.annotated_image_path?.startsWith('/') ? `${API_BASE_URL}${item.annotated_image_path}` : item.annotated_image_path,
  }));
}

export async function fetchSafetySummary(projectId = "PRJ-101") {
  const res = await fetch(`${API_BASE_URL}/api/safety/summary?project_id=${projectId}`);
  if (!res.ok) throw new Error(`Failed to fetch safety summary (HTTP ${res.status})`);
  const data = await res.json();

  if (data.recent_violations) {
    data.recent_violations = data.recent_violations.map(item => ({
      ...item,
      annotated_image_path: item.annotated_image_path?.startsWith('/') ? `${API_BASE_URL}${item.annotated_image_path}` : item.annotated_image_path,
    }));
  }

  return data;
}

export async function fetchSafetyAlerts(projectId = "PRJ-101") {
  const res = await fetch(`${API_BASE_URL}/api/safety/alerts?project_id=${projectId}`);
  if (!res.ok) throw new Error(`Failed to fetch safety alerts (HTTP ${res.status})`);
  const data = await res.json();

  return data.map(item => ({
    ...item,
    evidence_image_url: item.evidence_image_url?.startsWith('/') ? `${API_BASE_URL}${item.evidence_image_url}` : item.evidence_image_url,
  }));
}

export async function acknowledgeAlert(alertId, acknowledgedBy = "Safety Supervisor", note = "") {
  const res = await fetch(`${API_BASE_URL}/api/safety/alerts/${alertId}/acknowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ acknowledged_by: acknowledgedBy, note }),
  });
  if (!res.ok) throw new Error(`Failed to acknowledge alert (HTTP ${res.status})`);
  return await res.json();
}

export async function resolveAlert(alertId, resolvedBy = "Safety Supervisor", resolutionNote = "") {
  const res = await fetch(`${API_BASE_URL}/api/safety/alerts/${alertId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resolved_by: resolvedBy, resolution_note: resolutionNote }),
  });
  if (!res.ok) throw new Error(`Failed to resolve alert (HTTP ${res.status})`);
  return await res.json();
}
