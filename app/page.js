"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeOff, AlertTriangle, MessageSquare, Send, Star } from 'lucide-react';
import Link from 'next/link';

function PostCard({ c, allowedEmojis, onReact, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  const handleComment = (e) => {
    e.preventDefault();
    const alias = localStorage.getItem('aliasName') || 'Ghost';
    if(!commentText) return;
    onComment(c._id, commentText, alias);
    setCommentText('');
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

      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
        <div className="w-12 h-12 bg-gradient-to-br from-[#c0ff00] to-[#80aa00] rounded-full flex items-center justify-center font-black text-black text-xl shadow-[0_0_15px_rgba(192,255,0,0.3)]">
          {c.authorName[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <span className="font-bold text-white text-lg block">{c.authorName}</span>
          <span className="text-xs text-gray-400 font-sans tracking-wide">Anonymous Contributor</span>
        </div>
      </div>
      
      <p className="text-xl md:text-2xl mb-8 leading-relaxed whitespace-pre-wrap text-gray-100 font-sans">
        {c.bodyText}
      </p>
      
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

  const totalVotes = Object.values(poll.voteCounts).reduce((a, b) => a + b, 0);

  const handleVote = async () => {
    if (!selectedOption) return;
    setStatus({ type: 'loading', msg: 'TRANSMITTING...' });
    const res = await fetch(`/api/polls/${poll._id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option: selectedOption, description })
    });
    if (res.ok) {
      setStatus({ type: 'success', msg: 'VOTED' });
      setShowVotePanel(false);
      onVote(); 
    } else {
      setStatus({ type: 'error', msg: 'ERROR' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-6 md:p-8 mb-8 relative group border-t-4 border-[#c0ff00]"
    >
      <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
        <div>
          <span className="text-xs font-bold text-[#c0ff00] uppercase tracking-widest block mb-1">Campus Poll</span>
          <h2 className="text-2xl font-black text-white uppercase leading-tight mb-2">{poll.question}</h2>
          <span className="text-sm text-gray-400 font-sans">Deployed by <span className="text-[#c0ff00] font-bold">{poll.authorName}</span></span>
        </div>
        <div className="bg-white/10 border border-white/20 text-[#c0ff00] font-black px-3 py-1 rounded-lg text-sm whitespace-nowrap">
          {totalVotes} VOTES
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        {poll.options.map(option => {
          const count = poll.voteCounts[option] || 0;
          const percent = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
          const isSelected = selectedOption === option;
          
          return (
            <div key={option} className="relative z-10">
              <button 
                onClick={() => {
                  setSelectedOption(option);
                  setShowVotePanel(true);
                }}
                className={`w-full flex justify-between items-center p-3 border rounded-xl transition-all relative overflow-hidden ${
                  isSelected ? 'border-[#c0ff00] bg-[#c0ff00]/10 text-white' : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <span className="font-bold uppercase relative z-10">{option}</span>
                <span className="font-bold bg-black/50 text-white px-2 py-1 rounded-md text-xs relative z-10">{percent}%</span>
                <div className="absolute top-0 left-0 h-full bg-white/5 -z-0 transition-all duration-1000 ease-out" style={{ width: `${percent}%` }} />
              </button>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showVotePanel && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden mt-4">
            <div className="bg-black/30 p-4 rounded-xl border border-white/10">
              <input 
                placeholder="Why? (Optional justification)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#c0ff00] mb-3 text-sm"
              />
              <button 
                onClick={handleVote}
                disabled={status.type === 'loading'}
                className="w-full bg-[#c0ff00] hover:bg-white text-black font-black uppercase py-3 rounded-lg text-sm transition-colors"
              >
                {status.type === 'loading' ? 'LOCKING IN...' : 'SUBMIT VOTE'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FeedRatingCard({ rating, onRateTarget }) {
  const [hoverScore, setHoverScore] = useState(0);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleRate = async (score) => {
    setStatus({ type: 'loading', msg: 'RATING...' });
    const success = await onRateTarget(rating.targetStudentName, score);
    if (success) {
      setStatus({ type: 'success', msg: 'RATING RECORDED' });
      setTimeout(() => setStatus({ type: '', msg: '' }), 2000);
    } else {
      setStatus({ type: 'error', msg: 'ERROR' });
      setTimeout(() => setStatus({ type: '', msg: '' }), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-6 md:p-8 mb-8 relative overflow-hidden border-t-4 border-[#ff3300]"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-[#ff3300]/20 flex items-center justify-center border-2 border-[#ff3300] shrink-0">
          <span className="text-3xl font-black text-[#ff3300]">{rating.score}</span>
        </div>
        <div>
          <span className="text-xs font-bold text-[#ff3300] uppercase tracking-widest block mb-1">Campus Rating</span>
          <p className="text-xl text-white font-sans">
            <strong className="font-black text-[#c0ff00]">{rating.targetStudentName}</strong>
          </p>
          <span className="text-sm text-gray-400 font-bold">{rating.count} {rating.count === 1 ? 'Rating' : 'Ratings'}</span>
        </div>
      </div>

      {/* Rate Too Feature */}
      <div className="border-t border-white/10 pt-4 mt-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Rate {rating.targetStudentName} Too:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoverScore(star)}
                onMouseLeave={() => setHoverScore(0)}
                onClick={() => handleRate(star)}
                disabled={status.type === 'loading' || status.type === 'success'}
                className="focus:outline-none disabled:opacity-50"
              >
                <Star 
                  className={`w-6 h-6 transition-colors ${
                    (hoverScore || 0) >= star 
                      ? 'fill-[#ff3300] text-[#ff3300]' 
                      : 'text-gray-600'
                  }`} 
                />
              </motion.button>
            ))}
          </div>
        </div>
        {status.msg && (
           <p className={`text-xs font-bold mt-2 text-right ${status.type === 'success' ? 'text-[#c0ff00]' : status.type === 'error' ? 'text-[#ff3300]' : 'text-gray-400'}`}>
             {status.msg}
           </p>
        )}
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [feedItems, setFeedItems] = useState([]);
  const [allowedEmojis, setAllowedEmojis] = useState(['🔥', '💀', '👀', '💔', '😂']);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);

  const fetchData = async () => {
    try {
      const [feedRes, settingsRes] = await Promise.all([
        fetch('/api/feed'),
        fetch('/api/settings')
      ]);
      
      if (!feedRes.ok) throw new Error('DB Error');
      
      const feedData = await feedRes.json();
      setFeedItems(Array.isArray(feedData) ? feedData : []);
      
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
    fetchData();
  }, []);

  const handleReact = async (id, emoji) => {
    const alias = localStorage.getItem('aliasName') || 'Ghost';
    await fetch(`/api/confessions/${id}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji, alias })
    });
    fetchData(); 
  };

  const handleComment = async (id, bodyText, authorName) => {
    await fetch(`/api/confessions/${id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bodyText, authorName })
    });
    fetchData(); 
  };

  const handleRateTarget = async (targetStudentName, score) => {
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetStudentName, score })
    });
    if (res.ok) {
      fetchData();
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
          Campus <br/>
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
    </main>
  );
}
