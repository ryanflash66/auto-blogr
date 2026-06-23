// Database Integration Test Page
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { BlogIdea } from "../src/entities/BlogIdea.js";
import { Button } from "../src/components/ui/button.jsx";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "../src/components/ui/card.jsx";
import { Input } from "../src/components/ui/input.jsx";
import { Textarea } from "../src/components/ui/textarea.jsx";
import { Badge } from "../src/components/ui/badge.jsx";

function DatabaseIntegrationTest() {
  const { user } = useUser();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    targetKeywords: [],
  });
  const [status, setStatus] = useState("");

  // Load user's blog ideas
  const loadIdeas = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userIdeas = await BlogIdea.findByUserId(user.id);
      setIdeas(userIdeas);
      setStatus(`✅ Loaded ${userIdeas.length} ideas from database`);
    } catch (error) {
      console.error("Error loading ideas:", error);
      setStatus(`❌ Error loading ideas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create new blog idea
  const createIdea = async () => {
    if (!user || !newIdea.title) return;

    setLoading(true);
    try {
      const idea = BlogIdea.create(user.id, {
        title: newIdea.title,
        description: newIdea.description,
        targetKeywords: newIdea.targetKeywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k),
      });

      await idea.save();
      setStatus(`✅ Created new idea: ${idea.title}`);

      // Clear form
      setNewIdea({ title: "", description: "", targetKeywords: [] });

      // Reload ideas
      await loadIdeas();
    } catch (error) {
      console.error("Error creating idea:", error);
      setStatus(`❌ Error creating idea: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete idea
  const deleteIdea = async (idea) => {
    setLoading(true);
    try {
      await idea.delete();
      setStatus(`✅ Deleted idea: ${idea.title}`);
      await loadIdeas();
    } catch (error) {
      console.error("Error deleting idea:", error);
      setStatus(`❌ Error deleting idea: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadIdeas();
    }
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Database Integration Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please sign in to test database integration.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Database Integration Test</CardTitle>
          <p className="text-gray-600">
            Testing Clerk + Supabase integration with BlogIdea entities
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              User: {user.emailAddresses[0]?.emailAddress}
            </Badge>
            <Badge variant="outline">ID: {user.id}</Badge>
          </div>

          {status && (
            <div className="p-3 bg-gray-100 rounded-md">
              <p className="text-sm">{status}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Idea */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Blog Idea</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Blog idea title..."
            value={newIdea.title}
            onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
          />
          <Textarea
            placeholder="Description..."
            value={newIdea.description}
            onChange={(e) =>
              setNewIdea({ ...newIdea, description: e.target.value })
            }
          />
          <Input
            placeholder="Keywords (comma separated)..."
            value={newIdea.targetKeywords}
            onChange={(e) =>
              setNewIdea({ ...newIdea, targetKeywords: e.target.value })
            }
          />
          <Button
            onClick={createIdea}
            disabled={loading || !newIdea.title}
            className="w-full"
          >
            {loading ? "Creating..." : "Create Blog Idea"}
          </Button>
        </CardContent>
      </Card>

      {/* List Ideas */}
      <Card>
        <CardHeader>
          <CardTitle>Your Blog Ideas ({ideas.length})</CardTitle>
          <Button onClick={loadIdeas} variant="outline" size="sm">
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading...</p>}

          {ideas.length === 0 && !loading && (
            <p className="text-gray-600">No ideas found. Create one above!</p>
          )}

          <div className="space-y-3">
            {ideas.map((idea) => (
              <div key={idea.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{idea.title}</h3>
                    {idea.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {idea.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{idea.status}</Badge>
                      <Badge variant="outline">{idea.tone}</Badge>
                      {idea.targetKeywords.length > 0 && (
                        <Badge variant="secondary">
                          {idea.targetKeywords.length} keywords
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Created:{" "}
                      {idea.createdAt
                        ? new Date(idea.createdAt).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>
                  <Button
                    onClick={() => deleteIdea(idea)}
                    variant="destructive"
                    size="sm"
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DatabaseIntegrationTest;
