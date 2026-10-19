export type ProblemCategory =
  | "Leaking pipe"
  | "Clogged drain"
  | "Damaged electrical socket"
  | "Flat tire"
  | "Overheating engine";

export type RiskLevel = "Low" | "Medium" | "High";

export interface DiagnosisRecord {
  id: string;
  image_url: string;
  category: ProblemCategory;
  cause: string;
  risk_level: RiskLevel;
  recommended_action: string;
  is_diy: boolean;
  professional_required: boolean;
  safety_warning?: string | null;
  instructions: string[];
  created_at: string;
}

export interface DiagnosisStats {
  total_diagnoses: number;
  diy_eligible: number;
  professional_required: number;
  high_risk_alerts: number;
  category_breakdown: Record<string, number>;
}

export interface CategoryMeta {
  id: ProblemCategory;
  name: string;
  domain: "Plumbing" | "Electrical" | "Automotive";
  typical_diy: boolean;
  badge_color: string;
  description: string;
}

export interface SampleProblem {
  id: string;
  title: string;
  category: ProblemCategory;
  thumbnail: string;
  description: string;
  expected_type: "DIY" | "Professional";
}
