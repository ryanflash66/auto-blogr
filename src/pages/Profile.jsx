import { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [user, setUser] = useState(null);
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
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Populate form with existing data
      setFormData(prev => ({
        ...prev,
        business_name: userData.business_name || "",
        business_description: userData.business_description || "",
        industry: userData.industry || "",
        target_audience: userData.target_audience || "",
        brand_voice: userData.brand_voice || "professional",
        content_preferences: {
          preferred_length: userData.content_preferences?.preferred_length || "medium",
          include_images: userData.content_preferences?.include_images ?? true,
          seo_focused: userData.content_preferences?.seo_focused ?? true
        },
        timezone: userData.timezone || "UTC"
      }));
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await User.updateMyUserData(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-lg text-gray-600 mt-1">Customize your AI content generation preferences</p>
          </div>
          {user && (
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.full_name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          )}
        </div>

        {saved && (
          <Alert className="mb-6 border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Business Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
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
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-600" />
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
                    <p className="text-sm text-gray-600">Automatically generate hero images for blog posts</p>
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
                    <p className="text-sm text-gray-600">Optimize content for search engines</p>
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
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              These settings will be used as defaults when generating new blog content. You can always customize individual posts.
            </AlertDescription>
          </Alert>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-8 py-3 h-auto"
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