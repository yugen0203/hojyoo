-- company_profiles
CREATE TABLE company_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  business_type text NOT NULL CHECK (business_type IN ('individual', 'corporation')),
  company_name text NOT NULL,
  registered_address text,
  industry text NOT NULL,
  business_description text NOT NULL,
  employee_count integer NOT NULL,
  capital bigint,
  established_at date,
  annual_revenue_range text,
  business_area text,
  challenges text,
  target_items text,
  business_plan text,
  website_url text,
  contact_name text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- subsidies
CREATE TABLE subsidies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  authority text NOT NULL,
  max_amount bigint,
  subsidy_rate text,
  status text,
  next_recruitment_date date,
  recommended_expenses text[],
  official_url text,
  template_urls text[],
  region text,
  industry_codes text[],
  last_updated timestamptz DEFAULT now()
);

-- subsidy_searches
CREATE TABLE subsidy_searches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_profile_id uuid REFERENCES company_profiles(id) ON DELETE CASCADE,
  searched_at timestamptz DEFAULT now(),
  results jsonb NOT NULL
);

-- favorites
CREATE TABLE favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subsidy_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, (subsidy_data->>'name'))
);

-- applications
CREATE TABLE applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subsidy_name text NOT NULL,
  company_profile_id uuid REFERENCES company_profiles(id),
  status text DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'cancelled', 'failed')),
  zip_storage_path text,
  zip_expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- document_sessions
CREATE TABLE document_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  estimated_minutes integer DEFAULT 3,
  progress_pct integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- RLS有効化
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidy_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sessions ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（company_profiles）
CREATE POLICY "Users can manage own profiles" ON company_profiles
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- RLSポリシー（subsidies - 全ユーザー読み取り可）
CREATE POLICY "Anyone can read subsidies" ON subsidies
  FOR SELECT USING (true);

-- RLSポリシー（favorites）
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- RLSポリシー（applications）
CREATE POLICY "Users can manage own applications" ON applications
  FOR ALL USING (auth.uid() = user_id);

-- RLSポリシー（document_sessions）
CREATE POLICY "Users can read own document sessions" ON document_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM applications a WHERE a.id = application_id AND a.user_id = auth.uid())
  );
