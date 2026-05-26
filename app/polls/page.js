"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Calendar, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

export default function Polls() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePollId, setActivePollId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedPollJustifications, setExpandedPollJustifications] = useState(null);
  
  const [selectedOption, setSelectedOption] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState({ pollId: '', type: '', msg: '' });

  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState('');
  const [createStatus, setCreateStatus] = useState({ type: '', msg: '' });

  const fetchPolls = () => {
    fetch('/api/polls')
      .then(res => res.json())
      .then(data => {
        setPolls(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleVote = async (pollId) => {
    if (!selectedOption) {
      setStatus({ pollId, type: 'error', msg: 'SELECT AN OPTION.' });
      return;
    }

    setStatus({ pollId, type: 'loading', msg: 'TRANSMITTING...' });
    
    const alias = localStorage.getItem('aliasName') || 'Ghost';
    const res = await fetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option: selectedOption, description, alias })
    });
    
    const data = await res.json();
    if (res.ok) {
      setStatus({ pollId, type: 'success', msg: 'VOTE RECORDED.' });
      setSelectedOption('');
      setDescription('');
      setActivePollId(null);
      fetchPolls();
    } else {
      setStatus({ pollId, type: 'error', msg: data.error || 'ERROR.' });
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const opts = newOptions.split(',').map(o => o.trim()).filter(Boolean);
    if (opts.length < 2) {
       setCreateStatus({ type: 'error', msg: 'AT LEAST 2 OPTIONS REQUIRED' });
       return;
    }
    setCreateStatus({ type: 'loading', msg: 'DEPLOYING...' });
    const alias = localStorage.getItem('aliasName') || 'Ghost';
    const res = await fetch('/api/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: newQuestion, options: opts, authorName: alias })
    });
    if (res.ok) {
      setCreateStatus({ type: 'success', msg: 'POLL DEPLOYED' });
      setNewQuestion('');
      setNewOptions('');
      setShowCreate(false);
      fetchPolls();
    } else {
      const data = await res.json();
      setCreateStatus({ type: 'error', msg: data.error || 'ERROR' });
    }
  };

  const toggleJustifications = (pollId) => {
    if (expandedPollJustifications === pollId) {
      setExpandedPollJustifications(null);
    } else {
      setExpandedPollJustifications(pollId);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-4 py-24 pb-36">
      <div className="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black uppercase text-white tracking-tighter"
          >
            IT Batch <span className="bg-[#c0ff00] px-4 text-black rounded-xl">Polls</span>
          </motion.h1>
          <p className="mt-6 text-xl font-bold text-gray-400 uppercase tracking-widest">
            Vote. Justify. Dominate.
          </p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="glass-button px-6 py-3 text-[#c0ff00] font-bold flex items-center gap-2 hover:bg-[#c0ff00] hover:text-black transition-colors"
        >
          <Plus className="w-5 h-5" />
          DEPLOY POLL
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-12"
          >
            <div className="glass-card p-8 border border-[#c0ff00]/30 shadow-[0_0_30px_rgba(192,255,0,0.1)]">
              <h2 className="text-2xl font-black text-white uppercase mb-6">Create New Poll</h2>
              <form onSubmit={handleCreatePoll} className="space-y-4">
                <input 
                  required
                  placeholder="The Question..."
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#c0ff00] transition-colors"
                />
                <input 
                  required
                  placeholder="Options (Comma Separated) e.g. Yes, No, Maybe"
                  value={newOptions}
                  onChange={e => setNewOptions(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#c0ff00] transition-colors"
                />
                <button type="submit" disabled={createStatus.type === 'loading'} className="w-full bg-[#c0ff00] text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-white transition-colors">
                  {createStatus.type === 'loading' ? 'DEPLOYING...' : 'PUBLISH POLL'}
                </button>
                {createStatus.msg && (
                  <p className={`text-center font-bold uppercase p-2 rounded-xl mt-2 ${createStatus.type === 'error' ? 'bg-[#ff3300]/20 text-[#ff3300]' : 'bg-[#c0ff00]/20 text-[#c0ff00]'}`}>
                    {createStatus.msg}
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-12">
        {loading ? (
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-[#c0ff00]/30 border-t-[#c0ff00] rounded-full animate-spin"></div>
          </div>
        ) : polls.length === 0 ? (
          <div className="glass-card p-16 text-center">
             <h3 className="text-3xl font-black uppercase text-gray-500">NO ACTIVE POLLS.</h3>
          </div>
        ) : (
          polls.map((poll, i) => {
            const totalVotes = Object.values(poll.voteCounts).reduce((a, b) => a + b, 0);
            
            // If the user hasn't voted yet, add a virtual +1 vote to the selected option for live preview
            const hasSelectedForThisPoll = activePollId === poll._id && selectedOption;
            const previewTotalVotes = totalVotes + (hasSelectedForThisPoll && !poll.hasVoted ? 1 : 0);
            
            return (
              <motion.div 
                key={poll._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 md:p-8"
              >
                <div className="flex justify-between items-start mb-6 gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase leading-tight mb-2">{poll.question}</h2>
                    <span className="text-sm text-gray-400">Deployed by <span className="text-[#c0ff00] font-bold">{poll.authorName}</span></span>
                  </div>
                  <div className="bg-white/10 border border-white/20 text-[#c0ff00] font-black px-4 py-2 rounded-xl text-xl whitespace-nowrap">
                    {previewTotalVotes} VOTE{previewTotalVotes !== 1 && 'S'}
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  {poll.options.map(option => {
                    const count = poll.voteCounts[option] || 0;
                    const isSelected = activePollId === poll._id && selectedOption === option;
                    
                    // Calculate preview count for live feedback
                    const previewCount = count + (isSelected && !poll.hasVoted ? 1 : 0);
                    const percent = previewTotalVotes === 0 ? 0 : Math.round((previewCount / previewTotalVotes) * 100);
                    const isVotedChoice = poll.hasVoted && poll.userVotedOption === option;
                    
                    return (
                      <div key={option} className="relative z-10 group">
                        <button 
                          disabled={poll.hasVoted}
                          onClick={() => {
                            setActivePollId(poll._id);
                            setSelectedOption(option);
                          }}
                          className={`w-full flex justify-between items-center p-4 border rounded-xl transition-all relative overflow-hidden ${
                            isVotedChoice 
                              ? 'border-[#c0ff00] bg-[#c0ff00]/20 text-white shadow-[0_0_15px_rgba(192,255,0,0.2)]'
                              : isSelected 
                                ? 'border-[#c0ff00] bg-[#c0ff00]/10 text-white shadow-[0_0_10px_rgba(192,255,0,0.15)]' 
                                : poll.hasVoted
                                  ? 'border-white/5 bg-white/5 text-gray-400 cursor-not-allowed'
                                  : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                          }`}
                        >
                          <span className="font-black text-xl uppercase relative z-10 flex items-center gap-3">
                            {option}
                            {isVotedChoice && (
                              <CheckCircle2 className="w-5 h-5 text-[#c0ff00] drop-shadow-[0_0_8px_rgba(192,255,0,0.8)]" />
                            )}
                          </span>
                          <span className="font-bold bg-black/50 text-white px-3 py-1 rounded-lg text-sm relative z-10">{percent}%</span>
                          
                          {/* Progress Bar Background */}
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
                  {activePollId === poll._id && !poll.hasVoted && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden bg-black/30 p-6 rounded-2xl border border-white/10 mt-6"
                    >
                      <h4 className="text-[#c0ff00] font-black uppercase mb-4 text-xl">Justify Your Choice (Optional)</h4>
                      <textarea 
                        placeholder="Why?"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#c0ff00] mb-4 resize-none font-sans"
                        rows={2}
                      />
                      <button 
                        onClick={() => handleVote(poll._id)}
                        disabled={status.pollId === poll._id && status.type === 'loading'}
                        className="w-full bg-[#c0ff00] hover:bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl transition-colors"
                      >
                        LOCK IN VOTE
                      </button>
                      
                      {status.pollId === poll._id && status.msg && (
                        <p className={`mt-4 text-center font-bold uppercase p-2 rounded-xl ${status.type === 'error' ? 'bg-[#ff3300]/20 text-[#ff3300]' : 'bg-[#c0ff00]/20 text-[#c0ff00]'}`}>
                          {status.msg}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer Section: View Justifications Comment Stream */}
                <div className="flex flex-col sm:flex-row justify-between items-center border-t border-white/10 pt-6 mt-6 gap-4">
                  <button 
                    onClick={() => toggleJustifications(poll._id)}
                    className="text-sm font-bold text-gray-400 hover:text-[#c0ff00] transition-colors flex items-center gap-2 uppercase tracking-widest"
                  >
                    <MessageSquare className="w-5 h-5 text-[#c0ff00]" />
                    {expandedPollJustifications === poll._id ? 'Hide Comments' : 'View Justifications'} ({poll.justifications?.length || 0})
                  </button>
                  {poll.hasVoted && (
                    <span className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-[#c0ff00]" />
                      Vote Secured
                    </span>
                  )}
                </div>

                <AnimatePresence>
                  {expandedPollJustifications === poll._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-6 bg-black/40 p-6 rounded-2xl border border-white/10"
                    >
                      <h4 className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-4">Justifications Feed</h4>
                      <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                        {!poll.justifications || poll.justifications.length === 0 ? (
                          <p className="text-gray-600 italic uppercase font-bold text-sm py-2">No justifications submitted yet.</p>
                        ) : (
                          poll.justifications.map((just, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-sans font-bold text-[#c0ff00]">{just.alias}</span>
                                  <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full font-black uppercase">Voter</span>
                                </div>
                                <span className="text-[10px] font-black uppercase bg-[#c0ff00]/10 text-[#c0ff00] border border-[#c0ff00]/20 px-3 py-1 rounded-full">
                                  Choice: {just.option}
                                </span>
                              </div>
                              <p className="text-gray-200 text-sm font-sans font-medium break-words leading-relaxed">{just.description}</p>
                              <div className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
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
          })
        )}
      </div>
    </main>
  );
}
