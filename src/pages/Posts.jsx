import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { BlogPost } from "@/services/blogPosts";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Search, Filter } from "lucide-react";

import PostCard from "../components/posts/PostCard";
import PostDetails from "../components/posts/PostDetails";
import SEOAnalyzer from "../components/posts/SEOAnalyzer";
import ContentAnalyzer from "../components/posts/ContentAnalyzer";

export default function Posts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("-created_at");

  useEffect(() => {
    if (user?.id) {
      loadPosts();
    }
  }, [user?.id, sortBy]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, statusFilter]);

  const loadPosts = async () => {
    if (!user?.id) return;
    
    try {
      const data = await BlogPost.list(user.id, sortBy);
      setPosts(data);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    setFilteredPosts(filtered);
  };

  const handleSEOImprove = async (improvements) => {
    if (!selectedPost) return;
    
    try {
      await BlogPost.update(selectedPost.id, {
        seo_title: improvements.seo_title,
        meta_description: improvements.meta_description
      });
      loadPosts();
      toast({
        title: "SEO updated",
        description: "The improved title and meta description have been saved.",
      });
    } catch (error) {
      console.error("Error applying SEO improvements:", error);
      toast({
        variant: "destructive",
        title: "Couldn't apply SEO improvements",
        description: error.message || "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Generated Posts</h1>
          <p className="text-lg text-gray-600 mt-1">Manage your AI-generated content</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48 h-12">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {/* Canonical post/idea status set: draft | generating | ready | published | scheduled */}
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="generating">Generating</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48 h-12">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_at">Newest First</SelectItem>
            <SelectItem value="created_at">Oldest First</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
            <SelectItem value="-title">Title Z-A</SelectItem>
            <SelectItem value="-word_count">Longest First</SelectItem>
            <SelectItem value="word_count">Shortest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Posts List */}
        <div className="lg:col-span-3">
          <PostCard
            posts={filteredPosts}
            loading={loading}
            onPostSelect={setSelectedPost}
            selectedPost={selectedPost}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {selectedPost && (
            <>
              <PostDetails
                post={selectedPost}
                onUpdate={loadPosts}
              />
              <ContentAnalyzer
                post={selectedPost}
                onApplyImprovement={loadPosts}
              />
              <SEOAnalyzer
                post={selectedPost}
                onImprove={handleSEOImprove}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
