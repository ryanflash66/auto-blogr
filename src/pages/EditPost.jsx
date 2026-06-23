import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { BlogPost } from "@/services/blogPosts";
import { BlogPostVersion } from "@/services/blogPostVersions";
import { InvokeLLM } from "@/lib/openrouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, Loader2, ImageIcon, X, Globe, Eye, Sparkles, Wand2, PanelRight, ChevronRight } from "lucide-react";
import ToneRephraser from "../components/posts/ToneRephraser";
import SEOAnalyzer from "../components/posts/SEOAnalyzer";
import VersionHistory from "../components/posts/VersionHistory";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import PublishModal from "../components/posts/PublishModal";

export default function EditPost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showToneRephraser, setShowToneRephraser] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [generatingSEO, setGeneratingSEO] = useState({ seo_title: false, meta_description: false });
  const [post, setPost] = useState(null);
  const [lastSavedVersion, setLastSavedVersion] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    hero_image_url: "",
    hero_image_alt: "",
    seo_title: "",
    meta_description: "",
    tags: ""
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id && user?.id) {
      loadPost(id);
    } else if (!id) {
      navigate(createPageUrl("Posts"));
    }
  }, [user?.id]);

  const loadPost = async (id) => {
    if (!user?.id) return;
    
    try {
      const posts = await BlogPost.filter(user.id, { id });
      if (posts && posts.length > 0) {
        const currentPost = posts[0];
        setPost(currentPost);

        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        let cleanContent = currentPost.content || "";
        const title = currentPost.title || "";
        const altText = currentPost.hero_image_alt || "";

        if (title) {
          const escapedTitle = escapeRegExp(title);
          const doubleTitleRegex = new RegExp(`^${escapedTitle}${escapedTitle}\\s*`, 'i');
          cleanContent = cleanContent.replace(doubleTitleRegex, "");
          const singleTitleRegex = new RegExp(`^${escapedTitle}\\s*`, 'i');
          cleanContent = cleanContent.replace(singleTitleRegex, "");
        }

        if (altText) {
           const escapedAlt = escapeRegExp(altText);
           const imgWithAltRegex = new RegExp(`<img[^>]*alt=["']?${escapedAlt}["']?[^>]*>`, 'gi');
           cleanContent = cleanContent.replace(imgWithAltRegex, "");
           const plainAltRegex = new RegExp(`^\\s*${escapedAlt}\\s*`, 'i');
           cleanContent = cleanContent.replace(plainAltRegex, "");
           const pAltRegex = new RegExp(`^\\s*<p>\\s*${escapedAlt}\\s*<\\/p>`, 'i');
           cleanContent = cleanContent.replace(pAltRegex, "");
        }

        cleanContent = cleanContent.replace(/^\s*(<p>)?\s*<img[^>]*>\s*(<\/p>)?/i, "");
        cleanContent = cleanContent.replace(/^\s*<p>\s*<br>\s*<\/p>\s*/i, "");

        setFormData({
          title: currentPost.title || "",
          content: cleanContent,
          excerpt: currentPost.excerpt || "",
          hero_image_url: currentPost.hero_image_url || "",
          hero_image_alt: currentPost.hero_image_alt || "",
          seo_title: currentPost.seo_title || "",
          meta_description: currentPost.meta_description || "",
          tags: currentPost.tags ? currentPost.tags.join(", ") : ""
        });
      } else {
        navigate(createPageUrl("Posts"));
      }
    } catch (error) {
      console.error("Error loading post:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    const tagsArray = formData.tags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const updatedData = {
      ...formData,
      tags: tagsArray,
      word_count: formData.content.replace(/<[^>]*>/g, '').split(/\s+/).length
    };

    await BlogPost.update(post.id, updatedData);
    
    try {
      const existingVersions = await BlogPostVersion.filter({ blog_post_id: post.id });
      const nextVersionNum = existingVersions.length + 1;

      await BlogPostVersion.create({
        blog_post_id: post.id,
        title: updatedData.title,
        content: updatedData.content,
        excerpt: updatedData.excerpt,
        version_number: nextVersionNum,
        change_type: 'manual_save'
      });
      
      setLastSavedVersion(new Date().toISOString());
    } catch (verError) {
      console.error("Failed to create version history:", verError);
    }
    
    const updatedPost = { ...post, ...updatedData };
    setPost(updatedPost);
    return updatedPost;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveChanges();
      toast({
        title: "Post saved",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        variant: "destructive",
        title: "Couldn't save post",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishClick = async () => {
    setSaving(true);
    try {
      await saveChanges();
      setShowPublishModal(true);
    } catch (error) {
      console.error("Error saving before publish:", error);
      toast({
        variant: "destructive",
        title: "Couldn't save post",
        description: error.message || "We couldn't save your changes before publishing. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const generateSEOTitle = async () => {
    setGeneratingSEO({ ...generatingSEO, seo_title: true });
    try {
      const response = await InvokeLLM({
        prompt: `Generate an SEO-optimized title for this blog post. The title should be catchy, include relevant keywords, and be under 60 characters.

Post Title: ${formData.title}
Content Preview: ${formData.content?.substring(0, 500) || formData.excerpt}

Generate only the SEO title, no additional text. Do not use quotation marks.`
      });
      setFormData(prev => ({ ...prev, seo_title: response.trim() }));
    } catch (error) {
      console.error("Error generating SEO title:", error);
      toast({
        variant: "destructive",
        title: "Couldn't generate SEO title",
        description: error.message || "Check your AI provider settings and try again.",
      });
    } finally {
      setGeneratingSEO({ ...generatingSEO, seo_title: false });
    }
  };

  const generateMetaDescription = async () => {
    setGeneratingSEO({ ...generatingSEO, meta_description: true });
    try {
      const response = await InvokeLLM({
        prompt: `Generate an SEO-optimized meta description for this blog post. It should be compelling, include relevant keywords, and be under 160 characters.

Post Title: ${formData.title}
Content Preview: ${formData.content?.substring(0, 500) || formData.excerpt}

Generate only the meta description, no additional text. Do not use quotation marks.`
      });
      setFormData(prev => ({ ...prev, meta_description: response.trim() }));
    } catch (error) {
      console.error("Error generating meta description:", error);
      toast({
        variant: "destructive",
        title: "Couldn't generate meta description",
        description: error.message || "Check your AI provider settings and try again.",
      });
    } finally {
      setGeneratingSEO({ ...generatingSEO, meta_description: false });
    }
  };

  const handleApplyRephrasedContent = (newContent) => {
    setFormData(prev => ({ ...prev, content: newContent }));
    setShowToneRephraser(false);
  };

  const handleSEOImprove = (improvements) => {
    setFormData(prev => ({
      ...prev,
      seo_title: improvements.seo_title || prev.seo_title,
      meta_description: improvements.meta_description || prev.meta_description
    }));
  };

  const handleRestoreVersion = (version) => {
    setFormData(prev => ({
      ...prev,
      title: version.title || prev.title,
      content: version.content || prev.content,
      excerpt: version.excerpt || prev.excerpt
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(createPageUrl("Posts"))}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Post</h1>
              <p className="text-sm text-gray-500">Make changes to your generated content</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => navigate(createPageUrl("Posts"))}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setShowPreview(true)}
              variant="outline"
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>

            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            
            <Button 
              onClick={handlePublishClick}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Globe className="w-4 h-4 mr-2" />
              Publish
            </Button>
            
            <div className="w-px h-8 bg-gray-200 mx-2"></div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`text-gray-500 hover:text-gray-900 ${isSidebarOpen ? 'bg-gray-100' : ''}`}
              title="Toggle Sidebar"
            >
              <PanelRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {showPublishModal && (
        <PublishModal
          post={post}
          onClose={() => setShowPublishModal(false)}
          onPublishSuccess={() => navigate(createPageUrl("Posts"))}
        />
      )}

      {showToneRephraser && (
        <ToneRephraser
          content={formData.content}
          onApply={handleApplyRephrasedContent}
          onClose={() => setShowToneRephraser(false)}
        />
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{formData.title || "Untitled Post"}</h2>
                <p className="text-sm text-gray-500 mt-1">Preview Mode</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-8 overflow-y-auto bg-white">
               {formData.hero_image_url && (
                 <img 
                   src={formData.hero_image_url} 
                   alt={formData.hero_image_alt || formData.title}
                   className="w-full h-64 object-cover rounded-xl mb-8"
                 />
               )}
               <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content) }} />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex relative">
        {/* Main Editor Area */}
        <div className={`flex-1 transition-all duration-300 ease-in-out px-6 py-8 space-y-8 ${isSidebarOpen ? 'mr-0 lg:mr-96' : ''}`}>
          <div className="max-w-5xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Post Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="text-lg font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Content</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowToneRephraser(true)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-8"
                    >
                      <Wand2 className="w-3 h-3 mr-1.5" />
                      Rephrase with AI
                    </Button>
                  </div>
                  <div className="prose-editor resize-y overflow-hidden rounded-md border" style={{ height: '600px', minHeight: '300px' }}>
                    <style>{`
                      .ql-container { height: calc(100% - 42px) !important; }
                      .ql-editor { height: 100%; overflow-y: auto; }
                    `}</style>
                    <ReactQuill 
                      theme="snow"
                      value={formData.content}
                      onChange={(content) => setFormData({...formData, content})}
                      className="h-full"
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                          [{'list': 'ordered'}, {'list': 'bullet'}],
                          ['link', 'image'],
                          ['clean']
                        ],
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-gray-900">SEO Settings</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateSEOTitle}
                      disabled={generatingSEO.seo_title}
                      className="h-6 text-xs text-purple-600 hover:text-purple-700 px-2"
                    >
                      {generatingSEO.seo_title ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      Generate
                    </Button>
                  </div>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                    placeholder="Optimized title for search engines"
                  />
                  <div className="flex justify-end">
                    <span className={`text-xs ${formData.seo_title.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                      {formData.seo_title.length}/60
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateMetaDescription}
                      disabled={generatingSEO.meta_description}
                      className="h-6 text-xs text-purple-600 hover:text-purple-700 px-2"
                    >
                      {generatingSEO.meta_description ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      Generate
                    </Button>
                  </div>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                    placeholder="Summary for search results"
                    className="h-24"
                  />
                  <div className="flex justify-end">
                    <span className={`text-xs ${formData.meta_description.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                      {formData.meta_description.length}/160
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Floating Sidebar */}
        <div 
          className={`fixed right-0 top-[73px] bottom-0 w-96 bg-white border-l shadow-2xl transform transition-transform duration-300 ease-in-out z-20 overflow-y-auto ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 space-y-6 pb-24">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-gray-900">Assistant & Settings</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Version History */}
            {post && (
              <VersionHistory
                postId={post.id}
                currentVersion={lastSavedVersion}
                onRestore={handleRestoreVersion}
              />
            )}

            {/* SEO Analyzer */}
            <SEOAnalyzer 
              post={formData} 
              onImprove={handleSEOImprove}
            />

            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-gray-900">Featured Image</h3>
                
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border relative group">
                    {formData.hero_image_url ? (
                      <>
                        <img 
                          src={formData.hero_image_url} 
                          alt={formData.hero_image_alt}
                          className="w-full h-full object-cover"
                        />
                        <button 
                          onClick={() => setFormData({...formData, hero_image_url: ""})}
                          className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs">No image set</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url" className="text-xs">Image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.hero_image_url}
                      onChange={(e) => setFormData({...formData, hero_image_url: e.target.value})}
                      placeholder="https://..."
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_alt" className="text-xs">Alt Text</Label>
                    <Input
                      id="image_alt"
                      value={formData.hero_image_alt}
                      onChange={(e) => setFormData({...formData, hero_image_alt: e.target.value})}
                      placeholder="Description of image"
                      className="text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-gray-900">Organization</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    className="h-32 text-sm"
                    placeholder="Brief summary of the post..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="technology, ai, future (comma separated)"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
