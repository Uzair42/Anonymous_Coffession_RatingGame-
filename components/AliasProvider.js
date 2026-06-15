"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Shield, EyeOff, Lock, ArrowRight, MessageSquare, Star, BarChart3, AlertCircle, Trophy, Gamepad2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

// Rotating farewell-themed Urdu quotes
const urduQuotes = [
  {
    text: "یہ ہمارا آخری مشترکہ کھیل ہے — ہنسو، بولو، اور یادیں بناؤ",
    translation: "This is our last game together — laugh, speak, and make memories"
  },
  {
    text: "چار سال کا ساتھ ختم ہونے سے پہلے — اپنا حصہ ڈالو، اپنی بات کہو",
    translation: "Before four years of togetherness ends — play your part, say your piece"
  },
  {
    text: "الوداع کہنے سے پہلے، کچھ تو کہہ جاؤ — یہاں سب محفوظ ہے",
    translation: "Before saying goodbye, say something — everything here is safe"
  },
  {
    text: "کلاس کے ہر چہرے میں ایک یاد ہے — آج اسے لفظوں میں ڈھالو",
    translation: "In every face of the class is a memory — today, put it into words"
  },
  {
    text: "آخری کھیل میں سب کو اپنا حصہ ڈالنا ہے — بے خوف، بے نام، بس سچا",
    translation: "Everyone must play their part in the last game — fearless, nameless, just honest"
  },
];

