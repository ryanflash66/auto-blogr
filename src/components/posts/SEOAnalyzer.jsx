import { useState } from "react";
import { InvokeLLM } from "@/lib/openrouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  TrendingUp,
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Loader2,
  Sparkles,
  RefreshCw
} from "lucide-react";

export default function SEOAnalyzer({ post, onImprove }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [improving, setImproving] = useState(false);
  const [seoScore, setSeoScore] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const analyzeSEO = async () => {
    setAnalyzing(true);
    try {
      const response = await InvokeLLM({
        prompt: `Analyze the SEO quality of this blog post and provide a score out of 100 and specific suggestions for improvement.

Title: ${post.title}
SEO Title: ${post.seo_title || 'Not set'}
Meta Description: ${post.meta_description || 'Not set'}
Content: ${post.content?.substring(0, 1000) || 'No content'}
Word Count: ${post.word_count || 0}

Provide a detailed SEO analysis focusing on:
- Title optimization and keyword usage
- Meta description quality
- Content length and readability
- Keyword density and placement
- Header structure
- Overall SEO effectiveness`,
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number" },
            grade: { type: "string" },
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  issue: { type: "string" },
                  fix: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSeoScore(response);
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error("Error analyzing SEO:", error);
      toast({
        variant: "destructive",
        title: "Couldn't analyze SEO",
        description: error.message || "Check your AI provider settings and try again.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const improveSEO = async () => {
    setImproving(true);
    try {
      const response = await InvokeLLM({
        prompt: `Improve this blog post's SEO based on the following analysis:

Current Title: ${post.title}
Current SEO Title: ${post.seo_title || 'Not set'}
Current Meta Description: ${post.meta_description || 'Not set'}
Current Content: ${post.content?.substring(0, 2000) || 'No content'}

SEO Issues:
${suggestions.map(s => `- ${s.issue}: ${s.fix}`).join('\n')}

Generate improved versions of:
1. SEO-optimized title (max 60 characters)
2. Meta description (max 160 characters)
3. Brief content improvements (if needed)

Keep the original message and tone, but optimize for search engines.`,
        response_json_schema: {
          type: "object",
          properties: {
            seo_title: { type: "string" },
            meta_description: { type: "string" },
            content_suggestions: { type: "string" }
          }
        }
      });

      onImprove(response);
    } catch (error) {
      console.error("Error improving SEO:", error);
      toast({
        variant: "destructive",
        title: "Couldn't improve SEO",
        description: error.message || "Check your AI provider settings and try again.",
      });
    } finally {
      setImproving(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-primary";
    if (score >= 60) return "text-status-generating";
    return "text-destructive";
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return { color: "bg-accent text-accent-foreground", label: "Excellent" };
    if (score >= 60) return { color: "bg-status-generating-bg text-status-generating", label: "Good" };
    if (score >= 40) return { color: "bg-status-generating-bg text-status-generating", label: "Needs Work" };
    return { color: "bg-destructive/10 text-destructive", label: "Poor" };
  };

  const getPriorityIcon = (priority) => {
    if (priority === "high") return <XCircle className="w-4 h-4 text-destructive" />;
    if (priority === "medium") return <AlertTriangle className="w-4 h-4 text-status-generating" />;
    return <CheckCircle2 className="w-4 h-4 text-status-ready" />;
  };

  return (
    <Card className="border-0 shadow-lift">
      <CardHeader className="bg-muted/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-status-scheduled" />
            SEO Analysis
          </CardTitle>
          {!seoScore && (
            <Button
              onClick={analyzeSEO}
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
                  Analyze SEO
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {!seoScore ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-muted-foreground/70 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              Click "Analyze SEO" to check the optimization score
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score Display */}
            <div className="text-center py-6 bg-muted/50 rounded-lg">
              <div className={`text-5xl font-bold ${getScoreColor(seoScore.score)} mb-2`}>
                {seoScore.score}
                <span className="text-2xl">/100</span>
              </div>
              <Badge className={`${getScoreBadge(seoScore.score).color} text-sm px-4 py-1`}>
                {getScoreBadge(seoScore.score).label}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">{seoScore.grade}</p>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-sm">Improvement Suggestions</h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="bg-muted rounded-lg p-3 border border-border"
                    >
                      <div className="flex items-start gap-2">
                        {getPriorityIcon(suggestion.priority)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                            <Badge
                              className={`text-xs ${
                                suggestion.priority === 'high'
                                  ? 'bg-destructive/10 text-destructive'
                                  : suggestion.priority === 'medium'
                                  ? 'bg-status-generating-bg text-status-generating'
                                  : 'bg-status-ready-bg text-status-ready'
                              }`}
                            >
                              {suggestion.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            {suggestion.issue}
                          </p>
                          <p className="text-xs text-muted-foreground">{suggestion.fix}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={improveSEO}
                disabled={improving}
                className="flex-1 bg-primary hover:bg-primary"
              >
                {improving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Improving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Auto-Improve SEO
                  </>
                )}
              </Button>
              <Button
                onClick={analyzeSEO}
                disabled={analyzing}
                variant="outline"
                size="icon"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
