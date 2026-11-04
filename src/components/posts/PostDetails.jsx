import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BlogPost } from "@/services/blogPosts";
import { InvokeLLM } from "@/lib/openrouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Edit,
  Calendar,
  FileText,
  Hash,
  Loader2,
  Sparkles,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

export default function PostDetails({ post, onUpdate }) {
  const navigate = useNavigate();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditPost = () => {
    navigate(createPageUrl("EditPost") + `?id=${post.id}`);
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    setIsDeleting(true);
    try {
      await BlogPost.delete(post.id);
      onUpdate();
      toast({
        title: "Post deleted",
        description: "The post has been removed.",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        variant: "destructive",
        title: "Couldn't delete post",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRegenerateExcerpt = async () => {
    setIsRegenerating(true);
    try {
      const response = await InvokeLLM({
        prompt: `Generate a compelling excerpt (2-3 sentences) for this blog post:

Title: ${post.title}
Content: ${post.content?.substring(0, 1000)}

Generate only the excerpt, no additional text.`
      });

      await BlogPost.update(post.id, { excerpt: response.trim() });
      onUpdate();
    } catch (error) {
      console.error("Error regenerating excerpt:", error);
      toast({
        variant: "destructive",
        title: "Couldn't regenerate excerpt",
        description: error.message || "Check your AI provider settings and try again.",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-accent text-accent-foreground';
      case 'ready': return 'bg-status-ready-bg text-status-ready';
      case 'scheduled': return 'bg-status-scheduled-bg text-status-scheduled';
      default: return 'bg-muted text-foreground';
    }
  };

  return (
    <Card className="border-0 shadow-lift">
      <CardHeader className="border-b bg-muted/50">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Post Details
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Title */}
        <div>
          <h3 className="font-semibold text-foreground mb-1">{post.title}</h3>
          <Badge className={getStatusColor(post.status)}>
            <span className="capitalize">{post.status}</span>
          </Badge>
        </div>

        {/* Metadata */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground/70" />
            <span className="text-muted-foreground">
              Created {format(new Date(post.created_date), 'MMM d, yyyy')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-muted-foreground/70" />
            <span className="text-muted-foreground">{post.word_count} words</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Hash className="w-4 h-4" />
              Tags
            </div>
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Excerpt</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerateExcerpt}
                disabled={isRegenerating}
                className="h-6 text-xs"
              >
                {isRegenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Regenerate
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t space-y-2">
          <Button
            onClick={handleEditPost}
            className="w-full bg-primary hover:bg-primary"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Post
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDeletePost}
            disabled={isDeleting}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
