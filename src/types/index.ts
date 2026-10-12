export type SentimentType = 'positive' | 'neutral' | 'negative';
export type SafetyRiskLevel = 'none' | 'low' | 'medium' | 'high';
export type AnalysisMethod = 'rules' | 'llm' | 'hybrid';
export type AnalysisStatus = 'general' | 'priority' | 'escalated' | 'verified' | 'noise' | 'returned';

export interface FeedbackItem {
  id: string;
  original_text: string;
  source?: string;
  product_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Analysis {
  id: string;
  feedback_id: string;
  sentiment: SentimentType;
  sentiment_confidence: number;
  defect_present: boolean;
  defect_confidence: number;
  safety_risk: SafetyRiskLevel;
  safety_confidence: number;
  components: string[];
  risk_score: number;
  rationale: string;
  ai_confidence: number;
  matched_keywords: string[];
  analysis_method: AnalysisMethod;
  status: AnalysisStatus;
  qa_decision?: string;
  qa_reason?: string;
  safety_decision?: string;
  created_at: string;
  feedback?: FeedbackItem;
}

export interface Report {
  id: string;
  name: string;
  total_items: number;
  high_risk_count: number;
  average_risk_score: number;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export interface AnalysisRequest {
  text: string;
  use_llm?: boolean;
}

export interface AnalysisResult {
  sentiment: SentimentType;
  sentiment_confidence: number;
  defect_present: boolean;
  defect_confidence: number;
  safety_risk: SafetyRiskLevel;
  safety_confidence: number;
  components: string[];
  risk_score: number;
  rationale: string;
  ai_confidence: number;
  matched_keywords: string[];
  analysis_method: AnalysisMethod;
}

export interface DashboardStats {
  total_analyses: number;
  high_risk_count: number;
  average_risk_score: number;
  recent_trend: number;
}

export interface RiskDistribution {
  risk_level: SafetyRiskLevel;
  count: number;
}

export interface ComponentBreakdown {
  component: string;
  count: number;
}
