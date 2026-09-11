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

export async function retryAlertAutomation(alertId) {
  const res = await fetch(`${API_BASE_URL}/api/safety/alerts/${alertId}/retry-automation`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to retry automation (HTTP ${res.status})`);
  }
  return await res.json();
}

// =====================================================================
// Milestone 3: Compliance Intelligence API Helpers
// =====================================================================

export async function uploadComplianceDocument(file, projectId = "PRJ-101", documentCategory = "site_safety_plan") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("project_id", projectId);
  formData.append("document_category", documentCategory);

  const res = await fetch(`${API_BASE_URL}/api/compliance/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Upload failed with HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchComplianceDocuments(projectId = "PRJ-101", category = null) {
  const params = new URLSearchParams({ project_id: projectId });
  if (category) params.append("category", category);

  const res = await fetch(`${API_BASE_URL}/api/compliance/documents?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch compliance documents (HTTP ${res.status})`);
  return await res.json();
}

export async function fetchComplianceDocumentDetails(docId) {
  const res = await fetch(`${API_BASE_URL}/api/compliance/documents/${docId}`);
  if (!res.ok) throw new Error(`Failed to fetch document details (HTTP ${res.status})`);
  return await res.json();
}

export async function deleteComplianceDocument(docId) {
  const res = await fetch(`${API_BASE_URL}/api/compliance/documents/${docId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete document (HTTP ${res.status})`);
  return await res.json();
}

export async function fetchRegulatoryRules(category = null) {
  const params = new URLSearchParams();
  if (category) params.append("category", category);

  const res = await fetch(`${API_BASE_URL}/api/compliance/regulations?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch regulatory rules (HTTP ${res.status})`);
  return await res.json();
}

export async function fetchComplianceEvaluations(projectId = "PRJ-101", status = null, docId = null) {
  const params = new URLSearchParams({ project_id: projectId });
  if (status) params.append("status", status);
  if (docId) params.append("doc_id", docId);

  const res = await fetch(`${API_BASE_URL}/api/compliance/evaluations?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch compliance evaluations (HTTP ${res.status})`);
  return await res.json();
}

export async function reviewComplianceEvaluation(evalId, reviewedBy = "Safety Supervisor", statusOverride = null, reviewNotes = "") {
  const res = await fetch(`${API_BASE_URL}/api/compliance/evaluations/${evalId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reviewed_by: reviewedBy,
      status_override: statusOverride,
      review_notes: reviewNotes,
    }),
  });
  if (!res.ok) throw new Error(`Failed to submit compliance review (HTTP ${res.status})`);
  return await res.json();
}

export async function fetchInspectionSchedules(projectId = "PRJ-101") {
  const res = await fetch(`${API_BASE_URL}/api/compliance/schedules?project_id=${projectId}`);
  if (!res.ok) throw new Error(`Failed to fetch inspection schedules (HTTP ${res.status})`);
  return await res.json();
}

export async function createInspectionSchedule(scheduleData) {
  const res = await fetch(`${API_BASE_URL}/api/compliance/schedules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scheduleData),
  });
  if (!res.ok) throw new Error(`Failed to create inspection schedule (HTTP ${res.status})`);
  return await res.json();
}

export async function fetchComplianceReport(projectId = "PRJ-101") {
  const res = await fetch(`${API_BASE_URL}/api/compliance/report?project_id=${projectId}`);
  if (!res.ok) throw new Error(`Failed to fetch compliance report (HTTP ${res.status})`);
  return await res.json();
}

// =====================================================================
// Milestone 3: Insurance & Claim Intelligence API Helpers
// =====================================================================

export async function fetchInsuranceExposureSummary(projectId = "PRJ-101") {
  const res = await fetch(`${API_BASE_URL}/api/insurance/exposure-summary?project_id=${projectId}`);
  if (!res.ok) throw new Error(`Failed to fetch insurance exposure summary (HTTP ${res.status})`);
  return await res.json();
}

export async function fetchInsuranceClaims(projectId = "PRJ-101", decisionStatus = null) {
  const params = new URLSearchParams({ project_id: projectId });
  if (decisionStatus) params.append("decision_status", decisionStatus);

  const res = await fetch(`${API_BASE_URL}/api/insurance/claims?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch insurance claims (HTTP ${res.status})`);
  return await res.json();
}

export async function fetchClaimAssessmentForIncident(violationId) {
  const res = await fetch(`${API_BASE_URL}/api/insurance/claims/${violationId}/assessment`);
  if (!res.ok) throw new Error(`Failed to fetch claim assessment (HTTP ${res.status})`);
  return await res.json();
}

export async function submitClaimHumanReview(assessmentId, reviewedBy = "Senior Safety Supervisor", decisionStatus = "APPROVED_FOR_FILING", supervisorNotes = "", legalCounselSignOff = false) {
  const res = await fetch(`${API_BASE_URL}/api/insurance/claims/${assessmentId}/human-review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reviewed_by: reviewedBy,
      decision_status: decisionStatus,
      supervisor_notes: supervisorNotes,
      legal_counsel_sign_off: legalCounselSignOff,
    }),
  });
  if (!res.ok) throw new Error(`Failed to submit claim review (HTTP ${res.status})`);
  return await res.json();
}

