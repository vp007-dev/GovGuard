import React, { useState, useEffect } from 'react';
import { Shield, Activity, ArrowRight, BarChart3, Users, FileCheck, CheckCircle2, Building2, Lock, Cpu, Network, HelpCircle, ChevronDown, FileText } from 'lucide-react';

const LandingPage = ({ onEnter }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen font-sans bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">

            {/* --- NAVBAR --- */}
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-slate-200">
                            <Shield className="text-white w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-lg tracking-tight uppercase text-slate-900 leading-none">Vigilant<span className="text-blue-600">AI</span></span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Govt. of India Initiative</span>
                        </div>
                    </div>
                    <div className="hidden lg:flex gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        <a href="#mission" className="hover:text-blue-600 transition-colors">Mission</a>
                        <a href="#capabilities" className="hover:text-blue-600 transition-colors">Capabilities</a>
                        <a href="#ecosystem" className="hover:text-blue-600 transition-colors">Ecosystem</a>
                        <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
                    </div>
                    <button
                        onClick={onEnter}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all shadow-md hover:shadow-blue-200 active:translate-y-0.5"
                    >
                        Official Login
                    </button>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="pt-40 pb-24 relative">
                <div className={`container mx-auto px-6 relative z-10 transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-8 border border-slate-200 hover:border-slate-300 transition-colors cursor-default">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span>System Operational • V4.2.0 Stable</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[1]">
                            Public Oversight, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-blue-400">Reimagined.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                            An autonomous AI infrastructure designed to secure public funds, verify infrastructure, and ensuring 100% downstream accountability.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                            <button
                                onClick={onEnter}
                                className="w-full sm:w-auto px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold uppercase tracking-wide transition-all shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-1"
                            >
                                Access Dashboard
                            </button>
                            <button className="w-full sm:w-auto px-10 py-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 group">
                                <span>Read the Whitepaper</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- STATS STRIP --- */}
            <div className="border-y border-slate-100 bg-slate-50/80 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { label: "Funds Protected", val: "₹450 Cr+", icon: BarChart3, desc: "Cumulative Value" },
                            { label: "Claims Audited", val: "12,405", icon: FileCheck, desc: "Since Jan 2025" },
                            { label: "Active Nodes", val: "850+", icon: Users, desc: "Across 28 States" },
                            { label: "Compliance Rate", val: "99.8%", icon: CheckCircle2, desc: "Algorithm Verified" }
                        ].map((stat, i) => (
                            <div key={i} className={`text-center group transition-all duration-700 delay-[${i * 100}ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2 group-hover:text-blue-600 transition-colors">{stat.val}</div>
                                <div className="flex flex-col items-center">
                                    <div className="text-[11px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-1">
                                        <stat.icon size={14} className="text-blue-600" />
                                        {stat.label}
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{stat.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- MISSION STATEMENT --- */}
            <section id="mission" className="py-32 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em] mb-6">Our Core Mission</h2>
                        <p className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
                            "To establish a zero-tolerance framework for fiscal leakage through algorithmic transparency and decentralized community verification."
                        </p>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mx-auto"></div>
                    </div>
                </div>
            </section>

            {/* --- SYSTEM CAPABILITIES --- */}
            <section id="capabilities" className="py-24 bg-slate-50 border-y border-slate-200">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">System Capabilities</h2>
                            <p className="text-slate-500 max-w-md font-medium">Deployed modules currently active across the national infrastructure grid.</p>
                        </div>
                        <button className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline flex items-center gap-2">
                            View Module Status <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Network,
                                title: "Pattern Recognition",
                                desc: "Identifies circular trading, duplicate beneficiaries, and anomalous withdrawal frequencies using graph neural networks."
                            },
                            {
                                icon: Lock,
                                title: "Immutable Audit Trails",
                                desc: "Every action, from claim submission to fund disbursement, is cryptographically signed and stored."
                            },
                            {
                                icon: Cpu,
                                title: "Predictive Risk Modeling",
                                desc: "Scores new projects based on contractor history, region-specific risk factors, and satellite imagery analysis."
                            },
                            {
                                icon: CheckCircle2,
                                title: "Crowdsourced Validation",
                                desc: "Empowers local citizens to act as 'nodes' in the verification network, earning trust scores for accurate reporting."
                            },
                            {
                                icon: FileText,
                                title: "Automated Compliance",
                                desc: "Parses thousands of invoices and receipts instantly, checking against approved rate cards and tender documents."
                            },
                            {
                                icon: Building2,
                                title: "Inter-Departmental Sync",
                                desc: "Breaks data silos by connecting PFMS, GSTN, and Banking servers in a unified data lake."
                            }
                        ].map((item, i) => (
                            <div key={i} className="group p-10 bg-white rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                                <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- INTEGRATION ECOSYSTEM --- */}
            <section id="ecosystem" className="py-32 overflow-hidden">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-12">Seamlessly Integrated With National Infrastructure</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                        {/* Mock Logos - Text representation for minimalist feel */}
                        <div className="text-2xl font-black text-slate-300 hover:text-blue-900 transition-colors cursor-default">PFMS</div>
                        <div className="text-2xl font-black text-slate-300 hover:text-blue-900 transition-colors cursor-default">NREGASoft</div>
                        <div className="text-2xl font-black text-slate-300 hover:text-blue-900 transition-colors cursor-default">GSTN</div>
                        <div className="text-2xl font-black text-slate-300 hover:text-blue-900 transition-colors cursor-default">UIDAI</div>
                        <div className="text-2xl font-black text-slate-300 hover:text-blue-900 transition-colors cursor-default">NPCI</div>
                    </div>
                </div>
            </section>

            {/* --- FAQ SECTION --- */}
            <section id="faq" className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="container mx-auto px-6 max-w-3xl">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-12 text-center">Frequently Asked Questions</h2>

                    <div className="space-y-4">
                        {[
                            {
                                q: "How does the geo-tagging verification ensure authenticity?",
                                a: "Our system captures raw sensor data (GPS, Accelerometer, Magnetometer) alongside the image file. We use steganography to embed this metadata, making it tampering-evident. Additionally, we cross-reference the GPS coordinates with the project's sanctioned geofence."
                            },
                            {
                                q: "Is the data stored securely?",
                                a: "Yes. All data is encrypted at rest using AES-256 standards and in transit using TLS 1.3. We utilize a private permissioned blockchain for audit trails, ensuring that once a record is written, it cannot be altered."
                            },
                            {
                                q: "Can citizens participate in the audit process?",
                                a: "Absolutely. Through the Community Verification module, registered citizens can view public project details in their vicinity and upload photos/status reports. Consistent accuracy earns citizens 'Trust Badges' and potential rewards."
                            },
                            {
                                q: "What happens if a fraud is detected?",
                                a: "The system immediately freezes the fund disbursement and flags the case for 'High Priority' manual review. An automated report is generated and sent to the district nodal officer and the oversight committee."
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors">
                                <button
                                    onClick={() => toggleFaq(i)}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <span className="font-bold text-sm text-slate-900">{item.q}</span>
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-6 pt-0 text-sm text-slate-500 leading-relaxed font-medium border-t border-slate-50">
                                        {item.a}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- BOTTOM CTA --- */}
            <section className="py-32 bg-slate-900 text-white text-center">
                <div className="container mx-auto px-6">
                    <Activity size={48} className="mx-auto text-blue-500 mb-8" />
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8">Ready to Secure the Future?</h2>
                    <p className="text-slate-400 mb-12 max-w-xl mx-auto text-lg">Join the network of 850+ auditors and officers ensuring the integrity of our nation's development.</p>
                    <button
                        onClick={onEnter}
                        className="px-12 py-5 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-colors shadow-2xl shadow-white/10"
                    >
                        Login to VigilantAI
                    </button>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-12 bg-white text-center border-t border-slate-200">
                <div className="container mx-auto px-6">
                    <div className="flex justify-center items-center gap-2 mb-6 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="India Emblem" className="h-8" />
                        <div className="text-left">
                            <div className="text-[10px] font-bold text-slate-900 uppercase tracking-widest leading-none">National Informatics Centre</div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Ministry of Electronics & IT</div>
                        </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest space-x-6 mb-8">
                        <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Terms of Use</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Accessibility</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Sitemap</a>
                    </div>
                    <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                        &copy; 2025 VigilantAI System. Built for India.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
