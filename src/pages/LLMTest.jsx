import { useState } from 'react';
import { InvokeLLM } from '@/lib/openrouter';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';

export default function LLMTest() {
  const [prompt, setPrompt] = useState('Tell me a short story about a robot who discovers music.');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTestLLM = async () => {
    if (!prompt.trim()) {
      setError('Prompt cannot be empty.');
      return;
    }

    setLoading(true);
    setResponse('');
    setError('');

    try {
      const result = await InvokeLLM({ prompt });
      setResponse(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    } catch (err) {
      console.error("Error invoking LLM:", err);
      setError(err.message || 'Failed to get a response from the LLM. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">LLM Integration Test</h1>
          <p className="text-lg text-gray-600 mt-1">
            Test the OpenRouter LLM integration by sending a raw prompt.
          </p>
        </div>

        {/* Prompt Input Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Send a Prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt-input" className="text-base font-semibold">Prompt</Label>
              <Textarea
                id="prompt-input"
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-24 text-base"
              />
            </div>
            <Button
              onClick={handleTestLLM}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send to LLM
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Response Display Card */}
        {(response || loading || error) && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>LLM Response</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="ml-4 text-lg text-gray-600">Waiting for response...</p>
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
              {response && (
                <pre className="p-4 bg-gray-900 text-white rounded-lg whitespace-pre-wrap text-sm overflow-x-auto">
                  <code>{response}</code>
                </pre>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
