import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { WordPressSite } from "@/services/wordpressSites";
import { BlogPost } from "@/services/blogPosts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  X, 
  Globe, 
  Upload, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  Folder,
  Clock,
  Calendar as CalendarIcon
} from "lucide-react";
import { format } from "date-fns";

// Helper to upload image to WordPress
const uploadMediaToWordPress = async (baseUrl, auth, imageUrl, altText) => {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error("Failed to fetch image");
    const blob = await res.blob();
    const filename = "hero-image.jpg";
    const file = new File([blob], filename, { type: blob.type });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt_text', altText || '');

    const uploadRes = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      body: formData
    });

    if (!uploadRes.ok) return null;
    const media = await uploadRes.json();
    return media.id;
  } catch (e) {
    console.error("Error uploading media:", e);
    return null;
  }
};

// Helper to get or create a category/tag
const resolveWPTerm = async (baseUrl, auth, taxonomy, termName) => {
  if (!termName || !termName.trim()) return null;
  const cleanName = termName.trim();
  
  try {
    const searchUrl = `${baseUrl}/wp-json/wp/v2/${taxonomy}?search=${encodeURIComponent(cleanName)}`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    
    if (searchRes.ok) {
      const found = await searchRes.json();
      const existing = found.find(t => t.name.toLowerCase() === cleanName.toLowerCase());
      if (existing) return existing.id;
    }

    const createRes = await fetch(`${baseUrl}/wp-json/wp/v2/${taxonomy}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: cleanName })
    });
    
    if (createRes.ok) {
      const newTerm = await createRes.json();
      return newTerm.id;
    }
  } catch (e) {
    console.error(`Error resolving ${taxonomy}:`, e);
  }
  return null;
};

export default function PublishModal({ post, onClose, onPublishSuccess }) {
  const { user } = useAuth();
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [categories, setCategories] = useState("");
  const [tags, setTags] = useState(post.tags?.join(", ") || "");
  const [customExcerpt, setCustomExcerpt] = useState(post.excerpt || "");
  const [publishing, setPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState('idle');
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState(null);
  const [loadingSites, setLoadingSites] = useState(true);
  const [scheduleEnabled, setScheduleEnabled] = useState(post.status === 'scheduled');
  
  const initialDate = post.scheduled_publish_date ? format(new Date(post.scheduled_publish_date), 'yyyy-MM-dd') : "";
  const initialTime = post.scheduled_publish_date ? format(new Date(post.scheduled_publish_date), 'HH:mm') : "";
  
  const [scheduledDate, setScheduledDate] = useState(initialDate);
  const [scheduledTime, setScheduledTime] = useState(initialTime);

  useEffect(() => {
    if (user?.id) {
      loadWordPressSites();
    }
  }, [user?.id]);

  const loadWordPressSites = async () => {
    if (!user?.id) return;
    
    try {
      const connectedSites = await WordPressSite.filter(user.id, { 
        connection_status: 'connected',
        is_active: true 
      });
      setSites(connectedSites);
      
      if (connectedSites.length === 1) {
        setSelectedSiteId(connectedSites[0].id);
      }
    } catch (error) {
      console.error("Error loading WordPress sites:", error);
      setError("Failed to load WordPress sites. Please check your connections.");
    } finally {
      setLoadingSites(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedSiteId) {
      setError("Please select a WordPress site");
      return;
    }

    if (scheduleEnabled && (!scheduledDate || !scheduledTime)) {
      setError("Please select both date and time for scheduled publishing");
      return;
    }

    setPublishing(true);
    setPublishStep('uploading');
    setStatusMessage("Uploading featured image...");
    setError(null);

    try {
      const selectedSite = sites.find(s => s.id === selectedSiteId);
      if (!selectedSite) throw new Error("Selected site not found");
      
      let scheduledDateTime = null;
      if (scheduleEnabled) {
        scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
        
        if (new Date(scheduledDateTime) <= new Date()) {
          setError("Scheduled time must be in the future");
          setPublishing(false);
          setPublishStep('idle');
          return;
        }
      }
      
      const baseUrl = selectedSite.url.replace(/\/$/, "");
      const auth = btoa(`${selectedSite.username}:${selectedSite.api_key}`);
      
      let featuredMediaId = 0;
      if (post.hero_image_url) {
        featuredMediaId = await uploadMediaToWordPress(baseUrl, auth, post.hero_image_url, post.hero_image_alt);
      }

      setPublishStep('terms');
      setStatusMessage("Configuring categories and tags...");
      
      const catNames = categories.split(",").map(c => c.trim()).filter(c => c);
      const categoryIds = [];
      for (const name of catNames) {
        const id = await resolveWPTerm(baseUrl, auth, 'categories', name);
        if (id) categoryIds.push(id);
      }

      const tagNames = tags.split(",").map(t => t.trim()).filter(t => t);
      const tagIds = [];
      for (const name of tagNames) {
        const id = await resolveWPTerm(baseUrl, auth, 'tags', name);
        if (id) tagIds.push(id);
      }

      setPublishStep('publishing');
      setStatusMessage(scheduleEnabled ? "Scheduling post..." : "Publishing post...");
      
      const wpPayload = {
        title: post.title,
        content: post.content,
        excerpt: customExcerpt || post.excerpt,
        status: scheduleEnabled ? 'future' : 'publish',
        categories: categoryIds,
        tags: tagIds,
        featured_media: featuredMediaId || undefined
      };

      if (scheduledDateTime) {
        wpPayload.date = scheduledDateTime;
      }

      const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(wpPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `WordPress API Error: ${response.status}`);
      }

      const wpPost = await response.json();
      
      const updateData = {
        status: scheduleEnabled ? 'scheduled' : 'published',
        wordpress_site_id: selectedSiteId,
        wordpress_post_id: String(wpPost.id),
        tags: tagNames
      };

      if (scheduleEnabled) {
        updateData.scheduled_publish_date = scheduledDateTime;
      } else {
        updateData.published_at = new Date().toISOString();
      }
      
      await BlogPost.update(post.id, updateData);
      
      setPublishStep('success');
      setStatusMessage(scheduleEnabled ? "Post successfully scheduled!" : "Post successfully published!");
      
      setTimeout(() => {
        onPublishSuccess();
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error("Error publishing to WordPress:", error);
      setError(error.message || "Failed to publish to WordPress. Please try again.");
      setPublishing(false);
      setPublishStep('idle');
    }
  };

  const selectedSite = sites.find(s => s.id === selectedSiteId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Publish to WordPress</h2>
                <p className="text-emerald-50 text-sm mt-1">Configure your post settings</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Progress Overlay */}
          {(publishing || publishStep === 'success') ? (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 text-center">
              {publishStep === 'success' ? (
                <div className="animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                  <p className="text-gray-600 mb-8">{statusMessage}</p>
                </div>
              ) : (
                <div className="w-full max-w-sm">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                    <Globe className="absolute inset-0 m-auto w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Publishing to WordPress</h3>
                  <p className="text-gray-500 mb-8">{statusMessage}</p>
                  
                  <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className={`flex items-center gap-3 ${publishStep === 'uploading' ? 'text-emerald-600 font-medium' : publishStep === 'terms' || publishStep === 'publishing' || publishStep === 'success' ? 'text-gray-400' : 'text-gray-400'}`}>
                      {publishStep === 'uploading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                       (publishStep === 'terms' || publishStep === 'publishing' || publishStep === 'success') ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                      <span>Uploading media...</span>
                    </div>
                    <div className={`flex items-center gap-3 ${publishStep === 'terms' ? 'text-emerald-600 font-medium' : publishStep === 'publishing' || publishStep === 'success' ? 'text-gray-400' : 'text-gray-400'}`}>
                       {publishStep === 'terms' ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                       (publishStep === 'publishing' || publishStep === 'success') ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                      <span>Configuring categories & tags...</span>
                    </div>
                    <div className={`flex items-center gap-3 ${publishStep === 'publishing' ? 'text-emerald-600 font-medium' : publishStep === 'success' ? 'text-gray-400' : 'text-gray-400'}`}>
                       {publishStep === 'publishing' ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                       publishStep === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                      <span>Creating post...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* WordPress Site Selection */}
          <div>
            <Label htmlFor="site" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              WordPress Site
            </Label>
            {loadingSites ? (
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : sites.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">No connected WordPress sites found.</p>
                <p className="text-xs text-amber-700 mt-1">Please connect a site in the WordPress settings first.</p>
              </div>
            ) : (
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a WordPress site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{site.name}</span>
                        <span className="text-xs text-gray-500">({site.url})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedSite && (
              <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Will publish to: <span className="font-medium">{selectedSite.url}</span>
              </div>
            )}
          </div>

          {/* Post Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">Post Preview</Label>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Title</p>
                <p className="text-sm font-semibold text-gray-900">{post.title}</p>
              </div>
              {post.hero_image_url && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Featured Image</p>
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-200">
                    <img
                      src={post.hero_image_url}
                      alt={post.hero_image_alt || post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1">Word Count</p>
                <p className="text-sm text-gray-700">{post.word_count || 0} words</p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <Label htmlFor="categories" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <Folder className="w-4 h-4 text-emerald-600" />
              Categories
            </Label>
            <Input
              id="categories"
              placeholder="e.g., Technology, Marketing (comma-separated)"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              className="h-12"
            />
            <p className="text-xs text-gray-500 mt-1">
              {selectedSite?.default_category 
                ? `Default: ${selectedSite.default_category}` 
                : "Separate multiple categories with commas"}
            </p>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              Tags
            </Label>
            <Input
              id="tags"
              placeholder="e.g., AI, Content, Blogging (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="h-12"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
          </div>

          {/* Custom Excerpt */}
          <div>
            <Label htmlFor="excerpt" className="text-sm font-semibold text-gray-700 mb-2 block">
              Custom Excerpt (Optional)
            </Label>
            <Textarea
              id="excerpt"
              placeholder="Override the auto-generated excerpt..."
              value={customExcerpt}
              onChange={(e) => setCustomExcerpt(e.target.value)}
              className="h-24 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use the auto-generated excerpt
            </p>
          </div>

          {/* Scheduling Options */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Schedule Publishing</Label>
                  <p className="text-xs text-gray-500">Publish at a specific date and time</p>
                </div>
              </div>
              <Switch
                checked={scheduleEnabled}
                onCheckedChange={setScheduleEnabled}
              />
            </div>

            {scheduleEnabled && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduled_date" className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                      <CalendarIcon className="w-4 h-4 text-indigo-600" />
                      Date
                    </Label>
                    <Input
                      id="scheduled_date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduled_time" className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      Time
                    </Label>
                    <Input
                      id="scheduled_time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>
                {scheduledDate && scheduledTime && (
                  <div className="bg-white rounded-lg p-3 border border-indigo-300">
                    <p className="text-sm text-indigo-900">
                      <span className="font-semibold">Will publish on:</span>{" "}
                      {format(new Date(`${scheduledDate}T${scheduledTime}`), 'MMMM d, yyyy')} at {scheduledTime}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={publishing}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={publishing || !selectedSiteId || sites.length === 0}
            className={`${scheduleEnabled ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'} px-8`}
          >
            {publishing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {scheduleEnabled ? 'Scheduling...' : 'Publishing...'}
              </>
            ) : (
              <>
                {scheduleEnabled ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Schedule Post
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Publish Now
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
