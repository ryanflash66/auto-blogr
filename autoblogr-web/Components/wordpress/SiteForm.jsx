import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WordPressSite } from "@/entities/WordPressSite";
import { Zap, AlertTriangle, HelpCircle } from "lucide-react";

/**
 * SiteForm - Form component for adding/editing WordPress sites
 */
const SiteForm = ({ site = null, onSave, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    username: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Initialize form data when editing
  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name || "",
        url: site.url || "",
        username: site.username || "",
        password: site.password || "",
      });
    } else {
      setFormData({
        name: "",
        url: "",
        username: "",
        password: "",
      });
    }
    setFormErrors({});
  }, [site]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    try {
      let siteInstance;
      if (site) {
        // Update existing site
        siteInstance = site;
        Object.assign(siteInstance, formData);
      } else {
        // Create new site
        siteInstance = new WordPressSite(formData);
      }

      // Validate before saving
      const validation = siteInstance.validate();
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        return;
      }

      await siteInstance.save();
      onSave(siteInstance);
    } catch (error) {
      console.error("Error saving WordPress site:", error);
      setFormErrors({ submit: error.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {site ? "Edit WordPress Site" : "Add WordPress Site"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Development Mode Notice */}
          <Alert className="border-blue-200 bg-blue-50">
            <Zap className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              🔧 Development Mode: WordPress connections will use mock data for
              testing.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Site Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="My WordPress Site"
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="url">Site URL</Label>
              <Input
                id="url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://mysite.com"
                className={formErrors.url ? "border-red-500" : ""}
              />
              {formErrors.url && (
                <p className="text-sm text-red-600 mt-1">{formErrors.url}</p>
              )}
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="wordpress-username"
                className={formErrors.username ? "border-red-500" : ""}
              />
              {formErrors.username && (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.username}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Application Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="xxxx xxxx xxxx xxxx"
                className={formErrors.password ? "border-red-500" : ""}
              />
              {formErrors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.password}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Generate in WordPress: Users → Profile → Application Passwords
              </p>
            </div>
          </div>

          {/* Help Section */}
          <Alert className="border-blue-200 bg-blue-50">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Need help?</strong> To connect your WordPress site:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Log in to your WordPress admin panel</li>
                <li>Go to Users → Profile</li>
                <li>Scroll to "Application Passwords" section</li>
                <li>Enter "AutoBlogr" as the name and click "Add New"</li>
                <li>Copy the generated password and paste it above</li>
              </ol>
            </AlertDescription>
          </Alert>

          {formErrors.submit && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {formErrors.submit}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : site ? "Update Site" : "Add Site"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SiteForm;
