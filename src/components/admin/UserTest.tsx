import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  balance: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string | null;
}

const UserTest = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (profileError) {
          console.error("Profile error:", profileError);
          toast({
            title: "Profile Error",
            description: profileError.message,
            variant: "destructive",
          });
        } else {
          setProfile(profileData);
        }
        
        // Fetch roles
        const { data: rolesData, error: rolesError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", session.user.id);
        
        if (rolesError) {
          console.error("Roles error:", rolesError);
          toast({
            title: "Roles Error",
            description: rolesError.message,
            variant: "destructive",
          });
        } else {
          setRoles(rolesData);
        }
      }
    } catch (error) {
      console.error("User data fetch error:", error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const createProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "",
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Profile created successfully",
      });
      
      fetchUserData();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const grantAdmin = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: "admin",
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Admin role granted successfully",
      });
      
      fetchUserData();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">Auth User:</h3>
          <pre className="text-xs bg-muted p-2 rounded">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="font-semibold">Profile:</h3>
          {profile ? (
            <pre className="text-xs bg-muted p-2 rounded">
              {JSON.stringify(profile, null, 2)}
            </pre>
          ) : (
            <p>No profile found</p>
          )}
          {!profile && user && (
            <Button onClick={createProfile} className="mt-2">
              Create Profile
            </Button>
          )}
        </div>
        
        <div>
          <h3 className="font-semibold">Roles:</h3>
          {roles ? (
            <pre className="text-xs bg-muted p-2 rounded">
              {JSON.stringify(roles, null, 2)}
            </pre>
          ) : (
            <p>No roles found</p>
          )}
          {profile && !roles?.length && (
            <Button onClick={grantAdmin} className="mt-2">
              Grant Admin Role
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserTest;