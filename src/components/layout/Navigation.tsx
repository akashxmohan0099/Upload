import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Briefcase, Users, User, Bell, Menu, X, MessageSquare, Settings, LogOut, Building2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Different nav items for candidates vs recruiters
  const candidateNavItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/jobs', icon: Briefcase, label: 'Jobs' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
  ];

  const recruiterNavItems = [
    { path: '/recruiter-dashboard', icon: Home, label: 'Dashboard' },
    { path: '/talent-pool', icon: Search, label: 'Find Talent' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
  ];

  const navItems = profile?.user_type === 'recruiter' ? recruiterNavItems : candidateNavItems;

  if (!isAuthenticated) {
    return (
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="font-display font-bold text-xl text-gradient">Nexus</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="hero">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to={profile?.user_type === 'recruiter' ? '/recruiter-dashboard' : '/dashboard'} className="flex items-center space-x-2">
              <div className={`w-10 h-10 ${profile?.user_type === 'recruiter' ? 'bg-gradient-secondary' : 'bg-gradient-primary'} rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="font-display font-bold text-xl text-gradient hidden sm:inline">Nexus</span>
              {profile?.user_type === 'recruiter' && (
                <Badge variant="outline" className="ml-2">Recruiter</Badge>
              )}
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link key={path} to={path}>
                  <Button
                    variant={location.pathname === path ? 'glass' : 'ghost'}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-accent">
                3
              </Badge>
            </Button>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || user?.email} />
                    <AvatarFallback>{(profile?.full_name || user?.email)?.[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    {profile?.user_type === 'recruiter' && (
                      <Badge variant="outline" className="text-xs w-fit">
                        <Building2 className="h-3 w-3 mr-1" />
                        Recruiter
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {profile?.user_type === 'candidate' && (
                  <DropdownMenuItem onClick={() => navigate('/applications')}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Applications
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={location.pathname === path ? 'glass' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};