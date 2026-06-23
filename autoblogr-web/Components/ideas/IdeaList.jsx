// IdeaList.js - Component for displaying and managing blog ideas
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Clock, User, Target } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function IdeaList({ ideas, onEdit, onDelete, onView }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };

  if (!ideas || ideas.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-muted-foreground">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-lg font-semibold mb-2">No Ideas Yet</h3>
            <p>Start by creating your first blog idea using the form above.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {ideas.map((idea) => (
        <Card key={idea.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{idea.title}</CardTitle>
                {idea.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {idea.description}
                  </p>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(idea)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(idea)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(idea)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={getPriorityColor(idea.priority)}>
                {idea.priority} priority
              </Badge>
              <Badge className={getStatusColor(idea.status)}>
                {idea.status?.replace("_", " ")}
              </Badge>
              {idea.tone && <Badge variant="outline">{idea.tone}</Badge>}
              {idea.content_type && (
                <Badge variant="outline">
                  {idea.content_type?.replace("_", " ")}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              {idea.target_audience && (
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  <span className="truncate">{idea.target_audience}</span>
                </div>
              )}
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>Created {formatDate(idea.created_date)}</span>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span>by {idea.user_id || "User"}</span>
              </div>
            </div>

            {idea.keywords && idea.keywords.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {idea.keywords.slice(0, 5).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {idea.keywords.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{idea.keywords.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
