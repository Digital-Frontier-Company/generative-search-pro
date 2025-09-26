import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/global/Header";
import Breadcrumbs from "@/components/global/Breadcrumbs";
import { 
  FileText, 
  Layers, 
  Bot, 
  Download, 
  Share2, 
  TrendingUp, 
  AlertCircle, 
  Check, 
  Bookmark,
  BarChart3,
  Eye,
  Target
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SchemaAnalysisData {
  id: number;
  url: string;
  ai_visibility_score: number;
  existing_schema: any;
  suggested_patches: any;
  status: string;
  created_at: string;
  updated_at: string;
}

const SchemaAnalysis = () => {
  return <Navigate to="/seo-analysis?tab=core-analysis&sub=schema" replace />;
};

export default SchemaAnalysis;
