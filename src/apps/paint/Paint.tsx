import React from 'react';

/**
 * Paint is JS Paint (https://jspaint.app, MIT licensed by Isaiah Odhner), the same program
 * as the reference site, running live inside the window.
 */
export const Paint: React.FC = () => (
  <iframe
    title="Paint — JS Paint"
    src="https://jspaint.app/"
    allow="clipboard-read; clipboard-write; fullscreen"
    className="min-h-0 w-full flex-1 border-0 bg-[#c0c0c0]"
  />
);
