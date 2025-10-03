import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Briefcase, Users, TrendingUp, Target, Star, MessageSquare, Heart, Camera, Eye, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBackendReady } from '@/hooks/useBackendReady';
import { candidateProfileService, applicationService, savedJobsService } from '@/services/database';

export const Dashboard = () => {
  const { user, profile } = useAuth();
  const { isBackendReady } = useBackendReady();
  
  const [stats, setStats] = useState({
    applications: 0,
    connections: 0,
    profileViews: 0,
    savedJobs: 0
  });
  
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [personalProfileProgress, setPersonalProfileProgress] = useState(0);
  const [professionalProfileProgress, setProfessionalProfileProgress] = useState(0);
  
  useEffect(() => {
    if (user?.id && isBackendReady) {
      loadDashboardData();
    }
  }, [user, isBackendReady]);
  
  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      // Load candidate profile
      const candidateData = await candidateProfileService.getByUserId(user.id);
      setCandidateProfile(candidateData);
      
      // Calculate profile completion based on actual data
      if (candidateData) {
        // Personal profile progress (8 fields, each worth ~12.5%)
        let personalScore = 0;
        const personalFields = [
          { check: candidateData.photos?.length > 0, weight: 15 },
          { check: candidateData.interests?.length > 0, weight: 15 },
          { check: candidateData.availability?.length > 0, weight: 15 },
          { check: candidateData.transportation, weight: 10 },
          { check: candidateData.hobbies?.length > 0, weight: 15 },
          { check: candidateData.quick_facts?.length > 0, weight: 10 },
          { check: Array.isArray(candidateData.prompts) && candidateData.prompts.length > 0, weight: 15 },
          { check: profile?.location, weight: 5 }
        ];
        
        personalFields.forEach(field => {
          if (field.check) personalScore += field.weight;
        });
        setPersonalProfileProgress(Math.min(personalScore, 100));
        
        // Professional profile progress (7 fields)  
        let professionalScore = 0;
        const professionalFields = [
          { check: candidateData.skills?.length > 0, weight: 20 },
          { check: (Array.isArray(candidateData.experience) && candidateData.experience.length > 0) || candidateData.experience_years > 0, weight: 20 },
          { check: candidateData.education, weight: 15 },
          { check: candidateData.resume_url, weight: 15 },
          { check: candidateData.portfolio_url, weight: 10 },
          { check: candidateData.linkedin_url, weight: 10 },
          { check: candidateData.achievements, weight: 10 }
        ];
        
        professionalFields.forEach(field => {
          if (field.check) professionalScore += field.weight;
        });
        setProfessionalProfileProgress(Math.min(professionalScore, 100));
      }
      
      // Load stats
      const [applications, savedJobs] = await Promise.all([
        applicationService.getByCandidateId(user.id),
        savedJobsService.getByUserId(user.id)
      ]);
      
      setStats({
        applications: applications.length,
        connections: 0,
        profileViews: 0,
        savedJobs: savedJobs.length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };
  
  const statsDisplay = [
    { label: 'Applications', value: stats.applications, icon: Briefcase, change: 'Total sent' },
    { label: 'Connections', value: stats.connections, icon: Users, change: 'Your network' },
    { label: 'Profile Views', value: stats.profileViews, icon: TrendingUp, change: 'This month' },
    { label: 'Saved Jobs', value: stats.savedJobs, icon: Star, change: 'Bookmarked' },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-start"
        >
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Welcome back{profile?.full_name ? <>, <span className="text-gradient">{profile.full_name}</span></> : ''}! 👋
            </h1>
            <p className="text-muted-foreground">Here's what's happening with your job search today.</p>
          </div>
          <Link to="/profile/view">
            <Button variant="outline" className="hover:bg-primary/10">
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </Button>
          </Link>
        </motion.div>

        {/* Profile Completion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass hover-lift">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Personal Profile
                    </CardTitle>
                    <CardDescription>Let people know the real you</CardDescription>
                  </div>
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={personalProfileProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {personalProfileProgress === 100 
                      ? 'Your personal profile is complete!' 
                      : 'Add photos, interests, and personality'}
                  </p>
                  {personalProfileProgress < 100 && (
                    <Link to="/profile/personal">
                      <Button variant="hero" className="w-full">
                        Complete Personal Profile
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass hover-lift">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Professional Profile
                    </CardTitle>
                    <CardDescription>Showcase your skills & experience</CardDescription>
                  </div>
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={professionalProfileProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {professionalProfileProgress === 100 
                      ? 'Your professional profile is complete!' 
                      : 'Add experience, skills, and resume'}
                  </p>
                  {professionalProfileProgress < 100 && (
                    <Link to="/profile/professional">
                      <Button variant="secondary" className="w-full">
                        Complete Professional Profile
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsDisplay.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="glass hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">{stat.change}</span>
                  </div>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest updates and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.applications > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{stats.applications} job applications sent</p>
                          <p className="text-xs text-muted-foreground">Keep up the momentum!</p>
                        </div>
                      </div>
                      {stats.savedJobs > 0 && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{stats.savedJobs} jobs saved</p>
                            <p className="text-xs text-muted-foreground">Ready to apply when you are</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activity yet. Start exploring jobs!</p>
                  )}
                </div>
                <Link to="/applications">
                  <Button variant="ghost" className="w-full mt-4">
                    View All Activity
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recommended Jobs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle>Recommended Jobs 🚀</CardTitle>
                <CardDescription>Top opportunities for you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Complete your profile to get personalized job recommendations!
                  </p>
                  <div className="space-y-2">
                    {personalProfileProgress < 100 && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span>Complete your personal profile</span>
                      </div>
                    )}
                    {professionalProfileProgress < 100 && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span>Add your professional experience</span>
                      </div>
                    )}
                    {personalProfileProgress === 100 && professionalProfileProgress === 100 && (
                      <div className="flex items-center gap-2 text-xs text-success">
                        <div className="w-2 h-2 rounded-full bg-success"></div>
                        <span>Your profile is complete!</span>
                      </div>
                    )}
                  </div>
                </div>
                <Link to="/jobs">
                  <Button variant="hero" className="w-full mt-4">
                    Explore Jobs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/jobs">
                  <Button variant="glass" className="w-full flex flex-col h-auto py-4">
                    <Target className="h-6 w-6 mb-2" />
                    <span>Find Jobs</span>
                  </Button>
                </Link>
                <Link to="/applications">
                  <Button variant="glass" className="w-full flex flex-col h-auto py-4">
                    <Briefcase className="h-6 w-6 mb-2" />
                    <span>Applications</span>
                  </Button>
                </Link>
                <Link to="/profile/view">
                  <Button variant="glass" className="w-full flex flex-col h-auto py-4">
                    <Star className="h-6 w-6 mb-2" />
                    <span>View Profile</span>
                  </Button>
                </Link>
                <Link to="/messages">
                  <Button variant="glass" className="w-full flex flex-col h-auto py-4">
                    <MessageSquare className="h-6 w-6 mb-2" />
                    <span>Messages</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};