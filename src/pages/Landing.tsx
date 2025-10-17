import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, TrendingUp, Users, Zap } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          {/* Navigation */}
          <nav className="absolute top-6 right-6">
            <Button
              onClick={() => navigate('/shop')}
              variant="outline"
              className="font-medium"
            >
              Ultron Electronics
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </nav>

          {/* Main Content */}
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-light tracking-tight text-foreground">
              Ultron <span className="font-semibold text-primary">Agents</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
              Market-ready AI agents for sales and marketing that drive real results
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Subtle gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-light">AI-Powered</h3>
              <p className="text-muted-foreground font-light leading-relaxed">
                Advanced AI agents that understand context and deliver personalized interactions
              </p>
            </div>

            <div className="space-y-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-light">Results-Driven</h3>
              <p className="text-muted-foreground font-light leading-relaxed">
                Proven track record of increasing conversion rates and revenue growth
              </p>
            </div>

            <div className="space-y-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-light">Market-Ready</h3>
              <p className="text-muted-foreground font-light leading-relaxed">
                Deploy immediately with pre-trained agents optimized for your industry
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-light text-primary mb-2">98%</div>
              <div className="text-muted-foreground font-light">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-5xl font-light text-primary mb-2">3x</div>
              <div className="text-muted-foreground font-light">Average ROI Increase</div>
            </div>
            <div>
              <div className="text-5xl font-light text-primary mb-2">24/7</div>
              <div className="text-muted-foreground font-light">Always Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-4xl sm:text-5xl font-light text-foreground">
            Ready to transform your business?
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Join leading companies using Ultron Agents to revolutionize their sales and marketing
          </p>
          <Button size="lg" className="text-lg px-8 py-6">
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground font-light">
            <p>&copy; 2025 Ultron Agents. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
