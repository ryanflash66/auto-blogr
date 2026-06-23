// Simple Supabase Connection Test
import { supabase, isSupabaseConfigured } from "./src/config/supabase.js";

async function testConnection() {
  console.log("🔍 Testing Supabase Connection...\n");

  // Check configuration
  console.log(
    "Configuration status:",
    isSupabaseConfigured() ? "✅ Configured" : "❌ Not configured"
  );

  if (!isSupabaseConfigured()) {
    console.log("Please check your .env.local file");
    return;
  }

  // Test basic connection
  try {
    const { data, error } = await supabase
      .from("_test_table_that_does_not_exist")
      .select("*")
      .limit(1);

    // We expect an error here (table doesn't exist), but it means connection works
    if (error && error.code === "PGRST116") {
      console.log("✅ Supabase connection working!");
      console.log("✅ Database accessible");
      return true;
    } else if (error) {
      console.error("❌ Unexpected error:", error);
      return false;
    }
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    return false;
  }
}

testConnection();
