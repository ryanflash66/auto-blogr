import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Lightbulb, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Hash,
  Calendar,
  Target,
  Trash2,
  Loader2,
  AlertTriangle,
  X
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function IdeaList({ ideas, loading, onIdeaSelect, selectedIdea, onDelete }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(ideas.map(idea => idea.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(selectedIds);
      setSelectedIds([]);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckCircle2 className="w-4 h-4" />;
      case 'generating': return <Zap className="w-4 h-4 animate-pulse" />;
      case 'ready': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'generating': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ready': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-200">
        <CardContent className="p-12 text-center">
          <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No ideas yet</h3>
          <p className="text-gray-500 mb-6">Start by creating your first blog idea</p>
          <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700">
            Create Your First Idea
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2">
          <Checkbox 
            checked={ideas.length > 0 && selectedIds.length === ideas.length}
            onCheckedChange={handleSelectAll}
            disabled={ideas.length === 0}
            className="border-gray-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
          <span className="text-sm text-gray-600">
            {selectedIds.length} selected
          </span>
        </div>
        
        {selectedIds.length > 0 && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete Selected
          </Button>
        )}
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteDialog(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowDeleteDialog(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Delete {selectedIds.length} idea{selectedIds.length > 1 ? 's' : ''}?
              </h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. This will permanently delete the selected blog idea{selectedIds.length > 1 ? 's' : ''}.
              </p>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={confirmDelete} 
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {ideas.map((idea, index) => (
        <motion.div
          key={idea.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative group"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
             <Checkbox 
                checked={selectedIds.includes(idea.id)}
                onCheckedChange={() => toggleSelection(idea.id)}
                onClick={(e) => e.stopPropagation()}
                className="bg-white border-gray-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
          </div>
          <Card
            className={`pl-12 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              selectedIdea?.id === idea.id
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-transparent hover:border-gray-200'
            }`}
            onClick={() => onIdeaSelect(idea)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-4">
                  {idea.title}
                </h3>
                <Badge className={`${getStatusColor(idea.status)} border`}>
                  {getStatusIcon(idea.status)}
                  <span className="ml-1 capitalize">{idea.status}</span>
                </Badge>
              </div>

              {idea.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {idea.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(idea.created_date), 'MMM d, yyyy')}
                </div>
                
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {idea.variations_requested} variation{idea.variations_requested > 1 ? 's' : ''}
                </div>

                {idea.target_audience && (
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {idea.target_audience}
                  </div>
                )}

                {idea.keywords && idea.keywords.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Hash className="w-4 h-4" />
                    {idea.keywords.length} keyword{idea.keywords.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}