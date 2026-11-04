import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { BlogIdea } from "@/services/blogIdeas";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { toast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";

import IdeaForm from "../components/ideas/IdeaForm";
import IdeaList from "../components/ideas/IdeaList";
import IdeaDetails from "../components/ideas/IdeaDetails";

export default function Ideas() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadIdeas();
    }
  }, [user?.id]);

  const loadIdeas = async () => {
    if (!user?.id) return;
    
    try {
      const data = await BlogIdea.list(user.id, '-created_at');
      setIdeas(data);
      
      if (selectedIdea) {
        const updatedIdea = data.find(i => i.id === selectedIdea.id);
        if (updatedIdea) {
          setSelectedIdea(updatedIdea);
        }
      }
    } catch (error) {
      console.error("Error loading ideas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIdeaSubmit = async (ideaData) => {
    if (!user?.id) return;
    
    try {
      await BlogIdea.create(user.id, ideaData);
      setShowForm(false);
      loadIdeas();
      toast({
        title: "Idea created",
        description: "Your blog idea has been saved.",
      });
    } catch (error) {
      console.error("Error creating idea:", error);
      toast({
        variant: "destructive",
        title: "Couldn't create idea",
        description: error.message || "Something went wrong. Please try again.",
      });
    }
  };

  const handleIdeaSelect = (idea) => {
    setSelectedIdea(idea);
  };

  const handleDeleteIdeas = async (idsToDelete) => {
    try {
      for (const id of idsToDelete) {
        await BlogIdea.delete(id);
      }
      if (selectedIdea && idsToDelete.includes(selectedIdea.id)) {
        setSelectedIdea(null);
      }
      loadIdeas();
      toast({
        title: idsToDelete.length > 1 ? "Ideas deleted" : "Idea deleted",
        description: `${idsToDelete.length} idea${idsToDelete.length > 1 ? "s" : ""} removed.`,
      });
    } catch (error) {
      console.error("Error deleting ideas:", error);
      toast({
        variant: "destructive",
        title: "Couldn't delete ideas",
        description: error.message || "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Content"
        title="Blog ideas"
        description="Capture a working title and a brief, then generate drafts from it."
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            New idea
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ideas List */}
        <div className="lg:col-span-2">
          <IdeaList
            ideas={ideas}
            loading={loading}
            onIdeaSelect={handleIdeaSelect}
            selectedIdea={selectedIdea}
            onDelete={handleDeleteIdeas}
            onCreateIdea={() => setShowForm(true)}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {selectedIdea && (
            <IdeaDetails
              idea={selectedIdea}
              onUpdate={loadIdeas}
            />
          )}
        </div>
      </div>

      {/* Idea Form Modal */}
      {showForm && (
        <IdeaForm
          onSubmit={handleIdeaSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
