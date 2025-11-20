import React, { useState, useEffect } from "react";
import { BlogPostVersion } from "@/entities/BlogPostVersion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { History, RotateCcw, Loader2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function VersionHistory({ postId, currentVersion, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(null);

  useEffect(() => {
    if (postId) {
      loadVersions();
    }
  }, [postId, currentVersion]); // Reload when a new version is created

  const loadVersions = async () => {
    setLoading(true);
    try {
      const history = await BlogPostVersion.filter({ blog_post_id: postId }, "-created_date", 20);
      setVersions(history);
    } catch (error) {
      console.error("Error loading version history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (version) => {
    onRestore(version);
    setPreviewVersion(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <History className="w-4 h-4" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : versions.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              No history available
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="divide-y">
                {versions.map((version) => (
                  <div key={version.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(version.created_date), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(version.created_date), "h:mm a")}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-500 hover:text-blue-600"
                          onClick={() => setPreviewVersion(version)}
                          title="Preview Version"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-500 hover:text-emerald-600"
                          onClick={() => handleRestore(version)}
                          title="Restore Version"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {version.title}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                       <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                         v{version.version_number || 1}
                       </span>
                       <span className="text-xs text-gray-400 capitalize">
                         {version.change_type?.replace('_', ' ') || 'Manual Save'}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Dialog open={!!previewVersion} onOpenChange={(open) => !open && setPreviewVersion(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview Version</DialogTitle>
            <DialogDescription>
              Created on {previewVersion && format(new Date(previewVersion.created_date), "PPP 'at' p")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto border rounded-md p-4 bg-gray-50 mt-4">
             {previewVersion && (
               <div className="space-y-4">
                 <h2 className="text-2xl font-bold">{previewVersion.title}</h2>
                 <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewVersion.content }} />
               </div>
             )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setPreviewVersion(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleRestore(previewVersion)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore This Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}