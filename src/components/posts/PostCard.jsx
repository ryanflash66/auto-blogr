import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Hash,
  Eye,
  Image as ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function PostCard({ posts, loading, onPostSelect, selectedPost }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckCircle2 className="w-4 h-4" />;
      case 'ready': return <FileText className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ready': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
      <Card className="border-2 border-dashed border-gray-200">
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No posts found</h3>
          <p className="text-gray-500">Generate some content from your blog ideas to see them here</p>
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
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              selectedPost?.id === post.id
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-transparent hover:border-gray-200'
            }`}
            onClick={() => onPostSelect(post)}
          >
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Hero Image */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {post.hero_image_url ? (
                    <img
                      src={post.hero_image_url}
                      alt={post.hero_image_alt || post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mr-4">
                      {post.title}
                    </h3>
                    <Badge className={`${getStatusColor(post.status)} border flex-shrink-0`}>
                      {getStatusIcon(post.status)}
                      <span className="ml-1 capitalize">{post.status}</span>
                    </Badge>
                  </div>

                  {post.excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
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
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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