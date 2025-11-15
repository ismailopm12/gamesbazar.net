import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const MoneyRequestManagement = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('money_requests_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'money_requests' },
        () => fetchRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("money_requests")
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
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

  const handleApprove = async (request: any) => {
    setProcessingId(request.id);
    try {
      // Update request status
      const { error: requestError } = await supabase
        .from("money_requests")
        .update({
          status: "approved",
          admin_note: adminNotes[request.id] || "",
          processed_at: new Date().toISOString()
        })
        .eq("id", request.id);

      if (requestError) throw requestError;

      // Update user balance directly
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", request.user_id)
        .single();

      const newBalance = (profile?.balance || 0) + parseFloat(request.amount);
      
      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", request.user_id);

      if (balanceError) {
        // If balance update fails, revert request status
        await supabase
          .from("money_requests")
          .update({ status: "pending", processed_at: null })
          .eq("id", request.id);
        throw balanceError;
      }

      toast({ title: "Request approved and balance updated" });
      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: any) => {
    if (!adminNotes[request.id]) {
      toast({
        title: "Note required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(request.id);
    try {
      const { error } = await supabase
        .from("money_requests")
        .update({
          status: "rejected",
          admin_note: adminNotes[request.id],
          processed_at: new Date().toISOString()
        })
        .eq("id", request.id);

      if (error) throw error;
      toast({ title: "Request rejected" });
      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/20 text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/20 text-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="glass-effect border-primary/20 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl gradient-text">Money Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No money requests</p>
            ) : (
              requests.map((request) => (
                <Card key={request.id} className="bg-muted/30">
                  <CardContent className="p-3 md:p-4">
                    <div className="space-y-3">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm md:text-base">
                              {request.profiles?.full_name || request.profiles?.email}
                            </h4>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            Amount: ৳{request.amount} • Method: {request.payment_method}
                          </p>
                          {request.transaction_id && (
                            <p className="text-xs text-muted-foreground">
                              Transaction ID: {request.transaction_id}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.created_at).toLocaleString()}
                          </p>
                          {request.admin_note && (
                            <p className="text-xs mt-2 p-2 bg-muted rounded">
                              <strong>Admin Note:</strong> {request.admin_note}
                            </p>
                          )}
                        </div>
                      </div>

                      {request.status === "pending" && (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Admin note (optional for approval, required for rejection)"
                            value={adminNotes[request.id] || ""}
                            onChange={(e) => setAdminNotes({ ...adminNotes, [request.id]: e.target.value })}
                            rows={2}
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request)}
                              disabled={processingId === request.id}
                              className="bg-gradient-success"
                            >
                              {processingId === request.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(request)}
                              disabled={processingId === request.id}
                            >
                              {processingId === request.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoneyRequestManagement;
