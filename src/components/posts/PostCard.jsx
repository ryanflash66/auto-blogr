import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  FileText, 
  CheckCircle2, 
  Calendar,
  Hash,
  Eye,
  Image as ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function PostCard({ posts, loading, onPostSelect, selectedPost }) {
  if (loading) {
    return (
      <div className="grid gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-muted rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="border-2 border-dashed border-border">
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground/70 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">No posts found</h3>
          <p className="text-muted-foreground">Generate some content from your blog ideas to see them here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-lift border-2 ${
              selectedPost?.id === post.id
                ? 'border-primary/30 bg-accent/50'
                : 'border-transparent hover:border-border'
            }`}
            onClick={() => onPostSelect(post)}
          >
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Hero Image */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {post.hero_image_url ? (
                    <img
                      src={post.hero_image_url}
                      alt={post.hero_image_alt || post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/70" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground line-clamp-2 mr-4">
                      {post.title}
                    </h3>
                    <StatusBadge status={post.status} className="flex-shrink-0" />
                  </div>

                  {post.excerpt && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(post.created_date), 'MMM d, yyyy')}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.word_count || 0} words
                    </div>

                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Variation {post.variation_number}
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {post.tags.length} tag{post.tags.length > 1 ? 's' : ''}
                      </div>
                    )}

                    {post.published_at && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-primary" />
                        Published {format(new Date(post.published_at), 'MMM d')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}