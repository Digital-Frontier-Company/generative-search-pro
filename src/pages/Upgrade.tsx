
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";

const Upgrade = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header isAuthenticated={true} />
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Welcome to AEO Content Generator</h1>
          
          <Card className="border-aeo-blue/30 ring-1 ring-aeo-blue/20">
            <CardHeader>
              <div className="bg-aeo-blue text-white text-xs font-medium py-1 px-3 rounded-full inline-block mb-2">
                Free for All Users
              </div>
              <CardTitle>Unlimited Content Generation</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">Free</span>
                <span className="text-gray-500 ml-1">forever</span>
              </div>
              <CardDescription>Advanced AEO content generation for all registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-aeo-blue mr-2 flex-shrink-0 mt-0.5" />
                  <span>Unlimited content generations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-aeo-blue mr-2 flex-shrink-0 mt-0.5" />
                  <span>Advanced schema markup</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-aeo-blue mr-2 flex-shrink-0 mt-0.5" />
                  <span>All content types (Blog, Article, FAQ)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-aeo-blue mr-2 flex-shrink-0 mt-0.5" />
                  <span>Custom export templates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-aeo-blue mr-2 flex-shrink-0 mt-0.5" />
                  <span>Content history and search</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-aeo-blue mr-2 flex-shrink-0 mt-0.5" />
                  <span>HTML and JSON export</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate('/generator')}
                className="w-full bg-aeo-blue hover:bg-aeo-blue/90"
              >
                Start Creating Content
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Start generating AEO-optimized content immediately after signing up!</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upgrade;
