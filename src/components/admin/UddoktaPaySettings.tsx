import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const UddoktaPaySettings = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [useSandbox, setUseSandbox] = useState(true);

  const sandboxUrl = "https://gamesbazarnet.paymently.io/api/checkout";
  const productionUrl = "https://gamesbazarnet.paymently.io/api/checkout";
  const baseUrl = "https://gamesbazarnet.paymently.io";
  const verifyUrl = `${baseUrl}/api/verify-payment`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Uddokta Pay API Settings</h2>
        <p className="text-muted-foreground">
          Configure API credentials, tokens and permissions
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          To update your Uddokta Pay API key, please configure the <strong>UDDOKTA_API_KEY</strong> secret in your Lovable Cloud backend settings.
          The API URL is automatically configured based on the environment.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">API Access Credentials</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Manage your API keys and endpoints for integration
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Uddokta Pay API key for reference"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => copyToClipboard(apiKey, "API Key")}
                disabled={!apiKey}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your secret API key for authentication (for reference only, configure in backend)
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Available API endpoints for your integration
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Base URL</Label>
            <div className="flex gap-2">
              <Input value={baseUrl} readOnly />
              <Button
                type="button"
                variant="outline"
                onClick={() => copyToClipboard(baseUrl, "Base URL")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Root API endpoint</p>
          </div>

          <div className="space-y-2">
            <Label>API Checkout Endpoint</Label>
            <div className="flex gap-2">
              <Input value={productionUrl} readOnly />
              <Button
                type="button"
                variant="outline"
                onClick={() => copyToClipboard(productionUrl, "API Checkout Endpoint")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enhanced checkout with more features
            </p>
          </div>

          <div className="space-y-2">
            <Label>Verify Payment Endpoint</Label>
            <div className="flex gap-2">
              <Input value={verifyUrl} readOnly />
              <Button
                type="button"
                variant="outline"
                onClick={() => copyToClipboard(verifyUrl, "Verify Payment Endpoint")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this to verify payment status
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
