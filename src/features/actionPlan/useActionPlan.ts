import { useCallback, useEffect, useState } from 'react';

export type ActionPriority = 'high' | 'medium' | 'low';
export type ActionStatus = 'todo' | 'in_progress' | 'done';

export interface ActionItem {
  id: string;
  domain: string;
  title: string;
  description: string;
  priority: ActionPriority;
  source: string;
  status: ActionStatus;
  createdAt: string;
}

const STORAGE_KEY = 'gs.actionPlan.v1';

const read = (): ActionItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as ActionItem[]) : [];
  } catch {
    return [];
  }
};

const write = (items: ActionItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('action-plan-changed'));
};

const makeId = (domain: string, title: string) =>
  `${domain.toLowerCase()}::${title.toLowerCase().replace(/\s+/g, '-')}`;

export function useActionPlan(domain?: string) {
  const [items, setItems] = useState<ActionItem[]>([]);

  const refresh = useCallback(() => setItems(read()), []);

  useEffect(() => {
    refresh();
    window.addEventListener('action-plan-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('action-plan-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const scoped = domain
    ? items.filter((i) => i.domain.toLowerCase() === domain.toLowerCase())
    : items;

  const addItem = useCallback(
    (input: Omit<ActionItem, 'id' | 'status' | 'createdAt'>) => {
      const id = makeId(input.domain, input.title);
      const current = read();
      if (current.some((i) => i.id === id)) return { added: false, id };
      write([
        ...current,
        { ...input, id, status: 'todo' as ActionStatus, createdAt: new Date().toISOString() },
      ]);
      return { added: true, id };
    },
    []
  );

  const setStatus = useCallback((id: string, status: ActionStatus) => {
    write(read().map((i) => (i.id === id ? { ...i, status } : i)));
  }, []);

  const removeItem = useCallback((id: string) => {
    write(read().filter((i) => i.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    write(read().filter((i) => i.status !== 'done'));
  }, []);

  const hasItem = useCallback(
    (itemDomain: string, title: string) => items.some((i) => i.id === makeId(itemDomain, title)),
    [items]
  );

  return { items: scoped, allItems: items, addItem, setStatus, removeItem, clearCompleted, hasItem };
}
