import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
  Trash2,
  Zap,
  Calendar,
} from "lucide-react";

/**
 * SiteCard - Displays individual WordPress site information and actions
 */
const SiteCard = ({
  site,
  onEdit,
  onDelete,
  onTestConnection,
  isTestingConnection,
  connectionResult,
}) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{site.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{site.url}</p>
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

        {site.capabilities && Object.keys(site.capabilities).length > 0 && (
          <div className="text-sm">
            <span className="text-muted-foreground">Capabilities:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(site.capabilities)
                .filter(([, value]) => value === true)
                .map(([capability]) => (
                  <Badge key={capability} variant="outline" className="text-xs">
                    {capability.replace("_", " ")}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {site.lastSync && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            Last synced: {formatDate(site.lastSync)}
          </div>
        )}

        {/* Connection Test Results */}
        {connectionResult && (
          <Alert
            className={
              connectionResult.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            <AlertDescription
              className={
                connectionResult.success ? "text-green-800" : "text-red-800"
              }
            >
              {connectionResult.success ? (
                <>✅ {connectionResult.message}</>
              ) : (
                <>❌ {connectionResult.message}</>
              )}
              {connectionResult.user && (
                <span className="block mt-1 text-xs">
                  Connected as: {connectionResult.user}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onTestConnection(site)}
            disabled={isTestingConnection}
          >
            {isTestingConnection ? "Testing..." : "Test Connection"}
          </Button>

          <Button size="sm" variant="outline" onClick={() => onEdit(site)}>
            <Edit3 className="w-3 h-3 mr-1" />
            Edit
          </Button>

          <Button size="sm" variant="outline" onClick={() => onDelete(site)}>
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteCard;
