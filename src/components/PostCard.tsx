import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostCardProps {
  post: {
    id: string;
    image_url: string;
    caption: string;
    created_at: string;
    user_id: string;
    profiles?: {
      username: string;
      avatar_url?: string;
    };
  };
  currentUserId?: string;
}

export const PostCard = ({ post, currentUserId }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    fetchLikes();
    
    const channel = supabase
      .channel(`post-${post.id}-likes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${post.id}`
        },
        () => {
          fetchLikes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id, currentUserId]);

  const fetchLikes = async () => {
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', post.id);

    if (!error && data) {
      setLikesCount(data.length);
      if (currentUserId) {
        setIsLiked(data.some(like => like.user_id === currentUserId));
      }
    }
  };

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to like posts");
      return;
    }

    if (isLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUserId);

      if (error) {
        toast.error("Error removing like");
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: post.id, user_id: currentUserId });

      if (error) {
        toast.error("Error adding like");
      }
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-hover)]" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center gap-3 p-4">
        <Avatar>
          <AvatarImage src={post.profiles?.avatar_url} />
          <AvatarFallback className="bg-[image:var(--gradient-primary)] text-primary-foreground">
            {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{post.profiles?.username || 'Unknown User'}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="aspect-square w-full overflow-hidden">
        <img
          src={post.image_url}
          alt={post.caption || 'Post'}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="gap-2 hover:text-accent"
          >
            <Heart
              className={`h-6 w-6 transition-colors ${
                isLiked ? 'fill-accent text-accent' : ''
              }`}
            />
            <span className="font-semibold">{likesCount}</span>
          </Button>
        </div>

        {post.caption && (
          <p className="text-sm">
            <span className="font-semibold mr-2">{post.profiles?.username}</span>
            {post.caption}
          </p>
        )}
      </div>
    </Card>
  );
};
