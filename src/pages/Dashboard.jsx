import { useState, useEffect } from "react";
import { BlogIdea } from "@/entities/BlogIdea";
import { BlogPost } from "@/entities/BlogPost";
import { WordPressSite } from "@/entities/WordPressSite";
import { User } from "@/entities/User";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  TrendingUp, 
  FileText, 
  Lightbulb,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Globe
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalIdeas: 0,
    totalPosts: 0,
    publishedPosts: 0,
    connectedSites: 0
  });
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load user data
      const userData = await User.me();
      setUser(userData);

      // Load stats
      const [ideas, posts, sites] = await Promise.all([
        BlogIdea.list('-created_date', 50),
        BlogPost.list('-created_date', 50),
        WordPressSite.list('-created_date', 10)
      ]);

      setStats({
        totalIdeas: ideas.length,
        totalPosts: posts.length,
        publishedPosts: posts.filter(p => p.status === 'published').length,
        connectedSites: sites.filter(s => s.connection_status === 'connected').length
      });

      // Set recent data
      setRecentIdeas(ideas.slice(0, 5));
      setRecentPosts(posts.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-emerald-100 text-emerald-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'generating': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckCircle2 className="w-3 h-3" />;
      case 'generating': return <Clock className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="space-y-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Welcome back{user?.business_name ? `, ${user.business_name}` : ''}
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Let's create some amazing content today
            </p>
          </div>
          <Link to={createPageUrl("Ideas")}>
            <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg text-white px-6 py-3 h-auto">
              <Plus className="w-5 h-5 mr-2" />
              New Blog Idea
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -translate-y-10 translate-x-10 opacity-30"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Lightbulb className="w-8 h-8 text-blue-600" />
              <span className="text-2xl lg:text-3xl font-bold text-blue-700">{stats.totalIdeas}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-blue-800">Blog Ideas</p>
            <p className="text-xs text-blue-600 mt-1">Ready to generate</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200 rounded-full -translate-y-10 translate-x-10 opacity-30"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <FileText className="w-8 h-8 text-emerald-600" />
              <span className="text-2xl lg:text-3xl font-bold text-emerald-700">{stats.totalPosts}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-emerald-800">Generated Posts</p>
            <p className="text-xs text-emerald-600 mt-1">AI-created content</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200 rounded-full -translate-y-10 translate-x-10 opacity-30"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 text-amber-600" />
              <span className="text-2xl lg:text-3xl font-bold text-amber-700">{stats.publishedPosts}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-amber-800">Published</p>
            <p className="text-xs text-amber-600 mt-1">Live on your site</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full -translate-y-10 translate-x-10 opacity-30"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 text-purple-600" />
              <span className="text-2xl lg:text-3xl font-bold text-purple-700">{stats.connectedSites}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-purple-800">Connected Sites</p>
            <p className="text-xs text-purple-600 mt-1">WordPress ready</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Ideas */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                Recent Ideas
              </CardTitle>
              <Link to={createPageUrl("Ideas")}>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentIdeas.length > 0 ? (
              recentIdeas.map((idea) => (
                <div key={idea.id} className="flex items-start justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{idea.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{idea.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(idea.status)}>
                        {getStatusIcon(idea.status)}
                        <span className="ml-1 capitalize">{idea.status}</span>
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(idea.created_date), 'MMM d')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No blog ideas yet</p>
                <Link to={createPageUrl("Ideas")}>
                  <Button variant="outline" className="mt-4">
                    Create your first idea
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Recent Posts
              </CardTitle>
              <Link to={createPageUrl("Posts")}>
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div key={post.id} className="flex items-start justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{post.title}</h4>
                    <p className="text-sm text-gray-600">{post.word_count} words • Variation {post.variation_number}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(post.status)}>
                        {getStatusIcon(post.status)}
                        <span className="ml-1 capitalize">{post.status}</span>
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(post.created_date), 'MMM d')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No posts generated yet</p>
                <Link to={createPageUrl("Ideas")}>
                  <Button variant="outline" className="mt-4">
                    Generate your first post
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}