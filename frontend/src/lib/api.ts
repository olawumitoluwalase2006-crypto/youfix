import { DiagnosisRecord, DiagnosisStats, ProblemCategory, RiskLevel } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Upload an image file to the FastAPI backend for Gemini Vision fault diagnosis.
 */
export async function diagnoseImageFile(file: File): Promise<DiagnosisRecord> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/diagnose`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = "Failed to diagnose image.";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      errorDetail = `${response.status} ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

/**
 * Run diagnosis on a sample image URL (instant demo without file upload).
 */
export async function diagnoseSample(imageUrl: string, hintCategory?: string): Promise<DiagnosisRecord> {
  const response = await fetch(`${API_BASE_URL}/api/diagnose-sample`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: imageUrl,
      hint_category: hintCategory,
    }),
  });

  if (!response.ok) {
    let errorDetail = "Failed to diagnose sample.";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      errorDetail = `${response.status} ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

/**
 * Fetch diagnosis history from the backend.
 */
export async function getDiagnosisHistory(
  category?: string,
  riskLevel?: string,
  limit: number = 50
): Promise<DiagnosisRecord[]> {
  const params = new URLSearchParams();
  params.set("limit", limit.toString());
  if (category && category !== "All") params.set("category", category);
  if (riskLevel && riskLevel !== "All") params.set("risk_level", riskLevel);

  const url = `${API_BASE_URL}/api/history?${params.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load history (${response.status})`);
  }

  return response.json();
}

/**
 * Fetch a single diagnosis record by UUID.
 */
export async function getDiagnosisById(id: string): Promise<DiagnosisRecord> {
  const response = await fetch(`${API_BASE_URL}/api/diagnoses/${id}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch diagnosis ${id}`);
  }

  return response.json();
}

/**
 * Fetch diagnostic overview statistics.
 */
export async function getDiagnosisStats(): Promise<DiagnosisStats> {
  const response = await fetch(`${API_BASE_URL}/api/stats`, {
    method: "GET",
    headers: { "Accept": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load statistics.");
  }

  return response.json();
}

/**
 * Check backend health & connectivity.
 */
export async function checkBackendHealth(): Promise<{
  connected: boolean;
  gemini_configured?: boolean;
  supabase_configured?: boolean;
  environment?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        connected: true,
        gemini_configured: data.gemini_configured,
        supabase_configured: data.supabase_configured,
        environment: data.environment,
      };
    }
    return { connected: false };
  } catch {
    return { connected: false };
  }
}
