"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Home, PenLine, Star, BarChart2, Award } from 'lucide-react';

const links = [
  { href: '/', label: 'Feed', icon: Home },
  { href: '/submit', label: 'Submit', icon: PenLine },
  { href: '/rate', label: 'Rate', icon: Star },
  { href: '/class-ratings', label: 'Batch 7★', icon: Award },
  { href: '/polls', label: 'Polls', icon: BarChart2 },
];

export default function Navbar() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) return null;

  return (
    <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-[480px]">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between bg-black/40 backdrop-blur-3xl border border-white/10 p-2 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
      >
        {links.map(link => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="relative flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-16 rounded-full transition-all group">
              {isActive && (
                <motion.div 
                  layoutId="dock-indicator"
                  className="absolute inset-0 bg-white/10 rounded-full border border-white/5"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className="relative z-10 flex flex-col items-center"
              >
                <Icon className={`w-6 h-6 mb-1 transition-all duration-300 ${isActive ? 'text-[#c0ff00] scale-110 drop-shadow-[0_0_8px_rgba(192,255,0,0.8)]' : 'text-gray-400 group-hover:text-white group-hover:scale-110'}`} />
                <span className={`text-[9px] md:text-[10px] font-black transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {link.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </motion.nav>
    </div>
  );
}
