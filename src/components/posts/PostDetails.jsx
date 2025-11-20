import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { BlogPost } from "@/entities/BlogPost";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Eye, 
  Edit,
  Settings,
  Globe, 
  Calendar,
  Hash,
  FileText,
  Save,
  X,
  ExternalLink,
  Image as ImageIcon,
  Sparkles,
  Wand2,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import PublishModal from "./PublishModal";
import ToneRephraser from "./ToneRephraser";

export default function PostDetails({ post, onUpdate }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showToneRephraser, setShowToneRephraser] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatingSEO, setGeneratingSEO] = useState({ seo_title: false, meta_description: false });
  const [editData, setEditData] = useState({
    title: post.title || "",
    excerpt: post.excerpt || "",
    seo_title: post.seo_title || "",
    meta_description: post.meta_description || ""
  });

  const handleSave = async () => {
    try {
      await BlogPost.update(post.id, editData);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleCancel = () => {
    setEditData({
      title: post.title || "",
      excerpt: post.excerpt || "",
      seo_title: post.seo_title || "",
      meta_description: post.meta_description || ""
    });
    setIsEditing(false);
  };

  const handlePublishSuccess = () => {
    onUpdate();
  };

  const generateSEOTitle = async () => {
    setGeneratingSEO({ ...generatingSEO, seo_title: true });
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an SEO-optimized title for this blog post. The title should be catchy, include relevant keywords, and be under 60 characters.

Post Title: ${post.title}
Content Preview: ${post.content?.substring(0, 500) || post.excerpt}

Generate only the SEO title, no additional text. Do not use quotation marks.`
      });
      setEditData(prev => ({ ...prev, seo_title: response.trim() }));
    } catch (error) {
      console.error("Error generating SEO title:", error);
    } finally {
      setGeneratingSEO({ ...generatingSEO, seo_title: false });
    }
  };

  const generateMetaDescription = async () => {
    setGeneratingSEO({ ...generatingSEO, meta_description: true });
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an SEO-optimized meta description for this blog post. It should be compelling, include relevant keywords, and be under 160 characters.

Post Title: ${post.title}
Content Preview: ${post.content?.substring(0, 500) || post.excerpt}

Generate only the meta description, no additional text. Do not use quotation marks.`
      });
      setEditData(prev => ({ ...prev, meta_description: response.trim() }));
    } catch (error) {
      console.error("Error generating meta description:", error);
    } finally {
      setGeneratingSEO({ ...generatingSEO, meta_description: false });
    }
  };

  const handleApplyRephrasedContent = async (newContent) => {
    try {
      await BlogPost.update(post.id, { content: newContent });
      onUpdate();
    } catch (error) {
      console.error("Error updating content:", error);
    }
  };

  return (
    <>
      {showPublishModal && (
        <PublishModal
          post={post}
          onClose={() => setShowPublishModal(false)}
          onPublishSuccess={handlePublishSuccess}
        />
      )}

      {showToneRephraser && (
        <ToneRephraser
          content={post.content}
          onApply={handleApplyRephrasedContent}
          onClose={() => setShowToneRephraser(false)}
        />
      )}
    <Card className="border-0 shadow-lg sticky top-8">
      <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Post Details
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`${createPageUrl("EditPost")}?id=${post.id}`)}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              title="Open Full Editor"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-gray-600 hover:text-gray-800"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Hero Image */}
        {post.hero_image_url && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Hero Image</Label>
            <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={post.hero_image_url}
                alt={post.hero_image_alt || post.title}
                className="w-full h-full object-cover"
              />
            </div>
            <a
              href={post.hero_image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              View full size
            </a>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Status</span>
          <Badge className={`${
            post.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
            post.status === 'ready' ? 'bg-blue-100 text-blue-800' :
            post.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          } border`}>
            <span className="capitalize">{post.status}</span>
          </Badge>
        </div>

        {/* Editable Fields */}
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Input
                id="title"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="seo_title" className="text-sm font-medium">SEO Title</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateSEOTitle}
                  disabled={generatingSEO.seo_title}
                  className="h-7 text-xs text-purple-600 hover:text-purple-700"
                >
                  {generatingSEO.seo_title ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  Generate with AI
                </Button>
              </div>
              <Input
                id="seo_title"
                value={editData.seo_title}
                onChange={(e) => setEditData(prev => ({ ...prev, seo_title: e.target.value }))}
                placeholder="SEO-optimized title (max 60 chars)"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {editData.seo_title?.length || 0}/60 characters
              </p>
            </div>

            <div>
              <Label htmlFor="excerpt" className="text-sm font-medium">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={editData.excerpt}
                onChange={(e) => setEditData(prev => ({ ...prev, excerpt: e.target.value }))}
                className="mt-1 h-20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="meta_description" className="text-sm font-medium">Meta Description</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateMetaDescription}
                  disabled={generatingSEO.meta_description}
                  className="h-7 text-xs text-purple-600 hover:text-purple-700"
                >
                  {generatingSEO.meta_description ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  Generate with AI
                </Button>
              </div>
              <Textarea
                id="meta_description"
                value={editData.meta_description}
                onChange={(e) => setEditData(prev => ({ ...prev, meta_description: e.target.value }))}
                placeholder="SEO-optimized description (max 160 chars)"
                className="mt-1 h-16"
              />
              <p className="text-xs text-gray-500 mt-1">
                {editData.meta_description?.length || 0}/160 characters
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" className="flex-1">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Title</Label>
              <p className="text-sm text-gray-900 mt-1">{post.title}</p>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Excerpt</Label>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{post.excerpt}</p>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Created {format(new Date(post.created_date), 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{post.word_count || 0} words</span>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Variation {post.variation_number}</span>
          </div>

          {post.published_at && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Published {format(new Date(post.published_at), 'MMM d, yyyy')}</span>
            </div>
          )}

          {post.scheduled_publish_date && post.status === 'scheduled' && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span className="text-gray-600">Scheduled for {format(new Date(post.scheduled_publish_date), 'MMM d, yyyy h:mm a')}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
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

        {/* AI Actions */}
        <div className="space-y-2 pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
            onClick={() => setShowToneRephraser(true)}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Rephrase with AI
          </Button>
        </div>

        {/* Publishing Actions */}
        <div className="space-y-2 pt-4 border-t">
          {(post.status === 'ready' || post.status === 'draft') && (
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setShowPublishModal(true)}
            >
              <Globe className="w-4 h-4 mr-2" />
              Publish to WordPress
            </Button>
          )}

          {post.status === 'scheduled' && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-indigo-800 text-sm">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Scheduled for Publishing</span>
              </div>
              <p className="text-xs text-indigo-700 mt-1">
                {post.scheduled_publish_date && format(new Date(post.scheduled_publish_date), 'MMM d, yyyy h:mm a')}
              </p>
              <Button 
                variant="outline"
                size="sm"
                className="mt-2 w-full text-indigo-600 border-indigo-300 hover:bg-indigo-100"
                onClick={() => setShowPublishModal(true)}
              >
                Edit Schedule
              </Button>
            </div>
          )}
          
          {post.status === 'published' && post.wordpress_post_id && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-emerald-800 text-sm">
                <Globe className="w-4 h-4" />
                <span className="font-medium">Published to WordPress</span>
              </div>
              <p className="text-xs text-emerald-700 mt-1">
                {post.published_at && `on ${format(new Date(post.published_at), 'MMM d, yyyy')}`}
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowPreview(true)}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              onClick={() => navigate(`${createPageUrl("EditPost")}?id=${post.id}`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Post
            </Button>
          </div>
          </div>
      </CardContent>
    </Card>
    
    {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
                <p className="text-sm text-gray-500 mt-1">Preview Mode</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-8 overflow-y-auto bg-white">
               {post.hero_image_url && (
                 <img 
                   src={post.hero_image_url} 
                   alt={post.hero_image_alt || post.title}
                   className="w-full h-64 object-cover rounded-xl mb-8"
                 />
               )}
               <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}