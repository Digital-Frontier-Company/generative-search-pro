import { useState, useEffect } from 'react';
import { removeBackground, loadImage } from '../utils/backgroundRemoval';

const HeroLogo = () => {
  const [processedLogoUrl, setProcessedLogoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processLogo = async () => {
      setIsProcessing(true);
      try {
        // Fetch the original logo
        const response = await fetch('/lovable-uploads/931d267a-b24c-481f-955b-8c230a3a2d4b.png');
        const blob = await response.blob();
        
        // Load as image element
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        // Create URL for the processed image
        const processedUrl = URL.createObjectURL(processedBlob);
        setProcessedLogoUrl(processedUrl);
      } catch (error) {
        console.error('Error processing logo:', error);
        // Fallback to original image
        setProcessedLogoUrl('/lovable-uploads/931d267a-b24c-481f-955b-8c230a3a2d4b.png');
      } finally {
        setIsProcessing(false);
      }
    };

    processLogo();

    // Cleanup function to revoke URL
    return () => {
      if (processedLogoUrl) {
        URL.revokeObjectURL(processedLogoUrl);
      }
    };
  }, []);

  if (isProcessing) {
    return (
      <div className="w-full max-w-md border-2 border-primary/20 rounded-lg p-6 bg-card/50 animate-pulse">
        <div className="h-32 bg-primary/10 rounded"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md border-2 border-primary/20 rounded-lg p-6 bg-card/50 backdrop-blur-sm">
      {processedLogoUrl ? (
        <img 
          src={processedLogoUrl} 
          alt="Generative Search Pro Logo" 
          className="w-full h-auto object-contain"
        />
      ) : (
        <div className="h-32 bg-primary/10 rounded flex items-center justify-center">
          <span className="text-muted-foreground">Loading logo...</span>
        </div>
      )}
    </div>
  );
};

export default HeroLogo;