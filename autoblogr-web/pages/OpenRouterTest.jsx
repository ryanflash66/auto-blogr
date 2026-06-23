// OpenRouter Test Page - Verify AI Integration
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Zap, Settings } from "lucide-react";
import { openRouterService } from "../src/services/openRouterService.js";
import { InvokeLLM } from "../src/integrations/Core.js";

export default function OpenRouterTest() {
  const [configStatus, setConfigStatus] = useState(null);
  const [prompt, setPrompt] = useState(
    "Write a short blog post about the benefits of AI in content creation."
  );
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastTest, setLastTest] = useState(null);

  useEffect(() => {
    // Check OpenRouter configuration on component mount
    checkConfiguration();
  }, []);

  const checkConfiguration = () => {
    try {
      const config = openRouterService.config;
      console.log("OpenRouter Config:", config);

      setConfigStatus({
        hasApiKey: config.hasApiKey,
        isConfigured: config.isConfigured,
        defaultModel: config.defaultModel,
        baseURL: config.baseURL,
      });
    } catch (error) {
      console.error("Configuration check failed:", error);
      setConfigStatus({
        hasApiKey: false,
        isConfigured: false,
        error: error.message,
      });
    }
  };

  const testAIGeneration = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse("");

    const startTime = Date.now();

    try {
      console.log("Testing AI generation with prompt:", prompt);

      const result = await InvokeLLM(prompt, {
        taskType: "blog-content-generation",
        maxTokens: 500,
        temperature: 0.7,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      setResponse(result);
      setLastTest({
        success: true,
        duration,
        timestamp: new Date().toLocaleTimeString(),
        prompt: prompt.substring(0, 50) + "...",
      });

      console.log("✅ AI generation successful:", result);
    } catch (error) {
      console.error("❌ AI generation failed:", error);
      setResponse(`Error: ${error.message}`);
      setLastTest({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleTimeString(),
        prompt: prompt.substring(0, 50) + "...",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === null) return "gray";
    return status ? "green" : "red";
  };

  const getStatusIcon = (status) => {
    if (status === null) return <Settings className="h-4 w-4" />;
    return status ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : (
      <AlertTriangle className="h-4 w-4" />
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8 text-blue-500" />
          OpenRouter AI Integration Test
        </h1>
        <p className="text-gray-600 mt-2">
          Verify that OpenRouter API is configured and working correctly
        </p>
      </div>

      {/* Configuration Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span>API Key Present:</span>
              <Badge
                variant={getStatusColor(configStatus?.hasApiKey)}
                className="flex items-center gap-1"
              >
                {getStatusIcon(configStatus?.hasApiKey)}
                {configStatus?.hasApiKey ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Service Configured:</span>
              <Badge
                variant={getStatusColor(configStatus?.isConfigured)}
                className="flex items-center gap-1"
              >
                {getStatusIcon(configStatus?.isConfigured)}
                {configStatus?.isConfigured ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Default Model:</span>
              <Badge variant="outline">
                {configStatus?.defaultModel || "Loading..."}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Base URL:</span>
              <Badge variant="outline">
                {configStatus?.baseURL || "Loading..."}
              </Badge>
            </div>
          </div>

          {configStatus?.error && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Configuration Error: {configStatus.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Interface */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AI Generation Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Test Prompt:
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt to test AI generation..."
              rows={3}
            />
          </div>

          <Button
            onClick={testAIGeneration}
            disabled={loading || !prompt.trim()}
            className="w-full"
          >
            {loading ? "Generating..." : "Test AI Generation"}
          </Button>

          {lastTest && (
            <Alert
              className={`mt-4 ${
                lastTest.success ? "border-green-500" : "border-red-500"
              }`}
            >
              <div className="flex items-center gap-2">
                {lastTest.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <div>
                  <strong>Last Test ({lastTest.timestamp}):</strong>
                  {lastTest.success ? (
                    <span className="text-green-600 ml-2">
                      Success in {lastTest.duration}ms
                    </span>
                  ) : (
                    <span className="text-red-600 ml-2">
                      Failed: {lastTest.error}
                    </span>
                  )}
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Response Display */}
      {(response || loading) && (
        <Card>
          <CardHeader>
            <CardTitle>AI Response</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Generating content...</span>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{response}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
