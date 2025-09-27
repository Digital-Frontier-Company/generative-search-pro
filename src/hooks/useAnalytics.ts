import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Analytics configuration - optional environment variables
// Note: These are optional and the app will work without them
const GA_MEASUREMENT_ID = undefined; // Disabled to prevent build issues
const CLARITY_ID = undefined; // Disabled to prevent build issues

export const useAnalytics = () => {
  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(gaScript);

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
    }

    // Load Microsoft Clarity heatmap if ID provided
    if (CLARITY_ID) {
      const clarityScript = document.createElement('script');
      clarityScript.type = 'text/javascript';
      clarityScript.async = true;
      clarityScript.innerHTML = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_ID}");
      `;
      document.head.appendChild(clarityScript);
    }
    return () => {
      // cleanup is optional; scripts persist
    };
  }, []);

  // Event tracking functions
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (GA_MEASUREMENT_ID && window.gtag) {
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
    if (GA_MEASUREMENT_ID && window.gtag) {
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