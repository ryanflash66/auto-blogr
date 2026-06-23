// Ideas.js - Blog ideas management page component
import React, { useState, useEffect } from "react";
import { BlogIdea } from "@/entities/BlogIdea";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import IdeaForm from "../Components/ideas/IdeaForm.jsx";
import IdeaList from "../Components/ideas/IdeaList.jsx";
import IdeaDetails from "../Components/ideas/IdeaDetails.jsx";

export default function Ideas() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const data = await BlogIdea.list("-created_date");
      setIdeas(data);
    } catch (error) {
      console.error("Error loading ideas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIdeaSubmit = async (ideaData) => {
    try {
      await BlogIdea.create(ideaData);
      setShowForm(false);
      loadIdeas();
    } catch (error) {
      console.error("Error creating idea:", error);
    }
  };

  const handleIdeaSelect = (idea) => {
    setSelectedIdea(idea);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Blog Ideas
          </h1>
          <p className="text-lg text-gray-600 mt-1">
            Create and manage your content ideas
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg text-white px-6 py-3 h-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Idea
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Ideas List */}
        <div className="lg:col-span-2">
          <IdeaList
            ideas={ideas}
            loading={loading}
            onIdeaSelect={handleIdeaSelect}
            selectedIdea={selectedIdea}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {selectedIdea && (
            <IdeaDetails idea={selectedIdea} onUpdate={loadIdeas} />
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
