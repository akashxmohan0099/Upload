-- Create enum for user types
CREATE TYPE public.user_type AS ENUM ('candidate', 'recruiter');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for job types
CREATE TYPE public.job_type AS ENUM ('full-time', 'part-time', 'contract', 'temporary', 'internship');

-- Create enum for application status
CREATE TYPE public.application_status AS ENUM ('pending', 'reviewing', 'shortlisted', 'rejected', 'accepted');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  user_type user_type NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  industry TEXT,
  size TEXT,
  website TEXT,
  description TEXT,
  location TEXT,
  founded_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create job_postings table
CREATE TABLE public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies ON DELETE CASCADE NOT NULL,
  recruiter_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  responsibilities TEXT[],
  job_type job_type NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  location TEXT NOT NULL,
  remote_allowed BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create candidate_profiles table
CREATE TABLE public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  skills TEXT[],
  experience_years INTEGER,
  education TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  availability TEXT[],
  interests TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.job_postings ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  cover_letter TEXT,
  resume_url TEXT,
  status application_status DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- Create saved_jobs table
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.job_postings ON DELETE CASCADE NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Create saved_candidates table
CREATE TABLE public.saved_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  notes TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recruiter_id, candidate_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_candidates ENABLE ROW LEVEL SECURITY;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'candidate')
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidate_profiles_updated_at BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for companies
CREATE POLICY "Companies are viewable by everyone"
  ON public.companies FOR SELECT
  USING (true);

CREATE POLICY "Recruiters can insert own company"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can update own company"
  ON public.companies FOR UPDATE
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can delete own company"
  ON public.companies FOR DELETE
  USING (auth.uid() = recruiter_id);

-- RLS Policies for job_postings
CREATE POLICY "Job postings are viewable by everyone"
  ON public.job_postings FOR SELECT
  USING (true);

CREATE POLICY "Recruiters can insert job postings"
  ON public.job_postings FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can update own job postings"
  ON public.job_postings FOR UPDATE
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can delete own job postings"
  ON public.job_postings FOR DELETE
  USING (auth.uid() = recruiter_id);

-- RLS Policies for candidate_profiles
CREATE POLICY "Candidate profiles are viewable by everyone"
  ON public.candidate_profiles FOR SELECT
  USING (true);

CREATE POLICY "Candidates can insert own profile"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Candidates can update own profile"
  ON public.candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Candidates can delete own profile"
  ON public.candidate_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for applications
CREATE POLICY "Candidates can view own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = candidate_id);

CREATE POLICY "Recruiters can view applications for their jobs"
  ON public.applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.job_postings
    WHERE job_postings.id = applications.job_id
    AND job_postings.recruiter_id = auth.uid()
  ));

CREATE POLICY "Candidates can create applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can update own applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = candidate_id);

CREATE POLICY "Recruiters can update applications for their jobs"
  ON public.applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.job_postings
    WHERE job_postings.id = applications.job_id
    AND job_postings.recruiter_id = auth.uid()
  ));

-- RLS Policies for saved_jobs
CREATE POLICY "Users can view own saved jobs"
  ON public.saved_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save jobs"
  ON public.saved_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved jobs"
  ON public.saved_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for saved_candidates
CREATE POLICY "Recruiters can view own saved candidates"
  ON public.saved_candidates FOR SELECT
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can save candidates"
  ON public.saved_candidates FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can update own saved candidates"
  ON public.saved_candidates FOR UPDATE
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can delete own saved candidates"
  ON public.saved_candidates FOR DELETE
  USING (auth.uid() = recruiter_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('resumes', 'resumes', false),
  ('company-logos', 'company-logos', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for resumes
CREATE POLICY "Users can view own resumes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Recruiters can view candidate resumes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'recruiter'
  ));

CREATE POLICY "Users can upload own resume"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own resume"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own resume"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for company logos
CREATE POLICY "Company logos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

CREATE POLICY "Recruiters can upload company logo"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'company-logos' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'recruiter'
  ));

CREATE POLICY "Recruiters can update company logo"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'company-logos' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'recruiter'
  ));

CREATE POLICY "Recruiters can delete company logo"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'company-logos' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'recruiter'
  ));