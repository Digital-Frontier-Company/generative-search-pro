
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SchemaValidationDetailsProps {
  schema: Record<string, any>;
  issues: string[] | null;
}

const SchemaValidationDetails = ({ schema, issues }: SchemaValidationDetailsProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopied(true);
    toast.success("Schema copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">JSON-LD Schema</h3>
          {schema && schema["@type"] && (
            <Badge variant="outline" className="text-xs">
              {schema["@type"]}
            </Badge>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
        </Button>
      </div>
      
      {/* Schema Issues */}
      {issues && issues.length > 0 && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
            Schema Recommendations
          </h4>
          <ul className="list-disc pl-5 text-sm text-yellow-700 dark:text-yellow-300">
            {issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs max-h-[400px] whitespace-pre-wrap">
        {JSON.stringify(schema, null, 2)}
      </pre>
    </div>
  );
};

export default SchemaValidationDetails;
