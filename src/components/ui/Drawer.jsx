import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, title, children }) {
  const overlayRef = useRef(null);
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        ref={overlayRef}
        onClick={handleOverlayClick}
        className={`fixed top-11 inset-0 bg-black/40 backdrop-blur-sm z-[90] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-11 right-0 h-[calc(100vh-44px)] w-full max-w-[500px] bg-surface shadow-[0_0_40px_rgba(0,0,0,0.1)] z-[100] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col border-l border-border ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface relative overflow-hidden">
          {/* Subtle gradient highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 to-primary/10" />
          
          <h2 className="text-[15px] font-bold text-text-primary tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-surface2 rounded-md text-text-tertiary hover:text-text-primary transition-colors cursor-pointer group"
          >
            <X className="size-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-base relative">
          {children}
        </div>
      </div>
    </>
  );
}
