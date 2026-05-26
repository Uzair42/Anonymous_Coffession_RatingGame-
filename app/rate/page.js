"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, MessageSquare, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const getCleanDisplayName = (fullName) => {
  if (!fullName) return '';
  const parts = fullName.split(/\s+[SsDd]\/[Oo]\s+/);
  const name = parts[0].trim();
  const parent = parts[1] ? parts[1].trim() : '';
  if (name === 'Abdullah') {
    if (parent.toLowerCase().includes('asad')) return 'Abdullah (Asad)';
    if (parent.toLowerCase().includes('asif')) return 'Abdullah (Asif)';
  }
  if (name === 'Hammad Ali') {
    if (parent.toLowerCase().includes('amanat')) return 'Hammad Ali (Amanat)';
    if (parent.toLowerCase().includes('zulfiqar')) return 'Hammad Ali (Zulfiqar)';
  }
  return name;
};

export default function Rate() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTarget, setExpandedTarget] = useState(null);
  
  // Form state
  const [targetName, setTargetName] = useState('');
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });

  const fetchRatings = () => {
    fetch('/api/ratings')
      .then(res => res.json())
      .then(data => {
        setRatings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (score === 0) {
      setStatus({ type: 'error', msg: 'SELECT A STAR RATING.' });
      return;
    }

    setStatus({ type: 'loading', msg: 'SUBMITTING...' });
    
    const alias = localStorage.getItem('aliasName') || 'Ghost';
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetStudentName: targetName, score, alias, comment })
    });
    
    const data = await res.json();
    if (res.ok) {
      setStatus({ type: 'success', msg: 'RATING LOCKED.' });
      setTargetName('');
      setScore(0);
      setComment('');
      fetchRatings();
    } else {
      setStatus({ type: 'error', msg: data.error || 'ERROR.' });
    }
  };

  const toggleExpand = (targetId) => {
    if (expandedTarget === targetId) {
      setExpandedTarget(null);
    } else {
      setExpandedTarget(targetId);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-4 py-24 pb-36">
      <div className="mb-12 border-b border-white/10 pb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black uppercase text-white tracking-tighter mb-4"
        >
          Rate <span className="bg-[#ff3300] px-4 text-white rounded-xl shadow-[0_0_30px_rgba(255,51,0,0.4)]">Classmates</span>
        </motion.h1>
        <p className="text-xl font-bold text-gray-400 uppercase tracking-widest">
          Anonymous. Public. Brutal.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:w-1/3 w-full shrink-0"
        >
          <div className="glass-card p-8 border border-[#ff3300]/30 shadow-[0_0_30px_rgba(255,51,0,0.1)] lg:sticky lg:top-24">
            <h2 className="text-2xl font-black uppercase text-white mb-6">Drop a Rating</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-400 font-bold uppercase mb-2 text-sm tracking-widest">Target Name</label>
                <input 
                  type="text" 
                  required
                  value={targetName}
                  onChange={e => setTargetName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#ff3300] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 font-bold uppercase mb-2 text-sm tracking-widest">Score</label>
                <div className="flex gap-2 justify-between">
                  {[1, 2, 3, 4, 5].map(star => (
                    <motion.button 
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setScore(star)}
                      onMouseEnter={() => setHoverScore(star)}
                      onMouseLeave={() => setHoverScore(0)}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoverScore || score) 
                            ? 'fill-[#ff3300] text-[#ff3300]' 
                            : 'text-gray-600'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase mb-2 text-sm tracking-widest">Review / Comment (Optional)</label>
                <textarea 
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="e.g. Always helps with assignments, super friendly!"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#ff3300] transition-colors resize-none font-sans"
                />
              </div>
              
              <button 
                type="submit"
                disabled={status.type === 'loading'}
                className="w-full bg-[#ff3300] text-white hover:bg-white hover:text-black font-black py-4 rounded-xl uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(255,51,0,0.3)]"
              >
                {status.type === 'loading' ? 'TRANSMITTING...' : 'SUBMIT RATING'}
              </button>
              
              <AnimatePresence>
                {status.msg && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`text-center font-bold uppercase p-3 rounded-xl mt-4 ${
                      status.type === 'error' ? 'bg-[#ff3300]/20 text-[#ff3300] border border-[#ff3300]/50' : 'bg-[#c0ff00]/20 text-[#c0ff00] border border-[#c0ff00]/50'
                    }`}
                  >
                    {status.msg}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>
        </motion.div>

        {/* Results Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-2/3 w-full space-y-6"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-[#c0ff00]" />
              <h2 className="text-3xl font-black uppercase text-white tracking-widest">LEADERBOARD</h2>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <span className="text-sm font-bold text-gray-400">Top Rated targets</span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-16 h-16 border-4 border-[#ff3300]/30 border-t-[#ff3300] rounded-full animate-spin"></div>
            </div>
          ) : ratings.length === 0 ? (
            <div className="glass-card p-16 text-center border-dashed">
              <p className="text-2xl font-black uppercase text-gray-500">NO RATINGS DEPLOYED YET.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((r, i) => (
                <motion.div 
                  key={r._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card overflow-hidden group border-l-4 border-[#c0ff00] transition-colors"
                >
                  {/* Card Header (Click to toggle expansion) */}
                  <div 
                    onClick={() => toggleExpand(r._id)}
                    className="p-6 flex flex-col sm:flex-row items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-6 w-full sm:w-auto mb-4 sm:mb-0">
                      <span className="text-4xl font-black text-gray-700 w-12 text-center group-hover:text-white transition-colors">#{i + 1}</span>
                      <span className="text-2xl font-black uppercase text-white">{getCleanDisplayName(r._id)}</span>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 text-[#c0ff00]">
                          <span className="font-black text-4xl">{r.averageScore.toFixed(1)}</span>
                          <Star className="w-8 h-8 fill-current" />
                        </div>
                        <span className="font-bold text-xs text-gray-400 uppercase tracking-widest mt-1">
                          {r.count} VOTE{r.count !== 1 && 'S'}
                        </span>
                      </div>
                      <div className="text-gray-400 hover:text-white transition-colors pl-4 hidden sm:block">
                        {expandedTarget === r._id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                      </div>
                    </div>
                  </div>

                  {/* Play Store Rating Breakdown & Reviews Panel */}
                  <AnimatePresence>
                    {expandedTarget === r._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/10 bg-black/40 p-6 md:p-8"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                          {/* Column 1: Rating breakdown */}
                          <div className="md:col-span-2 space-y-4">
                            <h4 className="text-gray-400 font-bold uppercase text-xs tracking-widest">Rating Breakdown</h4>
                            <div className="flex items-center gap-6">
                              <span className="text-6xl md:text-7xl font-black text-white">{r.averageScore.toFixed(1)}</span>
                              <div className="space-y-1">
                                <div className="flex text-[#c0ff00]">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      className={`w-5 h-5 ${star <= Math.round(r.averageScore) ? 'fill-[#c0ff00] text-[#c0ff00]' : 'text-gray-600'}`} 
                                    />
                                  ))}
                                </div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                  {r.count} TOTAL RATING{r.count !== 1 && 'S'}
                                </div>
                              </div>
                            </div>

                            {/* Horizontal Distribution Bars */}
                            <div className="space-y-2 mt-4">
                              {[5, 4, 3, 2, 1].map((starNum) => {
                                const starCount = r.breakdown?.[starNum] || 0;
                                const starPercent = r.count === 0 ? 0 : Math.round((starCount / r.count) * 100);
                                return (
                                  <div key={starNum} className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-400 w-3">{starNum}</span>
                                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${starPercent}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="h-full bg-[#c0ff00] rounded-full"
                                      />
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 w-8 text-right">{starPercent}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Column 2: Reviews List */}
                          <div className="md:col-span-3 space-y-4">
                            <h4 className="text-gray-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-[#c0ff00]" />
                              Reviews History ({r.reviews?.length || 0})
                            </h4>

                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                              {!r.reviews || r.reviews.length === 0 ? (
                                <p className="text-gray-600 italic uppercase font-bold text-sm py-4">No reviews have been penned yet.</p>
                              ) : (
                                r.reviews.map((rev, index) => (
                                  <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-sans font-bold text-[#c0ff00]">{rev.alias}</span>
                                        <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full font-black uppercase">Voter</span>
                                      </div>
                                      <div className="flex text-[#c0ff00]">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star 
                                            key={star} 
                                            className={`w-3.5 h-3.5 ${star <= rev.score ? 'fill-[#c0ff00] text-[#c0ff00]' : 'text-gray-700'}`} 
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    {rev.comment ? (
                                      <p className="text-gray-200 text-sm font-sans font-medium break-words leading-relaxed">{rev.comment}</p>
                                    ) : (
                                      <p className="text-gray-500 text-xs italic font-sans uppercase">Rated {rev.score} star{rev.score !== 1 && 's'} without a detailed review.</p>
                                    )}
                                    <div className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
