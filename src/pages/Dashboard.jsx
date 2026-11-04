import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";

import { DashboardView } from "@/components/dashboard/DashboardView";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { BlogIdea } from "@/services/blogIdeas";
import { BlogPost } from "@/services/blogPosts";
import { WordPressSite } from "@/services/wordpressSites";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const PIPELINE_KEYS = ["draft", "generating", "ready", "scheduled", "published"];

// Records come back with created_date from the service layer; fall back to the
// raw column so a shape change degrades to "—" instead of "Invalid Date".
function relativeTime(record) {
  const raw = record?.created_date ?? record?.created_at;
  if (!raw) return "—";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "—";
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

function countByStatus(posts) {
  const counts = Object.fromEntries(PIPELINE_KEYS.map((key) => [key, 0]));
  posts.forEach((post) => {
    const key = String(post.status ?? "draft").toLowerCase();
    if (key in counts) counts[key] += 1;
  });
  return counts;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-7">
      <div className="space-y-3 border-b border-border pb-6">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-[7.5rem] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-36 rounded-lg" />
      <div className="grid gap-5 xl:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalIdeas: 0,
    totalPosts: 0,
    publishedPosts: 0,
    connectedSites: 0,
  });
  const [pipeline, setPipeline] = useState({});
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [ideas, posts, sites] = await Promise.all([
        BlogIdea.list(user.id, "-created_at", 50),
        BlogPost.list(user.id, "-created_at", 50),
        WordPressSite.list(user.id, "-created_at", 10),
      ]);

      setStats({
        totalIdeas: ideas.length,
        totalPosts: posts.length,
        publishedPosts: posts.filter((p) => p.status === "published").length,
        connectedSites: sites.filter((s) => s.connection_status === "connected").length,
      });
      setPipeline(countByStatus(posts));
      setRecentIdeas(
        ideas.slice(0, 5).map((idea) => ({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          status: idea.status,
          timestamp: relativeTime(idea),
        })),
      );
      setRecentPosts(
        posts.slice(0, 5).map((post) => ({
          id: post.id,
          title: post.title,
          meta: [
            post.word_count ? `${post.word_count} words` : null,
            post.variation_number ? `variation ${post.variation_number}` : null,
          ]
            .filter(Boolean)
            .join(" · "),
          status: post.status,
          timestamp: relativeTime(post),
        })),
      );
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) loadDashboardData();
  }, [user?.id, loadDashboardData]);

  if (loading) return <DashboardSkeleton />;

  return (
    <DashboardView
      businessName={user?.business_name}
      stats={stats}
      pipeline={pipeline}
      recentIdeas={recentIdeas}
      recentPosts={recentPosts}
      LinkComponent={Link}
      ideasUrl={createPageUrl("Ideas")}
      postsUrl={createPageUrl("Posts")}
      sitesUrl={createPageUrl("WordPress")}
    />
  );
}
