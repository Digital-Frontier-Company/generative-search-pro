import React from "react";

const SkipLink: React.FC = () => (
  <a
    href="#main-content"
    className="absolute left-4 top-4 z-50 -translate-y-full focus:translate-y-0 bg-primary text-primary-foreground px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary transition-transform"
  >
    Skip to main content
  </a>
);

export default SkipLink; 