import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface DomainContextType {
  defaultDomain: string | null;
  setDefaultDomain: (domain: string | null) => Promise<void>;
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

export const DomainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [defaultDomain, setDefaultDomainState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load default domain from user profile
  useEffect(() => {
    const loadDefaultDomain = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('default_domain')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading default domain:', error);
        } else if (data?.default_domain) {
          setDefaultDomainState(data.default_domain);
        }
      } catch (error) {
        console.error('Error loading default domain:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDefaultDomain();
  }, [user]);

  const setDefaultDomain = async (domain: string | null) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          default_domain: domain,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving default domain:', error);
        throw error;
      }

      setDefaultDomainState(domain);
    } catch (error) {
      console.error('Error updating default domain:', error);
      throw error;
    }
  };

  return (
    <DomainContext.Provider value={{ defaultDomain, setDefaultDomain, isLoading }}>
      {children}
    </DomainContext.Provider>
  );
};