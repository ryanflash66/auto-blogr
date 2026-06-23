// Create Database Tables via Supabase Client
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTables() {
  console.log("🏗️  Creating AutoBlogr database tables...\n");

  try {
    // Read and execute SQL script
    const sqlScript = readFileSync("./supabase-setup.sql", "utf8");

    // Split into individual statements (remove comments and empty lines)
    const statements = sqlScript
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt && !stmt.startsWith("--"))
      .map((stmt) => stmt + ";");

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement === ";") continue;

      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

      const { data, error } = await supabase.rpc("exec_sql", {
        sql_query: statement,
      });

      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        console.log("Statement:", statement.substring(0, 100) + "...");
        return false;
      } else {
        console.log(`✅ Statement ${i + 1} completed successfully`);
      }
    }

    console.log("\n🎉 All database tables created successfully!");
    return true;
  } catch (err) {
    console.error("❌ Setup failed:", err.message);
    return false;
  }
}

createTables().then((success) => {
  if (success) {
    console.log("\n✅ Database setup complete!");
    console.log("🔄 Ready to migrate entities from localStorage to Supabase");
  } else {
    console.log(
      "\n⚠️  Manual setup required - copy SQL from supabase-setup.sql to Supabase dashboard"
    );
  }
});
