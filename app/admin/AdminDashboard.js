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
  const [expandedVisitor, setExpandedVisitor] = useState(null);
  const [editingVisitor, setEditingVisitor] = useState(null);
  
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

  const deleteVisitor = async (id) => {
    if (!confirm('Are you absolutely sure you want to purge this visitor profile from the memory grid?')) return;
    const res = await fetch(`/api/admin/visitors?id=${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      fetch('/api/admin/visitors').then(r => r.json()).then(d => setVisitors(Array.isArray(d) ? d : []));
    }
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

  const deleteRating = async (id, system) => {
    if (!confirm(`Delete this ${system} rating roster target?`)) return;
    await fetch(`/api/admin/ratings?id=${id}&system=${system}`, { method: 'DELETE' });
    fetchData();
  };

  const deletePoll = async (id) => {
    if (!confirm('Delete this poll?')) return;
    await fetch(`/api/admin/polls?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const DeviceInfo = ({ fp }) => {
    const matchedVisitor = visitors.find(v => v.deviceFingerprint?.ip === fp?.ip);
    
    return (
      <div className="text-xs text-black mt-4 bg-white border-2 border-black p-2 font-mono">
        <p><strong>IP:</strong> {fp?.ip}</p>
        <p><strong>OS:</strong> {fp?.os}</p>
        <p><strong>Browser:</strong> {fp?.browser}</p>
        
        <div className="flex gap-2 mt-2 flex-wrap">
          <button 
            onClick={() => banUser(fp?.ip, 'Admin manual ban')} 
            className="text-white bg-[#ff3300] hover:bg-black px-2 py-1 flex items-center gap-1 border-2 border-black transition-colors font-bold uppercase cursor-pointer"
          >
            <BanIcon className="w-3 h-3" /> Execute Ban
          </button>
          
          {matchedVisitor ? (
            <button 
              onClick={() => {
                setExpandedVisitor(matchedVisitor._id);
                setActiveTab('radar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-black hover:bg-[#c0ff00] text-white hover:text-black px-2 py-1 flex items-center gap-1 border-2 border-black transition-colors font-bold uppercase cursor-pointer"
            >
              🔍 Inspect Node (GPS & Logs)
            </button>
          ) : (
            <span className="text-[10px] text-gray-400 italic flex items-center px-1">Telemetry Unavailable</span>
          )}
        </div>
      </div>
    );
  };

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
              <h2 className="text-3xl font-black uppercase mb-6">All Classmate Ratings (God View)</h2>
              {ratings.map(r => (
                <div key={r._id} className="bg-white border-4 border-black p-6 brutal-shadow mb-4">
                  <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                    <p className="text-xl"><strong>TARGET:</strong> {r.targetStudentName}</p>
                    <span className="text-xs bg-black text-[#c0ff00] px-2 py-0.5 font-black uppercase tracking-wider">{r.system || '5-Star'}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 mb-4">
                    <p className="text-2xl font-black text-[#ff3300]">
                      AVG SCORE: {r.averageScore}/{r.system === '7-Star' ? 7 : 5} 
                      <span className="text-sm text-gray-500 ml-2 font-mono">({r.count} ratings)</span>
                    </p>
                    <button 
                      onClick={() => deleteRating(r._id, r.system || '5-Star')} 
                      className="bg-[#ff3300] text-white font-bold px-4 py-2 border-2 border-black hover:bg-black transition-colors cursor-pointer"
                    >
                      DELETE TARGET
                    </button>
                  </div>
                  
                  <div className="mt-4 border-t-2 border-dashed border-black pt-4">
                     <h4 className="font-bold mb-2 text-sm uppercase">Rating Breakdown:</h4>
                     {r.ratings.map((subRating, idx) => (
                        <div key={idx} className="bg-gray-100 p-3 border-l-4 border-[#ff3300] mb-3 text-sm">
                           <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                             <span className="font-bold text-[#ff3300] text-lg">{subRating.score}/{r.system === '7-Star' ? 7 : 5}</span>
                             <span className="font-bold text-gray-600">by {subRating.alias || 'Ghost'}</span>
                           </div>
                           {subRating.comment && <p className="italic text-gray-700 bg-white/60 p-2 border border-black/10 rounded mb-2">"{subRating.comment}"</p>}
                           <DeviceInfo fp={subRating.deviceFingerprint} />
                        </div>
                     ))}
                  </div>
                </div>
              ))}
              {ratings.length === 0 && (
                <p className="text-center py-10 font-bold uppercase">No star classmate ratings have been submitted yet.</p>
              )}
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

          {/* RADAR (TELEMETRY & AUDIT EXPLORER) */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Radar className="w-8 h-8 text-[#ff3300]" />
                <h2 className="text-3xl font-black uppercase">Live Radar & Auditing</h2>
              </div>
              
              <p className="bg-white border-2 border-black p-4 font-bold brutal-shadow">
                Real-time tracking of all active visitors. Click a visitor card to audit their confessions, comments, classmate ratings, and votes.
              </p>

              {/* Interactive Map */}
              <Map visitors={visitors} />

              {/* Visitors Audit Grid */}
              <h3 className="text-2xl font-black uppercase mt-8 border-b-4 border-black pb-2">Active Visitor Nodes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {visitors.map(v => {
                  const isExpanded = expandedVisitor === v._id;
                  const totalActivities = (v.confessions?.length || 0) + (v.comments?.length || 0) + (v.ratings?.length || 0) + (v.votes?.length || 0);
                  
                  return (
                    <div key={v._id} className={`bg-white border-4 border-black p-6 brutal-shadow transition-all ${isExpanded ? 'ring-4 ring-[#c0ff00]' : ''}`}>
                      <div className="flex justify-between items-start border-b-2 border-black pb-3 mb-4 flex-wrap gap-2">
                        <div>
                          <span className="text-xs bg-black text-[#c0ff00] px-2 py-0.5 font-bold uppercase tracking-wider">GHOST NODE</span>
                          <h4 className="text-2xl font-black text-[#ff3300] uppercase mt-1">{v.alias || 'Fake Name'}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-gray-200 border border-black px-2 py-0.5 font-bold uppercase">{v.deviceFingerprint?.ip}</span>
                          <p className="text-xs text-gray-500 font-mono mt-1">{v.deviceFingerprint?.os} ({v.deviceFingerprint?.browser})</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-4 bg-gray-50 p-3 border-2 border-dashed border-black">
                        <p><strong>VISITS:</strong> {v.visitCount}</p>
                        <p><strong>GPS:</strong> {v.location ? `${v.location.lat.toFixed(4)}, ${v.location.lng.toFixed(4)}` : 'BLOCKED'}</p>
                        <p className="col-span-2"><strong>LAST SEEN:</strong> {new Date(v.lastSeen).toLocaleString()}</p>
                      </div>

                      <div className="flex gap-2 flex-wrap text-[10px] font-black uppercase mb-4">
                        <span className="bg-blue-100 border border-blue-400 px-2 py-1 rounded text-blue-800 font-bold">{v.confessions?.length || 0} Confessions</span>
                        <span className="bg-purple-100 border border-purple-400 px-2 py-1 rounded text-purple-800 font-bold">{v.comments?.length || 0} Comments</span>
                        <span className="bg-yellow-100 border border-yellow-400 px-2 py-1 rounded text-yellow-800 font-bold">{v.ratings?.length || 0} Ratings</span>
                        <span className="bg-green-100 border border-green-400 px-2 py-1 rounded text-green-800 font-bold">{v.votes?.length || 0} Votes</span>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button 
                          onClick={() => setExpandedVisitor(isExpanded ? null : v._id)} 
                          className="flex-1 bg-black hover:bg-[#c0ff00] text-white hover:text-black font-black py-2.5 uppercase text-xs border-2 border-black transition-colors cursor-pointer min-w-[120px]"
                        >
                          {isExpanded ? 'Close Logs' : `Audit Logs (${totalActivities})`}
                        </button>
                        <button 
                          onClick={() => setEditingVisitor({
                            id: v._id,
                            alias: v.alias || '',
                            lat: v.location?.lat || '',
                            lng: v.location?.lng || ''
                          })}
                          className="bg-[#c0ff00] hover:bg-black text-black hover:text-white font-black py-2.5 px-3 uppercase text-xs border-2 border-black transition-colors cursor-pointer"
                        >
                          Edit Profile
                        </button>
                        <button 
                          onClick={() => deleteVisitor(v._id)}
                          className="bg-white hover:bg-black text-black hover:text-white font-black py-2.5 px-3 uppercase text-xs border-2 border-black transition-colors cursor-pointer"
                        >
                          Purge Profile
                        </button>
                        <button 
                          onClick={() => banUser(v.deviceFingerprint?.ip, `Manual ban for visitor alias: ${v.alias}`)}
                          className="bg-[#ff3300] hover:bg-black text-white font-black py-2.5 px-3 uppercase text-xs border-2 border-black transition-colors cursor-pointer"
                        >
                          Ban Node
                        </button>
                      </div>

                      {/* Expandable audit log timeline */}
                      {isExpanded && (
                        <div className="mt-6 border-t-4 border-black pt-4 space-y-6">
                          
                          {/* Confessions */}
                          <div>
                            <h5 className="font-black text-xs uppercase bg-blue-100 border border-blue-400 p-1 mb-2 text-blue-800">Confessions Posted ({v.confessions?.length || 0})</h5>
                            {(!v.confessions || v.confessions.length === 0) ? (
                              <p className="text-xs text-gray-500 italic">No confessions posted.</p>
                            ) : (
                              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {v.confessions.map((c, idx) => (
                                  <div key={idx} className="bg-gray-50 border border-black p-2 text-xs">
                                    <div className="flex justify-between font-bold mb-1">
                                      <span className="text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                                      <span className={c.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}>{c.status}</span>
                                    </div>
                                    <p className="italic font-serif">"{c.bodyText}"</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Comments */}
                          <div>
                            <h5 className="font-black text-xs uppercase bg-purple-100 border border-purple-400 p-1 mb-2 text-purple-800">Comments Made ({v.comments?.length || 0})</h5>
                            {(!v.comments || v.comments.length === 0) ? (
                              <p className="text-xs text-gray-500 italic">No comments dropped.</p>
                            ) : (
                              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {v.comments.map((c, idx) => (
                                  <div key={idx} className="bg-gray-50 border border-black p-2 text-xs">
                                    <span className="text-[10px] text-gray-400 block font-bold">On: "{c.confessionText.substring(0, 40)}..."</span>
                                    <p className="font-medium text-black mt-1">"{c.commentText}"</p>
                                    <span className="text-[9px] text-gray-400 block mt-1">{new Date(c.createdAt).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Ratings */}
                          <div>
                            <h5 className="font-black text-xs uppercase bg-yellow-100 border border-yellow-400 p-1 mb-2 text-yellow-800">Classmate Ratings ({v.ratings?.length || 0})</h5>
                            {(!v.ratings || v.ratings.length === 0) ? (
                              <p className="text-xs text-gray-500 italic">No ratings submitted.</p>
                            ) : (
                              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {v.ratings.map((r, idx) => (
                                  <div key={idx} className="bg-gray-50 border border-black p-2 text-xs">
                                    <div className="flex justify-between font-bold mb-1">
                                      <span className="text-[#ff3300] uppercase font-black">{r.target}</span>
                                      <span className="bg-black text-[#c0ff00] px-1.5 rounded">{r.score}★ ({r.system})</span>
                                    </div>
                                    {r.comment ? (
                                      <p className="italic">"Review: {r.comment}"</p>
                                    ) : (
                                      <p className="text-gray-400 italic">No review comment.</p>
                                    )}
                                    <span className="text-[9px] text-gray-400 block mt-1">{new Date(r.createdAt).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Votes */}
                          <div>
                            <h5 className="font-black text-xs uppercase bg-green-100 border border-green-400 p-1 mb-2 text-green-800">Poll Votes Cast ({v.votes?.length || 0})</h5>
                            {(!v.votes || v.votes.length === 0) ? (
                              <p className="text-xs text-gray-500 italic">No votes recorded.</p>
                            ) : (
                              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {v.votes.map((vt, idx) => (
                                  <div key={idx} className="bg-gray-50 border border-black p-2 text-xs">
                                    <span className="font-bold text-black block mb-1">{vt.question}</span>
                                    <p className="text-xs">Voted: <strong className="text-green-700">{vt.option}</strong></p>
                                    {vt.description && <p className="italic text-gray-600 mt-1">"{vt.description}"</p>}
                                    <span className="text-[9px] text-gray-400 block mt-1">{new Date(vt.createdAt).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
                {visitors.length === 0 && (
                  <p className="col-span-2 text-center py-10 font-bold uppercase">No active visitor node telemetry detected.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {editingVisitor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black p-8 max-w-md w-full brutal-shadow">
            <h3 className="text-3xl font-black uppercase text-black mb-6 border-b-4 border-black pb-2">Edit Ghost Node</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">Ghost Alias</label>
                <input 
                  type="text" 
                  value={editingVisitor.alias} 
                  onChange={e => setEditingVisitor({ ...editingVisitor, alias: e.target.value })}
                  className="w-full bg-white border-2 border-black p-3 text-black font-mono font-bold focus:outline-none focus:bg-gray-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">Latitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={editingVisitor.lat} 
                    onChange={e => setEditingVisitor({ ...editingVisitor, lat: e.target.value })}
                    className="w-full bg-white border-2 border-black p-3 text-black font-mono font-bold focus:outline-none focus:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">Longitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={editingVisitor.lng} 
                    onChange={e => setEditingVisitor({ ...editingVisitor, lng: e.target.value })}
                    className="w-full bg-white border-2 border-black p-3 text-black font-mono font-bold focus:outline-none focus:bg-gray-100"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button 
                onClick={async () => {
                  const res = await fetch('/api/admin/visitors', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: editingVisitor.id,
                      alias: editingVisitor.alias,
                      location: {
                        lat: parseFloat(editingVisitor.lat) || 0,
                        lng: parseFloat(editingVisitor.lng) || 0,
                        accuracy: 10
                      }
                    })
                  });
                  if (res.ok) {
                    fetch('/api/admin/visitors').then(r => r.json()).then(d => setVisitors(Array.isArray(d) ? d : []));
                    setEditingVisitor(null);
                  }
                }}
                className="flex-1 bg-[#c0ff00] hover:bg-black hover:text-[#c0ff00] text-black font-black py-3 uppercase border-2 border-black transition-colors cursor-pointer text-center text-xs"
              >
                Save Node
              </button>
              <button 
                onClick={() => setEditingVisitor(null)}
                className="flex-1 bg-gray-200 hover:bg-black hover:text-white text-black font-black py-3 uppercase border-2 border-black transition-colors cursor-pointer text-center text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
