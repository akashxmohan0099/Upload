import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { 
  MapPin, MessageCircle, Share2, CheckCircle, Briefcase, Clock,
  Heart, Car, Bus, Bike, Train, CircleDot, Globe, Sparkles,
  Camera, Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const quickFactsData = [
  { id: 'early-bird', label: 'Early Bird', emoji: '🌅' },
  { id: 'night-owl', label: 'Night Owl', emoji: '🌙' },
  { id: 'team-player', label: 'Team Player', emoji: '🤝' },
  { id: 'solo-worker', label: 'Solo Worker', emoji: '💼' },
  { id: 'coffee-lover', label: 'Coffee Lover', emoji: '☕' },
  { id: 'tea-person', label: 'Tea Person', emoji: '🍵' },
  { id: 'dog-person', label: 'Dog Person', emoji: '🐕' },
  { id: 'cat-person', label: 'Cat Person', emoji: '🐈' },
  { id: 'beach-lover', label: 'Beach Lover', emoji: '🏖️' },
  { id: 'city-person', label: 'City Person', emoji: '🏙️' },
  { id: 'music-always', label: 'Music Always', emoji: '🎵' },
  { id: 'quiet-worker', label: 'Quiet Worker', emoji: '🤫' }
];

const transportIcons: { [key: string]: any } = {
  car: Car,
  bus: Bus,
  bike: Bike,
  train: Train,
  walk: CircleDot,
  mix: Globe
};

export const PublicProfileView = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch candidate profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('candidate_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        setCandidateProfile(data);
      } catch (error) {
        console.error('Error fetching candidate profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user?.id]);

  // Build profile data from database
  const profileData = {
    name: profile?.full_name || '',
    role: profile?.bio || '',
    location: profile?.location || '',
    photos: candidateProfile?.photos || (profile?.avatar_url ? [profile.avatar_url] : []),
    availability: candidateProfile?.availability || [],
    interests: candidateProfile?.interests || [],
    prompts: candidateProfile?.prompts || [],
    transportation: candidateProfile?.transportation || '',
    hobbies: candidateProfile?.hobbies || [],
    quickFacts: candidateProfile?.quick_facts || [],
    experience: candidateProfile?.experience || [],
    skills: candidateProfile?.skills || [],
    hourlyRate: candidateProfile?.hourly_rate || '',
    verified: false
  };

  const TransportIcon = transportIcons[profileData.transportation] || Car;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="glass p-8">
          <p className="text-center">Loading profile...</p>
        </Card>
      </div>
    );
  }

  // Check if profile exists and has data
  if (!profile?.full_name) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="glass p-8 max-w-md w-full text-center">
          <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Profile Yet</h2>
          <p className="text-muted-foreground mb-4">
            Complete your profile to start showcasing your skills and experience!
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Hero Section with Photos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <Card className="glass overflow-hidden">
                <div className="aspect-[16/9] relative">
                  {profileData.photos.length > 0 ? (
                    <img 
                      src={profileData.photos[selectedPhoto]} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Profile Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-end justify-between">
                      <div>
                        <h1 className="text-4xl font-bold mb-2">{profileData.name}</h1>
                        <p className="text-xl opacity-90">{profileData.role}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {profileData.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {profileData.hourlyRate}/hr
                          </span>
                          {profileData.verified && (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant={isFollowing ? "outline" : "hero"}
                          onClick={() => setIsFollowing(!isFollowing)}
                          className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20"
                        >
                          {isFollowing ? 'Following' : 'Connect'}
                        </Button>
                        <Button variant="outline" className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Photo Thumbnails */}
                {profileData.photos.length > 0 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {profileData.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPhoto(index)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedPhoto === index ? 'border-primary scale-105' : 'border-transparent'
                        }`}
                      >
                        <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* About Me Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Personality Spotlight
                  </h2>
                  <div className="space-y-4">
                    {profileData.prompts.length > 0 ? (
                      profileData.prompts.map((prompt: any, index: number) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          className="border-l-4 border-primary/20 pl-4 hover:border-primary/40 transition-colors"
                        >
                          <p className="text-sm text-muted-foreground mb-1">{prompt.prompt}</p>
                          <p className="font-medium">{prompt.answer}</p>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No personality prompts added yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Experience Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Work Experience
                  </h2>
                  <div className="space-y-4">
                    {profileData.experience.map((exp: any, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{exp.title}</p>
                          <p className="text-sm text-muted-foreground">{exp.company} • {exp.duration}</p>
                          {exp.description && (
                            <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {profileData.experience.length === 0 && (
                      <p className="text-sm text-muted-foreground">No experience added yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Sidebar Info */}
          <div className="space-y-6">
            
            {/* Availability Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-sm">When I'm Available</h3>
                  <div className="bg-background rounded-lg p-3 border">
                    <div className="grid grid-cols-8 gap-1 text-xs">
                      <div></div>
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <div key={i} className="text-center font-medium">
                          {day}
                        </div>
                      ))}
                      
                      {['AM', 'PM', 'EVE'].map((time) => (
                        <Fragment key={time}>
                          <div className="text-[10px] font-medium text-muted-foreground">{time}</div>
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                            const isAvailable = profileData.availability.includes(`${day}-${time}`);
                            return (
                              <div
                                key={`${day}-${time}`}
                                className={`aspect-square rounded-sm ${
                                  isAvailable 
                                    ? 'bg-gradient-primary' 
                                    : 'bg-muted/30'
                                }`}
                              />
                            );
                          })}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Facts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-sm">Quick Facts</h3>
                  {profileData.quickFacts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileData.quickFacts.map((fact: string, index: number) => {
                        const quickFact = quickFactsData.find(f => f.id === fact);
                        return quickFact ? (
                          <Badge key={index} variant="outline" className="px-3 py-1">
                            <span className="mr-1">{quickFact.emoji}</span>
                            {quickFact.label}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No quick facts added yet</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Interests & Hobbies */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-sm">Interests</h3>
                  {profileData.hobbies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileData.hobbies.map((hobby: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {hobby}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No interests added yet</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Transport & Location */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-sm">Getting Around</h3>
                  {profileData.transportation ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <TransportIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{profileData.transportation}</p>
                        <p className="text-xs text-muted-foreground">{profileData.location}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No transportation info added yet</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-sm">Top Skills</h3>
                  {profileData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills added yet</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            {user?.id && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="sticky top-4"
              >
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/profile')}
                  className="w-full"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/dashboard')}
                  className="w-full mt-2"
                >
                  Back to Dashboard
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};