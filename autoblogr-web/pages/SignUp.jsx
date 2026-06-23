import React from "react";
import { SignUp as ClerkSignUp } from "@clerk/clerk-react";

/**
 * SignUp - Clerk-powered sign-up page
 * Provides user registration interface with AutoBlogr branding
 */
const SignUp = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            Join AutoBlogr
          </h1>
          <p className="text-gray-600">
            Start creating AI-powered content today
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <ClerkSignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors",
                socialButtonsBlockButton:
                  "border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors w-full flex items-center justify-center gap-2",
                socialButtonsBlockButtonText: "text-gray-700",
                card: "shadow-none border-0",
                headerTitle: "text-green-900 font-semibold text-xl",
                headerSubtitle: "text-gray-600",
                dividerLine: "bg-gray-200",
                dividerText: "text-gray-500 text-sm",
              },
            }}
          />
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <a
              href="/sign-in"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
