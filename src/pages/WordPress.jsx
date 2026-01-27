import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { WordPressSite } from "@/services/wordpressSites";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import SiteForm from "../components/wordpress/SiteForm";
import SiteList from "../components/wordpress/SiteList";

export default function WordPress() {
  const { user } = useAuth();
  const [sites, setSites] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadSites();
    }
  }, [user?.id]);

  const loadSites = async () => {
    if (!user?.id) return;
    
    try {
      const data = await WordPressSite.list(user.id, '-created_at');
      setSites(data);
    } catch (error) {
      console.error("Error loading sites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSiteSubmit = async (siteData) => {
    if (!user?.id) return;
    
    try {
      if (editingSite) {
        await WordPressSite.update(editingSite.id, siteData);
      } else {
        await WordPressSite.create(user.id, siteData);
      }
      setShowForm(false);
      setEditingSite(null);
      loadSites();
    } catch (error) {
      console.error("Error saving site:", error);
    }
  };

  const handleEditSite = (site) => {
    setEditingSite(site);
    setShowForm(true);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">WordPress Sites</h1>
          <p className="text-lg text-gray-600 mt-1">Connect and manage your WordPress sites</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg text-white px-6 py-3 h-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Connect Site
        </Button>
      </div>

      {/* Sites List */}
      <SiteList
        sites={sites}
        loading={loading}
        onEditSite={handleEditSite}
        onRefresh={loadSites}
      />

      {/* Site Form Modal */}
      {showForm && (
        <SiteForm
          site={editingSite}
          onSubmit={handleSiteSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingSite(null);
          }}
        />
      )}
    </div>
  );
}
