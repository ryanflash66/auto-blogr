import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BlogIdea } from "@/entities/BlogIdea";
import { BlogPost } from "@/entities/BlogPost";
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Target, 
  Volume2, 
  Hash, 
  Calendar,
  Sparkles,
  Image as ImageIcon,
  FileText,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

export default function IdeaDetails({ idea, onUpdate }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const navigate = useNavigate();

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    
    try {
      for (let i = 1; i <= idea.variations_requested; i++) {
        setGenerationProgress(`Generating variation ${i} of ${idea.variations_requested}...`);
        
        // Generate blog post content
        const contentPrompt = `
          Create a comprehensive, engaging blog post about "${idea.title}".
          
          Additional details: ${idea.description || 'No additional details provided'}
          Target audience: ${idea.target_audience || 'General audience'}
          Tone: ${idea.tone || 'Professional'}
          Keywords to include: ${idea.keywords?.join(', ') || 'None specified'}
          
          Please create:
          1. An SEO-optimized title (different from the idea title)
          2. A compelling meta description (150-160 characters)
          3. A brief excerpt (2-3 sentences)
          4. Full blog post content in HTML format with proper headings, paragraphs, and formatting
          5. Alt text for a hero image
          6. 5-8 relevant tags
          
          The blog post should be informative, well-structured, and engaging. 
          Include practical tips, examples, or actionable advice where relevant.
          Aim for 800-1200 words.
        `;

        const contentResult = await InvokeLLM({
          prompt: contentPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              seo_title: { type: "string" },
              meta_description: { type: "string" },
              excerpt: { type: "string" },
              content: { type: "string" },
              hero_image_alt: { type: "string" },
              tags: { type: "array", items: { type: "string" } },
              word_count: { type: "number" }
            }
          }
        });

        setGenerationProgress(`Generating hero image for variation ${i}...`);
        
        // Generate hero image
        const imagePrompt = `Create a professional, high-quality hero image for a blog post titled "${contentResult.seo_title}". The image should be visually appealing, relevant to the topic, and suitable for a business blog. Style: modern, clean, professional.`;
        
        const imageResult = await GenerateImage({
          prompt: imagePrompt
        });

        // Save the generated blog post
        await BlogPost.create({
          blog_idea_id: idea.id,
          title: contentResult.seo_title,
          content: contentResult.content,
          excerpt: contentResult.excerpt,
          hero_image_url: imageResult.url,
          hero_image_alt: contentResult.hero_image_alt,
          variation_number: i,
          status: 'ready',
          seo_title: contentResult.seo_title,
          meta_description: contentResult.meta_description,
          tags: contentResult.tags || [],
          word_count: contentResult.word_count || 0
        });
      }

      // Update idea status
      await BlogIdea.update(idea.id, { status: 'ready' });
      
      setGenerationProgress("Content generated successfully!");
      
      // Immediately trigger update to refresh UI state
      onUpdate();
      
    } catch (error) {
      console.error("Error generating content:", error);
      setGenerationProgress("Error generating content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg sticky top-8">
      <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          Idea Details
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Status</span>
          <Badge className={`${
            idea.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
            idea.status === 'generating' ? 'bg-amber-100 text-amber-800' :
            idea.status === 'ready' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          } border`}>
            <span className="capitalize">{idea.status}</span>
          </Badge>
        </div>

        {/* Metadata */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Created {format(new Date(idea.created_date), 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{idea.variations_requested} variation{idea.variations_requested > 1 ? 's' : ''} requested</span>
          </div>

          {idea.tone && (
            <div className="flex items-center gap-2 text-sm">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 capitalize">{idea.tone} tone</span>
            </div>
          )}

          {idea.target_audience && (
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{idea.target_audience}</span>
            </div>
          )}
        </div>

        {/* Keywords */}
        {idea.keywords && idea.keywords.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4" />
              Keywords
            </div>
            <div className="flex flex-wrap gap-1">
              {idea.keywords.map((keyword) => (
                <Badge key={keyword} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {idea.description && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Description</div>
            <p className="text-sm text-gray-600 leading-relaxed">{idea.description}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t">
          {idea.status === 'draft' && (
            <Button
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          )}
          
          {idea.status === 'ready' && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate(createPageUrl("Posts"))}
            >
              <FileText className="w-4 h-4 mr-2" />
              View Generated Posts
            </Button>
          )}
        </div>

        {/* Generation Progress */}
        {isGenerating && generationProgress && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span className="text-sm text-amber-800">{generationProgress}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}