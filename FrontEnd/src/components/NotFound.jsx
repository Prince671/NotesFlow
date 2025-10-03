import { useState, useEffect } from 'react';
import './NotFound.css';

const NotFound = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generate random stars
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 50; i++) {
        newStars.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: Math.random() * 2 + 1,
          duration: Math.random() * 3 + 2,
          delay: Math.random() * 2
        });
      }
      setStars(newStars);
    };

    generateStars();

    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="notfound-container">
      {/* Animated Background Stars */}
      <div className="notfound-stars">
        {stars.map((star) => (
          <div
            key={star.id}
            className="notfound-star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="notfound-content">
        {/* Animated 404 with Parallax Effect */}
        <div 
          className="notfound-number"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
          }}
        >
          <span className="notfound-digit notfound-digit-1">4</span>
          <div className="notfound-digit notfound-digit-0">
            <svg viewBox="0 0 200 200" className="notfound-planet">
              <defs>
                <linearGradient id="planetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle 
                cx="100" 
                cy="100" 
                r="80" 
                fill="url(#planetGradient)"
                filter="url(#glow)"
                className="notfound-planet-sphere"
              />
              <ellipse 
                cx="100" 
                cy="100" 
                rx="120" 
                ry="30" 
                fill="none" 
                stroke="#764ba2" 
                strokeWidth="4"
                className="notfound-planet-ring"
              />
              <circle cx="70" cy="80" r="12" fill="#ffffff" opacity="0.3" />
              <circle cx="130" cy="110" r="8" fill="#ffffff" opacity="0.2" />
              <circle cx="90" cy="130" r="15" fill="#ffffff" opacity="0.25" />
            </svg>
          </div>
          <span className="notfound-digit notfound-digit-4">4</span>
        </div>

        {/* Floating Astronaut */}
        <div className="notfound-astronaut">
          <svg viewBox="0 0 200 250" className="notfound-astronaut-svg">
            <g className="notfound-astronaut-body">
              {/* Helmet */}
              <ellipse cx="100" cy="80" rx="45" ry="50" fill="#e0e7ff" opacity="0.9" />
              <ellipse cx="100" cy="75" rx="40" ry="35" fill="#4c1d95" opacity="0.1" />
              
              {/* Body */}
              <rect x="70" y="115" width="60" height="80" rx="10" fill="#f3f4f6" />
              <rect x="75" y="120" width="50" height="30" fill="#667eea" />
              
              {/* Arms */}
              <rect x="40" y="130" width="30" height="15" rx="7" fill="#f3f4f6" transform="rotate(-20 55 137)" />
              <rect x="130" y="130" width="30" height="15" rx="7" fill="#f3f4f6" transform="rotate(20 145 137)" />
              
              {/* Legs */}
              <rect x="75" y="195" width="18" height="40" rx="9" fill="#f3f4f6" />
              <rect x="107" y="195" width="18" height="40" rx="9" fill="#f3f4f6" />
              
              {/* Life support */}
              <circle cx="100" cy="155" r="8" fill="#667eea" />
              <line x1="95" y1="155" x2="85" y2="155" stroke="#764ba2" strokeWidth="2" />
              <line x1="105" y1="155" x2="115" y2="155" stroke="#764ba2" strokeWidth="2" />
            </g>
          </svg>
        </div>

        {/* Text Content */}
        <div className="notfound-text">
          <h1 className="notfound-title">Page Not Found</h1>
          <p className="notfound-description">
            Houston, we have a problem! The page you're looking for has drifted off into space.
          </p>
          <p className="notfound-subdescription">
            It seems you've ventured into uncharted territory.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="notfound-actions">
          <button className="notfound-btn notfound-btn-primary" onClick={handleGoHome}>
            <svg className="notfound-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9 22 9 12 15 12 15 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Return Home
          </button>
          <button className="notfound-btn notfound-btn-secondary" onClick={handleGoBack}>
            <svg className="notfound-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="19" y1="12" x2="5" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="12 19 5 12 12 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Go Back
          </button>
        </div>

        {/* Error Code */}
        <div className="notfound-error-code">
          ERROR CODE: 404_SPACE_ODYSSEY
        </div>
      </div>

      {/* Floating Particles */}
      <div className="notfound-particles">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="notfound-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NotFound;