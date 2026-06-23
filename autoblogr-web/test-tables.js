// Simple Table Creation Test
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testTableCreation() {
  console.log("🧪 Testing individual table operations...\n");

  try {
    // Test 1: Check if tables exist
    console.log("📋 Checking existing tables...");
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    if (tablesError) {
      console.log(
        "❌ Cannot query information_schema (expected with anon key)"
      );
    } else {
      console.log(
        "✅ Found tables:",
        tables?.map((t) => t.table_name) || "none"
      );
    }

    // Test 2: Try to query our expected tables
    console.log("\n🔍 Testing table access...");

    const tables_to_test = [
      "blog_ideas",
      "blog_posts",
      "wordpress_sites",
      "published_posts",
    ];

    for (const table of tables_to_test) {
      const { data, error } = await supabase
        .from(table)
        .select("count")
        .limit(1);

      if (error) {
        if (error.code === "PGRST116") {
          console.log(`❌ Table '${table}' does not exist`);
        } else {
          console.log(`❌ Table '${table}' error:`, error.message);
        }
      } else {
        console.log(`✅ Table '${table}' exists and accessible`);
      }
    }
  } catch (err) {
    console.error("❌ Test failed:", err.message);
  }
}

testTableCreation();
