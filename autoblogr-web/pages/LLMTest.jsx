// LLMTest.js - Testing interface for AI integrations
import React, { useState } from "react";
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Zap,
  Image as ImageIcon,
  Play,
  RotateCcw,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Settings,
} from "lucide-react";

export default function LLMTest() {
  const [textPrompt, setTextPrompt] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [textResponse, setTextResponse] = useState("");
  const [imageResponse, setImageResponse] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [textModel, setTextModel] = useState("gpt-4");
  const [imageModel, setImageModel] = useState("dall-e-3");
  const [copied, setCopied] = useState(false);

  const handleTextGeneration = async () => {
    if (!textPrompt.trim()) return;

    setTextLoading(true);
    setTextResponse("");

    try {
      const response = await InvokeLLM({
        model: textModel,
        prompt: textPrompt,
        max_tokens: 1000,
        temperature: 0.7,
      });
      setTextResponse(response.content);
    } catch (error) {
      setTextResponse(`Error: ${error.message}`);
    } finally {
      setTextLoading(false);
    }
  };

  const handleImageGeneration = async () => {
    if (!imagePrompt.trim()) return;

    setImageLoading(true);
    setImageResponse("");

    try {
      const response = await GenerateImage({
        prompt: imagePrompt,
        model: imageModel,
        size: "1024x1024",
        quality: "standard",
      });
      setImageResponse(response.url);
    } catch (error) {
      setImageResponse(`Error: ${error.message}`);
    } finally {
      setImageLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const clearAll = () => {
    setTextPrompt("");
    setImagePrompt("");
    setTextResponse("");
    setImageResponse("");
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8" />
            LLM Testing Lab
          </h1>
          <p className="text-muted-foreground">
            Test and experiment with AI text and image generation
          </p>
        </div>

        {/* Demo Notice */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Demo Mode:</strong> This is a testing interface with mock AI
            responses. In production, this would connect to real AI APIs.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Text Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="text-model">Model</Label>
                <Select value={textModel} onValueChange={setTextModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="text-prompt">Prompt</Label>
                <Textarea
                  id="text-prompt"
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  placeholder="Enter your text generation prompt..."
                  rows={4}
                />
              </div>

              <Button
                onClick={handleTextGeneration}
                disabled={textLoading || !textPrompt.trim()}
                className="w-full"
              >
                {textLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate Text
                  </>
                )}
              </Button>

              {textResponse && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Response</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(textResponse)}
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">
                      {textResponse}
                    </pre>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Model: {textModel}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Image Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="image-model">Model</Label>
                <Select value={imageModel} onValueChange={setImageModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                    <SelectItem value="dall-e-2">DALL-E 2</SelectItem>
                    <SelectItem value="midjourney">Midjourney</SelectItem>
                    <SelectItem value="stable-diffusion">
                      Stable Diffusion
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image-prompt">Prompt</Label>
                <Textarea
                  id="image-prompt"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  rows={4}
                />
              </div>

              <Button
                onClick={handleImageGeneration}
                disabled={imageLoading || !imagePrompt.trim()}
                className="w-full"
              >
                {imageLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>

              {imageResponse && (
                <div className="space-y-2">
                  <Label>Generated Image</Label>
                  {imageResponse.startsWith("Error:") ? (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <p className="text-red-800 text-sm">{imageResponse}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <img
                        src={imageResponse}
                        alt="Generated"
                        className="w-full rounded-lg border"
                      />
                      <Badge variant="secondary" className="text-xs">
                        Model: {imageModel}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={clearAll}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* Sample Prompts */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Sample Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Text Prompts</h4>
                <div className="space-y-2 text-sm">
                  <div
                    className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                    onClick={() =>
                      setTextPrompt(
                        "Write a compelling blog post introduction about the benefits of remote work"
                      )
                    }
                  >
                    Blog post introduction about remote work
                  </div>
                  <div
                    className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                    onClick={() =>
                      setTextPrompt(
                        "Create 5 catchy headlines for a tech startup launching a new productivity app"
                      )
                    }
                  >
                    Headlines for tech startup app
                  </div>
                  <div
                    className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                    onClick={() =>
                      setTextPrompt(
                        "Explain artificial intelligence in simple terms for beginners"
                      )
                    }
                  >
                    Explain AI for beginners
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Image Prompts</h4>
                <div className="space-y-2 text-sm">
                  <div
                    className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                    onClick={() =>
                      setImagePrompt(
                        "A modern minimalist office workspace with natural lighting, plants, and a laptop"
                      )
                    }
                  >
                    Modern office workspace
                  </div>
                  <div
                    className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                    onClick={() =>
                      setImagePrompt(
                        "Abstract representation of artificial intelligence and machine learning, blue and purple gradient"
                      )
                    }
                  >
                    Abstract AI visualization
                  </div>
                  <div
                    className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                    onClick={() =>
                      setImagePrompt(
                        "Professional blog header image for a technology blog, clean design"
                      )
                    }
                  >
                    Technology blog header
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
