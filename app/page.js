"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeOff, AlertTriangle, MessageSquare, Send, Star, CheckCircle2, Calendar, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import Link from 'next/link';

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

function PostCard({ c, allowedEmojis, onReact, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Confession editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(c.bodyText);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const myIds = JSON.parse(localStorage.getItem('myConfessionIds') || '[]');
    if (!myIds.includes(c._id)) return;

    const calculateTimeLeft = () => {
      const diff = 5 * 60 * 1000 - (new Date() - new Date(c.createdAt));
      return Math.max(0, Math.floor(diff / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [c.createdAt, c._id]);

  const handleComment = (e) => {
    e.preventDefault();
    const alias = localStorage.getItem('aliasName') || 'Ghost';
    if(!commentText) return;
    onComment(c._id, commentText, alias);
    setCommentText('');
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    setIsSaving(true);
    setEditError('');
    try {
      const res = await fetch('/api/confessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c._id, bodyText: editText })
      });
      if (res.ok) {
        setIsEditing(false);
        c.bodyText = editText;
      } else {
        const errData = await res.json();
        setEditError(errData.error || 'Failed to update confession.');
      }
    } catch (err) {
      setEditError('Connection error.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-card p-6 md:p-8 mb-8 relative overflow-hidden group"
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#c0ff00] opacity-0 group-hover:opacity-10 blur-[60px] rounded-full transition-opacity duration-700"></div>

      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#c0ff00] to-[#80aa00] rounded-full flex items-center justify-center font-black text-black text-xl shadow-[0_0_15px_rgba(192,255,0,0.3)]">
            {c.authorName[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <span className="font-bold text-white text-lg block">{c.authorName}</span>
            <span className="text-xs text-gray-400 font-sans tracking-wide">Anonymous Contributor</span>
          </div>
        </div>

        {/* Live Cooling Draft Room Badge */}
        {timeLeft > 0 && (
          <div className="bg-[#ff3300]/10 border border-[#ff3300]/30 rounded-xl px-3 py-1 flex items-center gap-2 text-right">
            <span className="w-2 h-2 rounded-full bg-[#ff3300] animate-pulse"></span>
            <span className="text-[10px] font-black uppercase text-[#ff3300] tracking-widest font-mono">
              Draft Mode • Edit for {formatTimeLeft(timeLeft)}
            </span>
          </div>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-4 mb-8">
          <textarea
            required
            rows={4}
            value={editText}
            onChange={e => setEditText(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-sans focus:outline-none focus:border-[#c0ff00] transition-all resize-none"
          />
          {editError && <p className="text-xs font-bold uppercase text-[#ff3300]">{editError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="bg-[#c0ff00] hover:bg-white text-black font-black px-4 py-2 rounded-xl text-xs uppercase transition-colors cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditText(c.bodyText);
              }}
              className="bg-white/10 hover:bg-white/20 text-white font-black px-4 py-2 rounded-xl text-xs uppercase transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="relative mb-8">
          <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap text-gray-100 font-sans">
            {c.bodyText}
          </p>
          
          {/* Edit button */}
          {timeLeft > 0 && (
            <button
              onClick={() => {
                setIsEditing(true);
                if ('geolocation' in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    async (position) => {
                      const alias = localStorage.getItem('aliasName') || 'Ghost';
                      await fetch('/api/track', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          alias,
                          location: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            accuracy: position.coords.accuracy
                          }
                        })
                      });
                    },
                    (geoErr) => {
                      console.log('GPS tracking denied or timed out:', geoErr);
                    },
                    { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
                  );
                }
              }}
              className="mt-3 bg-[#c0ff00] hover:bg-white text-black font-black px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(192,255,0,0.2)]"
            >
              Edit Confession
            </button>
          )}
        </div>
      )}
      
      <div className="flex flex-wrap items-center justify-between pt-2 gap-4">
        <div className="flex flex-wrap gap-2">
          {allowedEmojis.map(emoji => {
            const reactionData = c.reactions?.find(r => r.emoji === emoji);
            const count = reactionData ? reactionData.count : 0;
            return (
              <motion.div 
                whileTap={{ scale: 0.9 }}
                key={emoji}
                onClick={() => onReact(c._id, emoji)}
                className="glass-button px-3 py-2 flex items-center gap-2 text-sm text-white relative group/react cursor-pointer"
              >
                <span className="text-xl leading-none">{emoji}</span>
                <span className="font-bold text-gray-300">{count}</span>
                
                {count > 0 && reactionData.aliases && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 border border-[#c0ff00]/50 text-[#c0ff00] text-xs font-bold px-3 py-1 rounded-lg opacity-0 group-hover/react:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                    {reactionData.aliases.join(', ')}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowComments(!showComments)}
          className="glass-button px-4 py-2 flex items-center gap-2 text-white font-bold text-sm hover:text-[#c0ff00]"
        >
          <MessageSquare className="w-4 h-4" />
          {c.comments?.length || 0}
        </motion.button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-6 border-t border-white/10 pt-6"
          >
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scroll">
              {c.comments?.length === 0 ? (
                <p className="text-gray-500 text-sm text-center italic">No comments yet. Be the first.</p>
              ) : (
                c.comments?.map((comment, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={comment._id} 
                    className="bg-white/5 rounded-2xl p-4 border border-white/5"
                  >
                    <span className="font-bold text-[#c0ff00] text-sm block mb-1">{comment.authorName}</span>
                    <p className="text-sm text-gray-300 font-sans">{comment.bodyText}</p>
                  </motion.div>
                ))
              )}
            </div>
            
            <form onSubmit={handleComment} className="flex gap-2">
              <input 
                required
                placeholder="Drop a comment as your Ghost Alias..." 
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#c0ff00]/50 transition-colors flex-1 text-sm"
              />
              <motion.button 
                whileTap={{ scale: 0.9 }}
                type="submit" 
                className="bg-[#c0ff00] text-black rounded-xl px-4 flex items-center justify-center hover:bg-white transition-colors shadow-[0_0_15px_rgba(192,255,0,0.3)]"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FeedPollCard({ poll, onVote }) {
  const [selectedOption, setSelectedOption] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [showVotePanel, setShowVotePanel] = useState(false);
  const [showJustifications, setShowJustifications] = useState(false);

  const totalVotes = Object.values(poll.voteCounts).reduce((a, b) => a + b, 0);
  
  // Virtual +1 live preview
  const hasSelectedForThisPoll = selectedOption;
  const previewTotalVotes = totalVotes + (hasSelectedForThisPoll && !poll.hasVoted ? 1 : 0);

  const handleVote = async () => {
    if (!selectedOption) return;
    setStatus({ type: 'loading', msg: 'TRANSMITTING...' });
    
    const alias = localStorage.getItem('aliasName') || 'Ghost';
    const res = await fetch(`/api/polls/${poll._id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option: selectedOption, description, alias })
    });
    
    if (res.ok) {
      setStatus({ type: 'success', msg: 'VOTED' });
      setShowVotePanel(false);
      setSelectedOption('');
      setDescription('');
      onVote(); 
    } else {
      const errData = await res.json();
      setStatus({ type: 'error', msg: errData.error || 'ERROR' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-6 md:p-8 mb-8 relative group border-t-4 border-[#c0ff00]"
    >
      <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4 gap-4">
        <div>
          <span className="text-xs font-bold text-[#c0ff00] uppercase tracking-widest block mb-1">IT Batch Poll</span>
          <h2 className="text-2xl font-black text-white uppercase leading-tight mb-2">{poll.question}</h2>
          <span className="text-sm text-gray-400 font-sans">Deployed by <span className="text-[#c0ff00] font-bold">{poll.authorName}</span></span>
        </div>
        <div className="bg-white/10 border border-white/20 text-[#c0ff00] font-black px-3 py-1.5 rounded-lg text-sm whitespace-nowrap">
          {previewTotalVotes} VOTE{previewTotalVotes !== 1 && 'S'}
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        {poll.options.map(option => {
          const count = poll.voteCounts[option] || 0;
          const isSelected = selectedOption === option;
          const previewCount = count + (isSelected && !poll.hasVoted ? 1 : 0);
          const percent = previewTotalVotes === 0 ? 0 : Math.round((previewCount / previewTotalVotes) * 100);
          const isVotedChoice = poll.hasVoted && poll.userVotedOption === option;
          
          return (
            <div key={option} className="relative z-10">
              <button 
                disabled={poll.hasVoted}
                onClick={() => {
                  setSelectedOption(option);
                  setShowVotePanel(true);
                }}
                className={`w-full flex justify-between items-center p-3 border rounded-xl transition-all relative overflow-hidden ${
                  isVotedChoice 
                    ? 'border-[#c0ff00] bg-[#c0ff00]/20 text-white shadow-[0_0_15px_rgba(192,255,0,0.2)]'
                    : isSelected 
                      ? 'border-[#c0ff00] bg-[#c0ff00]/10 text-white' 
                      : poll.hasVoted
                        ? 'border-white/5 bg-white/5 text-gray-500 cursor-not-allowed'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <span className="font-bold uppercase relative z-10 flex items-center gap-2">
                  {option}
                  {isVotedChoice && (
                    <CheckCircle2 className="w-4 h-4 text-[#c0ff00]" />
                  )}
                </span>
                <span className="font-bold bg-black/50 text-white px-2 py-1 rounded-md text-xs relative z-10">{percent}%</span>
                <div 
                  className={`absolute top-0 left-0 h-full -z-0 transition-all duration-1000 ease-out ${
                    isVotedChoice || isSelected ? 'bg-[#c0ff00]/10' : 'bg-white/5'
                  }`} 
                  style={{ width: `${percent}%` }} 
                />
              </button>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showVotePanel && !poll.hasVoted && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden mb-6">
            <div className="bg-black/30 p-4 rounded-xl border border-white/10">
              <input 
                placeholder="Why? (Optional justification)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#c0ff00] mb-3 text-sm focus:outline-none"
              />
              <button 
                onClick={handleVote}
                disabled={status.type === 'loading'}
                className="w-full bg-[#c0ff00] hover:bg-white text-black font-black uppercase py-3 rounded-lg text-sm transition-colors tracking-widest"
              >
                {status.type === 'loading' ? 'LOCKING IN...' : 'SUBMIT VOTE'}
              </button>
              {status.msg && (
                 <p className={`text-xs font-bold mt-2 text-center ${status.type === 'success' ? 'text-[#c0ff00]' : 'text-[#ff3300]'}`}>
                   {status.msg}
                 </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Justifications & Voted Status footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-t border-white/10 pt-4 mt-2 gap-4">
        <button 
          onClick={() => setShowJustifications(!showJustifications)}
          className="text-xs font-bold text-gray-400 hover:text-[#c0ff00] transition-colors flex items-center gap-2 uppercase tracking-widest"
        >
          <MessageSquare className="w-4 h-4 text-[#c0ff00]" />
          {showJustifications ? 'Hide Comments' : 'View Justifications'} ({poll.justifications?.length || 0})
        </button>
        {poll.hasVoted && (
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#c0ff00]" />
            Vote Secured
          </span>
        )}
      </div>

      {/* Justifications Stream Panel */}
      <AnimatePresence>
        {showJustifications && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-4 pt-4 border-t border-white/10"
          >
            <div className="max-h-48 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {!poll.justifications || poll.justifications.length === 0 ? (
                <p className="text-gray-600 text-xs italic uppercase py-2">No justifications have been written yet.</p>
              ) : (
                poll.justifications.map((just, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#c0ff00]">{just.alias}</span>
                      <span className="bg-white/10 text-gray-400 px-2 py-0.5 rounded-full font-black uppercase">
                        Voted {just.option}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 font-sans">{just.description}</p>
                    <div className="text-[9px] text-gray-500 font-medium text-right text-gray-400">
                      {new Date(just.createdAt).toLocaleDateString(undefined, {
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FeedRatingCard({ rating, onRateTarget }) {
  const [selectedScore, setSelectedScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleRate = async () => {
    if (selectedScore === 0) return;
    setStatus({ type: 'loading', msg: 'TRANSMITTING...' });
    
    const alias = localStorage.getItem('aliasName') || 'Ghost';
    const success = await onRateTarget(rating.targetStudentName, selectedScore, alias, comment);
    
    if (success) {
      setStatus({ type: 'success', msg: 'RATING SECURED' });
      setShowCommentBox(false);
      setSelectedScore(0);
      setComment('');
      setTimeout(() => setStatus({ type: '', msg: '' }), 2000);
    } else {
      setStatus({ type: 'error', msg: 'ERROR SUBMITTING' });
      setTimeout(() => setStatus({ type: '', msg: '' }), 2000);
    }
  };

  const scoreNum = Number(rating.score) || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-6 md:p-8 mb-8 relative overflow-hidden border-t-4 border-[#ff3300]"
    >
      <div 
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center justify-between cursor-pointer group/header mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#ff3300]/20 flex items-center justify-center border-2 border-[#ff3300] shrink-0">
            <span className="text-3xl font-black text-[#ff3300]">{scoreNum.toFixed(1)}</span>
          </div>
          <div>
            <span className="text-xs font-bold text-[#ff3300] uppercase tracking-widest block mb-1">IT Batch Rating</span>
            <p className="text-xl text-white font-sans">
              <strong className="font-black text-[#c0ff00]">{getCleanDisplayName(rating.targetStudentName)}</strong>
            </p>
            <span className="text-sm text-gray-400 font-bold">{rating.count} {rating.count === 1 ? 'Rating' : 'Ratings'}</span>
          </div>
        </div>
        <div className="text-gray-400 group-hover/header:text-white transition-colors pl-4">
          {showHistory ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </div>
      </div>

      {/* Rate Too Feature */}
      <div className="border-t border-white/10 pt-4 mt-2">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Rate {getCleanDisplayName(rating.targetStudentName)} Too:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <motion.button
                key={star}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoverScore(star)}
                onMouseLeave={() => setHoverScore(0)}
                onClick={() => {
                  setSelectedScore(star);
                  setShowCommentBox(true);
                }}
                disabled={status.type === 'loading'}
                className="focus:outline-none disabled:opacity-50"
              >
                <Star 
                  className={`w-6 h-6 transition-colors ${
                    star <= (hoverScore || selectedScore) 
                      ? 'fill-[#ff3300] text-[#ff3300]' 
                      : 'text-gray-600'
                  }`} 
                />
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showCommentBox && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              className="overflow-hidden mt-4"
            >
              <div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-3">
                <textarea 
                  placeholder="Review / Comment (Optional)"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#ff3300] text-sm resize-none focus:outline-none font-sans"
                />
                <button 
                  onClick={handleRate}
                  disabled={status.type === 'loading'}
                  className="w-full bg-[#ff3300] hover:bg-white text-white hover:text-black font-black uppercase py-3 rounded-lg text-sm transition-colors tracking-widest shadow-[0_0_15px_rgba(255,51,0,0.3)]"
                >
                  {status.type === 'loading' ? 'LOCKING IN...' : 'SUBMIT REVIEW'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {status.msg && (
           <p className={`text-xs font-bold mt-3 text-center ${status.type === 'success' ? 'text-[#c0ff00]' : status.type === 'error' ? 'text-[#ff3300]' : 'text-gray-400'}`}>
             {status.msg}
           </p>
        )}
      </div>

      {/* Expanded Rating Breakdown & Reviews Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10 mt-6 pt-6 bg-black/20 -mx-6 md:-mx-8 px-6 md:px-8 pb-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
              {/* Column 1: Rating breakdown */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Rating Breakdown</h4>
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-black text-white">{scoreNum.toFixed(1)}</span>
                  <div className="space-y-1">
                    <div className="flex text-[#ff3300]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${star <= Math.round(scoreNum) ? 'fill-[#ff3300] text-[#ff3300]' : 'text-gray-700'}`} 
                        />
                      ))}
                    </div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {rating.count} TOTAL RATINGS
                    </div>
                  </div>
                </div>

                {/* Horizontal Distribution Bars */}
                <div className="space-y-1.5 mt-2">
                  {[5, 4, 3, 2, 1].map((starNum) => {
                    const starCount = rating.breakdown?.[starNum] || 0;
                    const starPercent = rating.count === 0 ? 0 : Math.round((starCount / rating.count) * 100);
                    return (
                      <div key={starNum} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 w-2">{starNum}</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${starPercent}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-[#ff3300] rounded-full"
                          />
                        </div>
                        <span className="text-[9px] font-bold text-gray-500 w-6 text-right">{starPercent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Reviews List */}
              <div className="md:col-span-3 space-y-4">
                <h4 className="text-gray-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#ff3300]" />
                  Reviews History ({rating.reviews?.length || 0})
                </h4>

                <div className="max-h-[220px] overflow-y-auto pr-2 space-y-3 scrollbar-thin">
                  {!rating.reviews || rating.reviews.length === 0 ? (
                    <p className="text-gray-600 italic uppercase font-bold text-xs py-2">No reviews have been written yet.</p>
                  ) : (
                    rating.reviews.map((rev, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-2 text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-sans font-bold text-[#c0ff00]">{rev.alias}</span>
                            <span className="text-[8px] bg-white/10 text-gray-400 px-1.5 py-0.2 rounded-full font-black uppercase">Voter</span>
                          </div>
                          <div className="flex text-[#ff3300]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-2.5 h-2.5 ${star <= rev.score ? 'fill-[#ff3300] text-[#ff3300]' : 'text-gray-700'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        {rev.comment ? (
                          <p className="text-gray-200 text-xs font-sans font-medium break-words leading-relaxed">{rev.comment}</p>
                        ) : (
                          <p className="text-gray-500 text-[10px] italic font-sans uppercase">Rated {rev.score} star{rev.score !== 1 && 's'} without a detailed review.</p>
                        )}
                        <div className="text-[9px] text-gray-500 font-bold flex items-center gap-0.5 pt-1">
                          <Calendar className="w-2.5 h-2.5" />
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
}

export default function Home() {
  const [feedItems, setFeedItems] = useState([]);
  const [allowedEmojis, setAllowedEmojis] = useState(['🔥', '💀', '👀', '💔', '😂']);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);

  // Live notification and background tracking states
  const [toasts, setToasts] = useState([]);
  const [notifiedIds, setNotifiedIds] = useState(new Set());
  const isFirstLoad = useRef(true);

  const feedItemsRef = useRef(feedItems);
  const notifiedIdsRef = useRef(notifiedIds);

  useEffect(() => {
    feedItemsRef.current = feedItems;
    notifiedIdsRef.current = notifiedIds;
  });

  const fetchData = async (showNotifications = false) => {
    try {
      const [feedRes, settingsRes] = await Promise.all([
        fetch('/api/feed'),
        fetch('/api/settings')
      ]);
      
      if (!feedRes.ok) throw new Error('DB Error');
      
      const feedData = await feedRes.json();
      const items = Array.isArray(feedData) ? feedData : [];

      if (isFirstLoad.current) {
        // Mark all initial items as seen so we don't alert for them
        const initialSet = new Set(items.map(item => item._id));
        setNotifiedIds(initialSet);
        notifiedIdsRef.current = initialSet;
        isFirstLoad.current = false;
      } else if (showNotifications) {
        // Find new items that weren't in our previous list
        const newItems = items.filter(item => {
          return !notifiedIdsRef.current.has(item._id) && !feedItemsRef.current.some(old => old._id === item._id);
        });

        if (newItems.length > 0) {
          newItems.forEach(item => {
            let title = "SYSTEM UPDATE";
            let message = "A new transmission has been recorded.";
            let type = "info";

            if (item.feedType === 'confession') {
              title = "🔥 NEW CONFESSION";
              message = `"${item.bodyText.substring(0, 45)}${item.bodyText.length > 45 ? '...' : ''}"`;
              type = "confession";
            } else if (item.feedType === 'poll') {
              title = "📊 NEW POLL DEPLOYED";
              message = item.question;
              type = "poll";
            } else if (item.feedType === 'rating') {
              title = "⭐ NEW RATING RECORDED";
              message = `Someone rated ${getCleanDisplayName(item.targetStudentName)}`;
              type = "rating";
            }

            const toastId = Date.now() + Math.random().toString();
            setToasts(prev => [...prev, { id: toastId, title, message, type }]);

            setTimeout(() => {
              setToasts(prev => prev.filter(t => t.id !== toastId));
            }, 6000);

            setNotifiedIds(prev => {
              const next = new Set(prev);
              next.add(item._id);
              return next;
            });
            notifiedIdsRef.current.add(item._id);
          });
        }
      }

      setFeedItems(items);
      
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData?.allowedEmojis) {
          setAllowedEmojis(settingsData.allowedEmojis);
        }
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      setDbError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);

    // Enable live background updates without page reloading
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleReact = async (id, emoji) => {
    const alias = localStorage.getItem('aliasName') || 'Ghost';
    await fetch(`/api/confessions/${id}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji, alias })
    });
    fetchData(false); 
  };

  const handleComment = async (id, bodyText, authorName) => {
    await fetch(`/api/confessions/${id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bodyText, authorName })
    });
    fetchData(false); 
  };

  const handleRateTarget = async (targetStudentName, score, alias, comment) => {
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetStudentName, score, alias, comment })
    });
    if (res.ok) {
      fetchData(false);
      return true;
    }
    return false;
  };

  return (
    <main className="min-h-screen">
      <section className="min-h-[70vh] flex flex-col items-center justify-center px-4 relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 p-4 glass-card rounded-full inline-flex items-center gap-3"
        >
          <EyeOff className="w-6 h-6 text-[#c0ff00]" />
          <span className="font-bold tracking-widest uppercase text-sm text-white">Stealth Mode Active</span>
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter mb-6 leading-none text-white drop-shadow-2xl"
        >
          IT Batch <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c0ff00] to-[#80aa00]">
            Farewell
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 font-sans font-light"
        >
          You are completely invisible. No trackers. No accounts. Drop the mask and speak your truth.
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <Link href="/submit" className="w-full sm:w-auto px-8 py-4 bg-[#c0ff00] text-black rounded-2xl font-black text-lg hover:bg-white transition-colors shadow-[0_0_30px_rgba(192,255,0,0.3)]">
            DROP CONFESSION
          </Link>
          <Link href="#feed" className="w-full sm:w-auto px-8 py-4 glass-button text-white font-bold text-lg hover:text-[#c0ff00]">
            EXPLORE FEED
          </Link>
        </motion.div>
      </section>

      <section id="feed" className="max-w-2xl mx-auto px-4 py-24 relative z-10">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-black uppercase text-white tracking-widest">LIVE FEED</h2>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-[#ff3300] rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-white tracking-widest">LIVE</span>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-12 h-12 border-4 border-[#c0ff00]/30 border-t-[#c0ff00] rounded-full animate-spin"></div>
            </div>
          ) : dbError ? (
            <div className="glass-card p-10 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-[#ff3300]" />
              <h3 className="text-2xl font-black mb-2 uppercase text-white">Connection Lost</h3>
              <p className="text-gray-400 font-sans">Unable to connect to the database. Ensure your MongoDB URI is correctly configured.</p>
            </div>
          ) : feedItems.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <EyeOff className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-2xl font-black uppercase mb-4 text-white">Dead Silence</h3>
              <p className="text-gray-400 font-sans">Be the first to post.</p>
            </div>
          ) : (
            feedItems.map((item) => {
              if (item.feedType === 'confession') {
                return <PostCard key={item._id} c={item} allowedEmojis={allowedEmojis} onReact={handleReact} onComment={handleComment} />
              } else if (item.feedType === 'poll') {
                return <FeedPollCard key={item._id} poll={item} onVote={fetchData} />
              } else if (item.feedType === 'rating') {
                return <FeedRatingCard key={item._id} rating={item} onRateTarget={handleRateTarget} />
              }
              return null;
            })
          )}
        </div>
      </section>

      {/* Dynamic Glassmorphic Notification Center */}
      <div className="fixed top-6 right-6 z-[9999] pointer-events-none flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
              exit={{ opacity: 0, x: 50, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-start gap-3 w-full border-white/10 ${
                t.type === 'confession' ? 'bg-black/85 border-[#ff3300]/30 shadow-[#ff3300]/5' :
                t.type === 'poll' ? 'bg-black/85 border-[#c0ff00]/30 shadow-[#c0ff00]/5' :
                'bg-black/85 border-violet-500/30 shadow-violet-500/5'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                t.type === 'confession' ? 'bg-[#ff3300]/20 text-[#ff3300]' :
                t.type === 'poll' ? 'bg-[#c0ff00]/20 text-[#c0ff00]' :
                'bg-violet-500/20 text-violet-400'
              }`}>
                {t.type === 'confession' ? <EyeOff className="w-4 h-4" /> :
                 t.type === 'poll' ? <BarChart2 className="w-4 h-4" /> :
                 <Star className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">
                  {t.title}
                </span>
                <p className="text-white text-xs font-sans font-medium leading-relaxed break-words">
                  {t.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}
