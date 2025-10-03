import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, MapPin, Briefcase, Clock, DollarSign,
  Bookmark, Building2, Calendar, Users, 
  Filter, ArrowUpDown, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { jobService, savedJobsService, applicationService } from '@/services/database';
import type { Tables } from '@/integrations/supabase/types';

export const JobListings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [jobListings, setJobListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
    if (user?.id) {
      loadSavedJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      const jobs = await jobService.getAll(filters);
      setJobListings(jobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "Error loading jobs",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSavedJobs = async () => {
    if (!user?.id) return;
    
    try {
      const saved = await savedJobsService.getByUserId(user.id);
      setSavedJobs(saved.map(s => s.job_id));
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    }
  };

  const toggleSavedJob = async (jobId: string) => {
    if (!user?.id) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to save jobs.",
        variant: "destructive"
      });
      return;
    }

    const isCurrentlySaved = savedJobs.includes(jobId);
    const job = jobListings.find(j => j.id === jobId);
    
    try {
      if (isCurrentlySaved) {
        await savedJobsService.unsave(user.id, jobId);
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      } else {
        await savedJobsService.save(user.id, jobId);
        setSavedJobs(prev => [...prev, jobId]);
      }
      
      toast({
        title: isCurrentlySaved ? "Job removed" : "Job saved!",
        description: `${job?.title} ${isCurrentlySaved ? 'removed from' : 'added to'} your saved jobs`,
      });
    } catch (error) {
      console.error('Error toggling saved job:', error);
      toast({
        title: "Error",
        description: "Could not save job. Please try again.",
        variant: "destructive"
      });
    }
  };

  const applyToJob = async (jobId: string) => {
    if (!user?.id) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to apply for jobs.",
        variant: "destructive"
      });
      return;
    }

    const job = jobListings.find(j => j.id === jobId);
    
    try {
      // Check if already applied
      const alreadyApplied = await applicationService.checkExisting(jobId, user.id);
      if (alreadyApplied) {
        toast({
          title: "Already applied",
          description: `You have already applied for ${job?.title}`,
          variant: "destructive"
        });
        return;
      }
      
      await applicationService.create({
        job_id: jobId,
        candidate_id: user.id,
        status: 'pending'
      });
      
      toast({
        title: "Application sent!",
        description: `Your application for ${job?.title} has been submitted`,
      });
    } catch (error) {
      console.error('Error applying to job:', error);
      toast({
        title: "Error",
        description: "Could not submit application. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatSalary = (job: any) => {
    if (!job.salary_min || !job.salary_max) return 'Competitive';
    return `$${job.salary_min}-${job.salary_max}/hr`;
  };

  const getPostedTime = (createdAt?: string) => {
    if (!createdAt) return 'Recently';
    const posted = new Date(createdAt);
    const now = new Date();
    const days = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const quickFilters = ['Part-time', 'Full-time', 'Remote', 'Entry Level', 'Immediate Start'];

  const toggleQuickFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-3">
            Find Your Next <span className="text-gradient">Opportunity</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover jobs that match your skills and availability
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search job titles, companies, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-card/50 backdrop-blur border-border/50"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-12 bg-card/50">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="salary">Highest Salary</SelectItem>
                <SelectItem value="popular">Most Applied</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-12 px-6">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </motion.div>

        {/* Quick Filters */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-wrap gap-2"
        >
          {quickFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleQuickFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedFilters.includes(filter)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card/50 hover:bg-card/80 text-foreground'
              }`}
            >
              {filter}
            </button>
          ))}
        </motion.div>

        {/* Job Listings */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : jobListings.length === 0 ? (
            <Card className="glass">
              <CardContent className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No jobs available yet</p>
                <p className="text-muted-foreground">Check back later for new opportunities!</p>
              </CardContent>
            </Card>
          ) : (
            jobListings.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass hover-lift cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Job Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{job.companies?.name || 'Company'}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSavedJob(job.id);
                          }}
                          className="p-2 rounded-full hover:bg-card transition-colors"
                        >
                          <Bookmark 
                            className={`h-5 w-5 ${
                              savedJobs.includes(job.id) 
                                ? 'fill-primary text-primary' 
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Job Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location || 'Remote'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.job_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Full-time'}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatSalary(job)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {getPostedTime(job.created_at)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {job.description}
                      </p>

                      {/* Requirements */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.requirements && job.requirements.length > 0 ? (
                          <>
                            {job.requirements.slice(0, 3).map((req: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                            {job.requirements.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.requirements.length - 3} more
                              </Badge>
                            )}
                          </>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            View details for requirements
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Be the first to apply!
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // View details
                            }}
                          >
                            View Details
                          </Button>
                          <Button 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              applyToJob(job.id);
                            }}
                          >
                            Quick Apply
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
          )}
        </div>

        {/* Load More */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg">
            Load More Jobs
          </Button>
        </motion.div>
      </div>
    </div>
  );
};