export function AliasProvider({ children }) {
  const [alias, setAlias] = useState(null);
  const [inputName, setInputName] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const storedAlias = localStorage.getItem('aliasName');
    if (storedAlias) {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias: storedAlias })
      }).then(res => {
        if (res.ok) {
          setAlias(storedAlias);
        } else {
          localStorage.removeItem('aliasName');
          setAlias('');
          setStep(2);
          setSubmitError('Your player name was taken by another squad member. Pick a new one.');
        }
      }).catch(() => {
        setAlias(storedAlias);
      });
    } else {
      setAlias('');
    }
  }, []);

  // Rotate through Urdu quotes every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % urduQuotes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const name = inputName.trim();
    if (!name) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias: name })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('aliasName', name);
        setAlias(name);
        router.push('/class-ratings');
      } else {
        setSubmitError(data.error || 'Failed to join the game. Try again.');
      }
    } catch (err) {
      setSubmitError('Connection lost. Check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  if (pathname.startsWith('/admin') || pathname.startsWith('/unkown')) {
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
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-start overflow-y-auto py-12 px-4 sm:px-8"
          >
            {/* Ambient Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[#c0ff00] opacity-5 blur-[120px] rounded-full animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[#ff3300] opacity-5 blur-[120px] rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-amber-400 opacity-[0.03] blur-[100px] rounded-full"></div>
            </div>

            <motion.div
              layout
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-6 gap-4 p-2 relative z-10 my-auto"
            >
              {/* ── HERO HEADER CELL ── */}
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="glass-card p-6 sm:p-10 border border-white/10 relative overflow-hidden flex flex-col items-center justify-center col-span-1 md:col-span-6"
              >
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#c0ff00]/10 blur-xl rounded-full"></div>

                <motion.div
                  layout
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-[#c0ff00]/50 flex items-center justify-center mb-4"
                >
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-[#c0ff00]" />
                </motion.div>

                {/* Live Game Status Badge */}
                <div className="bg-[#c0ff00]/10 border border-[#c0ff00]/30 rounded-full px-3 py-1 flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#c0ff00] animate-pulse"></span>
                  <span className="text-[10px] sm:text-xs font-black uppercase text-[#c0ff00] tracking-widest">🎮 FINAL ROUND — IT BATCH 2024</span>
                </div>

                <motion.h2 layout className="text-3xl sm:text-4xl md:text-5xl font-black text-white text-center uppercase tracking-tighter mb-2 leading-tight flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
                  <span>IT Batch</span>{' '}
                  <span className="bg-[#c0ff00] text-black px-2 sm:px-3 rounded-lg whitespace-nowrap">Farewell Game</span>
                </motion.h2>

                <motion.p layout className="text-gray-400 font-bold text-xs sm:text-sm tracking-wide text-center max-w-xl mt-2 leading-relaxed">
                  The last game of the last semester — played with the whole class, anonymously. Rate friends, drop confessions, share polls, and leave your mark forever. No one knows who you are. 🎓
                </motion.p>

                {/* ── ROTATING URDU QUOTE STRIP ── */}
                <div className="w-full mt-6 border-t border-white/10 pt-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuoteIndex}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="flex flex-col items-center gap-2"
                    >
                      <p
                        className="text-xl sm:text-2xl md:text-3xl text-center leading-loose text-[#ffd580]"
                        style={{
                          fontFamily: "'Noto Nastaliq Urdu', serif",
                          direction: 'rtl',
                          lineHeight: '2.2',
                          textShadow: '0 0 30px rgba(255,213,128,0.25)'
                        }}
                      >
                        {urduQuotes[currentQuoteIndex].text}
                      </p>
                      <p className="text-[11px] sm:text-xs text-gray-500 italic font-sans text-center max-w-lg leading-relaxed">
                        {urduQuotes[currentQuoteIndex].translation}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Dot indicators */}
                  <div className="flex justify-center gap-1.5 mt-4">
                    {urduQuotes.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentQuoteIndex(i)}
                        className={`rounded-full transition-all cursor-pointer ${
                          i === currentQuoteIndex
                            ? 'w-5 h-1.5 bg-[#ffd580]'
                            : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              <AnimatePresence mode="popLayout">
                {step === 1 && (
                  <>
                    {/* ── CARD 1: Play Safe / Privacy ── */}
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="glass-card p-6 border border-white/10 col-span-1 md:col-span-3 space-y-3 flex flex-col justify-between hover:border-[#c0ff00]/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <EyeOff className="w-5 h-5 text-[#c0ff00]" />
                      </div>
                      <div>
                        <h4 className="text-white font-black uppercase text-sm tracking-wide mb-1">🕵️ Play Safe — No One Knows You</h4>
                        <p className="text-gray-400 font-sans text-xs leading-relaxed mb-3">
                          This is a judgment-free zone. No emails, no profiles, no sign-ups. Your real name never enters the game. Play however you feel — completely invisible to your classmates.
                        </p>
                        <p
                          className="text-[#ffd580]/80 text-sm leading-loose text-right border-t border-white/5 pt-3"
                          style={{ fontFamily: "'Noto Nastaliq Urdu', serif", direction: 'rtl', lineHeight: '2' }}
                        >
                          کوئی نہیں جانے گا تم کون ہو — نہ نام، نہ چہرہ، نہ آواز
                        </p>
                        <p className="text-[9px] text-gray-600 italic text-right font-sans">
                          No one will know who you are — no name, no face, no voice
                        </p>
                      </div>
                    </motion.div>

                    {/* ── CARD 2: Safe to Speak ── */}
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      transition={{ duration: 0.2, delay: 0.05 }}
                      className="glass-card p-6 border border-white/10 col-span-1 md:col-span-3 space-y-3 flex flex-col justify-between hover:border-[#c0ff00]/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-[#c0ff00]" />
                      </div>
                      <div>
                        <h4 className="text-white font-black uppercase text-sm tracking-wide mb-1">🔐 What You Say, Stays Here</h4>
                        <p className="text-gray-400 font-sans text-xs leading-relaxed mb-3">
                          Your confessions, votes, and reviews are completely disconnected from your identity. Everything you write is protected — no one in class can trace it back to you.
                        </p>
                        <p
                          className="text-[#ffd580]/80 text-sm leading-loose text-right border-t border-white/5 pt-3"
                          style={{ fontFamily: "'Noto Nastaliq Urdu', serif", direction: 'rtl', lineHeight: '2' }}
                        >
                          دل کی بات صرف تمہاری — باہر کوئی نہیں جھانکتا
                        </p>
                        <p className="text-[9px] text-gray-600 italic text-right font-sans">
                          Your heart's words belong only to you — no one peeks outside
                        </p>
                      </div>
                    </motion.div>

                    {/* ── CARD 3: Farewell Confessions ── */}
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className="glass-card p-6 border border-white/10 col-span-1 md:col-span-3 space-y-3 flex flex-col justify-between hover:border-[#c0ff00]/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-[#c0ff00]" />
                      </div>
                      <div>
                        <h4 className="text-white font-black uppercase text-sm tracking-wide mb-1">💬 Drop a Farewell Confession</h4>
                        <p className="text-gray-400 font-sans text-xs leading-relaxed mb-3">
                          That thing you always wanted to say to someone — a thank you, an apology, a shoutout, or just a funny memory. Drop it on the board. The whole class will see it. You won't.
                        </p>
                        <p
                          className="text-[#ffd580]/80 text-sm leading-loose text-right border-t border-white/5 pt-3"
                          style={{ fontFamily: "'Noto Nastaliq Urdu', serif", direction: 'rtl', lineHeight: '2' }}
                        >
                          وہ بات جو تم نے کبھی کہنی چاہی مگر ہمت نہ ہوئی — آج کہہ دو
                        </p>
                        <p className="text-[9px] text-gray-600 italic text-right font-sans">
                          The words you always wanted to say but never had the courage — say them today
                        </p>
                      </div>
                    </motion.div>

                    {/* ── CARD 4: Rate Your Squad ── */}
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      transition={{ duration: 0.2, delay: 0.15 }}
                      className="glass-card p-6 border border-white/10 col-span-1 md:col-span-3 space-y-3 flex flex-col justify-between hover:border-[#c0ff00]/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <Star className="w-5 h-5 text-[#c0ff00]" />
                      </div>
                      <div>
                        <h4 className="text-white font-black uppercase text-sm tracking-wide mb-1">⭐ Rate Your Classmates — Respectfully</h4>
                        <p className="text-gray-400 font-sans text-xs leading-relaxed mb-3">
                          Give your classmates an honest, anonymous star rating. Share what you genuinely appreciate about them. Vote in class polls. Be kind — this is the final score that stays.
                        </p>
                        <p
                          className="text-[#ffd580]/80 text-sm leading-loose text-right border-t border-white/5 pt-3"
                          style={{ fontFamily: "'Noto Nastaliq Urdu', serif", direction: 'rtl', lineHeight: '2' }}
                        >
                          کوئی ہے جس کی محنت، مسکراہٹ یا اچھائی دل میں ہے؟ عزت سے بتاؤ
                        </p>
                        <p className="text-[9px] text-gray-600 italic text-right font-sans">
                          Is there someone whose effort, smile, or goodness is in your heart? Say it respectfully
                        </p>
                      </div>
                    </motion.div>

                    {/* ── JOIN GAME BUTTON ── */}
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: 0.2 }}
                      className="col-span-1 md:col-span-6"
                    >
                      <button
                        onClick={() => setStep(2)}
                        className="w-full bg-[#c0ff00] text-black font-black uppercase tracking-wider py-5 rounded-3xl hover:bg-white transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_30px_rgba(192,255,0,0.15)] active:scale-[0.98]"
                      >
                        🎮 JOIN THE FAREWELL GAME
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <p className="text-center text-[10px] text-gray-600 mt-2 font-sans uppercase tracking-widest">
                        Free to play · No sign-up · 100% anonymous · Your identity is never revealed
                      </p>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <AnimatePresence mode="popLayout">
                {step === 2 && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="col-span-1 md:col-span-6 glass-card p-8 md:p-12 border border-[#c0ff00]/30 shadow-[0_0_45px_rgba(192,255,0,0.1)] relative overflow-hidden"
                  >
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-[#c0ff00]/50 flex items-center justify-center animate-pulse">
                        <Gamepad2 className="w-8 h-8 text-[#c0ff00]" />
                      </div>
                    </div>

                    <h2 className="text-3xl font-black text-[#c0ff00] text-center uppercase tracking-tighter mb-2">
                      Pick Your Player Name
                    </h2>

                    {/* Urdu on name-pick step */}
                    <p
                      className="text-[#ffd580]/90 text-lg sm:text-xl text-center leading-loose mb-2"
                      style={{ fontFamily: "'Noto Nastaliq Urdu', serif", direction: 'rtl', lineHeight: '2.2' }}
                    >
                      بے خوف ہو جاؤ — یہاں تمہاری پہچان کوئی نہیں جانتا
                    </p>
                    <p className="text-gray-600 text-center text-[10px] italic font-sans mb-4">
                      Be fearless — no one here knows your identity
                    </p>

                    <p className="text-gray-300 text-center text-sm font-sans mb-8 max-w-md mx-auto leading-relaxed">
                      Choose <span className="text-[#c0ff00] font-bold">any player name</span> — a nickname, a funny alias, a code name, or even an emoji. 
                      No real names, no registration, no tracking. Your classmates will only ever see this name.
                    </p>

                    <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-md mx-auto">
                      <input
                        required
                        disabled={isSubmitting}
                        placeholder="e.g. Shadow, Panda, IT-Legend 👾"
                        value={inputName}
                        onChange={e => setInputName(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-white text-center font-bold focus:outline-none focus:border-[#c0ff00] transition-colors"
                      />

                      {submitError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-[#ff3300]/15 border border-[#ff3300]/30 rounded-2xl p-3 text-[#ff3300] font-bold text-xs uppercase flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{submitError}</span>
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#c0ff00] text-black font-black uppercase py-4 rounded-2xl hover:bg-white transition-colors cursor-pointer shadow-[0_0_20px_rgba(192,255,0,0.1)] disabled:opacity-50"
                      >
                        {isSubmitting ? 'JOINING GAME...' : '🎮 START PLAYING'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs text-gray-500 font-bold uppercase hover:text-white transition-colors text-center mt-2 cursor-pointer"
                      >
                        &larr; Back to Game Info
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
