import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { companyService } from '@/services/database';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Users, MapPin, Clock, User, 
  Upload, ArrowRight, ArrowLeft, Check, Camera,
  Plus, X, Globe, Calendar, Sparkles, SkipForward
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
];

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Education',
  'Manufacturing',
  'Hospitality',
  'Real Estate',
  'Marketing',
  'Consulting',
  'Non-profit',
  'Other'
];

export const CompanyProfileSetup = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Step 1: Company Name
  const [companyName, setCompanyName] = useState('');
  
  // Step 2: Location
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Step 3: Industry & Size
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [foundedYear, setFoundedYear] = useState('');

  // Step 4: Description
  const [description, setDescription] = useState('');
  const [mission, setMission] = useState('');
  const [website, setWebsite] = useState('');

  // Step 5: Workplace Photos
  const [workplacePhotos, setWorkplacePhotos] = useState<string[]>([]);
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string>('');

  // Additional Info (will be added in dashboard later)
  const [founderName] = useState('');
  const [founderTitle] = useState('');
  const [culture] = useState('');
  const [perks] = useState<string[]>([]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompanyLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWorkplacePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && workplacePhotos.length < 6) {
      const newPhotos = Array.from(files).slice(0, 6 - workplacePhotos.length).map(file => 
        URL.createObjectURL(file)
      );
      setWorkplacePhotos([...workplacePhotos, ...newPhotos]);
    }
  };

  const removeWorkplacePhoto = (index: number) => {
    setWorkplacePhotos(workplacePhotos.filter((_, i) => i !== index));
  };

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
      await companyService.create({
        recruiter_id: user?.id!,
        name: companyName,
        logo_url: companyLogoPreview,
        industry,
        size: companySize,
        website,
        description,
        location: `${address}, ${city}, ${state}, ${country} ${postalCode}`,
        founded_year: foundedYear ? parseInt(foundedYear) : undefined,
      });
      
      toast({
        title: "Company profile created!",
        description: "Your company profile has been set up successfully.",
      });
      
      navigate('/recruiter-dashboard');
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        title: "Error",
        description: "Failed to create company profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return companyName;
      case 2:
        return city && country;
      case 3:
        return industry && companySize;
      case 4:
        return description;
      case 5:
        return true; // Photos are optional
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Company Name";
      case 2: return "Company Location";
      case 3: return "Industry & Size";
      case 4: return "About Your Company";
      case 5: return "Workplace Photos";
      default: return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return "Let's start with your company name";
      case 2: return "Where are you located?";
      case 3: return "Help candidates understand your business";
      case 4: return "Tell your company's story";
      case 5: return "Show off your workplace";
      default: return "";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">What's your company name?</h3>
              <p className="text-muted-foreground">This is how candidates will find you</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div>
                <Label htmlFor="company-name">Company Name *</Label>
                <Input
                  id="company-name"
                  placeholder="e.g., Acme Corporation"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Where are you located?</h3>
              <p className="text-muted-foreground">Help candidates find opportunities near them</p>
            </div>
            
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  placeholder="123 Business St, Suite 100"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="NY"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="postal">Postal Code</Label>
                  <Input
                    id="postal"
                    placeholder="10001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Tell us about your business</h3>
              <p className="text-muted-foreground">This helps match you with the right candidates</p>
            </div>
            
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="company-size">Company Size *</Label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="How many employees?" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="founded">Year Founded</Label>
                <Input
                  id="founded"
                  placeholder="e.g., 2020"
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-10 w-10 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Describe your company</h3>
              <p className="text-muted-foreground">Help candidates understand what makes you unique</p>
            </div>
            
            <div className="max-w-lg mx-auto space-y-4">
              <div>
                <Label htmlFor="description">Company Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Tell candidates what your company does and what makes it special..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {description.length}/500 characters
                </p>
              </div>

              <div>
                <Label htmlFor="mission">Mission Statement</Label>
                <Textarea
                  id="mission"
                  placeholder="What's your company's mission? (optional)"
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="website">Company Website</Label>
                <div className="relative mt-2">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    placeholder="https://www.yourcompany.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Show off your workplace</h3>
              <p className="text-muted-foreground">Photos help candidates visualize working with you</p>
            </div>
            
            <div className="max-w-lg mx-auto space-y-6">
              {/* Company Logo */}
              <div>
                <Label>Company Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <label className="relative cursor-pointer group">
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden hover:border-primary transition-colors">
                      {companyLogoPreview ? (
                        <img src={companyLogoPreview} alt="Company logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Camera className="h-6 w-6 text-muted-foreground mx-auto" />
                          <p className="text-xs text-muted-foreground mt-1">Logo</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {companyLogoPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCompanyLogo(null);
                        setCompanyLogoPreview('');
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {/* Workplace Photos */}
              <div>
                <Label>Workplace Photos</Label>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Add up to 6 photos of your office, team, or work environment
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {workplacePhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo} 
                        alt={`Workplace ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeWorkplacePhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {workplacePhotos.length < 6 && (
                    <label className="cursor-pointer">
                      <div className="w-full h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary transition-colors">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleWorkplacePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
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
          <div className="space-y-4">
            {/* Progress */}
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
                <CardDescription>{getStepDescription()}</CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {currentStep} of {totalSteps}
              </Badge>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px]"
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
            
            <div className="flex gap-3">
              {currentStep === 5 && (
                <Button
                  variant="outline"
                  onClick={handleSkip}
                >
                  <SkipForward className="mr-2 h-4 w-4" />
                  Skip
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {currentStep === totalSteps ? (
                  <>
                    Complete Setup
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