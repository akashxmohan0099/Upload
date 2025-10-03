import { useState, useEffect } from 'react';
import { companyService, jobService, applicationService } from '@/services/database';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Briefcase, Building2, TrendingUp, Plus, Search,
  Eye, Calendar, MapPin, Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { JobPostingModal } from '@/components/recruiter/JobPostingModal';
import { CandidateCard } from '@/components/recruiter/CandidateCard';

export const RecruiterDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showJobPostingModal, setShowJobPostingModal] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Load company data
      const companyData = await companyService.getByRecruiterId(user.id);
      setCompany(companyData);
      
      // Load jobs if company exists
      if (companyData) {
        const jobsData = await jobService.getByRecruiterId(user.id);
        setJobs(jobsData);
        
        // Load applications for all jobs
        if (jobsData.length > 0) {
          const allApplications = await Promise.all(
            jobsData.map(job => applicationService.getByJobId(job.id))
          );
          setApplications(allApplications.flat());
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasCompanyProfile = !!company;
  const companyName = company?.name || "";
  const companyLogo = company?.logo_url || null;

  const activeJobs = jobs.filter(job => job.is_active);
  const totalApplications = applications.length;
  const newApplications = applications.filter(app => app.status === 'pending').length;


  if (!hasCompanyProfile) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-hero pt-20 p-4">
          <div className="max-w-4xl mx-auto">
            <Card className="glass">
              <CardHeader className="text-center">
                <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-3xl">Welcome to Nexus Recruiter</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Let's set up your company profile to start hiring top talent
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                  Create your company profile to post jobs and connect with qualified candidates
                </p>
                <Link to="/company-setup">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80">
                    Set Up Company Profile
                    <Building2 className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-hero pt-20 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Company Header */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {companyLogo ? (
                  <img src={companyLogo} alt={companyName} className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold">{companyName}</h1>
                  <p className="text-muted-foreground">Recruiter Dashboard</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowJobPostingModal(true)} className="bg-gradient-to-r from-primary to-primary/80">
                  <Plus className="mr-2 h-4 w-4" />
                  Post New Job
                </Button>
                <Link to="/talent-pool">
                  <Button variant="outline">
                    <Search className="mr-2 h-4 w-4" />
                    Source Candidates
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Jobs</p>
                    <p className="text-2xl font-bold">{activeJobs.length}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Applicants</p>
                      <p className="text-2xl font-bold">{totalApplications}</p>
                    </div>
                    <Users className="h-8 w-8 text-accent" />
                  </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">New Applications</p>
                      <p className="text-2xl font-bold">{newApplications}</p>
                    </div>
                    <Eye className="h-8 w-8 text-secondary" />
                  </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Company Profile</p>
                      <p className="text-2xl font-bold">✓</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-success" />
                  </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Jobs */}
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Job Postings</CardTitle>
                <Link to="/manage-jobs">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No active jobs yet. Post your first job to start hiring!</p>
                  </div>
                ) : (
                  activeJobs.map((job) => {
                    const jobApplications = applications.filter(app => app.job_id === job.id);
                    return (
                      <div key={job.id} className="p-4 rounded-lg bg-card/50 hover:bg-card/70 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div>
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {job.job_type?.replace('_', ' ')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Posted {new Date(job.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className="gap-1">
                                <Users className="h-3 w-3" />
                                {jobApplications.length} applicants
                              </Badge>
                              {job.is_active && (
                                <Badge className="bg-success/20 text-success">Active</Badge>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Applicants
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Job Posting Modal */}
      {showJobPostingModal && (
        <JobPostingModal onClose={() => setShowJobPostingModal(false)} />
      )}
    </>
  );
};