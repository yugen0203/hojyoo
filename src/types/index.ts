export type BusinessType = "individual" | "corporation";

export interface CompanyProfile {
  id?: string;
  user_id?: string;
  session_id?: string;
  business_type: BusinessType;
  company_name: string;
  registered_address?: string;
  industry: string;
  business_description: string;
  employee_count: number;
  capital?: number;
  established_at?: string;
  annual_revenue_range?: string;
  business_area?: string;
  challenges?: string;
  target_items?: string;
  business_plan?: string;
  website_url?: string;
  contact_name?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export type SubsidyStatus =
  | "recruiting_1st"
  | "recruiting_2nd"
  | "not_recruiting"
  | "year_round";

export interface Subsidy {
  id: string;
  name: string;
  authority: string;
  max_amount: number | null;
  subsidy_rate: string | null;
  status: SubsidyStatus | null;
  next_recruitment_date: string | null;
  recommended_expenses: string[];
  official_url: string | null;
  template_urls?: string[];
  region?: string;
  industry_codes?: string[];
  last_updated?: string;
  match_score?: number;
  match_reason?: string;
  status_label?: string;
}

export type ApplicationStatus =
  | "generating"
  | "completed"
  | "cancelled"
  | "failed";

export interface Application {
  id: string;
  user_id?: string;
  subsidy_name: string;
  company_profile_id?: string;
  status: ApplicationStatus;
  zip_storage_path?: string;
  zip_expires_at?: string;
  created_at?: string;
}

export interface DocumentSession {
  id: string;
  application_id: string;
  estimated_minutes: number;
  progress_pct: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  subsidy_data: Subsidy;
  created_at?: string;
}

export interface SubsidySearch {
  id: string;
  company_profile_id?: string;
  searched_at?: string;
  results: Subsidy[];
}

export interface SearchResponse {
  subsidies: Subsidy[];
  error?: string;
}
