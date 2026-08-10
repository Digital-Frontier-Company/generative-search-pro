import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export const cleanDomain = (domain: string) =>
  domain
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase();

export const isValidDomain = (domain: string) =>
  /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(domain.trim());

interface DomainContextType {
  /** The domain every tool should currently operate on. */
  defaultDomain: string | null;
  /** The domain saved on the user's profile (the fallback). */
  savedDefaultDomain: string | null;
  /** All domains the user has added in this workspace. */
  domains: string[];
  /** Persist a new profile default (also makes it active). */
  setDefaultDomain: (domain: string | null) => Promise<void>;
  /** Switch the active domain for this session without changing the default. */
  setActiveDomain: (domain: string | null) => void;
  addDomain: (domain: string) => void;
  removeDomain: (domain: string) => void;
  isLoading: boolean;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

export const useDomain = () => {
  const context = useContext(DomainContext);
  if (!context) {
    throw new Error('useDomain must be used within a DomainProvider');
  }
  return context;
};

const storageKey = (userId?: string) => `gsp:domains:${userId ?? 'anon'}`;
const activeKey = (userId?: string) => `gsp:active-domain:${userId ?? 'anon'}`;

const readList = (userId?: string): string[] => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((d) => typeof d === 'string') : [];
  } catch {
    return [];
  }
};

export const DomainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedDefaultDomain, setSavedDefaultDomain] = useState<string | null>(null);
  const [activeDomain, setActiveDomainState] = useState<string | null>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setSavedDefaultDomain(null);
        setActiveDomainState(null);
        setDomains([]);
        setIsLoading(false);
        return;
      }

      const stored = readList(user.id);
      const storedActive = localStorage.getItem(activeKey(user.id));

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('default_domain')
          .eq('id', user.id)
          .maybeSingle();

        if (error) console.error('Error loading default domain:', error);

        const profileDomain = data?.default_domain ?? null;
        const merged = Array.from(
          new Set([...(profileDomain ? [profileDomain] : []), ...stored])
        );

        setSavedDefaultDomain(profileDomain);
        setDomains(merged);
        setActiveDomainState(
          storedActive && merged.includes(storedActive) ? storedActive : profileDomain
        );
      } catch (error) {
        console.error('Error loading default domain:', error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user?.id]);

  const persistList = useCallback(
    (next: string[]) => {
      setDomains(next);
      try {
        localStorage.setItem(storageKey(user?.id), JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
    },
    [user?.id]
  );

  const setActiveDomain = useCallback(
    (domain: string | null) => {
      setActiveDomainState(domain);
      try {
        if (domain) localStorage.setItem(activeKey(user?.id), domain);
        else localStorage.removeItem(activeKey(user?.id));
      } catch {
        /* storage unavailable */
      }
    },
    [user?.id]
  );

  const addDomain = useCallback(
    (domain: string) => {
      const cleaned = cleanDomain(domain);
      if (!cleaned) return;
      persistList(Array.from(new Set([...domains, cleaned])));
      setActiveDomain(cleaned);
    },
    [domains, persistList, setActiveDomain]
  );

  const removeDomain = useCallback(
    (domain: string) => {
      const next = domains.filter((d) => d !== domain);
      persistList(next);
      if (activeDomain === domain) setActiveDomain(next[0] ?? savedDefaultDomain ?? null);
    },
    [domains, activeDomain, persistList, setActiveDomain, savedDefaultDomain]
  );

  const setDefaultDomain = async (domain: string | null) => {
    if (!user) return;

    const cleaned = domain ? cleanDomain(domain) : null;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      default_domain: cleaned,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error saving default domain:', error);
      throw error;
    }

    setSavedDefaultDomain(cleaned);
    if (cleaned) {
      persistList(Array.from(new Set([...domains, cleaned])));
    }
    setActiveDomain(cleaned);
  };

  return (
    <DomainContext.Provider
      value={{
        defaultDomain: activeDomain ?? savedDefaultDomain,
        savedDefaultDomain,
        domains,
        setDefaultDomain,
        setActiveDomain,
        addDomain,
        removeDomain,
        isLoading,
      }}
    >
      {children}
    </DomainContext.Provider>
  );
};
