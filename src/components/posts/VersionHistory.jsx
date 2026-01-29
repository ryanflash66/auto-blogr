import { useState, useEffect } from "react";
import { BlogPostVersion } from "@/services/blogPostVersions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  RotateCcw,
  Clock,
  FileText
} from "lucide-react";
import { format } from "date-fns";

export default function VersionHistory({ postId, currentVersion, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      loadVersions();
    }
  }, [postId, currentVersion]);

  const loadVersions = async () => {
    try {
      const data = await BlogPostVersion.list(postId, '-created_at');
      setVersions(data);
    } catch (error) {
      console.error("Error loading versions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (version) => {
    if (confirm('Restore this version? Your current changes will be replaced.')) {
      onRestore(version);
    }
  };

  const getChangeTypeLabel = (type) => {
    switch (type) {
      case 'manual_save': return 'Manual Save';
      case 'auto_save': return 'Auto Save';
      case 'ai_generated': return 'AI Generated';
      default: return type;
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 py-4">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600" />
          Version History
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : versions.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No version history yet</p>
            <p className="text-xs text-gray-400 mt-1">Versions are saved when you click Save</p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="p-2 space-y-2">
              {versions.map((version, index) => (
                <div 
                  key={version.id}
                  className="p-3 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          v{version.version_number}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {getChangeTypeLabel(version.change_type)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {version.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(version.created_date), 'MMM d, h:mm a')}
                      </div>
                    </div>
                    
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(version)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
