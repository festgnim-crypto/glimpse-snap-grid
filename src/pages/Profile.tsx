import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);
      await fetchProfile(session.user.id);
      await fetchUserPosts(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const fetchUserPosts = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      
      <main className="container max-w-4xl py-8">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-[image:var(--gradient-primary)] text-primary-foreground text-3xl">
                  {profile?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-2xl font-bold">{profile?.username || 'Loading...'}</h1>
                {profile?.full_name && (
                  <p className="text-muted-foreground">{profile.full_name}</p>
                )}
                {profile?.bio && (
                  <p className="mt-2">{profile.bio}</p>
                )}
                <div className="mt-4 flex gap-6">
                  <div>
                    <span className="font-bold">{posts.length}</span>
                    <span className="text-muted-foreground ml-1">posts</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold mb-4">Your Posts</h2>

        <div className="grid grid-cols-3 gap-2">
          {loading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))
          ) : posts.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="aspect-square overflow-hidden rounded-lg border hover:opacity-90 transition-opacity cursor-pointer"
              >
                <img
                  src={post.image_url}
                  alt={post.caption || 'Post'}
                  className="h-full w-full object-cover"
                />
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
