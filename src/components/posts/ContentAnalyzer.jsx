import { useState } from "react";
import { InvokeLLM } from "@/lib/openrouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  BookOpen,
  Sparkles, 
  Loader2,
  CheckCircle2,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function ContentAnalyzer({ post, onApplyImprovement }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [expandedSuggestions, setExpandedSuggestions] = useState({});

  const analyzeContent = async () => {
    setAnalyzing(true);
    try {
      const response = await InvokeLLM({
        prompt: `Analyze this blog post content and provide specific, actionable suggestions for improvement focusing on clarity, engagement, and flow.

Title: ${post.title}
Content: ${post.content?.substring(0, 3000) || 'No content'}
Word Count: ${post.word_count || 0}

Provide a detailed analysis with:
1. Overall assessment of clarity, engagement, and flow (rate each out of 10)
2. Specific suggestions organized by category (clarity, engagement, flow)
3. For each suggestion, provide:
   - The specific issue
   - Why it matters
   - How to fix it (actionable steps)
   - Example improvement if applicable`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_scores: {
              type: "object",
              properties: {
                clarity: { type: "number" },
                engagement: { type: "number" },
                flow: { type: "number" }
              }
            },
            summary: { type: "string" },
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  issue: { type: "string" },
                  why_it_matters: { type: "string" },
                  how_to_fix: { type: "string" },
                  example: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAnalysis(response);
    } catch (error) {
      console.error("Error analyzing content:", error);
      toast({
        variant: "destructive",
        title: "Couldn't analyze content",
        description: error.message || "Check your AI provider settings and try again.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleSuggestion = (index) => {
    setExpandedSuggestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-primary";
    if (score >= 6) return "text-status-generating";
    return "text-destructive";
  };

  const getScoreBg = (score) => {
    if (score >= 8) return "bg-accent";
    if (score >= 6) return "bg-status-generating-bg";
    return "bg-destructive/10";
  };

  const getCategoryIcon = (category) => {
    if (category.toLowerCase().includes('clarity')) return <BookOpen className="w-4 h-4" />;
    if (category.toLowerCase().includes('engagement')) return <Sparkles className="w-4 h-4" />;
    return <CheckCircle2 className="w-4 h-4" />;
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-destructive/10 text-destructive border-destructive/30';
    if (priority === 'medium') return 'bg-status-generating-bg text-status-generating border-status-generating/30';
    return 'bg-status-ready-bg text-status-ready border-status-ready/30';
  };

  return (
    <Card className="border-0 shadow-lift">
      <CardHeader className="bg-muted/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-status-ready" />
            Content Analysis
          </CardTitle>
          {!analysis && (
            <Button
              onClick={analyzeContent}
              disabled={analyzing}
              size="sm"
              className="bg-primary hover:bg-primary"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Content
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {!analysis ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-muted-foreground/70 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              Get AI-powered suggestions to improve your content's clarity, engagement, and flow
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Scores */}
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(analysis.overall_scores || {}).map(([key, value]) => (
                <div key={key} className={`${getScoreBg(value)} rounded-lg p-3 text-center`}>
                  <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
                    {value}/10
                  </div>
                  <p className="text-xs font-medium text-foreground capitalize mt-1">
                    {key}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary */}
            {analysis.summary && (
              <div className="bg-status-ready-bg border border-status-ready/30 rounded-lg p-4">
                <p className="text-sm text-foreground">{analysis.summary}</p>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-status-generating" />
                  Improvement Suggestions ({analysis.suggestions.length})
                </h4>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleSuggestion(index)}
                        className="w-full text-left p-3 bg-muted hover:bg-muted transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getCategoryIcon(suggestion.category)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.category}
                              </Badge>
                              <Badge className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                                {suggestion.priority}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                              {suggestion.issue}
                            </p>
                          </div>
                        </div>
                        {expandedSuggestions[index] ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      
                      {expandedSuggestions[index] && (
                        <div className="p-4 bg-white border-t space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-foreground mb-1">Why it matters:</p>
                            <p className="text-sm text-muted-foreground">{suggestion.why_it_matters}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground mb-1">How to fix:</p>
                            <p className="text-sm text-muted-foreground">{suggestion.how_to_fix}</p>
                          </div>
                          {suggestion.example && (
                            <div className="bg-status-ready-bg border border-status-ready/30 rounded p-3">
                              <p className="text-xs font-semibold text-status-ready mb-1">Example:</p>
                              <p className="text-sm text-status-ready italic">{suggestion.example}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reanalyze Button */}
            <Button
              onClick={analyzeContent}
              disabled={analyzing}
              variant="outline"
              className="w-full"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Reanalyze
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
