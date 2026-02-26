import React from 'react';

const Footer = React.memo(() => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer 
      className="fixed bottom-0 left-0 w-full h-16 z-50"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="flex h-full items-center justify-between px-6 text-white sm:px-12">
        <p className="text-sm sm:text-base">
          &copy; {currentYear} Quizzy. All rights reserved.
        </p>
        <p className="text-sm sm:text-base">
          # Team Vector.
        </p>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
