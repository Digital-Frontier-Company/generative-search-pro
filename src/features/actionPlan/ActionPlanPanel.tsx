import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ClipboardList, Trash2 } from 'lucide-react';
import { ActionPriority, useActionPlan } from './useActionPlan';

const priorityClass: Record<ActionPriority, string> = {
  high: 'bg-destructive/20 text-destructive border-destructive/30',
  medium: 'bg-primary/20 text-primary border-primary/30',
  low: 'bg-muted text-muted-foreground border-border',
};

export function ActionPlanPanel({ domain }: { domain?: string }) {
  const { items, setStatus, removeItem, clearCompleted } = useActionPlan(domain);
  const done = items.filter((i) => i.status === 'done').length;
  const progress = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <Card className="content-card">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          Action Plan{domain ? ` — ${domain}` : ''}
        </CardTitle>
        {done > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCompleted}>
            Clear completed
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tracked actions yet. Add recommendations or content gaps to build your plan.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Progress value={progress} className="h-2 flex-1" />
              <span className="text-sm text-muted-foreground">
                {done}/{items.length} done
              </span>
            </div>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <Checkbox
                    checked={item.status === 'done'}
                    aria-label={`Mark "${item.title}" as done`}
                    onCheckedChange={(checked) => setStatus(item.id, checked ? 'done' : 'todo')}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`font-medium ${item.status === 'done' ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.title}
                      </span>
                      <Badge className={`text-xs ${priorityClass[item.priority]}`}>{item.priority}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.source}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove "${item.title}" from action plan`}
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
