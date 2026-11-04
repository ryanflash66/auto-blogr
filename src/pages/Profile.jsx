import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { User } from "@/services/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { 
  User as UserIcon, 
  Building2, 
  Target, 
  Volume2, 
  Save,
  CheckCircle2,
  Info
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    business_name: "",
    business_description: "",
    industry: "",
    target_audience: "",
    brand_voice: "professional",
    content_preferences: {
      preferred_length: "medium",
      include_images: true,
      seo_focused: true
    },
    timezone: "UTC"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Populate form with existing data
      setFormData(prev => ({
        ...prev,
        business_name: user.business_name || "",
        business_description: user.business_description || "",
        industry: user.industry || "",
        target_audience: user.target_audience || "",
        brand_voice: user.brand_voice || "professional",
        content_preferences: {
          preferred_length: user.content_preferences?.preferred_length || "medium",
          include_images: user.content_preferences?.include_images ?? true,
          seo_focused: user.content_preferences?.seo_focused ?? true
        },
        timezone: user.timezone || "UTC"
      }));
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setSaving(true);
    
    try {
      await User.updateMyUserData(user.id, formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast({
        title: "Profile saved",
        description: "Your content preferences have been updated.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Couldn't save profile",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-7">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-4 w-1/4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-lg text-muted-foreground mt-1">Customize your AI content generation preferences</p>
          </div>
          {user && (
            <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-lg">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-foreground">{user.full_name || 'Local User'}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}
        </div>

        {saved && (
          <Alert className="mb-6 border-primary/30 bg-accent">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription className="text-accent-foreground">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Business Information */}
          <Card className="border-0 shadow-lift">
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="business_name" className="text-base font-semibold">Business Name</Label>
                  <Input
                    id="business_name"
                    placeholder="Your business or brand name"
                    value={formData.business_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-base font-semibold">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Healthcare, Technology, Finance"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_description" className="text-base font-semibold">Business Description</Label>
                <Textarea
                  id="business_description"
                  placeholder="Describe your business, products, or services..."
                  value={formData.business_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_description: e.target.value }))}
                  className="min-h-24"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_audience" className="text-base font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Target Audience
                </Label>
                <Input
                  id="target_audience"
                  placeholder="e.g., Small business owners, Tech professionals"
                  value={formData.target_audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                  className="h-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Preferences */}
          <Card className="border-0 shadow-lift">
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-primary" />
                Content Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Brand Voice</Label>
                  <Select 
                    value={formData.brand_voice} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, brand_voice: value }))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Preferred Content Length</Label>
                  <Select 
                    value={formData.content_preferences.preferred_length} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      content_preferences: { ...prev.content_preferences, preferred_length: value }
                    }))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (400-600 words)</SelectItem>
                      <SelectItem value="medium">Medium (800-1200 words)</SelectItem>
                      <SelectItem value="long">Long (1500+ words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">Include Hero Images</Label>
                    <p className="text-sm text-muted-foreground">Automatically generate hero images for blog posts</p>
                  </div>
                  <Switch
                    checked={formData.content_preferences.include_images}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      content_preferences: { ...prev.content_preferences, include_images: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">SEO Focused</Label>
                    <p className="text-sm text-muted-foreground">Optimize content for search engines</p>
                  </div>
                  <Switch
                    checked={formData.content_preferences.seo_focused}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      content_preferences: { ...prev.content_preferences, seo_focused: checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Settings Info */}
          <Alert className="border-status-ready/30 bg-status-ready-bg">
            <Info className="h-4 w-4 text-status-ready" />
            <AlertDescription className="text-status-ready">
              These settings will be used as defaults when generating new blog content. You can always customize individual posts.
            </AlertDescription>
          </Alert>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="px-8 py-3 h-auto"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
