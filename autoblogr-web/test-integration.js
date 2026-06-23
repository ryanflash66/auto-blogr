// Complete Supabase Integration Test
import { supabaseService } from "./src/services/supabaseService.js";
import { BlogIdea } from "./src/entities/BlogIdea.js";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testFullIntegration() {
  console.log("🧪 Starting Full AutoBlogr-Supabase Integration Test\n");

  let testUserId = "test-user-" + Date.now();

  try {
    // Test 1: Verify all tables exist
    console.log("📋 Testing table accessibility...");
    const tables = [
      "blog_ideas",
      "blog_posts",
      "wordpress_sites",
      "published_posts",
    ];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("count")
        .limit(1);
      if (error && error.code !== "PGRST116") {
        console.log(`❌ Table ${table}:`, error.message);
      } else {
        console.log(`✅ Table ${table}: Accessible`);
      }
    }

    // Test 2: Test BlogIdea entity operations
    console.log("\n🧠 Testing BlogIdea Entity...");

    // Create a new blog idea
    const blogIdea = BlogIdea.create(testUserId, {
      title: "Test Blog Idea Integration",
      description:
        "Testing the complete integration between BlogIdea entity and Supabase",
      targetKeywords: ["test", "integration", "supabase"],
      targetAudience: "developers",
      tone: "professional",
    });

    console.log("✨ Created new BlogIdea instance");

    // Test validation
    if (!blogIdea.validate()) {
      console.log("❌ Validation failed:", blogIdea.getErrors());
      return false;
    }
    console.log("✅ BlogIdea validation passed");

    // Test save (create)
    await blogIdea.save();
    console.log("✅ BlogIdea saved to database, ID:", blogIdea.id);

    // Test update
    blogIdea.description = "Updated description for integration test";
    await blogIdea.save();
    console.log("✅ BlogIdea updated successfully");

    // Test find by ID
    const foundIdea = await BlogIdea.findById(blogIdea.id);
    if (foundIdea && foundIdea.title === blogIdea.title) {
      console.log("✅ BlogIdea found by ID successfully");
    } else {
      console.log("❌ BlogIdea find by ID failed");
      return false;
    }

    // Test find by user ID
    const userIdeas = await BlogIdea.findByUserId(testUserId);
    if (userIdeas.length > 0) {
      console.log(`✅ Found ${userIdeas.length} BlogIdeas for user`);
    } else {
      console.log("❌ No BlogIdeas found for user");
      return false;
    }

    // Test status update
    await blogIdea.updateStatus("ready");
    console.log("✅ BlogIdea status updated to ready");

    // Test find by status
    const readyIdeas = await BlogIdea.findByStatus("ready", testUserId);
    if (readyIdeas.length > 0) {
      console.log(`✅ Found ${readyIdeas.length} ready BlogIdeas`);
    }

    // Test clone
    const clonedIdea = blogIdea.clone();
    await clonedIdea.save();
    console.log("✅ BlogIdea cloned and saved, ID:", clonedIdea.id);

    // Test 3: Test SupabaseService directly
    console.log("\n🔧 Testing SupabaseService...");

    // Test query
    const { data: queryData, error: queryError } = await supabaseService.query(
      "blog_ideas",
      {
        filter: { user_id: testUserId },
        order: { column: "created_at", ascending: false },
      }
    );

    if (queryError) {
      console.log("❌ SupabaseService query failed:", queryError);
      return false;
    } else {
      console.log(
        `✅ SupabaseService query returned ${queryData.length} results`
      );
    }

    // Test insert
    const { data: insertData, error: insertError } =
      await supabaseService.insert("blog_ideas", {
        user_id: testUserId,
        title: "Direct Service Test",
        description: "Testing direct supabaseService insert",
        status: "draft",
        keywords: ["service", "test"],
        tone: "professional",
      });

    if (insertError) {
      console.log("❌ SupabaseService insert failed:", insertError);
      return false;
    } else {
      console.log(
        "✅ SupabaseService insert successful, ID:",
        insertData[0].id
      );
    }

    // Test 4: Cleanup
    console.log("\n🧹 Cleaning up test data...");

    // Delete all test ideas
    const allTestIdeas = await BlogIdea.findByUserId(testUserId);
    for (const idea of allTestIdeas) {
      await idea.delete();
    }
    console.log(`✅ Cleaned up ${allTestIdeas.length} test BlogIdeas`);

    console.log("\n🎉 All integration tests PASSED! ✅");
    console.log("\n📊 Test Summary:");
    console.log("✅ Database tables accessible");
    console.log("✅ BlogIdea entity CRUD operations");
    console.log("✅ BlogIdea validation and business logic");
    console.log("✅ SupabaseService direct operations");
    console.log("✅ Data cleanup successful");

    return true;
  } catch (error) {
    console.error("\n❌ Integration test failed:", error);
    console.error("Stack trace:", error.stack);
    return false;
  }
}

testFullIntegration().then((success) => {
  if (success) {
    console.log("\n🚀 AutoBlogr-Supabase integration is fully functional!");
    console.log(
      "📝 Ready to migrate from localStorage to database persistence"
    );
  } else {
    console.log(
      "\n⚠️  Integration issues detected - please review errors above"
    );
  }
});
