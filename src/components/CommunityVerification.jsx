import React, { useState, useEffect } from 'react';
import { Check, X, Bell, Map, Loader2, Users } from 'lucide-react';

const CommunityVerification = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:8000/claims");
            const data = await res.json();
            setClaims(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    const handleVote = async (claimId, action) => {
        try {
            const formData = new FormData();
            formData.append("action", action);

            const res = await fetch(`http://localhost:8000/verify-claim/${claimId}`, {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                // Optimistic update
                setClaims(claims.map(c => {
                    if (c.claim_id === claimId) {
                        const newVotes = { ...c.community_votes };
                        if (action === 'approve') newVotes.approvals++;
                        if (action === 'reject') newVotes.rejections++;
                        if (action === 'remind') {
                            newVotes.reminders++;
                            c.ai_reminder_sent = true;
                        }
                        return { ...c, community_votes: newVotes };
                    }
                    return c;
                }));
                // Could show toast here
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-900" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-blue-900 uppercase">Community Verification</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Crowdsourced Audit & Validation</p>
                </div>
                <button onClick={fetchClaims} className="text-blue-900 text-xs font-bold hover:underline">Refresh List</button>
            </div>

            {claims.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Users size={40} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-500 font-bold text-sm">No pending claims for verification.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {claims.map((claim) => (
                        <div key={claim.claim_id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-48 bg-slate-100 relative group cursor-pointer">
                                <img
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${claim.image_path.replace('uploaded_images', 'images')}`}
                                    alt="Proof"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-bold text-xs uppercase border border-white px-3 py-1 rounded">View Full Image</span>
                                </div>
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold shadow-sm">
                                    {claim.location.geohash !== "UNKNOWN" ? (
                                        <span className="text-emerald-700 flex items-center gap-1"><Map size={10} /> GEO-VERIFIED</span>
                                    ) : (
                                        <span className="text-amber-600 flex items-center gap-1"><Map size={10} /> NO EXIF DATA</span>
                                    )}
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">₹{Number(claim.amount).toLocaleString()}</h3>
                                        <p className="text-xs text-slate-500 uppercase font-bold">{claim.claimant_name}</p>
                                    </div>
                                    <div className="px-2 py-1 bg-blue-50 text-blue-800 text-[10px] font-bold rounded uppercase">{claim.fund_id}</div>
                                </div>

                                <p className="text-sm text-slate-700 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                    "{claim.description}"
                                </p>

                                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-6">
                                    <div className="flex items-center gap-1 text-emerald-600">
                                        <Check size={14} />
                                        <span>{claim.community_votes.approvals} Verified</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-red-600">
                                        <X size={14} />
                                        <span>{claim.community_votes.rejections} Flagged</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => handleVote(claim.claim_id, 'approve')}
                                        className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all group"
                                    >
                                        <Check size={20} className="mb-1 text-slate-400 group-hover:text-emerald-600" />
                                        <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-emerald-700">Verify</span>
                                    </button>

                                    <button
                                        onClick={() => handleVote(claim.claim_id, 'reject')}
                                        className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all group"
                                    >
                                        <X size={20} className="mb-1 text-slate-400 group-hover:text-red-600" />
                                        <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-red-700">Reject</span>
                                    </button>

                                    <button
                                        onClick={() => handleVote(claim.claim_id, 'remind')}
                                        disabled={claim.ai_reminder_sent}
                                        className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Bell size={20} className={`mb-1 ${claim.ai_reminder_sent ? 'text-blue-600' : 'text-slate-400'} group-hover:text-blue-600`} />
                                        <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-blue-700">
                                            {claim.ai_reminder_sent ? 'Sent' : 'AI Remind'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommunityVerification;
