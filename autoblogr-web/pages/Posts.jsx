// Posts.js - Generated posts management page component
import React, { useState, useEffect } from "react";
import { BlogPost } from "@/entities/BlogPost";
import { BlogIdea } from "@/entities/BlogIdea";
import { WordPressSite } from "@/entities/WordPressSite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Filter,
  Eye,
  Edit3,
  ExternalLink,
  Calendar,
  FileText,
  Image,
  ChevronDown,
  Upload,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("-created_date");

  // WordPress publishing state
  const [wordpressSites, setWordpressSites] = useState([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadPosts();
    loadWordPressSites();
  }, []);

  useEffect(() => {
    filterAndSortPosts();
  }, [posts, searchTerm, statusFilter, sortBy]);

  const loadPosts = async () => {
    try {
      const data = await BlogPost.list(sortBy, 100);
      setPosts(data);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadWordPressSites = async () => {
    try {
      const sites = await WordPressSite.findAll();
      setWordpressSites(sites.filter((site) => site.status === "connected"));
    } catch (error) {
      console.error("Error loading WordPress sites:", error);
    }
  };

  const handlePublishToWordPress = async (post) => {
    if (wordpressSites.length === 0) {
      alert(
        "No connected WordPress sites found. Please connect a WordPress site first."
      );
      return;
    }

    if (publishing) return;

    const confirmed = confirm(`Publish "${post.title}" to WordPress?`);
    if (!confirmed) return;

    setPublishing(true);

    try {
      const site = wordpressSites[0]; // Use first connected site for now

      const result = await site.publishPost({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        status: "draft", // Start with draft
        categories: post.categories || [],
        tags: post.tags || [],
      });

      if (result.success) {
        // Update post status
        post.wordpress_post_id = result.post.id;
        post.wordpress_url = result.post.link;
        post.status = "published";
        await post.save();

        alert(
          `Successfully published "${post.title}" to WordPress!\nView at: ${result.post.link}`
        );

        // Reload posts to show updated status
        await loadPosts();
      }
    } catch (error) {
      console.error("Publishing error:", error);
      alert(`Failed to publish post: ${error.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const filterAndSortPosts = () => {
    let filtered = [...posts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((post) => post.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const [field, direction] = sortBy.startsWith("-")
        ? [sortBy.slice(1), "desc"]
        : [sortBy, "asc"];

      let aVal = a[field];
      let bVal = b[field];

      if (field === "created_date") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (direction === "desc") {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });

    setFilteredPosts(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "generating":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "published":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground">
            Manage and publish your AI-generated blog content
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="generating">Generating</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <ChevronDown className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_date">Newest First</SelectItem>
            <SelectItem value="created_date">Oldest First</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
            <SelectItem value="-title">Title Z-A</SelectItem>
            <SelectItem value="-word_count">Word Count High</SelectItem>
            <SelectItem value="word_count">Word Count Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-6">
              {posts.length === 0
                ? "Generate your first post from a blog idea"
                : "Try adjusting your search or filter criteria"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="group hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(post.status)}>
                      {post.status}
                    </Badge>
                    {post.wordpress_post_id && (
                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-200 bg-blue-50"
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        WordPress
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {/* Publish to WordPress Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePublishToWordPress(post)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title={
                        post.wordpress_post_id
                          ? "Re-publish to WordPress"
                          : "Publish to WordPress"
                      }
                      disabled={publishing}
                    >
                      {publishing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : post.wordpress_post_id ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                    {/* WordPress URL Button */}
                    {post.wordpress_url && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          window.open(post.wordpress_url, "_blank")
                        }
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="View on WordPress"
                      >
                        <Globe className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {post.hero_image_url && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={post.hero_image_url}
                      alt={post.hero_image_alt || post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold line-clamp-2 mb-1">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(post.created_date), "MMM d, yyyy")}
                    </span>
                  </div>
                  {post.word_count && (
                    <div className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>{post.word_count} words</span>
                    </div>
                  )}
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Status Summary */}
      {wordpressSites.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No WordPress sites connected.
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => (window.location.href = "/wordpress")}
            >
              Connect a WordPress site
            </Button>{" "}
            to enable publishing.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
