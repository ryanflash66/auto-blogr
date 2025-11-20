import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Globe, Key, User, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function SiteForm({ site, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: site?.name || "",
    url: site?.url || "",
    username: site?.username || "",
    api_key: site?.api_key || "",
    default_category: site?.default_category || "",
    default_author: site?.default_author || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const siteData = {
        ...formData,
        connection_status: 'disconnected' // Will be tested after creation
      };
      
      await onSubmit(siteData);
    } catch (error) {
      console.error("Error submitting site:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {site ? 'Edit WordPress Site' : 'Connect WordPress Site'}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Add your WordPress site details</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                You'll need to create an Application Password in your WordPress admin (Users → Profile → Application Passwords) for secure API access.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold">Site Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., My Business Blog"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url" className="text-base font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    WordPress URL *
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://yourblog.com"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    className="h-12"
                    required
                  />
                </div>
              </div>

              {/* Authentication */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-base font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username *
                  </Label>
                  <Input
                    id="username"
                    placeholder="WordPress username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_key" className="text-base font-semibold flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Application Password *
                  </Label>
                  <Input
                    id="api_key"
                    type="password"
                    placeholder="Application password"
                    value={formData.api_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                    className="h-12"
                    required
                  />
                </div>
              </div>

              {/* Default Settings */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_category" className="text-base font-semibold">Default Category</Label>
                  <Input
                    id="default_category"
                    placeholder="e.g., Blog"
                    value={formData.default_category}
                    onChange={(e) => setFormData(prev => ({ ...prev, default_category: e.target.value }))}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_author" className="text-base font-semibold">Default Author</Label>
                  <Input
                    id="default_author"
                    placeholder="Author name or ID"
                    value={formData.default_author}
                    onChange={(e) => setFormData(prev => ({ ...prev, default_author: e.target.value }))}
                    className="h-12"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim() || !formData.url.trim()}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-8"
                >
                  {isSubmitting ? "Connecting..." : site ? "Update Site" : "Connect Site"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}