import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-image.jpg";
import { Camera, Heart, Users, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/feed');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-primary)] opacity-5" />
        
        <div className="container relative py-20 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Share Your{" "}
                <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
                  Moments
                </span>
                <br />
                Connect With{" "}
                <span className="bg-[image:var(--gradient-accent)] bg-clip-text text-transparent">
                  Friends
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-md">
                Join Snapgram and share your life's best moments with a vibrant community of creators and friends.
              </p>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-[image:var(--gradient-primary)] hover:opacity-90 transition-opacity text-lg"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
                {!user && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-[image:var(--gradient-primary)] rounded-3xl blur-3xl opacity-20" />
              <img
                src={heroImage}
                alt="Snapgram social media platform"
                className="relative rounded-3xl shadow-2xl"
                style={{ boxShadow: 'var(--shadow-hover)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose{" "}
              <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
                Snapgram
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to share, connect, and engage with your community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Camera,
                title: "Easy Sharing",
                description: "Share photos and moments with just a few clicks"
              },
              {
                icon: Heart,
                title: "Engage & Like",
                description: "Show love to your favorite posts with instant reactions"
              },
              {
                icon: Users,
                title: "Connect",
                description: "Build your community and follow amazing creators"
              },
              {
                icon: Zap,
                title: "Real-time Updates",
                description: "Get instant notifications for likes and new posts"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-card transition-all duration-300 hover:shadow-[var(--shadow-hover)]"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="h-12 w-12 rounded-lg bg-[image:var(--gradient-primary)] flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="rounded-3xl bg-[image:var(--gradient-primary)] p-12 text-center text-primary-foreground">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Sharing?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of users already sharing their stories on Snapgram
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              onClick={handleGetStarted}
            >
              Join Snapgram Today
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
