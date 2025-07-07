import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Sparkles, ArrowRight } from "lucide-react";

interface LeadCaptureModalProps {
  triggerText?: string;
  title?: string;
  description?: string;
  type?: "trial" | "demo" | "newsletter";
}

const LeadCaptureModal = ({ 
  triggerText = "Start Free Trial", 
  title = "Start Your Free Trial",
  description = "Get instant access to all AI-powered SEO tools",
  type = "trial"
}: LeadCaptureModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    website: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Send to n8n webhook
      const webhookResponse = await fetch("https://digitalfrontierc0.app.n8n.cloud/webhook-test/39dfc70d-d91c-4685-bb48-cb74416196f9", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          website: formData.website,
          lead_type: type,
          source: "landing_page",
          timestamp: new Date().toISOString()
        }),
      });

      if (webhookResponse.ok) {
        toast.success("Success! Check your email for next steps.");
        setIsOpen(false);
        setFormData({ name: "", email: "", phone: "", company: "", website: "" });
      } else {
        throw new Error("Failed to submit");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Lead capture error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="glow-button">
          <Sparkles className="w-4 h-4 mr-2" />
          {triggerText}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="gradient-text">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="bg-input border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              className="bg-input border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="bg-input border-border focus:border-primary"
            />
          </div>
          {type !== "newsletter" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="bg-input border-border focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://example.com"
                  className="bg-input border-border focus:border-primary"
                />
              </div>
            </>
          )}
          <Button 
            type="submit" 
            className="w-full glow-button"
            disabled={isLoading || !formData.name || !formData.email}
          >
            {isLoading ? "Processing..." : `Get Started ${type === "demo" ? "- Book Demo" : ""}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;