"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', {
      redirect: false,
      username,
      password
    });
    if (res?.error) {
      setError('ACCESS DENIED.');
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F4F0] p-4 font-sans selection:bg-[#ff3300] selection:text-white">
      <div className="bg-black border-8 border-black p-10 w-full max-w-md brutal-shadow-red relative">
        <div className="absolute -top-6 -left-6 bg-[#c0ff00] border-4 border-black p-4 brutal-shadow">
          <ShieldAlert className="w-12 h-12 text-black" />
        </div>
        
        <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-8 mt-4 text-right">GOD<br/><span className="text-[#ff3300]">MODE</span></h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-black text-[#F4F4F0] uppercase mb-2">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-white border-4 border-black px-4 py-3 text-black font-bold focus:outline-none focus:ring-4 focus:ring-[#ff3300]"
            />
          </div>
          <div>
            <label className="block font-black text-[#F4F4F0] uppercase mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white border-4 border-black px-4 py-3 text-black font-bold focus:outline-none focus:ring-4 focus:ring-[#ff3300]"
            />
          </div>
          
          {error && <div className="bg-[#ff3300] text-white font-black uppercase p-3 border-4 border-black text-center">{error}</div>}
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#c0ff00] hover:bg-white text-black border-4 border-black font-black py-4 uppercase tracking-widest transition-colors disabled:opacity-50 mt-4 brutal-shadow"
          >
            {loading ? 'AUTHENTICATING...' : 'BREACH PROTOCOL'}
          </button>
        </form>
      </div>
    </div>
  );
}
