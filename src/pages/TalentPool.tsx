import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Filter, MapPin, Briefcase, Clock, Star, 
  Heart, Bookmark, MessageCircle, ChevronRight, Sparkles,
  Coffee, Car, Bike, Train, Home, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

export const TalentPool = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [savedCandidates, setSavedCandidates] = useState<number[]>([]);

  // Real candidates will come from database
  const candidates: any[] = [];

  const filterOptions = [
    'Remote', 'Entry Level', 'Part-time', 'Full-time', 
    'Immediate Start', 'Flexible Hours', 'Weekend Work'
  ];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const toggleSaved = (candidateId: number) => {
    setSavedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const getTransportIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      car: <Car className="h-4 w-4" />,
      bike: <Bike className="h-4 w-4" />,
      train: <Train className="h-4 w-4" />,
      home: <Home className="h-4 w-4" />
    };
    return icons[type] || <Globe className="h-4 w-4" />;
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-3">
              Discover Your Next <span className="text-gradient">Star Employee</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Find candidates that match your vibe and requirements
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search candidates, skills, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card/50 backdrop-blur border-border/50"
                />
              </div>
              <Button variant="outline" className="h-12 px-6">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedFilters.includes(filter)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card/50 hover:bg-card/80 text-foreground'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Candidates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass overflow-hidden hover-lift group cursor-pointer">
                  <div className="relative">
                    {/* Header with gradient background */}
                    <div className="h-32 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20" />
                    
                    {/* Profile Photo */}
                    <div className="absolute top-16 left-6">
                      <div className="relative">
                        <img 
                          src={candidate.photo} 
                          alt={candidate.name}
                          className="w-24 h-24 rounded-2xl border-4 border-background shadow-xl"
                        />
                        {candidate.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

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
                  </div>

                  <CardContent className="pt-14 pb-6 px-6">
                    {/* Name and Title */}
                    <div className="mb-3">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        {candidate.name}
                        <span className="text-sm text-muted-foreground">({candidate.age})</span>
                      </h3>
                      <p className="text-primary font-medium">{candidate.title}</p>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {candidate.bio}
                    </p>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{candidate.rating}</span>
                        <span className="text-muted-foreground">({candidate.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span>{candidate.responseRate}%</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {candidate.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
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

                    {/* Info Row */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {candidate.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {candidate.availability}
                      </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-primary">
                          {candidate.hourlyRate}/hr
                        </span>
                        <div className="flex gap-1">
                          {candidate.transportation.map((t) => (
                            <span key={t} className="text-muted-foreground">
                              {getTransportIcon(t)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button size="sm" className="group">
                        View Profile
                        <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
      </div>
    </>
  );
};