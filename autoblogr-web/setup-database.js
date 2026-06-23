// Supabase Database Setup Script
// Run this to create tables and test connection

import { supabase } from "./src/config/supabase.js";
import fs from "fs";

async function setupDatabase() {
  console.log("🚀 Starting Supabase Database Setup...\n");

  // Test connection
  console.log("1. Testing Supabase connection...");
  try {
    const { data, error } = await supabase.from("_test").select("*").limit(1);
    if (error && error.code !== "PGRST116") {
      // PGRST116 = table doesn't exist (expected)
      throw error;
    }
    console.log("✅ Connection successful!\n");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    return;
  }

  // Read and execute SQL setup script
  console.log("2. Creating database tables...");
  try {
    const sqlScript = fs.readFileSync("./supabase-setup.sql", "utf8");

    // Split the script into individual statements
    const statements = sqlScript
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`Found ${statements.length} SQL statements to execute.`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        const { error } = await supabase.rpc("exec_sql", { sql: statement });
        if (error) {
          console.warn(`⚠️  Statement ${i + 1} warning:`, error.message);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (error) {
        console.warn(`⚠️  Statement ${i + 1} failed:`, error.message);
      }
    }
  } catch (error) {
    console.error("❌ Failed to execute SQL script:", error.message);
    console.log("\n📝 Manual Setup Required:");
    console.log("1. Go to your Supabase dashboard");
    console.log("2. Navigate to SQL Editor");
    console.log("3. Copy and paste the contents of supabase-setup.sql");
    console.log('4. Click "Run" to execute the script');
    return;
  }

  // Test table creation
  console.log("\n3. Verifying table creation...");
  const tables = [
    "blog_ideas",
    "blog_posts",
    "wordpress_sites",
    "published_posts",
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);
      if (error) {
        console.error(`❌ Table ${table} not accessible:`, error.message);
      } else {
        console.log(`✅ Table ${table} ready`);
      }
    } catch (error) {
      console.error(`❌ Table ${table} check failed:`, error.message);
    }
  }

  console.log("\n🎉 Database setup complete!");
  console.log("\nNext steps:");
  console.log("1. Test creating a blog idea through the app");
  console.log("2. Verify data is persisted in Supabase dashboard");
  console.log("3. Check that user data isolation is working");
}

// Run the setup
setupDatabase().catch(console.error);
