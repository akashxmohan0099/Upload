import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ArrowLeft, Check, SkipForward, Upload, MapPin, Calendar,
  Coffee, ShoppingBag, Utensils, Package, Users, Car, Home, Sparkles,
  ChevronDown, Bus, Bike, Train, CircleDot,
  Sun, Moon, Heart, UserCheck, CoffeeIcon, Leaf, Waves, Building2, Music, Smile,
  Dog, Cat, Globe, Headphones
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const casualInterests = [
  { id: 'hospitality', label: 'Hospitality', icon: Coffee },
  { id: 'retail', label: 'Retail', icon: ShoppingBag },
  { id: 'food', label: 'Food Service', icon: Utensils },
  { id: 'delivery', label: 'Delivery', icon: Package },
  { id: 'events', label: 'Events', icon: Users },
  { id: 'driver', label: 'Driver', icon: Car },
  { id: 'household', label: 'Household', icon: Home },
  { id: 'other', label: 'Other', icon: Sparkles },
];

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = ['AM', 'PM', 'EVE'];

const transportOptions = [
  { id: 'car', label: 'Car', icon: Car },
  { id: 'bus', label: 'Bus', icon: Bus },
  { id: 'bike', label: 'Bike', icon: Bike },
  { id: 'train', label: 'Train', icon: Train },
  { id: 'walk', label: 'Walk', icon: CircleDot },
  { id: 'mix', label: 'Mix of All', icon: Globe }
];

const generalInterests = [
  'Surfing', 'Beach Volleyball', 'Gym', 'Running', 'Hiking', 'Gaming',
  'Photography', 'Coffee', 'Hospitality', 'Music Production', 'Content Creation',
  'Fashion', 'Design', 'Cars', 'Sustainability', 'Cooking', 'Travel',
  'Festivals', 'Reading', 'Yoga', 'Art', 'Tech', 'Fitness', 'Nature'
];

const quickFacts = [
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
  { id: 'quiet-worker', label: 'Quiet Worker', emoji: '🤫' },
  { id: 'social-butterfly', label: 'Social Butterfly', emoji: '🦋' },
  { id: 'detail-oriented', label: 'Detail Oriented', emoji: '🔍' },
  { id: 'big-picture', label: 'Big Picture', emoji: '🖼️' },
  { id: 'creative-mind', label: 'Creative Mind', emoji: '🎨' }
];

const personalPrompts = {
  'Daily Life & Preferences': [
    "My go-to comfort snack is...",
    "The app I open first every morning is...",
    "If you looked at my screen time, you'd see way too much of...",
    "My current binge-watch obsession is...",
    "The last thing that made me laugh way too hard was..."
  ],
  'Social & Culture': [
    "My friends always call me the one who...",
    "The best concert or event I've been to is...",
    "My ideal weekend on the Gold Coast looks like...",
    "A movie I'll never get tired of watching is...",
    "My playlist would not be complete without..."
  ],
  'Fun & Random': [
    "A random fact I love sharing is...",
    "My most used emoji is...",
    "The weirdest food combo I actually enjoy is...",
    "If I could teleport right now, I'd go to...",
    "My guilty pleasure show, song, or trend is..."
  ],
  'Interests & Hobbies': [
    "A hobby I could talk about for hours is...",
    "Something I've recently gotten into is...",
    "My favorite way to stay active is...",
    "If I could instantly get good at one thing, it would be...",
    "The game I always win (or always lose) is..."
  ],
  'Personality & Vibes': [
    "My friends know me for always...",
    "A little thing that instantly makes me happy is...",
    "I'd describe myself in three emojis...",
    "The best compliment I've ever gotten is...",
    "Something I do that always makes people smile is..."
  ],
  'Aspirations & Self': [
    "A skill I want to learn just for fun is...",
    "My dream travel destination is...",
    "The best advice I've ever gotten is...",
    "The last time I tried something new was when...",
    "One thing I'm passionate about outside of study or work is..."
  ]
};

