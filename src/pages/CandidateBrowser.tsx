import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Search, Filter, MapPin, Briefcase, Clock, 
  Bookmark, ChevronRight, Car, Bike, Train, 
  Bus, CircleDot, Globe, GraduationCap, 
  Coffee, ShoppingBag, Utensils, Package, 
  Users, Home, Sparkles, FileText, Link2,
  X, ArrowUpDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export const CandidateBrowser = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [savedCandidates, setSavedCandidates] = useState<number[]>([]);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  
  // Filter states for modal
  const [tempFilters, setTempFilters] = useState({
    interests: [] as string[],
    availability: [] as string[],
    transportation: [] as string[],
    skills: [] as string[],
    education: [] as string[]
  });

  // Real candidates will come from database
  const candidates: any[] = [];

  // Quick filter options (visible by default)
  const quickFilters = ['Immediate Start', 'Part-time', 'Full-time', 'Weekends'];

  // All filter options for modal
  const filterOptions = {
    interests: ['Hospitality', 'Retail', 'Food Service', 'Delivery', 'Events', 'Driver', 'Household'],
    availability: ['Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings', 'Weekend Availability', 'Full-time Available', 'Part-time Available'],
    transportation: ['Car', 'Public Transit', 'Bike', 'Walking', 'Flexible'],
    skills: ['Customer Service', 'Management', 'Sales', 'Food Service', 'Driving', 'Technology'],
    education: ['High School', 'Some College', 'Associate Degree', 'Bachelor\'s Degree', 'Trade Certificate']
  };

  const toggleQuickFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const applyFilters = () => {
    // Apply filters from modal
    const allFilters = [
      ...tempFilters.interests,
      ...tempFilters.availability,
      ...tempFilters.transportation,
      ...tempFilters.skills,
      ...tempFilters.education
    ];
    setSelectedFilters(allFilters);
    setShowFiltersModal(false);
  };

  const clearFilters = () => {
    setTempFilters({
      interests: [],
      availability: [],
      transportation: [],
      skills: [],
      education: []
    });
    setSelectedFilters([]);
  };

  const toggleSaved = (candidateId: number) => {
    setSavedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
    
    const candidate = candidates.find(c => c.id === candidateId);
    toast({
      title: savedCandidates.includes(candidateId) ? "Removed from saved" : "Candidate saved!",
      description: `${candidate?.name} ${savedCandidates.includes(candidateId) ? 'removed from' : 'added to'} your saved candidates`,
    });
  };

  const getTransportIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      car: <Car className="h-4 w-4" />,
      bike: <Bike className="h-4 w-4" />,
      train: <Train className="h-4 w-4" />,
      bus: <Bus className="h-4 w-4" />,
      walk: <CircleDot className="h-4 w-4" />,
      mix: <Globe className="h-4 w-4" />
    };
    return icons[type] || <Globe className="h-4 w-4" />;
  };

  const getInterestIcon = (interest: string) => {
    const icons: Record<string, JSX.Element> = {
      hospitality: <Coffee className="h-4 w-4" />,
      retail: <ShoppingBag className="h-4 w-4" />,
      food: <Utensils className="h-4 w-4" />,
      delivery: <Package className="h-4 w-4" />,
      events: <Users className="h-4 w-4" />,
      driver: <Car className="h-4 w-4" />,
      household: <Home className="h-4 w-4" />,
      other: <Sparkles className="h-4 w-4" />
    };
    return icons[interest] || <Sparkles className="h-4 w-4" />;
  };

  const formatAvailability = (availability: string[]) => {
    const days = new Set<string>();
    const times = new Set<string>();
    
    availability.forEach(slot => {
      const [day, time] = slot.split('-');
      days.add(day);
      times.add(time);
    });

    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const weekends = ['Sat', 'Sun'];
    
    const hasWeekdays = weekdays.some(day => days.has(day));
    const hasWeekends = weekends.some(day => days.has(day));
    
    if (days.size >= 5 && times.size >= 2) return 'Full-time';
    if (hasWeekdays && hasWeekends) return 'Flexible';
    if (hasWeekends && !hasWeekdays) return 'Weekends';
    if (hasWeekdays && !hasWeekends) return 'Weekdays';
    
    return 'Part-time';
  };

  const getQuickFactDisplay = (factId: string) => {
    const factMap: Record<string, { label: string; emoji: string }> = {
      'early-bird': { label: 'Early Bird', emoji: '🌅' },
      'night-owl': { label: 'Night Owl', emoji: '🌙' },
      'team-player': { label: 'Team Player', emoji: '🤝' },
      'solo-worker': { label: 'Solo Worker', emoji: '💼' },
      'coffee-lover': { label: 'Coffee Lover', emoji: '☕' },
      'detail-oriented': { label: 'Detail Oriented', emoji: '🔍' },
      'creative-mind': { label: 'Creative Mind', emoji: '🎨' },
      'social-butterfly': { label: 'Social Butterfly', emoji: '🦋' },
      'music-always': { label: 'Music Always', emoji: '🎵' },
      'big-picture': { label: 'Big Picture', emoji: '🖼️' }
    };
    return factMap[factId] || { label: factId, emoji: '✨' };
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
            Find Your Perfect <span className="text-gradient">Candidate</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Browse profiles of job seekers ready to work
          </p>
        </motion.div>

        {/* Search Bar with Sort */}
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
                placeholder="Search by name, skills, or hobbies..."
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
                <SelectItem value="relevance">Best Match</SelectItem>
                <SelectItem value="recent">Recently Joined</SelectItem>
                <SelectItem value="experience">Most Experience</SelectItem>
                <SelectItem value="availability">Available Now</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="h-12 px-6"
              onClick={() => setShowFiltersModal(true)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {selectedFilters.length > 0 && (
                <Badge className="ml-2 bg-primary text-xs">
                  {selectedFilters.length}
                </Badge>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Quick Filters */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Quick filters:</span>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleQuickFilter(filter)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedFilters.includes(filter)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card/50 hover:bg-card/80 text-foreground border border-border'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            {selectedFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                Clear all
                <X className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        </motion.div>

        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {candidates.length} candidates
        </div>

        {/* Candidates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass overflow-hidden hover-lift cursor-pointer">
                <div className="relative">
                  {/* Profile Photo */}
                  <div className="h-48 relative">
                    <img 
                      src={candidate.photos[0]} 
                      alt={candidate.name}
                      className="w-full h-full object-cover"
                    />
                    {candidate.photos.length > 1 && (
                      <div className="absolute top-2 left-2 bg-background/80 backdrop-blur px-2 py-1 rounded-full text-xs">
                        +{candidate.photos.length - 1} photos
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    
                    {/* Save Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaved(candidate.id);
                      }}
                      className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-background transition-colors"
                    >
                      <Bookmark 
                        className={`h-5 w-5 ${
                          savedCandidates.includes(candidate.id) 
                            ? 'fill-primary text-primary' 
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>

                    {/* Name & Location overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-semibold text-white">{candidate.name}</h3>
                      <div className="flex items-center gap-3 text-white/80 text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {candidate.location}
                        </span>
                        <span className="flex items-center gap-1">
                          {getTransportIcon(candidate.transportation)}
                          Transport
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="pt-4 pb-6 px-6">
                  {/* Job Interests */}
                  <div className="flex items-center gap-2 mb-3">
                    {candidate.interests.slice(0, 3).map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {getInterestIcon(interest)}
                        <span className="ml-1 capitalize">{interest}</span>
                      </Badge>
                    ))}
                  </div>

                  {/* Current/Recent Experience */}
                  {candidate.experience[0] && (
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{candidate.experience[0].title}</span>
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div className="mb-3">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatAvailability(candidate.availability)}
                    </Badge>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {candidate.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-card/50 rounded-md text-xs">
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="px-2 py-1 text-xs text-muted-foreground">
                        +{candidate.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Quick Facts */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {candidate.quickFacts.slice(0, 2).map((fact) => {
                      const factDisplay = getQuickFactDisplay(fact);
                      return (
                        <span key={fact} className="text-xs text-muted-foreground">
                          {factDisplay.emoji} {factDisplay.label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Prompt Preview */}
                  {candidate.prompts[0] && (
                    <div className="mb-4 p-3 bg-card/50 rounded-lg">
                      <p className="text-xs font-medium text-primary mb-1">
                        {candidate.prompts[0].prompt}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        "{candidate.prompts[0].answer}"
                      </p>
                    </div>
                  )}

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {candidate.portfolio && (
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                      )}
                      {candidate.linkedIn && (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {candidate.hobbies.slice(0, 2).join(', ')}
                      </span>
                    </div>
                    <Button size="sm">
                      View Profile
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg">
            Load More Candidates
          </Button>
        </motion.div>
      </div>

      {/* Filters Modal */}
      <Dialog open={showFiltersModal} onOpenChange={setShowFiltersModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filter Candidates</DialogTitle>
            <DialogDescription>
              Narrow down your search to find the perfect match
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Job Interests */}
            <div>
              <Label className="text-base font-medium mb-3">Job Interests</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {filterOptions.interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => {
                      setTempFilters(prev => ({
                        ...prev,
                        interests: prev.interests.includes(interest)
                          ? prev.interests.filter(i => i !== interest)
                          : [...prev.interests, interest]
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      tempFilters.interests.includes(interest)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Availability */}
            <div>
              <Label className="text-base font-medium mb-3">Availability</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {filterOptions.availability.map((avail) => (
                  <button
                    key={avail}
                    onClick={() => {
                      setTempFilters(prev => ({
                        ...prev,
                        availability: prev.availability.includes(avail)
                          ? prev.availability.filter(a => a !== avail)
                          : [...prev.availability, avail]
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      tempFilters.availability.includes(avail)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {avail}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Transportation */}
            <div>
              <Label className="text-base font-medium mb-3">Transportation</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {filterOptions.transportation.map((transport) => (
                  <button
                    key={transport}
                    onClick={() => {
                      setTempFilters(prev => ({
                        ...prev,
                        transportation: prev.transportation.includes(transport)
                          ? prev.transportation.filter(t => t !== transport)
                          : [...prev.transportation, transport]
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      tempFilters.transportation.includes(transport)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {transport}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Skills */}
            <div>
              <Label className="text-base font-medium mb-3">Key Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {filterOptions.skills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => {
                      setTempFilters(prev => ({
                        ...prev,
                        skills: prev.skills.includes(skill)
                          ? prev.skills.filter(s => s !== skill)
                          : [...prev.skills, skill]
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      tempFilters.skills.includes(skill)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Education */}
            <div>
              <Label className="text-base font-medium mb-3">Education Level</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {filterOptions.education.map((edu) => (
                  <button
                    key={edu}
                    onClick={() => {
                      setTempFilters(prev => ({
                        ...prev,
                        education: prev.education.includes(edu)
                          ? prev.education.filter(e => e !== edu)
                          : [...prev.education, edu]
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      tempFilters.education.includes(edu)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {edu}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setTempFilters({
                  interests: [],
                  availability: [],
                  transportation: [],
                  skills: [],
                  education: []
                });
              }}
            >
              Clear All
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowFiltersModal(false)}>
                Cancel
              </Button>
              <Button onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};