import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SmartInput } from "@/components/optimized/SmartInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Gift, Loader2 } from "lucide-react";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Send to n8n webhook
      await fetch("https://digitalfrontierc0.app.n8n.cloud/webhook-test/39dfc70d-d91c-4685-bb48-cb74416196f9", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          lead_type: "newsletter",
          source: "newsletter_signup",
          timestamp: new Date().toISOString()
        }),
      });

      toast.success("Subscribed! Check your email for the free SEO checklist.");
      setEmail("");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Newsletter signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="content-card max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-full bg-primary/10">
            <Gift className="w-6 h-6 text-primary" />
          </div>
        </div>
        <CardTitle className="gradient-text">Get Your Free SEO Checklist</CardTitle>
        <p className="text-muted-foreground text-sm">
          Plus weekly AI optimization tips delivered to your inbox
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <SmartInput
            label="Email"
            name="newsletterEmail"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={setEmail}
            validationRules={{ email: true, required: true }}
            formName="newsletter"
            className="flex-1 bg-input border-border focus:border-primary"
            required
          />
          <Button 
            type="submit" 
            disabled={isLoading || !email}
            className="bg-primary hover:bg-primary/90"
            aria-label="Subscribe"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          No spam. Unsubscribe at any time.
        </p>
      </CardContent>
    </Card>
  );
};

export default NewsletterSignup;