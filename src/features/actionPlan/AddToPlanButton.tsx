import { Button } from '@/components/ui/button';
import { Check, ListPlus } from 'lucide-react';
import { toast } from 'sonner';
import { ActionPriority, useActionPlan } from './useActionPlan';

interface AddToPlanButtonProps {
  domain: string;
  title: string;
  description: string;
  priority: ActionPriority;
  source: string;
}

export function AddToPlanButton({ domain, title, description, priority, source }: AddToPlanButtonProps) {
  const { addItem, hasItem } = useActionPlan();
  const added = hasItem(domain, title);

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={added}
      onClick={() => {
        const result = addItem({ domain, title, description, priority, source });
        if (result.added) toast.success('Added to action plan');
      }}
      className="border-primary/30 text-primary hover:bg-primary/10"
    >
      {added ? <Check className="w-3 h-3 mr-1" /> : <ListPlus className="w-3 h-3 mr-1" />}
      {added ? 'In action plan' : 'Add to action plan'}
    </Button>
  );
}
