import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ArrowLeft, Check, SkipForward, Upload, 
  Briefcase, GraduationCap, Award, Target, Plus, X, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const softSkills = [
  'Communication', 'Teamwork', 'Problem Solving', 'Time Management', 'Customer Service',
  'Leadership', 'Adaptability', 'Work Ethic', 'Attention to Detail', 'Flexibility',
  'Interpersonal Skills', 'Conflict Resolution', 'Active Listening', 'Patience',
  'Reliability', 'Multitasking', 'Positive Attitude', 'Quick Learning'
];

const technicalSkills = [
  'Cash Handling', 'Food Safety', 'Barista Skills', 'POS Systems', 'Inventory Management',
  'Food Preparation', 'Cleaning & Sanitation', 'Heavy Lifting', 'Driving License',
  'First Aid Certified', 'Forklift Operation', 'Basic Computer Skills',
  'Microsoft Office', 'Social Media', 'Data Entry', 'JavaScript', 'Python', 'Excel'
];

export const ProfessionalProfileFlow = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const totalSteps = 5;

  // Form state
  const [experience, setExperience] = useState<Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>>([]);
  const [education, setEducation] = useState<Array<{
    degree: string;
    school: string;
    year: string;
  }>>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSoftSkill, setCustomSoftSkill] = useState('');
  const [customTechnicalSkill, setCustomTechnicalSkill] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [portfolio, setPortfolio] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [achievements, setAchievements] = useState<string[]>([]);

  // Load existing profile data
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('candidate_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setSelectedSkills(data.skills || []);
          setPortfolio(data.portfolio_url || '');
          setLinkedIn(data.linkedin_url || '');
          
          // Parse experience from JSONB safely
          const exp = data.experience;
          if (Array.isArray(exp) && exp.length > 0) {
            setExperience(exp as Array<{
              title: string;
              company: string;
              duration: string;
              description: string;
            }>);
          }
          
          // Parse education
          if (data.education) {
            const eduLines = data.education.split('\n\n').filter((line: string) => line.trim());
            if (eduLines.length > 0) {
              const parsedEdu = eduLines.map((line: string) => {
                const parts = line.split('\n');
                return {
                  degree: parts[0] || '',
                  school: parts[1] || '',
                  year: parts[2] || ''
                };
              });
              setEducation(parsedEdu);
            }
          }
          
          // Parse achievements
          if (data.achievements) {
            const achArray = data.achievements.split(';').map((a: string) => a.trim()).filter((a: string) => a);
            if (achArray.length > 0) {
              setAchievements(achArray);
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadExistingData();
  }, [user?.id]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleComplete = async () => {
    try {
      if (!user?.id) return;
      
      // Calculate experience years from the experience entries
      const experienceYears = experience.reduce((total, exp) => {
        const duration = exp.duration.toLowerCase();
        const yearMatch = duration.match(/(\d+)\s*year/);
        return total + (yearMatch ? parseInt(yearMatch[1]) : 0);
      }, 0);
      
      // Format education for storage
      const educationString = education.map(edu => 
        `${edu.degree} from ${edu.school} (${edu.year})`
      ).join('; ');
      
      // Import database service
      const { candidateProfileService, storageService } = await import('@/services/database');
      
      // Handle resume upload if exists
      let resumeUrl = null;
      if (resume) {
        try {
          resumeUrl = await storageService.uploadResume(user.id, resume);
        } catch (error) {
          console.error('Error uploading resume:', error);
        }
      }
      
      // Save complete professional profile to candidate_profiles
      const profileData = {
        user_id: user.id,
        skills: selectedSkills,
        experience_years: experienceYears,
        experience: experience.map(exp => ({
          title: exp.title,
          company: exp.company,
          duration: exp.duration,
          description: exp.description
        })),
        education: educationString,
        portfolio_url: portfolio || null,
        linkedin_url: linkedIn || null,
        resume_url: resumeUrl,
        achievements: achievements.join('; ') || null
      };
      
      // Create or update candidate profile
      await candidateProfileService.upsert(profileData);
      
      toast({
        title: "Professional profile saved!",
        description: "Your professional information has been updated successfully.",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving professional profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const addExperience = () => {
    setExperience([...experience, {
      title: '',
      company: '',
      duration: '',
      description: ''
    }]);
  };

  const addEducation = () => {
    setEducation([...education, {
      degree: '',
      school: '',
      year: ''
    }]);
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSoftSkill = () => {
    if (customSoftSkill && !selectedSkills.includes(customSoftSkill)) {
      setSelectedSkills([...selectedSkills, customSoftSkill]);
      setCustomSoftSkill('');
    }
  };

  const addCustomTechnicalSkill = () => {
    if (customTechnicalSkill && !selectedSkills.includes(customTechnicalSkill)) {
      setSelectedSkills([...selectedSkills, customTechnicalSkill]);
      setCustomTechnicalSkill('');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Your Experience 💼</h3>
              <p className="text-muted-foreground">Tell us about your work history</p>
            </div>
            <div className="max-w-lg mx-auto space-y-4">
              {experience.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No experience added yet</p>
                  <Button onClick={addExperience} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Experience
                  </Button>
                </div>
              ) : (
                <>
                  {experience.map((exp, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <Input
                          placeholder="Job Title"
                          value={exp.title}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[index].title = e.target.value;
                            setExperience(updated);
                          }}
                        />
                        <Input
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[index].company = e.target.value;
                            setExperience(updated);
                          }}
                        />
                        <Input
                          placeholder="Duration (e.g., 2021 - Present)"
                          value={exp.duration}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[index].duration = e.target.value;
                            setExperience(updated);
                          }}
                        />
                        <Textarea
                          placeholder="Brief description of your role..."
                          value={exp.description}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[index].description = e.target.value;
                            setExperience(updated);
                          }}
                          rows={3}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExperience(experience.filter((_, i) => i !== index))}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))}
                  <Button onClick={addExperience} variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another
                  </Button>
                </>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Education 🎓</h3>
              <p className="text-muted-foreground">Share your academic background</p>
            </div>
            <div className="max-w-lg mx-auto space-y-4">
              {education.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No education added yet</p>
                  <Button onClick={addEducation} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Education
                  </Button>
                </div>
              ) : (
                <>
                  {education.map((edu, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <Input
                          placeholder="Degree/Certificate"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[index].degree = e.target.value;
                            setEducation(updated);
                          }}
                        />
                        <Input
                          placeholder="School/Institution"
                          value={edu.school}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[index].school = e.target.value;
                            setEducation(updated);
                          }}
                        />
                        <Input
                          placeholder="Graduation Year"
                          value={edu.year}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[index].year = e.target.value;
                            setEducation(updated);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEducation(education.filter((_, i) => i !== index))}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))}
                  <Button onClick={addEducation} variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another
                  </Button>
                </>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Soft Skills 🤝</h3>
              <p className="text-muted-foreground">Select your interpersonal and personal qualities</p>
            </div>
            <div className="max-w-lg mx-auto space-y-4">
              <div className="flex flex-wrap gap-2">
                {softSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Soft Skill */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom soft skill..."
                  value={customSoftSkill}
                  onChange={(e) => setCustomSoftSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSoftSkill()}
                />
                <Button onClick={addCustomSoftSkill} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Soft Skills Display */}
              {selectedSkills.filter(skill => 
                softSkills.includes(skill) || 
                !technicalSkills.includes(skill)
              ).length > 0 && (
                <div className="p-4 rounded-lg bg-card/50 border border-border">
                  <p className="text-sm font-medium mb-2">
                    Selected Soft Skills ({selectedSkills.filter(skill => 
                      softSkills.includes(skill) || 
                      !technicalSkills.includes(skill)
                    ).length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.filter(skill => 
                      softSkills.includes(skill) || 
                      !technicalSkills.includes(skill)
                    ).map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Technical Skills ⚡</h3>
              <p className="text-muted-foreground">Select your job-specific and technical abilities</p>
            </div>
            <div className="max-w-lg mx-auto space-y-4">
              <div className="flex flex-wrap gap-2">
                {technicalSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Technical Skill */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom technical skill..."
                  value={customTechnicalSkill}
                  onChange={(e) => setCustomTechnicalSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTechnicalSkill()}
                />
                <Button onClick={addCustomTechnicalSkill} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Technical Skills Display */}
              {selectedSkills.filter(skill => 
                technicalSkills.includes(skill) || 
                (!softSkills.includes(skill) && selectedSkills.includes(skill))
              ).length > 0 && (
                <div className="p-4 rounded-lg bg-card/50 border border-border">
                  <p className="text-sm font-medium mb-2">
                    Selected Technical Skills ({selectedSkills.filter(skill => 
                      technicalSkills.includes(skill) || 
                      (!softSkills.includes(skill) && !softSkills.some(s => s === skill))
                    ).length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.filter(skill => 
                      technicalSkills.includes(skill) || 
                      (!softSkills.includes(skill) && !softSkills.some(s => s === skill))
                    ).map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Documents & Links 📄</h3>
              <p className="text-muted-foreground">Add your resume and professional links</p>
            </div>
            <div className="max-w-lg mx-auto space-y-4">
              <div>
                <Label htmlFor="resume">Resume/CV</Label>
                <div className="mt-2">
                  <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-card/50">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {resume ? resume.name : 'Click to upload PDF'}
                      </p>
                    </div>
                    <input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setResume(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="portfolio">Portfolio Website</Label>
                <Input
                  id="portfolio"
                  placeholder="https://yourportfolio.com"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="glass p-8">
          <p className="text-center">Loading profile...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="glass max-w-2xl w-full">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <div>
              <CardTitle className="text-2xl">Complete Your Professional Profile</CardTitle>
              <CardDescription>Showcase your skills and experience</CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">{currentStep} of {totalSteps}</Badge>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-3" />
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px] flex flex-col justify-center"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSkip}
              >
                <SkipForward className="mr-2 h-4 w-4" />
                Skip
              </Button>
              
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {currentStep === totalSteps ? (
                  <>
                    Complete
                    <Check className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};