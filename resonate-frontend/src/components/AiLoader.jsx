import React from 'react';
import PropTypes from 'prop-types'; 

const AiLoader = ({ label = "Analyzing..." }) => {
  return (
    <>
      <style>
        {`
          @keyframes spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          .animate-spin-slow-reverse {
            animation: spin-reverse 3s linear infinite;
          }
        `}
      </style>

      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="relative h-20 w-20">
          <div className="animate-spin-slow-reverse absolute h-full w-full rounded-full border-4 border-dashed border-primary/30"></div>
          <div className="animate-spin absolute h-full w-full rounded-full border-t-4 border-b-4 border-accent"></div>
        </div>
        <p className="text-lg font-medium text-muted-foreground animate-pulse tracking-wide">
          {label}
        </p>
      </div>
    </>
  );
};

AiLoader.propTypes = {
  label: PropTypes.string,
};

export default AiLoader;