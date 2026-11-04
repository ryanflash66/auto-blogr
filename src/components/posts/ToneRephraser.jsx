import { useState } from "react";
import { InvokeLLM } from "@/lib/openrouter";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  X,
  Wand2, 
  Loader2,
  Copy,
  CheckCircle2,
  Sparkles
} from "lucide-react";

const TONE_OPTIONS = [
  { value: "formal", label: "Formal", description: "Professional and authoritative", icon: "👔" },
  { value: "casual", label: "Casual", description: "Friendly and conversational", icon: "😊" },
  { value: "witty", label: "Witty", description: "Humorous and clever", icon: "😄" },
  { value: "persuasive", label: "Persuasive", description: "Compelling and convincing", icon: "💪" },
  { value: "educational", label: "Educational", description: "Clear and informative", icon: "📚" },
  { value: "inspirational", label: "Inspirational", description: "Motivating and uplifting", icon: "✨" }
];

export default function ToneRephraser({ content, onApply, onClose }) {
  const [selectedTone, setSelectedTone] = useState(null);
  const [rephrasing, setRephrasing] = useState(false);
  const [rephrasedContent, setRephrasedContent] = useState("");
  const [copied, setCopied] = useState(false);

  const handleRephrase = async (tone) => {
    setSelectedTone(tone);
    setRephrasing(true);
    setRephrasedContent("");

    try {
      const response = await InvokeLLM({
        prompt: `Rephrase the following content in a ${tone.label.toLowerCase()} tone. ${tone.description}.

Original Content:
${content}

Requirements:
- Keep the same core message and key points
- Maintain the same approximate length
- Adapt the language and style to match the ${tone.label.toLowerCase()} tone
- Preserve any technical terms or important keywords
- Make it natural and engaging

Return only the rephrased content without any additional commentary. Do not wrap the output in quotation marks.`
      });

      setRephrasedContent(response);
    } catch (error) {
      console.error("Error rephrasing content:", error);
      toast({
        variant: "destructive",
        title: "Couldn't rephrase content",
        description: error.message || "Check your AI provider settings and try again.",
      });
    } finally {
      setRephrasing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rephrasedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    onApply(rephrasedContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Wand2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Tone Rephraser</h2>
                <p className="text-primary-foreground/80 text-sm mt-1">Transform your content with different writing styles</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Original Content */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Original Content</h3>
              <div className="bg-muted rounded-lg p-4 border border-border h-64 overflow-y-auto">
                <p className="text-sm text-foreground whitespace-pre-wrap">{content}</p>
              </div>
            </div>

            {/* Rephrased Content */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">
                  {selectedTone ? `${selectedTone.label} Version` : "Select a Tone"}
                </h3>
                {rephrasedContent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="text-muted-foreground"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="bg-muted/50 rounded-lg p-4 border border-status-scheduled/30 h-64 overflow-y-auto">
                {rephrasing ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-status-scheduled animate-spin mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Rephrasing in {selectedTone?.label.toLowerCase()} tone...</p>
                    </div>
                  </div>
                ) : rephrasedContent ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap">{rephrasedContent}</p>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 text-muted-foreground/70 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Choose a tone below to see the magic</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tone Options */}
          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-4">Choose a Tone</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone.value}
                  onClick={() => handleRephrase(tone)}
                  disabled={rephrasing}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTone?.value === tone.value
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-status-scheduled/30 bg-white'
                  } ${rephrasing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{tone.icon}</span>
                    <span className="font-semibold text-foreground">{tone.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{tone.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-muted p-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={rephrasing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!rephrasedContent || rephrasing}
            className="bg-primary hover:bg-primary px-8"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Apply Rephrased Content
          </Button>
        </div>
      </div>
    </div>
  );
}
