import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Zap, Loader2 } from "lucide-react";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const isSignUp = mode === "signup";

  const toggleMode = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setError("");
    setInfo("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        const { data, error: signUpError } = await signUp(
          email,
          password,
          fullName
        );
        if (signUpError) throw signUpError;

        // When email confirmation is enabled, Supabase returns a user but no
        // session until the address is verified.
        if (data?.session) {
          toast({
            title: "Account created",
            description: "You're signed in.",
          });
        } else {
          const message =
            "Check your email to confirm your account before signing in.";
          setInfo(message);
          toast({ title: "Confirm your email", description: message });
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
        toast({ title: "Signed in", description: "Welcome back." });
      }
    } catch (err) {
      const message = err?.message || "Something went wrong. Please try again.";
      setError(message);
      toast({
        variant: "destructive",
        title: isSignUp ? "Sign up failed" : "Sign in failed",
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-amber-500 shadow-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? "Create your account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Sign up to start creating content with AutoBlogr."
              : "Sign in to your AutoBlogr account."}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={submitting}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            {error && (
              <p
                role="alert"
                className="text-sm font-medium text-destructive"
              >
                {error}
              </p>
            )}
            {info && (
              <p className="text-sm font-medium text-emerald-700">{info}</p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignUp ? "Sign up" : "Sign in"}
            </Button>
            <button
              type="button"
              onClick={toggleMode}
              disabled={submitting}
              className="text-sm text-gray-600 hover:text-emerald-600 transition-colors disabled:opacity-50"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Need an account? Sign up"}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
