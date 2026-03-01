import * as React from 'react';
import { Star, MessageSquare, ShieldCheck } from 'lucide-react';

export const TrustSignals: React.FC = () => {
    const reviews = [
        { name: "Sarah K.", role: "Legal Assistant", comment: "The redaction tool is a lifesaver. Fast and actually removes the data. No. 1 choice.", rating: 5 },
        { name: "Mark T.", role: "Student", comment: "Compressed my 50MB thesis to 2MB without blur. Incredible quality.", rating: 5 },
        { name: "John D.", role: "Real Estate", comment: "Merging 20 contracts took seconds. UI is very clean and Apple-like.", rating: 5 }
    ];

    return (
        <section className="mt-20 py-12 bg-slate-900 rounded-[3rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 blur-[100px]" />

            <div className="px-8 md:px-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Community Trust</h3>
                        <p className="text-slate-400 font-medium">Why 50,000+ professionals choose PDFA2Z</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                        <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                        </div>
                        <span className="text-white font-black text-xl">4.8/5</span>
                        <span className="text-slate-500 text-sm font-bold">1,250+ RATINGS</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((rev, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group">
                            <div className="flex text-amber-500 mb-4 scale-75 origin-left">
                                {[...Array(rev.rating)].map((_, j) => <Star key={j} size={20} fill="currentColor" />)}
                            </div>
                            <p className="text-slate-200 font-medium italic mb-6 leading-relaxed">"{rev.comment}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white font-black text-xs">
                                    {rev.name[0]}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">{rev.name}</p>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{rev.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-40 grayscale contrast-125">
                    <div className="flex items-center gap-2 text-white font-black italic text-lg"><ShieldCheck /> SECURE</div>
                    <div className="flex items-center gap-2 text-white font-black italic text-lg"><MessageSquare /> 24/7 SUPPORT</div>
                    <div className="flex items-center gap-2 text-white font-black italic text-lg"><ShieldCheck /> PRIVACY FIRST</div>
                </div>
            </div>
        </section>
    );
};
