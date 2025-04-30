
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Upgrade = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleUpgrade = async () => {
    setIsLoading(true);
    toast("Redirecting to checkout...");
    
    // In a real implementation, this would redirect to a Stripe checkout
    // For now, we'll just show a toast and redirect back to dashboard
    setTimeout(() => {
      toast.success("This is a demo - in production this would redirect to Stripe");
      setIsLoading(false);
      navigate('/dashboard');
    }, 2000);
  };

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "per month",
      description: "Basic AEO content generation",
      features: [
        "5 content generations per month",
        "Basic content elements",
        "HTML export",
        "Copy & paste implementation"
      ],
      cta: "Current Plan",
      highlighted: false,
      disabled: true
    },
    {
      name: "Premium",
      price: "$29",
      period: "per month",
      description: "Advanced AEO content generation",
      features: [
        "Unlimited content generations",
        "Advanced schema markup",
        "Priority generation queue",
        "Content performance analytics",
        "Custom export templates",
        "Email support"
      ],
      cta: "Upgrade to Premium",
      highlighted: true,
      disabled: false
    }
  ];

  return (
    <>
      <Header isAuthenticated={true} />
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Upgrade Your Plan</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`${plan.highlighted ? 'border-aeo-blue/30 ring-1 ring-aeo-blue/20' : ''}`}
              >
                <CardHeader>
                  {plan.highlighted && (
                    <div className="bg-aeo-blue text-white text-xs font-medium py-1 px-3 rounded-full inline-block mb-2">
                      Recommended
                    </div>
                  )}
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 ml-1">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-aeo-blue mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={plan.highlighted ? handleUpgrade : () => {}}
                    className={plan.highlighted ? "w-full bg-aeo-blue hover:bg-aeo-blue/90" : "w-full"}
                    variant={plan.highlighted ? "default" : "outline"}
                    disabled={plan.disabled || isLoading}
                  >
                    {isLoading && plan.highlighted ? "Processing..." : plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Need help choosing a plan? Contact our support team at support@frontieraeo.com</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upgrade;
