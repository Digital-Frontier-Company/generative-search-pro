import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Analytics configuration
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with actual GA4 ID

export const useAnalytics = () => {
  useEffect(() => {
    // Load Google Analytics 4
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Event tracking functions
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        timestamp: Date.now(),
      });
    }
  };

  const trackConversion = (conversionType: 'signup' | 'trial_start' | 'subscription' | 'form_submit', value?: number) => {
    trackEvent('conversion', {
      conversion_type: conversionType,
      value: value || 0,
      currency: 'USD',
    });
  };

  const trackCTAClick = (ctaText: string, location: string, variant?: string) => {
    trackEvent('cta_click', {
      cta_text: ctaText,
      cta_location: location,
      cta_variant: variant,
    });
  };

  const trackFormInteraction = (formName: string, action: 'start' | 'complete' | 'abandon' | 'error', field?: string) => {
    trackEvent('form_interaction', {
      form_name: formName,
      form_action: action,
      form_field: field,
    });
  };

  const trackPageView = (pageName: string, pageCategory?: string) => {
    if (window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_title: pageName,
        page_location: window.location.href,
        page_category: pageCategory,
      });
    }
  };

  return {
    trackEvent,
    trackConversion,
    trackCTAClick,
    trackFormInteraction,
    trackPageView,
  };
};