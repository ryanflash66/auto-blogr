import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { WordPressSite } from "@/entities/WordPressSite";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Calendar,
  ExternalLink,
  RefreshCw,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

export default function SiteList({ sites, loading, onEditSite, onRefresh }) {
  const [testingId, setTestingId] = useState(null);
  const navigate = useNavigate();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const handleTestConnection = async (site) => {
    setTestingId(site.id);
    try {
      const baseUrl = site.url.replace(/\/$/, "");
      const auth = btoa(`${site.username}:${site.api_key}`);
      
      // Test request to users/me endpoint to verify credentials
      const response = await fetch(`${baseUrl}/wp-json/wp/v2/users/me`, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // If successful, update status to connected
      await WordPressSite.update(site.id, {
        connection_status: 'connected',
        last_tested: new Date().toISOString()
      });
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Connection test failed:", error);
      // If failed, update status to error
      await WordPressSite.update(site.id, {
        connection_status: 'error',
        last_tested: new Date().toISOString()
      });
      if (onRefresh) onRefresh();
    } finally {
      setTestingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded mb-2 w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-200">
        <CardContent className="p-12 text-center">
          <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No WordPress sites connected</h3>
          <p className="text-gray-500 mb-6">Connect your first WordPress site to start publishing AI-generated content</p>
          <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700">
            Connect Your First Site
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {sites.map((site) => (
        <Card key={site.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{site.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
                    >
                      {site.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
              <Badge className={`${getStatusColor(site.connection_status)} border`}>
                {getStatusIcon(site.connection_status)}
                <span className="ml-1 capitalize">{site.connection_status}</span>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Site Details */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Connection Details</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Added {format(new Date(site.created_date), 'MMM d, yyyy')}
                    </div>
                    {site.last_tested && (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                        Last tested {format(new Date(site.last_tested), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Default Settings */}
                {(site.default_category || site.default_author) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Default Settings</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {site.default_category && (
                        <div>Category: {site.default_category}</div>
                      )}
                      {site.default_author && (
                        <div>Author: {site.default_author}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => handleTestConnection(site)}
                  variant="outline"
                  disabled={testingId === site.id}
                  className="flex items-center gap-2"
                >
                  {testingId === site.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {testingId === site.id ? "Testing..." : "Test Connection"}
                </Button>
                
                <Button
                  onClick={() => onEditSite(site)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Edit Settings
                </Button>

                {site.is_active && site.connection_status === 'connected' && (
                  <Button 
                    onClick={() => navigate(createPageUrl("Posts"))}
                    className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    Publish Content
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}