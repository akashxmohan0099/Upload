import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, Briefcase, TrendingUp, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const Landing = () => {
  const features = [
    {
      icon: Briefcase,
      title: 'Smart Job Discovery',
      description: 'Find opportunities that align with your goals and values'
    },
    {
      icon: Users,
      title: 'Build Your Network',
      description: 'Connect with peers and mentors in your industry'
    },
    {
      icon: TrendingUp,
      title: 'Track Your Progress',
      description: 'Stay organized with visual application tracking'
    },
    {
      icon: Star,
      title: 'Showcase Your Story',
      description: 'Create a profile that truly represents you'
    }
  ];

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'UX Designer',
      content: 'Finally, a job platform that doesn\'t feel like homework!',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
    },
    {
      name: 'Jordan Smith',
      role: 'Software Engineer',
      content: 'The job discovery feature is amazing. Found my dream role in just a week!',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan'
    },
    {
      name: 'Sam Wilson',
      role: 'Marketing Manager',
      content: 'The networking features helped me connect with amazing people in my field.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sam'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Built for Gen Z Professionals</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              <span className="text-gradient">Job Hunting</span>
              <br />
              <span className="text-foreground">Made Fun</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover your dream career through smart job recommendations. Connect with peers, 
              explore opportunities, and build your professional network - all in one vibrant platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl" className="group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="glass" size="xl">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 floating">
          <div className="w-20 h-20 bg-gradient-primary rounded-full opacity-20 blur-xl"></div>
        </div>
        <div className="absolute bottom-20 right-10 floating" style={{ animationDelay: '1s' }}>
          <div className="w-32 h-32 bg-gradient-secondary rounded-full opacity-20 blur-xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Why Nexus <span className="text-gradient">Hits Different</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              We've reimagined professional networking for the digital generation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass rounded-xl p-6 hover-lift"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="text-gradient">Real Stories</span> from Real Users
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-foreground/80 italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-2xl p-12"
          >
            <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Level Up Your Career?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of Gen Z professionals already using Nexus
            </p>
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};