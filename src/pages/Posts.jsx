import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { BlogPost } from "@/services/blogPosts";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
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
    <div className="space-y-7">
      <PageHeader
        eyebrow="Content"
        title="Posts"
        description="Review, refine and publish the drafts your model keys generated."
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="Search posts…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-full md:w-44">
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
          <SelectTrigger className="h-10 w-full md:w-44">
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

      <div className="grid gap-6 lg:grid-cols-4">
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
