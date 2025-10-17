import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, TrendingUp, Zap, MessageSquare, BarChart3, Target } from 'lucide-react';
import { useState, useRef } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const agentsRef = useRef<HTMLSpanElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (agentsRef.current) {
      const rect = agentsRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Video Background */}
        <div className="absolute inset-0 -z-10">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-futuristic-corridor-with-neon-lights-28888-large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 relative z-10 w-full">
          {/* Navigation */}
          <nav className="absolute top-6 right-6">
            <Button
              onClick={() => navigate('/shop')}
              variant="outline"
              className="font-medium border-primary/50 hover:bg-primary/10"
            >
              Ultron Electronics
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </nav>

          {/* Main Content */}
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-light tracking-tight text-foreground group">
              Ultron{' '}
              <span 
                ref={agentsRef}
                onMouseMove={handleMouseMove}
                className="font-semibold text-primary inline-block cursor-pointer relative overflow-hidden"
                style={{
                  background: `radial-gradient(circle 100px at ${mousePos.x}px ${mousePos.y}px, 
                    rgba(var(--primary-rgb, 139, 92, 246), 0.8),
                    rgba(var(--primary-rgb, 139, 92, 246), 0.4) 30%,
                    hsl(var(--primary)) 60%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  transition: 'background 0.1s ease-out',
                }}
              >
                Agents
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
              Market-ready AI agents for sales and marketing that drive real results
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="py-24 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-light text-foreground mb-4">
              Our AI Agent Suite
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Three specialized agents designed to transform your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sales Agent */}
            <div className="group relative bg-card/50 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 transition-all duration-500 hover:blur-none blur-sm hover:scale-105 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20">
              <div className="mb-6 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-all duration-500">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-light mb-4 text-foreground">Sales Agent</h3>
              <p className="text-muted-foreground font-light leading-relaxed mb-6">
                Intelligent conversational AI that engages prospects, qualifies leads, and closes deals 24/7. Trained on your best sales practices.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Automated lead qualification</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Natural conversation flow</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>CRM integration</span>
                </li>
              </ul>
            </div>

            {/* Marketing Agent */}
            <div className="group relative bg-card/50 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 transition-all duration-500 hover:blur-none blur-sm hover:scale-105 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20">
              <div className="mb-6 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-all duration-500">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-light mb-4 text-foreground">Marketing Agent</h3>
              <p className="text-muted-foreground font-light leading-relaxed mb-6">
                Data-driven marketing automation that creates, optimizes, and executes campaigns across all channels with precision targeting.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Multi-channel campaigns</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Real-time optimization</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Audience segmentation</span>
                </li>
              </ul>
            </div>

            {/* Analytics Agent */}
            <div className="group relative bg-card/50 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 transition-all duration-500 hover:blur-none blur-sm hover:scale-105 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20">
              <div className="mb-6 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-all duration-500">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-light mb-4 text-foreground">Analytics Agent</h3>
              <p className="text-muted-foreground font-light leading-relaxed mb-6">
                Advanced analytics AI that tracks performance, predicts trends, and provides actionable insights to maximize ROI.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Predictive analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Custom dashboards</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Automated reporting</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 sm:py-32 bg-card/30 backdrop-blur-sm border-y border-primary/10">
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
      <footer className="border-t border-primary/20 py-12 bg-card/20">
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
