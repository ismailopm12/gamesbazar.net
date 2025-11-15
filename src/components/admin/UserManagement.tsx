import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Shield, ShieldOff } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

const UserManagement = () => {
  const [users, setUsers] = useState<(Tables<'profiles'> & { user_roles: { role: string }[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles(role)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentRoles: { role: string }[]) => {
    try {
      const isAdmin = currentRoles.some((r) => r.role === "admin");

      if (isAdmin) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Admin role ${isAdmin ? "removed" : "granted"}`,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Email</TableHead>
                <TableHead className="whitespace-nowrap">Name</TableHead>
                <TableHead className="whitespace-nowrap">Phone</TableHead>
                <TableHead className="whitespace-nowrap">Balance</TableHead>
                <TableHead className="whitespace-nowrap">Roles</TableHead>
                <TableHead className="whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="max-w-[150px] truncate">{user.email}</TableCell>
                  <TableCell className="max-w-[120px] truncate">{user.full_name || "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{user.phone || "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">৳{user.balance}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.user_roles.map((role, idx: number) => (
                        <Badge key={idx} variant={role.role === "admin" ? "default" : "secondary"}>
                          {role.role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAdmin(user.id, user.user_roles)}
                      className="whitespace-nowrap"
                    >
                      {user.user_roles.some((r) => r.role === "admin") ? (
                        <>
                          <ShieldOff className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Remove Admin</span>
                          <span className="sm:hidden">Remove</span>
                        </>
                      ) : (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Make Admin</span>
                          <span className="sm:hidden">Make</span>
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;