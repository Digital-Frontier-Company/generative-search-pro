import { useState } from 'react';

const AnimatedGSPLogo = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="w-full max-w-md rounded-lg p-6 bg-gradient-to-br from-black/20 to-lime-400/5 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-lime-400/20 transform-gpu perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-10px) rotateX(5deg) rotateY(-5deg)' : 'translateY(0px)',
        boxShadow: isHovered 
          ? '0 25px 50px rgba(102, 255, 20, 0.3), 0 15px 30px rgba(0, 0, 0, 0.4), 0 5px 15px rgba(102, 255, 20, 0.2)'
          : '0 10px 25px rgba(102, 255, 20, 0.15), 0 5px 15px rgba(0, 0, 0, 0.2)',
        transformStyle: 'preserve-3d'
      }}
    >
      <div className="flex items-center justify-center space-x-4">
        {/* GSP Text */}
        <div className="flex space-x-1">
          <span 
            className={`text-6xl font-black font-orbitron text-lime-400 transition-all duration-500 transform-gpu ${
              isHovered ? 'animate-pulse scale-110' : ''
            }`}
            style={{ 
              textShadow: '0 0 20px #66FF14, 0 0 40px #66FF14, 0 8px 16px rgba(0, 0, 0, 0.5)',
              transform: isHovered ? 'translateZ(20px) rotateY(10deg)' : 'translateZ(10px)',
              transformStyle: 'preserve-3d'
            }}
          >
            G
          </span>
          <span 
            className={`text-6xl font-black font-orbitron text-lime-400 transition-all duration-500 transform-gpu ${
              isHovered ? 'animate-pulse scale-110' : ''
            }`}
            style={{ 
              textShadow: '0 0 20px #66FF14, 0 0 40px #66FF14, 0 8px 16px rgba(0, 0, 0, 0.5)',
              transform: isHovered ? 'translateZ(25px) rotateY(0deg)' : 'translateZ(15px)',
              transformStyle: 'preserve-3d',
              animationDelay: '200ms'
            }}
          >
            S
          </span>
          <span 
            className={`text-6xl font-black font-orbitron text-lime-400 transition-all duration-500 transform-gpu ${
              isHovered ? 'animate-pulse scale-110' : ''
            }`}
            style={{ 
              textShadow: '0 0 20px #66FF14, 0 0 40px #66FF14, 0 8px 16px rgba(0, 0, 0, 0.5)',
              transform: isHovered ? 'translateZ(20px) rotateY(-10deg)' : 'translateZ(10px)',
              transformStyle: 'preserve-3d',
              animationDelay: '400ms'
            }}
          >
            P
          </span>
        </div>

        {/* Animated Question Mark */}
        <div className="relative transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
          <div 
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center shadow-lg transition-all duration-300 transform-gpu ${
              isHovered ? 'rotate-12 scale-110' : 'hover:rotate-6'
            }`}
            style={{ 
              boxShadow: isHovered 
                ? '0 0 30px #66FF14, 0 15px 30px rgba(102, 255, 20, 0.4), 0 8px 20px rgba(0, 0, 0, 0.3)'
                : '0 0 20px #66FF14, 0 8px 15px rgba(102, 255, 20, 0.2), 0 4px 10px rgba(0, 0, 0, 0.2)',
              transform: isHovered ? 'translateZ(30px) rotateX(10deg)' : 'translateZ(20px)',
              transformStyle: 'preserve-3d'
            }}
          >
            <span 
              className={`text-3xl font-bold text-black transition-all duration-300 transform-gpu ${isHovered ? 'animate-spin' : ''}`}
              style={{ 
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                transform: 'translateZ(10px)',
                transformStyle: 'preserve-3d'
              }}
            >
              ?
            </span>
          </div>

          {/* Floating particles effect */}
          {isHovered && (
            <>
              <div className="absolute -top-2 -right-2 w-2 h-2 bg-lime-400 rounded-full animate-ping" />
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-lime-500 rounded-full animate-ping" />
              <div className="absolute top-1/2 -right-3 w-1 h-1 bg-lime-300 rounded-full animate-ping" />
            </>
          )}
        </div>
      </div>

      {/* Subtitle */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground/80 font-medium font-orbitron">
          Generative Search Pro
        </p>
        <p className="text-xs text-lime-400/70 mt-1 font-orbitron">
          Engine Optimization
        </p>
      </div>
    </div>
  );
};

export default AnimatedGSPLogo;