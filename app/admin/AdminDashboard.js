"use client";
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Shield, Ban as BanIcon, Check, X, LogOut, Settings as SettingsIcon, Radar } from 'lucide-react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function AdminDashboard({ session }) {
  const [activeTab, setActiveTab] = useState('confessions');
  
  // Data states
  const [confessions, setConfessions] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [polls, setPolls] = useState([]);
  const [bans, setBans] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [settings, setSettings] = useState({ allowedEmojis: [] });
  
  // Create Poll State
  const [newPollQ, setNewPollQ] = useState('');
  const [newPollOpts, setNewPollOpts] = useState('');

  // Emoji State
  const [emojiInput, setEmojiInput] = useState('');

  const fetchData = async () => {
    fetch('/api/admin/confessions').then(r => r.json()).then(d => setConfessions(Array.isArray(d) ? d : []));
    fetch('/api/admin/ratings').then(r => r.json()).then(d => setRatings(Array.isArray(d) ? d : []));
    fetch('/api/admin/polls').then(r => r.json()).then(d => setPolls(Array.isArray(d) ? d : []));
    fetch('/api/admin/bans').then(r => r.json()).then(d => setBans(Array.isArray(d) ? d : []));
    fetch('/api/admin/visitors').then(r => r.json()).then(d => setVisitors(Array.isArray(d) ? d : []));
    fetch('/api/settings').then(r => r.json()).then(d => setSettings(d || { allowedEmojis: [] }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateConfessionStatus = async (id, status) => {
    await fetch('/api/admin/confessions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    fetchData();
  };

  const updatePollStatus = async (id, status) => {
    await fetch('/api/admin/polls', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    fetchData();
  };

  const createPoll = async (e) => {
    e.preventDefault();
    const options = newPollOpts.split(',').map(o => o.trim()).filter(Boolean);
    if (options.length < 2) return alert('Need at least 2 options separated by comma');
    
    await fetch('/api/admin/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: newPollQ, options })
    });
    setNewPollQ('');
    setNewPollOpts('');
    fetchData();
  };

  const banUser = async (ip, reason) => {
    if (!confirm(`Ban IP ${ip}?`)) return;
    await fetch('/api/admin/bans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, reason })
    });
    fetchData();
  };

  const unbanUser = async (ip) => {
    await fetch(`/api/admin/bans?ip=${ip}`, { method: 'DELETE' });
    fetchData();
  };

  const updateEmojis = async () => {
    const emojis = emojiInput.split(',').map(e => e.trim()).filter(Boolean);
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowedEmojis: emojis })
    });
    fetchData();
  };

  const deleteConfession = async (id) => {
    if (!confirm('Permanently delete this confession?')) return;
    await fetch(`/api/admin/confessions?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const deleteComment = async (id, commentId) => {
    if (!confirm('Delete this comment?')) return;
    await fetch(`/api/admin/confessions?id=${id}&commentId=${commentId}`, { method: 'DELETE' });
    fetchData();
  };

  const deleteRating = async (id) => {
    if (!confirm('Delete this rating?')) return;
    await fetch(`/api/admin/ratings?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const deletePoll = async (id) => {
    if (!confirm('Delete this poll?')) return;
    await fetch(`/api/admin/polls?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const DeviceInfo = ({ fp }) => (
    <div className="text-xs text-black mt-4 bg-white border-2 border-black p-2 font-mono">
      <p><strong>IP:</strong> {fp?.ip}</p>
      <p><strong>OS:</strong> {fp?.os}</p>
      <p><strong>Browser:</strong> {fp?.browser}</p>
      <button onClick={() => banUser(fp?.ip, 'Admin manual ban')} className="mt-2 text-white bg-[#ff3300] hover:bg-black px-2 py-1 flex items-center gap-1 border-2 border-black transition-colors font-bold uppercase">
        <BanIcon className="w-3 h-3" /> Execute Ban
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black p-4 font-sans selection:bg-[#c0ff00]">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex justify-between items-center py-6 border-b-4 border-black mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-10 h-10 text-[#ff3300]" />
          <h1 className="text-4xl font-black tracking-widest uppercase">GOD MODE</h1>
        </div>
        <button onClick={() => signOut()} className="flex items-center gap-2 bg-black text-white px-4 py-2 font-bold hover:bg-[#ff3300] transition-colors border-2 border-black brutal-shadow">
          <LogOut className="w-5 h-5" /> EXIT
        </button>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-2">
          {['confessions', 'ratings', 'polls', 'bans', 'settings', 'radar'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 border-2 border-black uppercase font-black transition-colors brutal-shadow ${
                activeTab === tab ? 'bg-[#c0ff00] text-black' : 'bg-white hover:bg-black hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          
          {/* CONFESSIONS */}
          {activeTab === 'confessions' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase mb-6">Moderation Queue</h2>
              {confessions.map(c => (
                <div key={c._id} className="bg-white border-4 border-black p-6 brutal-shadow flex flex-col gap-4">
                  <div className="flex justify-between items-start border-b-2 border-black pb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-sm font-black border-2 border-black uppercase ${
                        c.status === 'Accepted' ? 'bg-[#c0ff00]' :
                        c.status === 'Rejected' ? 'bg-[#ff3300] text-white' : 'bg-yellow-400'
                      }`}>{c.status}</span>
                      <span className="font-bold text-xl">{c.authorName}</span>
                    </div>
                  </div>
                  
                  <p className="text-xl font-medium">{c.bodyText}</p>
                  
                  {c.comments && c.comments.length > 0 && (
                    <div className="mt-4 border-t-2 border-dashed border-black pt-4">
                      <h4 className="font-bold mb-2">Comments:</h4>
                      {c.comments.map(comment => (
                        <div key={comment._id} className="bg-gray-100 p-2 border-l-4 border-[#c0ff00] mb-2 text-sm relative group">
                          <button onClick={() => deleteComment(c._id, comment._id)} className="absolute top-2 right-2 bg-[#ff3300] text-white p-1 hover:bg-black transition-colors opacity-0 group-hover:opacity-100">
                            <X className="w-4 h-4" />
                          </button>
                          <span className="font-bold">{comment.authorName}: </span>{comment.bodyText}
                          <DeviceInfo fp={comment.deviceFingerprint} />
                        </div>
                      ))}
                    </div>
                  )}

                  <DeviceInfo fp={c.deviceFingerprint} />
                  
                  <div className="flex gap-4 mt-4 pt-4 border-t-2 border-black">
                    {c.status === 'Accepted' ? (
                      <button onClick={() => updateConfessionStatus(c._id, 'Rejected')} className="flex-1 bg-yellow-400 hover:bg-black text-black hover:text-white font-black border-2 border-black py-3 uppercase flex justify-center items-center gap-2 transition-colors">
                         HIDE POST
                      </button>
                    ) : (
                      <button onClick={() => updateConfessionStatus(c._id, 'Accepted')} className="flex-1 bg-[#c0ff00] hover:bg-white text-black font-black border-2 border-black py-3 uppercase flex justify-center items-center gap-2 transition-colors">
                        <Check className="w-5 h-5" /> RESTORE POST
                      </button>
                    )}
                    <button onClick={() => deleteConfession(c._id)} className="flex-1 bg-[#ff3300] hover:bg-black text-white font-black border-2 border-black py-3 uppercase flex justify-center items-center gap-2 transition-colors">
                      <X className="w-5 h-5" /> PERMA-DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* RATINGS */}
          {activeTab === 'ratings' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase mb-6">All Ratings (God View)</h2>
              {ratings.map(r => (
                <div key={r._id} className="bg-white border-4 border-black p-6 brutal-shadow mb-4">
                  <p className="text-xl"><strong>TARGET:</strong> {r.targetStudentName}</p>
                  <div className="flex justify-between items-center mt-2 mb-4">
                    <p className="text-2xl font-black text-[#ff3300]">AVG SCORE: {r.averageScore}/5 <span className="text-sm text-gray-500">({r.count} ratings)</span></p>
                    <button onClick={() => deleteRating(r._id)} className="bg-[#ff3300] text-white font-bold px-4 py-2 border-2 border-black hover:bg-black transition-colors">DELETE TARGET</button>
                  </div>
                  
                  <div className="mt-4 border-t-2 border-dashed border-black pt-4">
                     <h4 className="font-bold mb-2 text-sm uppercase">Rating Breakdown:</h4>
                     {r.ratings.map((subRating, idx) => (
                        <div key={idx} className="bg-gray-100 p-2 border-l-4 border-[#ff3300] mb-2 text-sm">
                           <span className="font-bold text-[#ff3300] text-lg">{subRating.score}/5</span>
                           <span className="ml-2 font-bold text-gray-600">by {subRating.alias || 'Ghost'}</span>
                           <DeviceInfo fp={subRating.deviceFingerprint} />
                        </div>
                     ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* POLLS */}
          {activeTab === 'polls' && (
            <div className="space-y-8">
              <div className="bg-[#c0ff00] border-4 border-black p-6 brutal-shadow">
                <h3 className="text-2xl font-black uppercase mb-4">Create New Poll</h3>
                <form onSubmit={createPoll} className="space-y-4">
                  <input required value={newPollQ} onChange={e=>setNewPollQ(e.target.value)} placeholder="Question" className="w-full bg-white border-2 border-black p-4 font-bold focus:outline-none" />
                  <input required value={newPollOpts} onChange={e=>setNewPollOpts(e.target.value)} placeholder="Options (comma separated)" className="w-full bg-white border-2 border-black p-4 font-bold focus:outline-none" />
                  <button type="submit" className="bg-black text-white px-8 py-4 font-black uppercase hover:bg-white hover:text-black border-2 border-black transition-colors w-full">Deploy Poll</button>
                </form>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-black uppercase mb-6">Manage Polls</h2>
                {polls.map(p => (
                  <div key={p._id} className="bg-white border-4 border-black p-6 brutal-shadow">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-black gap-2 flex-wrap">
                      <h3 className="font-black text-2xl flex-1">{p.question}</h3>
                      <button onClick={() => updatePollStatus(p._id, p.status === 'Active' ? 'Closed' : 'Active')} className={`px-4 py-2 font-bold uppercase border-2 border-black ${p.status === 'Active' ? 'bg-[#ff3300] text-white' : 'bg-[#c0ff00] text-black'}`}>
                        {p.status === 'Active' ? 'Close Poll' : 'Re-open'}
                      </button>
                      <button onClick={() => deletePoll(p._id)} className="bg-black text-white px-4 py-2 font-bold uppercase border-2 border-black hover:bg-[#ff3300] transition-colors">
                        Delete
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-500 uppercase">Raw Votes (God View)</h4>
                      {p.votes.map((v, i) => (
                        <div key={i} className="p-4 bg-gray-100 border-2 border-black text-sm">
                          <p className="text-lg font-bold">Voted: <span className="text-[#ff3300]">{v.option}</span></p>
                          {v.description && <p className="italic mb-2">"{v.description}"</p>}
                          <DeviceInfo fp={v.deviceFingerprint} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BANS */}
          {activeTab === 'bans' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase mb-6">Banned IPs</h2>
              {bans.map(b => (
                <div key={b._id} className="bg-black text-white border-4 border-[#ff3300] p-6 flex justify-between items-center brutal-shadow-red">
                  <div>
                    <p className="font-black text-2xl text-[#ff3300]">{b.ip}</p>
                    <p className="font-mono text-gray-400">Reason: {b.reason}</p>
                  </div>
                  <button onClick={() => unbanUser(b.ip)} className="bg-white text-black font-bold px-6 py-3 uppercase hover:bg-[#c0ff00] transition-colors border-2 border-black">Unban</button>
                </div>
              ))}
              {bans.length === 0 && <div className="bg-white border-4 border-black p-8 text-center font-bold text-xl uppercase">No banned users.</div>}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase mb-6">Global Settings</h2>
              
              <div className="bg-white border-4 border-black p-8 brutal-shadow">
                <h3 className="text-2xl font-bold uppercase mb-4 flex items-center gap-2"><SettingsIcon /> Reaction Emojis</h3>
                <p className="mb-6 font-medium text-gray-600">Define the exact emojis users are allowed to react with. Comma-separated.</p>
                
                <div className="flex gap-4 mb-6 flex-wrap">
                  {settings?.allowedEmojis?.map((e, i) => (
                    <span key={i} className="text-4xl bg-gray-100 border-2 border-black p-2">{e}</span>
                  ))}
                </div>

                <div className="flex gap-4">
                  <input 
                    placeholder="e.g. 🔥,💀,👀,😭" 
                    value={emojiInput}
                    onChange={e => setEmojiInput(e.target.value)}
                    className="flex-1 bg-white border-2 border-black p-4 font-bold text-xl focus:outline-none focus:ring-4 focus:ring-black"
                  />
                  <button onClick={updateEmojis} className="bg-black text-white px-8 font-black uppercase hover:bg-[#c0ff00] hover:text-black border-2 border-black transition-colors">
                    UPDATE EMOJIS
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RADAR (TELEMETRY) */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Radar className="w-8 h-8 text-[#ff3300]" />
                <h2 className="text-3xl font-black uppercase">Live Radar & Telemetry</h2>
              </div>
              
              <p className="bg-white border-2 border-black p-4 font-bold brutal-shadow">
                Real-time tracking of all active visitors across the globe. Exact GPS coordinates are intercepted upon alias assignment.
              </p>

              {/* Interactive Map */}
              <Map visitors={visitors} />

              {/* Data Table */}
              <div className="mt-8 bg-white border-4 border-black brutal-shadow overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black text-white uppercase text-sm">
                    <tr>
                      <th className="p-4">Alias</th>
                      <th className="p-4">IP Address</th>
                      <th className="p-4">OS & Browser</th>
                      <th className="p-4">Coordinates</th>
                      <th className="p-4">Visits</th>
                      <th className="p-4">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map(v => (
                      <tr key={v._id} className="border-b-2 border-black font-mono text-sm hover:bg-gray-100">
                        <td className="p-4 font-black uppercase text-[#ff3300]">{v.alias}</td>
                        <td className="p-4">{v.deviceFingerprint?.ip}</td>
                        <td className="p-4">{v.deviceFingerprint?.os} <br/> <span className="text-gray-500">{v.deviceFingerprint?.browser}</span></td>
                        <td className="p-4">{v.location ? `${v.location.lat.toFixed(4)}, ${v.location.lng.toFixed(4)}` : 'UNKNOWN'}</td>
                        <td className="p-4">{v.visitCount}</td>
                        <td className="p-4">{new Date(v.lastSeen).toLocaleString()}</td>
                      </tr>
                    ))}
                    {visitors.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center font-bold uppercase">No telemetry data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
