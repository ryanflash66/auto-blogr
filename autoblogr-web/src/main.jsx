import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { ClerkSupabaseProvider } from "./contexts/ClerkSupabaseContext.jsx";
import App from "./App.jsx";
import "./index.css";

// Get the publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{
        theme: {
          primaryColor: "#059669", // AutoBlogr green theme
        },
        elements: {
          formButtonPrimary:
            "bg-green-600 hover:bg-green-700 text-sm normal-case",
          card: "shadow-lg border-0",
          headerTitle: "text-green-900 font-semibold",
          headerSubtitle: "text-gray-600",
          socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
          socialButtonsBlockButtonText: "text-gray-700 font-medium",
        },
      }}
    >
      <ClerkSupabaseProvider>
        <App />
      </ClerkSupabaseProvider>
    </ClerkProvider>
  </React.StrictMode>
);
