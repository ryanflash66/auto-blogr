// WordPress.jsx - WordPress site management page component
import React, { useState, useEffect } from "react";
import { WordPressSite } from "@/entities/WordPressSite";
import wordpressService from "@/services/wordpressService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Globe,
  Settings,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
  Zap,
  AlertTriangle,
} from "lucide-react";

export default function WordPress() {
  const [sites, setSites] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    username: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingConnection, setTestingConnection] = useState(null);
  const [connectionResults, setConnectionResults] = useState({});

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const data = await WordPressSite.findAll();
      setSites(data);
    } catch (error) {
      console.error("Error loading WordPress sites:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      username: "",
      password: "",
    });
    setFormErrors({});
    setEditingSite(null);
    setShowForm(false);
  };

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
    setIsSubmitting(true);
    setFormErrors({});

    try {
      let site;
      if (editingSite) {
        // Update existing site
        site = editingSite;
        Object.assign(site, formData);
      } else {
        // Create new site
        site = new WordPressSite(formData);
      }

      // Validate before saving
      const validation = site.validate();
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        return;
      }

      await site.save();
      resetForm();
      await loadSites();
    } catch (error) {
      console.error("Error saving WordPress site:", error);
      setFormErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async (site) => {
    setTestingConnection(site.id);
    setConnectionResults((prev) => ({ ...prev, [site.id]: null }));

    try {
      const result = await site.testConnection();
      setConnectionResults((prev) => ({ ...prev, [site.id]: result }));

      // Reload sites to get updated status
      await loadSites();
    } catch (error) {
      console.error("Error testing connection:", error);
      setConnectionResults((prev) => ({
        ...prev,
        [site.id]: {
          success: false,
          message: error.message,
        },
      }));
    } finally {
      setTestingConnection(null);
    }
  };

  const handleEditSite = (site) => {
    setEditingSite(site);
    setFormData({
      name: site.name,
      url: site.url,
      username: site.username,
      password: site.password,
    });
    setShowForm(true);
  };

  const handleDeleteSite = async (site) => {
    if (confirm(`Are you sure you want to delete "${site.name}"?`)) {
      try {
        await site.delete();
        await loadSites();
      } catch (error) {
        console.error("Error deleting site:", error);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" />
            Not Connected
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WordPress Sites</h1>
          <p className="text-muted-foreground">
            Connect and manage your WordPress sites for publishing
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Site
        </Button>
      </div>

      {/* Add/Edit Site Form */}
      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingSite ? "Edit WordPress Site" : "Add WordPress Site"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Development Mode Notice */}
              <Alert className="border-blue-200 bg-blue-50">
                <Zap className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  🔧 Development Mode: WordPress connections will use mock data
                  for testing.
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
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.name}
                    </p>
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
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.url}
                    </p>
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
                    Generate in WordPress: Users → Profile → Application
                    Passwords
                  </p>
                </div>
              </div>

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
                  {isSubmitting
                    ? "Saving..."
                    : editingSite
                    ? "Update Site"
                    : "Add Site"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sites List */}
      {sites.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Globe className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No WordPress sites connected
            </h3>
            <p className="text-muted-foreground mb-6">
              Connect your first WordPress site to start publishing content
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Site
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sites.map((site) => (
            <Card key={site.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{site.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {site.url}
                    </p>
                  </div>
                  {getStatusBadge(site.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Username:</span>
                    <p className="font-medium">{site.username}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Auth Method:</span>
                    <p className="font-medium capitalize">
                      {site.authMethod.replace("_", " ")}
                    </p>
                  </div>
                </div>

                {site.lastSync && (
                  <p className="text-xs text-muted-foreground">
                    Last synced: {new Date(site.lastSync).toLocaleString()}
                  </p>
                )}

                {/* Connection Test Results */}
                {connectionResults[site.id] && (
                  <Alert
                    className={
                      connectionResults[site.id].success
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }
                  >
                    <AlertDescription
                      className={
                        connectionResults[site.id].success
                          ? "text-green-800"
                          : "text-red-800"
                      }
                    >
                      {connectionResults[site.id].success ? (
                        <>✅ {connectionResults[site.id].message}</>
                      ) : (
                        <>❌ {connectionResults[site.id].message}</>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleTestConnection(site)}
                    disabled={testingConnection === site.id}
                  >
                    {testingConnection === site.id
                      ? "Testing..."
                      : "Test Connection"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditSite(site)}
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteSite(site)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
