import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
} from "lucide-react";
import {
  getAIServiceStatus,
  InvokeLLM,
  testHuggingFace,
} from "@/integrations/Core";

export default function AIServiceStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [testPrompt, setTestPrompt] = useState(
    "Write a brief introduction about artificial intelligence and its applications in content creation."
  );
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
  const [selectedTaskType, setSelectedTaskType] = useState("text-generation");
  const [testLoading, setTestLoading] = useState({});

  // Available models for testing
  const openRouterModels = [
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Cheap)" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Balanced)" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku (Fast)" },
    { value: "claude-3-sonnet", label: "Claude 3 Sonnet (Quality)" },
    { value: "meta-llama/llama-3.1-8b-instruct", label: "Llama 3.1 8B (Open)" },
  ];

  const huggingFaceTaskTypes = [
    { value: "text-generation", label: "Text Generation" },
    { value: "summarization", label: "Summarization" },
    { value: "text2text-generation", label: "Text-to-Text" },
  ];

  const getStatusColor = (service) => {
    if (!service) return "secondary";
    if (service.status === "ready") return "default";
    if (service.status === "fallback-mode") return "secondary";
    if (service.status === "error") return "destructive";
    return "secondary";
  };

  const getStatusIcon = (service) => {
    if (!service) return <AlertTriangle className="h-4 w-4" />;
    if (service.status === "ready")
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (service.status === "fallback-mode")
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (service.status === "error")
      return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const checkServiceStatus = async () => {
    setLoading(true);
    try {
      const serviceStatus = await getAIServiceStatus();
      setStatus(serviceStatus);
    } catch (error) {
      console.error("Failed to check service status:", error);
      setStatus({
        timestamp: new Date().toISOString(),
        services: {},
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testOpenRouterService = async () => {
    setTestLoading((prev) => ({ ...prev, openRouter: true }));
    try {
      const result = await InvokeLLM(testPrompt, {
        model: selectedModel,
        maxTokens: 150,
        temperature: 0.7,
      });

      setTestResults((prev) => ({
        ...prev,
        openRouter: {
          success: true,
          result,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        openRouter: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
    } finally {
      setTestLoading((prev) => ({ ...prev, openRouter: false }));
    }
  };

  const testHuggingFaceService = async (taskType = "text-generation") => {
    setTestLoading((prev) => ({ ...prev, huggingFace: true }));
    try {
      const result = await testHuggingFace(testPrompt, {
        maxTokens: 150,
        temperature: 0.7,
        taskType,
      });

      setTestResults((prev) => ({
        ...prev,
        huggingFace: {
          success: result.success,
          result: result.success ? result : null,
          error: result.success ? null : result.error,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        huggingFace: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
    } finally {
      setTestLoading((prev) => ({ ...prev, huggingFace: false }));
    }
  };

  useEffect(() => {
    checkServiceStatus();
  }, []);

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Checking AI service status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            AI Service Status
          </h2>
          <p className="text-muted-foreground">
            Monitor and test AI service connectivity and fallback systems
          </p>
        </div>
        <Button onClick={checkServiceStatus} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Settings className="h-4 w-4 mr-2" />
          )}
          Refresh Status
        </Button>
      </div>

      {status?.error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to check service status: {status.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Service Status Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* OpenRouter Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">
                OpenRouter (Primary)
              </CardTitle>
              <CardDescription>Main AI service provider</CardDescription>
            </div>
            {getStatusIcon(status?.services?.openRouter)}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={getStatusColor(status?.services?.openRouter)}>
                {status?.services?.openRouter?.status || "Unknown"}
              </Badge>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  Configured:{" "}
                  {status?.services?.openRouter?.configured ? "Yes" : "No"}
                </div>
                <div>
                  Available:{" "}
                  {status?.services?.openRouter?.available ? "Yes" : "No"}
                </div>
                {status?.services?.openRouter?.error && (
                  <div className="text-red-500">
                    Error: {status.services.openRouter.error}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hugging Face Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">
                Hugging Face (Fallback)
              </CardTitle>
              <CardDescription>Backup AI service provider</CardDescription>
            </div>
            {getStatusIcon(status?.services?.huggingFace)}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={getStatusColor(status?.services?.huggingFace)}>
                {status?.services?.huggingFace?.status || "Unknown"}
              </Badge>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  Configured:{" "}
                  {status?.services?.huggingFace?.configured ? "Yes" : "No"}
                </div>
                <div>
                  Available:{" "}
                  {status?.services?.huggingFace?.available ? "Yes" : "No"}
                </div>
                {status?.services?.huggingFace?.message && (
                  <div>Message: {status.services.huggingFace.message}</div>
                )}
                {status?.services?.huggingFace?.error && (
                  <div className="text-red-500">
                    Error: {status.services.huggingFace.error}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Service Testing</CardTitle>
          <CardDescription>
            Test AI services with custom prompts to verify functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-prompt">Test Prompt</Label>
              <Textarea
                id="test-prompt"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter a test prompt..."
                className="mt-1"
                rows={3}
              />
            </div>

            <Tabs defaultValue="openrouter" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="openrouter">OpenRouter</TabsTrigger>
                <TabsTrigger value="huggingface">Hugging Face</TabsTrigger>
              </TabsList>

              <TabsContent value="openrouter" className="space-y-4">
                <div>
                  <Label htmlFor="model-select">Model</Label>
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {openRouterModels.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={testOpenRouterService}
                  disabled={testLoading.openRouter || !testPrompt.trim()}
                  className="w-full"
                >
                  {testLoading.openRouter ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Testing
                      OpenRouter...
                    </>
                  ) : (
                    "Test OpenRouter Service"
                  )}
                </Button>

                {testResults.openRouter && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center">
                        {testResults.openRouter.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        OpenRouter Test Result
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {testResults.openRouter.success ? (
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Model: {testResults.openRouter.result.model} |
                            Tokens:{" "}
                            {testResults.openRouter.result.usage
                              ?.total_tokens || "N/A"}
                          </div>
                          <div className="p-3 bg-muted rounded text-sm">
                            {testResults.openRouter.result.content}
                          </div>
                        </div>
                      ) : (
                        <div className="text-red-500 text-sm">
                          Error: {testResults.openRouter.error}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="huggingface" className="space-y-4">
                <div>
                  <Label htmlFor="task-type-select">Task Type</Label>
                  <Select
                    value={selectedTaskType}
                    onValueChange={setSelectedTaskType}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      {huggingFaceTaskTypes.map((task) => (
                        <SelectItem key={task.value} value={task.value}>
                          {task.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => testHuggingFaceService(selectedTaskType)}
                  disabled={testLoading.huggingFace || !testPrompt.trim()}
                  className="w-full"
                >
                  {testLoading.huggingFace ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Testing
                      Hugging Face...
                    </>
                  ) : (
                    "Test Hugging Face Service"
                  )}
                </Button>

                {testResults.huggingFace && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center">
                        {testResults.huggingFace.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        Hugging Face Test Result
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {testResults.huggingFace.success ? (
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Model: {testResults.huggingFace.result.model} |
                            Type: {testResults.huggingFace.result.type}
                          </div>
                          <div className="p-3 bg-muted rounded text-sm">
                            {testResults.huggingFace.result.response}
                          </div>
                        </div>
                      ) : (
                        <div className="text-red-500 text-sm">
                          Error: {testResults.huggingFace.error}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Status Timestamp */}
      {status?.timestamp && (
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {new Date(status.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
