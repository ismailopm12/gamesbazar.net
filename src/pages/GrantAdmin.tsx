import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GrantAdmin = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const grantAdminRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Find user by email
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", email)
        .single();

      if (profileError || !profiles) {
        throw new Error("User not found with this email");
      }

      // Check if already admin
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", profiles.id)
        .eq("role", "admin")
        .maybeSingle();

      if (existingRole) {
        toast({
          title: "Already Admin",
          description: "This user already has admin privileges",
        });
        setIsLoading(false);
        return;
      }

      // Grant admin role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: profiles.id, role: "admin" });

      if (roleError) throw roleError;

      toast({
        title: "Success!",
        description: `Admin role granted to ${email}`,
      });
      
      setEmail("");
      setTimeout(() => navigate("/admin"), 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Grant Admin Access</CardTitle>
          </div>
          <CardDescription>
            Enter the email address of the user to grant admin privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={grantAdminRole} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Grant Admin Role
            </Button>
          </form>
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrantAdmin;
