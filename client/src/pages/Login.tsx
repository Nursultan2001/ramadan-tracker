import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const utils = trpc.useUtils();
  
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("Login successful!");
      // Invalidate auth query to refetch user data
      await utils.auth.me.invalidate();
      // Redirect to dashboard after successful login
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Login failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sacred-geometry-bg">
      <Card className="w-full max-w-md golden-border">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🌙</div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Log in to continue tracking your Ramadan activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loginMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loginMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full golden-glow"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Log In"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => setLocation("/forgot-password")}
                type="button"
              >
                Forgot Password?
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => setLocation("/register")}
                type="button"
              >
                Register here
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
