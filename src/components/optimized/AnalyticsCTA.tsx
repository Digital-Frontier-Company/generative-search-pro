import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

interface CTAVariant {
  id: string;
  text: string;
  subtext?: string;
  urgency?: string;
  weight: number; // For A/B testing distribution
}

interface AnalyticsCTAProps {
  variants: CTAVariant[];
  location: string; // Where the CTA is placed (header, hero, pricing, etc.)
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  testId?: string; // For A/B testing identification
}

export const AnalyticsCTA: React.FC<AnalyticsCTAProps> = ({
  variants,
  location,
  onClick,
  className,
  size = 'default',
  variant = 'default',
  testId,
}) => {
  const { trackCTAClick, trackEvent } = useAnalytics();
  const [selectedVariant, setSelectedVariant] = useState<CTAVariant>(variants[0]);
  const [isLoaded, setIsLoaded] = useState(false);

  // A/B testing variant selection
  useEffect(() => {
    const selectVariant = () => {
      const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
      const random = Math.random() * totalWeight;
      let currentWeight = 0;
      
      for (const variant of variants) {
        currentWeight += variant.weight;
        if (random <= currentWeight) {
          setSelectedVariant(variant);
          break;
        }
      }
      setIsLoaded(true);
    };

    // Check if user has been assigned a variant for this test
    const storageKey = `cta_variant_${testId || location}`;
    const savedVariant = localStorage.getItem(storageKey);
    
    if (savedVariant) {
      const found = variants.find(v => v.id === savedVariant);
      if (found) {
        setSelectedVariant(found);
        setIsLoaded(true);
        return;
      }
    }

    selectVariant();
    localStorage.setItem(storageKey, selectedVariant.id);
  }, [variants, location, testId, selectedVariant.id]);

  // Track variant exposure
  useEffect(() => {
    if (isLoaded) {
      trackEvent('cta_variant_exposed', {
        variant_id: selectedVariant.id,
        location,
        test_id: testId,
      });
    }
  }, [isLoaded, selectedVariant.id, location, testId, trackEvent]);

  const handleClick = () => {
    trackCTAClick(selectedVariant.text, location, selectedVariant.id);
    
    trackEvent('cta_conversion', {
      variant_id: selectedVariant.id,
      location,
      test_id: testId,
    });

    onClick();
  };

  if (!isLoaded) {
    return (
      <Button 
        className={cn("glow-button", className)} 
        size={size}
        variant={variant}
        disabled
      >
        Loading...
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      <Button 
        onClick={handleClick}
        className={cn("glow-button font-semibold", className)}
        size={size}
        variant={variant}
      >
        {selectedVariant.text}
      </Button>
      
      {selectedVariant.subtext && (
        <p className="text-xs text-matrix-green/70 text-center max-w-xs">
          {selectedVariant.subtext}
        </p>
      )}
      
      {selectedVariant.urgency && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-matrix-lime rounded-full animate-pulse" />
          <span className="text-xs text-matrix-lime font-medium">
            {selectedVariant.urgency}
          </span>
        </div>
      )}
    </div>
  );
};

// Pre-defined CTA variants for common use cases
export const defaultCTAVariants = {
  header: [
    {
      id: 'control',
      text: 'Start Free Trial',
      weight: 50,
    },
    {
      id: 'urgency',
      text: 'Get Started Now',
      urgency: 'Limited Time: Free Setup',
      weight: 25,
    },
    {
      id: 'benefit',
      text: 'Boost AI Visibility',
      subtext: 'See results in 24 hours',
      weight: 25,
    },
  ],
  hero: [
    {
      id: 'control',
      text: 'Start Free AI Analysis',
      weight: 40,
    },
    {
      id: 'social_proof',
      text: 'Join 10,000+ Marketers',
      subtext: 'Start your free AI optimization',
      weight: 30,
    },
    {
      id: 'outcome_focused',
      text: 'Get Your AI Score',
      subtext: 'Free analysis in 60 seconds',
      weight: 30,
    },
  ],
  pricing: [
    {
      id: 'control',
      text: 'Choose Plan',
      weight: 50,
    },
    {
      id: 'trial_focus',
      text: 'Start Free Trial',
      subtext: 'Cancel anytime',
      weight: 30,
    },
    {
      id: 'risk_free',
      text: 'Try Risk-Free',
      urgency: '30-day money back guarantee',
      weight: 20,
    },
  ],
};