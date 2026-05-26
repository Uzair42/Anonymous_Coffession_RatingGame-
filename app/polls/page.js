"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function Polls() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePollId, setActivePollId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  
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
    
    const res = await fetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option: selectedOption, description })
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

  return (
    <main className="max-w-4xl mx-auto p-4 py-24">
      <div className="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black uppercase text-white tracking-tighter"
          >
            Campus <span className="bg-[#c0ff00] px-4 text-black rounded-xl">Polls</span>
          </motion.h1>
          <p className="mt-6 text-xl font-bold text-gray-400 uppercase tracking-widest">
            Vote. Justify. Dominate.
          </p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="glass-button px-6 py-3 text-[#c0ff00] font-bold flex items-center gap-2 hover:bg-[#c0ff00] hover:text-black"
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
                    {totalVotes} VOTE{totalVotes !== 1 && 'S'}
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  {poll.options.map(option => {
                    const count = poll.voteCounts[option] || 0;
                    const percent = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                    const isSelected = activePollId === poll._id && selectedOption === option;
                    
                    return (
                      <div key={option} className="relative z-10 group">
                        <button 
                          onClick={() => {
                            setActivePollId(poll._id);
                            setSelectedOption(option);
                          }}
                          className={`w-full flex justify-between items-center p-4 border rounded-xl transition-all relative overflow-hidden ${
                            isSelected 
                              ? 'border-[#c0ff00] bg-[#c0ff00]/10 text-white' 
                              : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                          }`}
                        >
                          <span className="font-black text-xl uppercase relative z-10">{option}</span>
                          <span className="font-bold bg-black/50 text-white px-3 py-1 rounded-lg text-sm relative z-10">{percent}%</span>
                          
                          {/* Progress Bar Background */}
                          <div 
                            className="absolute top-0 left-0 h-full bg-white/5 -z-0 transition-all duration-1000 ease-out"
                            style={{ width: `${percent}%` }}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {activePollId === poll._id && (
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
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#c0ff00] mb-4 resize-none"
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
              </motion.div>
            );
          })
        )}
      </div>
    </main>
  );
}