export const PersonalProfileFlow = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const totalSteps = 7; // Increased from 4

  // Form state
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState<{ [key: string]: boolean }>({});
  const [location, setLocation] = useState('');
  const [selectedPrompts, setSelectedPrompts] = useState<{ prompt: string; answer: string }[]>([
    { prompt: '', answer: '' },
    { prompt: '', answer: '' },
    { prompt: '', answer: '' }
  ]);
  const [transportation, setTransportation] = useState('');
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [selectedQuickFacts, setSelectedQuickFacts] = useState<string[]>([]);

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
          setUploadedPhotos(data.photos || []);
          setSelectedInterests(data.interests || []);
          setTransportation(data.transportation || '');
          setHobbies(data.hobbies || []);
          setSelectedQuickFacts(data.quick_facts || []);
          
          // Parse prompts safely
          const prompts = data.prompts;
          if (Array.isArray(prompts) && prompts.length > 0) {
            setSelectedPrompts(prompts as Array<{ prompt: string; answer: string }>);
          }
          
          // Set availability
          if (data.availability && Array.isArray(data.availability)) {
            const availabilityObj: Record<string, boolean> = {};
            data.availability.forEach((key: string) => {
              availabilityObj[key] = true;
            });
            setAvailability(availabilityObj);
          }
        }
        
        // Set location from profile
        if (profile?.location) {
          setLocation(profile.location);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadExistingData();
  }, [user?.id, profile]);

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
      
      // Import services
      const { candidateProfileService, profileService, storageService } = await import('@/services/database');
      
      // Upload new photos to storage
      let photoUrls = [...uploadedPhotos.filter(url => url.startsWith('http'))]; // Keep existing URLs
      
      for (const file of photoFiles) {
        try {
          const url = await storageService.uploadAvatar(user.id, file);
          if (url) photoUrls.push(url);
        } catch (error) {
          console.error('Error uploading photo:', error);
        }
      }
      
      // Save complete personal profile to candidate_profiles
      const profileData = {
        user_id: user.id,
        interests: selectedInterests,
        availability: Object.keys(availability).filter(key => availability[key]),
        transportation: transportation,
        hobbies: hobbies,
        quick_facts: selectedQuickFacts,
        prompts: selectedPrompts,
        photos: photoUrls
      };
      
      // Create or update candidate profile
      await candidateProfileService.upsert(profileData);
      
      // Update main profile with location
      if (location.trim()) {
        await profileService.updateProfile(user.id, { location: location.trim() });
      }
      
      toast({
        title: "Personal profile saved!",
        description: "Your personal information has been updated successfully.",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving personal profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(i => i !== id));
    } else if (selectedInterests.length < 3) {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const toggleAvailability = (day: string, time: string) => {
    const key = `${day}-${time}`;
    setAvailability(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePromptUpdate = (index: number, prompt: string, answer: string) => {
    const newPrompts = [...selectedPrompts];
    newPrompts[index] = { prompt, answer };
    setSelectedPrompts(newPrompts.filter(p => p.prompt && p.answer));
  };

  const getAvailablePrompts = (currentPrompt?: string) => {
    const usedPrompts = selectedPrompts.map(p => p.prompt).filter(p => p && p !== currentPrompt);
    const allPrompts = Object.values(personalPrompts).flat();
    return allPrompts.filter(p => !usedPrompts.includes(p));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && uploadedPhotos.length < 5) {
      const filesArray = Array.from(files).slice(0, 5 - uploadedPhotos.length);
      const newPhotos = filesArray.map(file => URL.createObjectURL(file));
      setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
      setPhotoFiles([...photoFiles, ...filesArray]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
    const newFiles = photoFiles.filter((_, i) => i !== index);
    setUploadedPhotos(newPhotos);
    setPhotoFiles(newFiles);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Add Your Photos 📸</h3>
              <p className="text-muted-foreground">Show employers who you are</p>
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {[...Array(5)].map((_, index) => {
                const photo = uploadedPhotos[index];
                return (
                  <div
                    key={index}
                    className={`aspect-square rounded-2xl border-2 border-dashed overflow-hidden relative group ${
                      index === 0 ? 'col-span-2 row-span-2' : ''
                    } ${photo ? 'border-primary' : 'border-border'}`}
                  >
                    {photo ? (
                      <>
                        <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index))}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-card/50 transition-colors">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">
                          {index === 0 ? 'Main Photo' : 'Add Photo'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">What Work Interests You? 💼</h3>
              <p className="text-muted-foreground">Choose up to 3 areas</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {casualInterests.map((interest) => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isSelected 
                        ? 'border-primary bg-gradient-primary text-white scale-105' 
                        : 'border-border hover:border-primary/50 hover:bg-card/50'
                    } ${selectedInterests.length >= 3 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={selectedInterests.length >= 3 && !isSelected}
                  >
                    <interest.icon className={`h-8 w-8 mx-auto mb-2`} />
                    <span className="text-sm font-medium">{interest.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">When Can You Work? ⏰</h3>
              <p className="text-muted-foreground">Select your general availability</p>
            </div>
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-card rounded-2xl p-6 border">
                <div className="grid grid-cols-8 gap-2">
                  <div></div>
                  {daysOfWeek.map((day) => (
                    <div key={day} className="text-center text-sm font-medium">
                      {day}
                    </div>
                  ))}
                  
                  {timeSlots.map((time) => (
                    <Fragment key={time}>
                      <div className="text-sm font-medium flex items-center">{time}</div>
                      {daysOfWeek.map((day) => {
                        const key = `${day}-${time}`;
                        const isSelected = availability[key];
                        return (
                          <button
                            key={key}
                            onClick={() => toggleAvailability(day, time)}
                            className={`aspect-square rounded-lg border-2 transition-all ${
                              isSelected 
                                ? 'border-primary bg-gradient-primary' 
                                : 'border-border hover:border-primary/50 hover:bg-card/50'
                            }`}
                          />
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">Your Location</p>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="e.g., Sydney, NSW"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-12 h-14 text-lg rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        // Transportation step
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">How Do You Get Around? 🚗</h3>
              <p className="text-muted-foreground">Select your main transport method</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto">
              {transportOptions.map((option) => {
                const isSelected = transportation === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setTransportation(option.id)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isSelected 
                        ? 'border-primary bg-gradient-primary text-white scale-105' 
                        : 'border-border hover:border-primary/50 hover:bg-card/50'
                    }`}
                  >
                    <option.icon className={`h-8 w-8 mx-auto mb-2`} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 5:
        // General interests step
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">What Are Your Interests? 🎯</h3>
              <p className="text-muted-foreground">Choose up to 10 interests</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
              {generalInterests.map((hobby) => {
                const isSelected = hobbies.includes(hobby);
                return (
                  <button
                    key={hobby}
                    onClick={() => {
                      if (isSelected) {
                        setHobbies(hobbies.filter(h => h !== hobby));
                      } else if (hobbies.length < 10) {
                        setHobbies([...hobbies, hobby]);
                      }
                    }}
                    className={`px-4 py-2 rounded-full border-2 transition-all ${
                      isSelected 
                        ? 'border-primary bg-gradient-primary text-white' 
                        : 'border-border hover:border-primary/50'
                    } ${hobbies.length >= 10 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={hobbies.length >= 10 && !isSelected}
                  >
                    {hobby}
                  </button>
                );
              })}
            </div>
            {hobbies.length > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {hobbies.length}/10 selected
              </p>
            )}
          </div>
        );

      case 6:
        // Quick facts step
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Quick Facts About You ⚡</h3>
              <p className="text-muted-foreground">Select 3-10 facts that describe you best</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {quickFacts.map((fact) => {
                const isSelected = selectedQuickFacts.includes(fact.id);
                return (
                  <button
                    key={fact.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedQuickFacts(selectedQuickFacts.filter(f => f !== fact.id));
                      } else if (selectedQuickFacts.length < 10) {
                        setSelectedQuickFacts([...selectedQuickFacts, fact.id]);
                      }
                    }}
                    className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                      isSelected 
                        ? 'border-primary bg-gradient-primary text-white' 
                        : 'border-border hover:border-primary/50'
                    } ${selectedQuickFacts.length >= 10 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={selectedQuickFacts.length >= 10 && !isSelected}
                  >
                    <span className="text-xl">{fact.emoji}</span>
                    <span className="text-sm font-medium">{fact.label}</span>
                  </button>
                );
              })}
            </div>
            {selectedQuickFacts.length > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {selectedQuickFacts.length}/10 selected
              </p>
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Tell Us About You 💬</h3>
              <p className="text-muted-foreground">Choose 3 prompts that show your personality</p>
            </div>
            <div className="space-y-4 max-w-lg mx-auto">
              {[0, 1, 2].map((index) => {
                const prompt = selectedPrompts[index] || { prompt: '', answer: '' };
                return (
                  <div 
                    key={index}
                    className="p-4 rounded-2xl border-2 border-border bg-card"
                  >
                    <Select
                      value={prompt.prompt}
                      onValueChange={(value) => {
                        const newPrompts = [...selectedPrompts];
                        newPrompts[index] = { prompt: value, answer: prompt.answer };
                        setSelectedPrompts(newPrompts);
                      }}
                    >
                      <SelectTrigger className="w-full mb-3">
                        <SelectValue placeholder="Select a prompt..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {Object.entries(personalPrompts).map(([category, prompts]) => (
                          <div key={category}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              {category}
                            </div>
                            {prompts.map((p) => {
                              const isUsed = selectedPrompts.some((sp, i) => sp.prompt === p && i !== index);
                              return (
                                <SelectItem 
                                  key={p} 
                                  value={p} 
                                  disabled={isUsed}
                                  className={isUsed ? 'opacity-50' : ''}
                                >
                                  {p}
                                </SelectItem>
                              );
                            })}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    {prompt.prompt && (
                      <Textarea
                        placeholder="Your answer..."
                        value={prompt.answer}
                        onChange={(e) => {
                          const newPrompts = [...selectedPrompts];
                          newPrompts[index] = { prompt: prompt.prompt, answer: e.target.value };
                          setSelectedPrompts(newPrompts);
                        }}
                        className="min-h-[80px] resize-none"
                        maxLength={150}
                      />
                    )}
                  </div>
                );
              })}
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
              <CardTitle className="text-2xl">Personal Profile</CardTitle>
              <CardDescription>Help employers get to know you</CardDescription>
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
              className={currentStep === 1 ? 'invisible' : ''}
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
                variant="hero"
                onClick={handleNext}
                size="lg"
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