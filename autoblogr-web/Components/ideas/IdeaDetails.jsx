// IdeaDetails.js - Component for viewing detailed blog idea information
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  X,
  Clock,
  User,
  Target,
  Tag,
  FileText,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default function IdeaDetails({ idea, onEdit, onClose }) {
  if (!idea) return null;

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

  const formatFullDate = (dateString) => {
    try {
      return format(new Date(dateString), "PPp");
    } catch (error) {
      return "Unknown";
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl">{idea.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className={getPriorityColor(idea.priority)}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {idea.priority} priority
              </Badge>
              <Badge className={getStatusColor(idea.status)}>
                {idea.status?.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2 ml-4">
            <Button variant="outline" onClick={() => onEdit(idea)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {idea.description && (
          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Description
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {idea.description}
            </p>
          </div>
        )}

        <Separator />

        {/* Content Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Content Details</h4>
            <div className="space-y-3">
              {idea.tone && (
                <div className="flex items-center">
                  <span className="text-sm font-medium w-20">Tone:</span>
                  <Badge variant="outline">{idea.tone}</Badge>
                </div>
              )}
              {idea.content_type && (
                <div className="flex items-center">
                  <span className="text-sm font-medium w-20">Type:</span>
                  <Badge variant="outline">
                    {idea.content_type?.replace("_", " ")}
                  </Badge>
                </div>
              )}
              {idea.target_audience && (
                <div className="flex items-start">
                  <Target className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">
                      Target Audience:
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {idea.target_audience}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Metadata</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium">Created:</span>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(idea.created_date)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFullDate(idea.created_date)}
                  </p>
                </div>
              </div>

              {idea.updated_date && idea.updated_date !== idea.created_date && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Updated:</span>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(idea.updated_date)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium">Author:</span>
                  <p className="text-sm text-muted-foreground">
                    {idea.user_id || "User"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {idea.keywords && idea.keywords.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Keywords ({idea.keywords.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {idea.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Additional Statistics */}
        <Separator />
        <div>
          <h4 className="font-semibold mb-3">Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">1</div>
              <div className="text-xs text-muted-foreground">Idea</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {idea.keywords?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Keywords</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-muted-foreground">Posts Created</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{idea.priority}</div>
              <div className="text-xs text-muted-foreground">Priority</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
