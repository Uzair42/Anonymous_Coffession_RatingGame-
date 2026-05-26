"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Calendar, ChevronDown, ChevronUp, Search, Award, Shield } from 'lucide-react';

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

export default function ClassRatings() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTarget, setExpandedTarget] = useState(null);

  // Individual card rating states
  const [selectedScore, setSelectedScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState({ id: null, type: '', msg: '' });

  const fetchRatings = () => {
    fetch('/api/class-ratings')
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

  const handleRate = async (studentName, studentId) => {
    if (selectedScore === 0) {
      setStatus({ id: studentId, type: 'error', msg: 'Please select a star rating first.' });
      return;
    }

    setStatus({ id: studentId, type: 'loading', msg: 'TRANSMITTING REVIEW...' });
    
    const alias = localStorage.getItem('aliasName') || 'Ghost';
    const res = await fetch('/api/class-ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetStudentName: studentName, score: selectedScore, alias, comment })
    });
    
    const data = await res.json();
    if (res.ok) {
      setStatus({ id: studentId, type: 'success', msg: 'RATING SECURED.' });
      setSelectedScore(0);
      setComment('');
      fetchRatings();
      setTimeout(() => setStatus({ id: null, type: '', msg: '' }), 2000);
    } else {
      setStatus({ id: studentId, type: 'error', msg: data.error || 'Failed to submit.' });
    }
  };

  const toggleExpand = (targetId) => {
    setExpandedTarget(expandedTarget === targetId ? null : targetId);
    setSelectedScore(0);
    setComment('');
    setStatus({ id: null, type: '', msg: '' });
  };

  // Filter students based on search query
  const filteredRatings = ratings.filter(r => 
    r.targetStudentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCleanDisplayName(r.targetStudentName).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="max-w-6xl mx-auto p-4 py-24 pb-36">
      {/* Title Header */}
      <div className="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black uppercase text-white tracking-tighter mb-4"
          >
            Class <span className="bg-[#ff3300] px-4 text-white rounded-xl shadow-[0_0_30px_rgba(255,51,0,0.4)]">7★ Ratings</span>
          </motion.h1>
          <p className="text-xl font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#ff3300]" />
            Official Last Semester IT Batch Roster
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Classmate..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#ff3300] font-sans"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3300]"></div>
        </div>
      ) : filteredRatings.length === 0 ? (
        <p className="text-center text-gray-500 py-10 uppercase font-black tracking-wider">No classmates found matching search query.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredRatings.map((rating, i) => {
            const isExpanded = expandedTarget === rating._id;
            const avgScore = Number(rating.score) || 0;
            const totalRatings = rating.count || 0;

            return (
              <motion.div 
                key={rating._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
                className={`glass-card p-6 md:p-8 transition-all overflow-hidden border-t-4 ${
                  isExpanded ? 'border-[#ff3300] shadow-[0_0_30px_rgba(255,51,0,0.15)] bg-white/5' : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Header Toggle Row */}
                <div 
                  onClick={() => toggleExpand(rating._id)}
                  className="flex items-center justify-between cursor-pointer group/header select-none"
                >
                  <div className="flex items-center gap-4 md:gap-6 flex-wrap">
                    {/* Average circle score */}
                    <div className="w-16 h-16 rounded-full bg-[#ff3300]/20 flex items-center justify-center border-2 border-[#ff3300] shrink-0">
                      <span className="text-3xl font-black text-[#ff3300]">{avgScore.toFixed(1)}</span>
                    </div>

                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-white group-hover/header:text-[#c0ff00] transition-colors uppercase leading-tight font-sans">
                        {getCleanDisplayName(rating.targetStudentName)}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-[#ff3300]">
                          {[1, 2, 3, 4, 5, 6, 7].map(star => (
                            <Star 
                              key={star} 
                              className={`w-3.5 h-3.5 ${star <= Math.round(avgScore) ? 'fill-[#ff3300] text-[#ff3300]' : 'text-gray-700'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 font-bold ml-1">{totalRatings} {totalRatings === 1 ? 'Rating' : 'Ratings'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-gray-400 group-hover/header:text-white transition-colors pl-4">
                    {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                  </div>
                </div>

                {/* Expanded Sections */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/10 mt-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Rating Form Panel (4 Columns) */}
                        <div className="lg:col-span-4 bg-black/40 border border-white/5 rounded-2xl p-5 md:p-6 space-y-5">
                          <h3 className="text-sm font-black text-[#ff3300] uppercase tracking-widest">Select 7★ Score</h3>
                          
                          <div className="flex justify-center items-center gap-1.5 py-3 border-y border-white/5">
                            {[1, 2, 3, 4, 5, 6, 7].map(star => (
                              <motion.button
                                key={star}
                                type="button"
                                whileHover={{ scale: 1.25 }}
                                whileTap={{ scale: 0.9 }}
                                onMouseEnter={() => setHoverScore(star)}
                                onMouseLeave={() => setHoverScore(0)}
                                onClick={() => setSelectedScore(star)}
                                className="focus:outline-none"
                              >
                                <Star 
                                  className={`w-7 h-7 transition-colors ${
                                    star <= (hoverScore || selectedScore) 
                                      ? 'fill-[#ff3300] text-[#ff3300] drop-shadow-[0_0_6px_rgba(255,51,0,0.5)]' 
                                      : 'text-gray-600'
                                  }`} 
                                />
                              </motion.button>
                            ))}
                          </div>

                          <div className="space-y-3">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Why? (Optional review comment)</label>
                            <textarea 
                              placeholder="Describe your classmate experience..."
                              value={comment}
                              onChange={e => setComment(e.target.value)}
                              rows={3}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff3300] text-sm resize-none font-sans"
                            />
                            <button 
                              onClick={() => handleRate(rating.targetStudentName, rating._id)}
                              disabled={status.id === rating._id && status.type === 'loading'}
                              className="w-full bg-[#ff3300] hover:bg-white text-white hover:text-black font-black uppercase py-3.5 rounded-xl text-sm transition-colors tracking-widest shadow-[0_0_15px_rgba(255,51,0,0.3)]"
                            >
                              {status.id === rating._id && status.type === 'loading' ? 'LOCKING...' : 'SECURE RATING'}
                            </button>
                            
                            {status.id === rating._id && status.msg && (
                              <p className={`text-xs font-bold text-center mt-2 ${
                                status.type === 'success' ? 'text-[#c0ff00]' : 'text-[#ff3300]'
                              }`}>
                                {status.msg}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Star Distribution Breakdown (3 Columns) */}
                        <div className="lg:col-span-3 space-y-4">
                          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">7★ Breakdown</h3>
                          <div className="space-y-2 mt-2">
                            {[7, 6, 5, 4, 3, 2, 1].map(starNum => {
                              const starCount = rating.breakdown?.[starNum] || 0;
                              const starPercent = totalRatings === 0 ? 0 : Math.round((starCount / totalRatings) * 100);
                              return (
                                <div key={starNum} className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-gray-400 w-2">{starNum}</span>
                                  <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${starPercent}%` }}
                                      className="h-full bg-[#ff3300] rounded-full"
                                    />
                                  </div>
                                  <span className="text-[9px] font-bold text-gray-500 w-6 text-right">{starPercent}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Reviews timeline (5 Columns) */}
                        <div className="lg:col-span-5 space-y-4">
                          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-[#ff3300]" />
                            Review Comments ({rating.reviews?.length || 0})
                          </h3>
                          
                          <div className="max-h-[260px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            {!rating.reviews || rating.reviews.length === 0 ? (
                              <p className="text-gray-600 italic uppercase font-bold text-xs py-4 text-center">No review comments yet. Be the first to rate!</p>
                            ) : (
                              rating.reviews.map((rev, index) => (
                                <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                                  <div className="flex items-center justify-between text-[10px] flex-wrap gap-2">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-[#c0ff00] font-sans">{rev.alias}</span>
                                      <span className="text-[8px] bg-white/10 text-gray-400 px-1.5 py-0.2 rounded-full font-black uppercase">VOTER</span>
                                    </div>
                                    <div className="flex text-[#ff3300]">
                                      {[1, 2, 3, 4, 5, 6, 7].map(star => (
                                        <Star 
                                          key={star} 
                                          className={`w-2.5 h-2.5 ${star <= rev.score ? 'fill-[#ff3300] text-[#ff3300]' : 'text-gray-700'}`} 
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {rev.comment ? (
                                    <p className="text-gray-200 text-xs font-sans break-words leading-relaxed">{rev.comment}</p>
                                  ) : (
                                    <p className="text-gray-500 text-[10px] italic uppercase font-sans">Rated {rev.score} stars without comments.</p>
                                  )}
                                  
                                  <div className="text-[9px] text-gray-500 font-bold flex items-center gap-1 pt-1">
                                    <Calendar className="w-3.5 h-3.5" />
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
            );
          })}
        </div>
      )}
    </main>
  );
}
