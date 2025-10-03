import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Company Services
export const companyService = {
  async create(data: Omit<TablesInsert<'companies'>, 'id' | 'created_at' | 'updated_at'>) {
    const { data: company, error } = await supabase
      .from('companies')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return company;
  },

  async getByRecruiterId(recruiterId: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async update(id: string, data: TablesUpdate<'companies'>) {
    const { data: company, error } = await supabase
      .from('companies')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return company;
  }
};

// Job Posting Services
export const jobService = {
  async create(data: Omit<TablesInsert<'job_postings'>, 'id' | 'created_at' | 'updated_at'>) {
    const { data: job, error } = await supabase
      .from('job_postings')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return job;
  },

  async getAll(filters?: { location?: string; job_type?: string; search?: string }) {
    let query = supabase
      .from('job_postings')
      .select(`
        *,
        companies (
          id,
          name,
          logo_url,
          location,
          industry
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters?.job_type) {
      query = query.eq('job_type', filters.job_type as any);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getByRecruiterId(recruiterId: string) {
    const { data, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        companies (
          id,
          name,
          logo_url
        )
      `)
      .eq('recruiter_id', recruiterId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        companies (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, data: TablesUpdate<'job_postings'>) {
    const { data: job, error } = await supabase
      .from('job_postings')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return job;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Application Services
export const applicationService = {
  async create(data: Omit<TablesInsert<'applications'>, 'id' | 'applied_at' | 'updated_at'>) {
    const { data: application, error } = await supabase
      .from('applications')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return application;
  },

  async getByCandidateId(candidateId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job_postings (
          *,
          companies (*)
        )
      `)
      .eq('candidate_id', candidateId)
      .order('applied_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByJobId(jobId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        profiles:candidate_id (
          id,
          full_name,
          email,
          avatar_url,
          location
        )
      `)
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateStatus(id: string, status: Tables<'applications'>['status']) {
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async checkExisting(jobId: string, candidateId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('candidate_id', candidateId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }
};

// Candidate Profile Services
export const candidateProfileService = {
  async create(data: Omit<TablesInsert<'candidate_profiles'>, 'id' | 'created_at' | 'updated_at'>) {
    const { data: profile, error } = await supabase
      .from('candidate_profiles')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return profile;
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async update(userId: string, data: Partial<TablesUpdate<'candidate_profiles'>>) {
    const { data: profile, error } = await supabase
      .from('candidate_profiles')
      .update(data)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return profile;
  },

  async upsert(data: TablesInsert<'candidate_profiles'>) {
    const { data: profile, error } = await supabase
      .from('candidate_profiles')
      .upsert(data)
      .select()
      .single();
    
    if (error) throw error;
    return profile;
  },

  async search(filters?: { skills?: string[]; location?: string; experience?: number }) {
    let query = supabase
      .from('candidate_profiles')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          avatar_url,
          location,
          bio
        )
      `);

    if (filters?.skills && filters.skills.length > 0) {
      query = query.contains('skills', filters.skills);
    }
    if (filters?.experience) {
      query = query.gte('experience_years', filters.experience);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
};

// Saved Jobs Services
export const savedJobsService = {
  async save(userId: string, jobId: string) {
    const { data, error } = await supabase
      .from('saved_jobs')
      .insert({ user_id: userId, job_id: jobId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async unsave(userId: string, jobId: string) {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', jobId);
    
    if (error) throw error;
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        *,
        job_postings (
          *,
          companies (*)
        )
      `)
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async checkSaved(userId: string, jobId: string) {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }
};

// Saved Candidates Services
export const savedCandidatesService = {
  async save(recruiterId: string, candidateId: string, notes?: string) {
    const { data, error } = await supabase
      .from('saved_candidates')
      .insert({ 
        recruiter_id: recruiterId, 
        candidate_id: candidateId,
        notes 
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async unsave(recruiterId: string, candidateId: string) {
    const { error } = await supabase
      .from('saved_candidates')
      .delete()
      .eq('recruiter_id', recruiterId)
      .eq('candidate_id', candidateId);
    
    if (error) throw error;
  },

  async getByRecruiterId(recruiterId: string) {
    const { data, error } = await supabase
      .from('saved_candidates')
      .select(`
        *,
        profiles:candidate_id (
          id,
          full_name,
          email,
          avatar_url,
          location,
          bio
        ),
        candidate_profiles:candidate_id (
          skills,
          experience_years,
          education,
          portfolio_url,
          linkedin_url
        )
      `)
      .eq('recruiter_id', recruiterId)
      .order('saved_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateNotes(recruiterId: string, candidateId: string, notes: string) {
    const { data, error } = await supabase
      .from('saved_candidates')
      .update({ notes })
      .eq('recruiter_id', recruiterId)
      .eq('candidate_id', candidateId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Profile Services (for the main profiles table)
export const profileService = {
  async updateProfile(userId: string, data: Partial<TablesUpdate<'profiles'>>) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return profile;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Storage Services
export const storageService = {
  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    return publicUrl;
  },

  async uploadResume(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);
    
    return publicUrl;
  },

  async uploadCompanyLogo(companyId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${companyId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('company-logos')
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('company-logos')
      .getPublicUrl(fileName);
    
    return publicUrl;
  }
};