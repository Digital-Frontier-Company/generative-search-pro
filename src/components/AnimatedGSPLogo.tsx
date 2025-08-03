import { useState } from 'react';

const AnimatedGSPLogo = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="w-full max-w-md border-2 border-primary/20 rounded-lg p-6 bg-gradient-to-br from-blue-600/10 to-lime-400/10 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-center space-x-4">
        {/* GSP Text */}
        <div className="flex space-x-1">
          <span 
            className={`text-6xl font-bold bg-gradient-to-r from-blue-600 to-lime-400 bg-clip-text text-transparent transition-all duration-500 ${
              isHovered ? 'animate-pulse scale-110' : ''
            }`}
            style={{ 
              textShadow: '0 0 20px rgba(102, 255, 20, 0.3)'
            }}
          >
            G
          </span>
          <span 
            className={`text-6xl font-bold bg-gradient-to-r from-blue-600 to-lime-400 bg-clip-text text-transparent transition-all duration-500 ${
              isHovered ? 'animate-pulse scale-110' : ''
            }`}
            style={{ 
              textShadow: '0 0 20px rgba(102, 255, 20, 0.3)'
            }}
          >
            S
          </span>
          <span 
            className={`text-6xl font-bold bg-gradient-to-r from-blue-600 to-lime-400 bg-clip-text text-transparent transition-all duration-500 ${
              isHovered ? 'animate-pulse scale-110' : ''
            }`}
            style={{ 
              textShadow: '0 0 20px rgba(102, 255, 20, 0.3)'
            }}
          >
            P
          </span>
        </div>

        {/* Animated Question Mark */}
        <div className="relative">
          <div 
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-lime-400 to-blue-600 flex items-center justify-center shadow-lg transition-all duration-300 ${
              isHovered ? 'rotate-12 scale-110' : 'hover:rotate-6'
            }`}
            style={{ 
              boxShadow: '0 0 30px rgba(102, 255, 20, 0.4)'
            }}
          >
            <span 
              className={`text-3xl font-bold text-white ${isHovered ? 'animate-spin' : ''}`}
              style={{ 
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            >
              ?
            </span>
          </div>

          {/* Floating particles effect */}
          {isHovered && (
            <>
              <div className="absolute -top-2 -right-2 w-2 h-2 bg-lime-400 rounded-full animate-ping" />
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              <div className="absolute top-1/2 -right-3 w-1 h-1 bg-lime-300 rounded-full animate-ping" />
            </>
          )}
        </div>
      </div>

      {/* Subtitle */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground/80 font-medium">
          Generative Search Pro
        </p>
        <p className="text-xs text-lime-400/70 mt-1">
          Engine Optimization
        </p>
      </div>
    </div>
  );
};

export default AnimatedGSPLogo;