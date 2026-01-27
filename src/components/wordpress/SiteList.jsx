import { useState } from "react";
import { WordPressSite } from "@/services/wordpressSites";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Loader2,
  Trash2,
  ExternalLink
} from "lucide-react";

export default function SiteList({ sites, loading, onEditSite, onRefresh }) {
  const [testingConnection, setTestingConnection] = useState(null);
  const [deletingSite, setDeletingSite] = useState(null);

  const handleTestConnection = async (site) => {
    setTestingConnection(site.id);
    
    try {
      const result = await WordPressSite.testConnection(site);
      
      await WordPressSite.update(site.id, {
        connection_status: result.success ? 'connected' : 'error',
        last_sync_at: new Date().toISOString()
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error testing connection:", error);
    } finally {
      setTestingConnection(null);
    }
  };

  const handleDeleteSite = async (siteId) => {
    if (!confirm('Are you sure you want to delete this WordPress site?')) return;
    
    setDeletingSite(siteId);
    try {
      await WordPressSite.delete(siteId);
      onRefresh();
    } catch (error) {
      console.error("Error deleting site:", error);
    } finally {
      setDeletingSite(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            Not Connected
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-lg animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No WordPress Sites</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Connect your WordPress sites to publish content directly from AutoBlogr.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sites.map((site) => (
        <Card key={site.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{site.name}</CardTitle>
                  {getStatusBadge(site.connection_status)}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <a 
                href={site.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {site.url}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {site.default_category && (
              <p className="text-sm text-gray-600">
                Default Category: <span className="font-medium">{site.default_category}</span>
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestConnection(site)}
                disabled={testingConnection === site.id}
              >
                {testingConnection === site.id ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-1" />
                )}
                Test
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditSite(site)}
              >
                <Settings className="w-4 h-4 mr-1" />
                Edit
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteSite(site.id)}
                disabled={deletingSite === site.id}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {deletingSite === site.id ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-1" />
                )}
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
