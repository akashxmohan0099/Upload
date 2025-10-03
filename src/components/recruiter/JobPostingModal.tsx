import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { X, MapPin, DollarSign, Clock, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { jobService, companyService } from '@/services/database';
import { Enums } from '@/integrations/supabase/types';

interface JobPostingModalProps {
  onClose: () => void;
}

export const JobPostingModal = ({ onClose }: JobPostingModalProps) => {
  const { user } = useAuth();
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState<Enums<'job_type'>>('full-time');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCompany = async () => {
      if (user?.id) {
        const companyData = await companyService.getByRecruiterId(user.id);
        setCompany(companyData);
      }
    };
    loadCompany();
  }, [user]);

  const handleSubmit = async () => {
    if (!jobTitle || !jobType || !location || !description || !company) {
      toast({
        title: 'Missing Information',
        description: !company ? 'Please set up your company profile first' : 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await jobService.create({
        company_id: company.id,
        recruiter_id: user?.id!,
        title: jobTitle,
        job_type: jobType,
        location,
        salary_min: salaryMin ? parseInt(salaryMin) : undefined,
        salary_max: salaryMax ? parseInt(salaryMax) : undefined,
        description,
        requirements: requirements.split('\n').filter(r => r.trim()),
        responsibilities: responsibilities.split('\n').filter(r => r.trim()),
        remote_allowed: false,
        is_active: true
      });

      toast({
        title: 'Job Posted Successfully!',
        description: 'Your job listing is now live and accepting applications.',
      });
      onClose();
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to post job. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Post a New Job</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Create a job listing to attract qualified candidates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="job-title">Job Title *</Label>
            <Input
              id="job-title"
              placeholder="e.g., Server, Retail Associate, Barista"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="job-type">Employment Type *</Label>
              <Select value={jobType} onValueChange={(value) => setJobType(value as Enums<'job_type'>)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g., New York, NY"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary-min">Minimum Salary</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="salary-min"
                  type="number"
                  placeholder="e.g., 40000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="salary-max">Maximum Salary</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="salary-max"
                  type="number"
                  placeholder="e.g., 60000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and what makes this opportunity special..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="responsibilities">Responsibilities</Label>
            <Textarea
              id="responsibilities"
              placeholder="List the main responsibilities (one per line)..."
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="requirements">Requirements & Qualifications</Label>
            <Textarea
              id="requirements"
              placeholder="List the requirements (one per line)..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-primary to-primary/80">
            {loading ? 'Posting...' : 'Post Job'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};