import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ArrowLeft, Check, SkipForward, Upload, MapPin, Calendar,
  Gamepad2, Plane, Film, Music, Book, Coffee, Camera, Palette,
  Heart, Sparkles, Trophy, Zap, Globe, Home, Sun, Moon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const interests = [
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'movies', label: 'TV/Movies', icon: Film },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'reading', label: 'Reading', icon: Book },
  { id: 'food', label: 'Food', icon: Coffee },
  { id: 'photography', label: 'Photography', icon: Camera },
  { id: 'art', label: 'Art & Design', icon: Palette },
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ethnicities = [
  'Asian', 'Black/African American', 'Hispanic/Latino', 'White/Caucasian',
  'Middle Eastern', 'Native American', 'Pacific Islander', 'Mixed/Multiracial',
  'Prefer not to say', 'Other'
];

const prompts = [
  "A fact about me that surprises people...",
  "The last TV show I binged...",
  "My go-to coffee order is...",
  "If I could travel anywhere, it would be...",
  "My hidden talent is...",
  "The best advice I've ever received...",
  "My weekend usually involves...",
  "I'm passionate about...",
  "My favorite way to unwind is...",
  "The podcast I can't stop listening to..."
];

export const ProfileCompletionFlow = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  // Form state
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [politicalBelief, setPoliticalBelief] = useState('');
  const [otherPolitical, setOtherPolitical] = useState('');
  const [selectedEthnicities, setSelectedEthnicities] = useState<string[]>([]);
  const [otherEthnicity, setOtherEthnicity] = useState('');
  const [religiousBelief, setReligiousBelief] = useState('');
  const [otherReligion, setOtherReligion] = useState('');
  const [selectedPrompts, setSelectedPrompts] = useState<{ prompt: string; answer: string }[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

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

  const handleComplete = () => {
    // Save all profile data
    const profileData = {
      interests: selectedInterests,
      availability,
      location,
      politicalBelief: politicalBelief === 'other' ? otherPolitical : politicalBelief,
      ethnicities: selectedEthnicities.includes('Other') 
        ? [...selectedEthnicities.filter(e => e !== 'Other'), otherEthnicity]
        : selectedEthnicities,
      religiousBelief: religiousBelief === 'other' ? otherReligion : religiousBelief,
      prompts: selectedPrompts,
      photos: uploadedPhotos
    };
    
    // TODO: Save profile completion data to database
    // updateProfile(profileData);
    navigate('/profile');
  };

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(i => i !== id));
    } else if (selectedInterests.length < 3) {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const toggleDay = (day: string) => {
    if (availability.includes(day)) {
      setAvailability(availability.filter(d => d !== day));
    } else {
      setAvailability([...availability, day]);
    }
  };

  const toggleEthnicity = (ethnicity: string) => {
    if (selectedEthnicities.includes(ethnicity)) {
      setSelectedEthnicities(selectedEthnicities.filter(e => e !== ethnicity));
    } else {
      setSelectedEthnicities([...selectedEthnicities, ethnicity]);
    }
  };

  const handlePromptAnswer = (prompt: string, answer: string) => {
    const existing = selectedPrompts.find(p => p.prompt === prompt);
    if (existing) {
      setSelectedPrompts(selectedPrompts.map(p => 
        p.prompt === prompt ? { prompt, answer } : p
      ));
    } else if (selectedPrompts.length < 3) {
      setSelectedPrompts([...selectedPrompts, { prompt, answer }]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && uploadedPhotos.length < 5) {
      // In a real app, you'd upload these to a server
      const newPhotos = Array.from(files).slice(0, 5 - uploadedPhotos.length).map(file => URL.createObjectURL(file));
      setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Pick your interests</h3>
              <p className="text-sm text-muted-foreground mb-4">Choose up to 3 things you're into</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {interests.map((interest) => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10 scale-105' 
                        : 'border-border hover:border-primary/50 hover:bg-card/50'
                    } ${selectedInterests.length >= 3 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={selectedInterests.length >= 3 && !isSelected}
                  >
                    <interest.icon className={`h-8 w-8 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">{interest.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">When are you available?</h3>
              <p className="text-sm text-muted-foreground mb-4">Select the days you're typically free</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {daysOfWeek.map((day) => {
                const isSelected = availability.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50 hover:bg-card/50'
                    }`}
                  >
                    <span className="font-medium">{day}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Where are you based?</h3>
              <p className="text-sm text-muted-foreground mb-4">Enter your city or region</p>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="e.g., San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">What are your political beliefs?</h3>
              <p className="text-sm text-muted-foreground mb-4">This helps us match you with like-minded people</p>
            </div>
            <RadioGroup value={politicalBelief} onValueChange={setPoliticalBelief}>
              {['Liberal', 'Conservative', 'Moderate', 'Not sure', 'Prefer not to say'].map((option) => (
                <div key={option} className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value={option.toLowerCase().replace(/ /g, '-')} id={option} />
                  <Label htmlFor={option} className="cursor-pointer">{option}</Label>
                </div>
              ))}
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="other" id="other-political" />
                <Label htmlFor="other-political" className="cursor-pointer">Other</Label>
              </div>
            </RadioGroup>
            {politicalBelief === 'other' && (
              <Input
                placeholder="Please specify..."
                value={otherPolitical}
                onChange={(e) => setOtherPolitical(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">What is your ethnicity?</h3>
              <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
            </div>
            <div className="space-y-2">
              {ethnicities.map((ethnicity) => (
                <label
                  key={ethnicity}
                  className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-card/50"
                >
                  <input
                    type="checkbox"
                    checked={selectedEthnicities.includes(ethnicity)}
                    onChange={() => toggleEthnicity(ethnicity)}
                    className="rounded border-border"
                  />
                  <span>{ethnicity}</span>
                </label>
              ))}
            </div>
            {selectedEthnicities.includes('Other') && (
              <Input
                placeholder="Please specify..."
                value={otherEthnicity}
                onChange={(e) => setOtherEthnicity(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">What are your religious beliefs?</h3>
              <p className="text-sm text-muted-foreground mb-4">This helps us understand you better</p>
            </div>
            <RadioGroup value={religiousBelief} onValueChange={setReligiousBelief}>
              {['Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Judaism', 
                'Spiritual but not religious', 'Atheist/Agnostic', 'Prefer not to say'].map((option) => (
                <div key={option} className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value={option.toLowerCase().replace(/[\/\s]/g, '-')} id={option} />
                  <Label htmlFor={option} className="cursor-pointer">{option}</Label>
                </div>
              ))}
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="other" id="other-religion" />
                <Label htmlFor="other-religion" className="cursor-pointer">Other</Label>
              </div>
            </RadioGroup>
            {religiousBelief === 'other' && (
              <Input
                placeholder="Please specify..."
                value={otherReligion}
                onChange={(e) => setOtherReligion(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Tell us more about you</h3>
              <p className="text-sm text-muted-foreground mb-4">Pick any 3 prompts and share your answers</p>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {prompts.map((prompt) => {
                const existing = selectedPrompts.find(p => p.prompt === prompt);
                const isSelected = !!existing;
                return (
                  <div 
                    key={prompt}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border'
                    } ${selectedPrompts.length >= 3 && !isSelected ? 'opacity-50' : ''}`}
                  >
                    <p className="text-sm font-medium mb-2">{prompt}</p>
                    <Textarea
                      placeholder="Type your answer..."
                      value={existing?.answer || ''}
                      onChange={(e) => handlePromptAnswer(prompt, e.target.value)}
                      disabled={selectedPrompts.length >= 3 && !isSelected}
                      className="min-h-[60px] resize-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Add profile photos</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload up to 5 photos (1080x1080 recommended)</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[...Array(5)].map((_, index) => {
                const photo = uploadedPhotos[index];
                return (
                  <div
                    key={index}
                    className="aspect-square rounded-lg border-2 border-dashed border-border overflow-hidden relative group"
                  >
                    {photo ? (
                      <>
                        <img src={photo} alt={`Profile ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index))}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-card/50">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
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

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="glass max-w-2xl w-full">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <Badge variant="outline">{currentStep} of {totalSteps}</Badge>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
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