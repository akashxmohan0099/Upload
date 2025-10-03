import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Building2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export const RecruiterAuth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const [isSignup, setIsSignup] = useState(mode === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: ''
  });

  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/recruiter-dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        const { error } = await signup(formData.email, formData.password, formData.name, 'recruiter');
        if (error) throw error;
        toast({
          title: "Welcome to Nexus for Recruiters! 🎯",
          description: "Start finding top talent today.",
        });
      } else {
        const { error } = await login(formData.email, formData.password);
        if (error) throw error;
        toast({
          title: "Welcome back! 👋",
          description: "Ready to find great candidates?",
        });
      }
      navigate('/recruiter-dashboard');
    } catch (error) {
      toast({
        title: "Oops! Something went wrong",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass border-white/10">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-display">
                {isSignup ? 'Recruiter Sign Up' : 'Recruiter Login'}
              </CardTitle>
              <CardDescription>
                {isSignup 
                  ? 'Join Nexus to find exceptional talent'
                  : 'Access your recruiter dashboard'
                }
              </CardDescription>
              
              {/* Job Seeker Link */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <Link to="/auth">
                  <Button variant="ghost" className="text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    Looking for a job? Click here
                  </Button>
                </Link>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required={isSignup}
                        className="glass"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Enter your company name"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        required={isSignup}
                        className="glass"
                      />
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your work email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="glass"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="glass pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : (isSignup ? 'Create Recruiter Account' : 'Sign In')}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-muted-foreground"
                >
                  {isSignup 
                    ? 'Already have a recruiter account? Sign in'
                    : "Don't have a recruiter account? Sign up"
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};