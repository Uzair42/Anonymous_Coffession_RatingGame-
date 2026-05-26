"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Submit() {
  const [bodyText, setBodyText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    const alias = localStorage.getItem('aliasName');
    if (alias) setAuthorName(alias);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Submitting...' });
    
    const res = await fetch('/api/confessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bodyText, authorName })
    });
    
    const data = await res.json();
    if (res.ok) {
      setStatus({ type: 'success', msg: 'CONFESSION IS LIVE.' });
      setBodyText('');
      setAuthorName('');
    } else {
      setStatus({ type: 'error', msg: data.error || 'ERROR.' });
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#c0ff00] border-4 border-black p-8 md:p-12 brutal-shadow"
      >
        <h1 className="text-4xl md:text-6xl font-black uppercase mb-4 text-black tracking-tight">Speak Your Mind</h1>
        <p className="text-black font-bold mb-8 text-lg border-b-2 border-black pb-4">
          Drop the mask. Write something bold.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-black font-black uppercase mb-2">Alias / Fake Name</label>
            <input 
              type="text" 
              required
              readOnly
              value={authorName}
              placeholder="e.g. Agent 47"
              className="w-full bg-white/50 border-2 border-black p-4 text-gray-500 font-bold focus:outline-none cursor-not-allowed"
            />
          </div>
          
          <div>
            <label className="block text-black font-black uppercase mb-2">The Truth</label>
            <textarea 
              required
              rows={6}
              value={bodyText}
              onChange={e => setBodyText(e.target.value)}
              placeholder="What did you do?"
              className="w-full bg-white border-2 border-black p-4 text-black focus:outline-none focus:ring-4 focus:ring-black transition-all resize-none"
            />
          </div>
          
          <button 
            type="submit"
            disabled={status.type === 'loading'}
            className="w-full bg-black text-[#c0ff00] hover:bg-[#F4F4F0] hover:text-black font-black py-4 border-2 border-black uppercase tracking-widest transition-colors disabled:opacity-50"
          >
            {status.type === 'loading' ? 'TRANSMITTING...' : 'DROP CONFESSION'}
          </button>
          
          {status.msg && (
            <p className={`text-center font-bold uppercase p-2 border-2 border-black ${status.type === 'error' ? 'bg-[#ff3300] text-white' : 'bg-white text-black'}`}>
              {status.msg}
            </p>
          )}
        </form>
      </motion.div>
    </main>
  );
}
