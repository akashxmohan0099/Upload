import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Award, Star } from 'lucide-react';

interface CandidateCardProps {
  candidate: {
    id: number;
    name: string;
    title: string;
    skills: string[];
    experience: string;
    location: string;
    availability: string;
    match: number;
  };
}

export const CandidateCard = ({ candidate }: CandidateCardProps) => {
  return (
    <Card className="glass hover-lift cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold">
              {candidate.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h4 className="font-semibold">{candidate.name}</h4>
              <p className="text-sm text-muted-foreground">{candidate.title}</p>
            </div>
          </div>
          <Badge className="bg-success/20 text-success">
            {candidate.match}% Match
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {candidate.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="h-3 w-3" />
            {candidate.experience} experience
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            Available: {candidate.availability}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {candidate.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {candidate.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{candidate.skills.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            View Profile
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};