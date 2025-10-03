import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Navigation } from "./components/layout/Navigation";
import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { RecruiterAuth } from "./pages/RecruiterAuth";
import { Dashboard } from "./pages/Dashboard";
import { RecruiterDashboard } from "./pages/RecruiterDashboard";
import { JobListings } from "./pages/JobListings";
import { CandidateBrowser } from "./pages/CandidateBrowser";


import { Messages } from "./pages/Messages";
import { Applications } from "./pages/Applications";
import { Settings } from "./pages/Settings";
import { CompanyProfileSetup } from "./components/company/CompanyProfileSetup";
import { TalentPool } from "./pages/TalentPool";
import NotFound from "./pages/NotFound";
import { ProfileCompletionFlow } from "./components/profile/ProfileCompletionFlow";
import { PublicProfileView } from "./components/profile/PublicProfileView";
import { PersonalProfileFlow } from "./components/profile/PersonalProfileFlow";
import { ProfessionalProfileFlow } from "./components/profile/ProfessionalProfileFlow";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requireRecruiter = false }: { children: React.ReactNode; requireRecruiter?: boolean }) => {
  const { isAuthenticated, profile, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (requireRecruiter && profile?.user_type !== 'recruiter') return <Navigate to="/dashboard" />;
  if (!requireRecruiter && profile?.user_type === 'recruiter') return <Navigate to="/recruiter-dashboard" />;
  
  return <>{children}</>;
};

const App = () => {
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Navigation />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/recruiter-auth" element={<RecruiterAuth />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/recruiter-dashboard" element={<ProtectedRoute><RecruiterDashboard /></ProtectedRoute>} />
                <Route path="/jobs" element={<JobListings />} />

                <Route path="/profile" element={<Navigate to="/profile/view" />} />
                <Route path="/profile/complete" element={<ProtectedRoute><ProfileCompletionFlow /></ProtectedRoute>} />
                <Route path="/profile/personal" element={<ProtectedRoute><PersonalProfileFlow /></ProtectedRoute>} />
                <Route path="/profile/professional" element={<ProtectedRoute><ProfessionalProfileFlow /></ProtectedRoute>} />
                <Route path="/profile/view" element={<ProtectedRoute><PublicProfileView /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/company-setup" element={<ProtectedRoute><CompanyProfileSetup /></ProtectedRoute>} />
                <Route path="/talent-pool" element={<ProtectedRoute><TalentPool /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('App initialization error:', error);
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
        <h1>Unable to load application</h1>
        <p>Please check your environment configuration</p>
      </div>
    );
  }
};

export default App;
