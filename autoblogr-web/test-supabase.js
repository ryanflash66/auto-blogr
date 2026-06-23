// Node.js Supabase Connection Test
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🔍 Testing Supabase Connection...\n");

// Check if credentials are loaded
console.log("URL configured:", supabaseUrl ? "✅ Yes" : "❌ No");
console.log("Key configured:", supabaseAnonKey ? "✅ Yes" : "❌ No");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

// Create client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
async function testConnection() {
  try {
    console.log("\n🌐 Testing database connection...");

    // Try to access a non-existent table (should return specific error)
    const { data, error } = await supabase
      .from("_test_table_that_does_not_exist")
      .select("*")
      .limit(1);

    if (error && error.code === "PGRST116") {
      console.log("✅ Supabase connection successful!");
      console.log("✅ Database is accessible");
      return true;
    } else if (error) {
      console.error("❌ Unexpected error:", error.message);
      return false;
    }
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    return false;
  }
}

testConnection().then((success) => {
  if (success) {
    console.log("\n🎉 Ready to create database tables!");
    console.log("\nNext: Run the SQL script in Supabase dashboard");
  }
});
