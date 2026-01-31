import React, { useState, useEffect } from 'react';
import { Map, AlertTriangle, CheckCircle2, ChevronRight, Activity, Globe, Loader2, ArrowRight } from 'lucide-react';

const SATELLITE_DATA = [
    {
        id: 'PROJ-ROAD-001',
        name: 'Pradhan Mantri Gram Sadak Yojana (PMGSY) - Phase 4',
        location: 'Rampur, Uttar Pradesh',
        status: 'Active',
        funds_released: '₹45,00,000',
        images: {
            before: '/images/sat_road_before_1769834443330.png',
            after: '/images/sat_road_after_1769834458709.png'
        },
        type: 'valid'
    },
    {
        id: 'PROJ-HALL-002',
        name: 'Community Hall Construction - Block B',
        location: 'Sitapur, Bihar',
        status: 'Flagged',
        funds_released: '₹12,00,000',
        images: {
            before: '/images/sat_field_before_1769834475300.png',
            after: '/images/sat_field_before_1769834475300.png' // Intentional duplicate for fraud
        },
        type: 'fraud'
    }
];

const SatelliteAnalysis = () => {
    const [selectedProject, setSelectedProject] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [sliderPosition, setSliderPosition] = useState(50);
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleAnalyze = (project) => {
        setSelectedProject(project);
        setAnalysisResult(null);
        setAnalyzing(true);
        setSliderPosition(50);

        // Simulate Satellite Lock & AI Processing
        setTimeout(() => {
            setAnalyzing(false);
            setAnalysisResult(project.type === 'valid' ? {
                status: 'VERIFIED',
                confidence: '98.5%',
                message: 'Significant physical infrastructure change detected consistent with road construction patterns.',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                icon: CheckCircle2
            } : {
                status: 'CRITICAL ANOMALY',
                confidence: '99.9%',
                message: 'Zero physical change detected despite 80% fund utilization. Potential Ghost Project.',
                color: 'text-red-600',
                bg: 'bg-red-50',
                icon: AlertTriangle
            });
        }, 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-blue-900 uppercase">Satellite Surveillance</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">AI-Powered Temporal Analysis</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    <Globe size={14} className="animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">ISRO-Bhuvan Link Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Project List */}
                <div className="lg:col-span-1 space-y-4">
                    {SATELLITE_DATA.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => !analyzing && handleAnalyze(project)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedProject?.id === project.id
                                    ? 'bg-blue-50 border-blue-500 shadow-md transform scale-[1.02]'
                                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded inline-block">
                                    {project.id}
                                </span>
                                {project.type === 'fraud' && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full flex items-center gap-1"><AlertTriangle size={10} /> High Risk</span>}
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm mb-1">{project.name}</h3>
                            <p className="text-xs text-slate-500 font-medium mb-3">{project.location}</p>
                            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                                <span>Funds: <span className="text-slate-700">{project.funds_released}</span></span>
                                <ChevronRight size={14} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Analysis Area */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedProject ? (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            {analyzing ? (
                                <div className="h-96 flex flex-col items-center justify-center bg-slate-900 text-white">
                                    <Globe size={48} className="text-blue-500 animate-spin mb-6" />
                                    <h3 className="text-xl font-bold uppercase tracking-widest mb-2">Acquiring Satellite Lock</h3>
                                    <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 animate-progress"></div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-4 font-mono">Analyzing Temporal Differences (T-90 Days vs T-0)...</p>
                                </div>
                            ) : (
                                <div>
                                    {/* Split View Slider */}
                                    <div className="relative h-80 select-none overflow-hidden group">
                                        {/* After Image (Background) */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url(${selectedProject.images.after})` }}
                                        ></div>

                                        {/* Before Image (Foreground with Clip) */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center border-r-4 border-white shadow-2xl"
                                            style={{
                                                backgroundImage: `url(${selectedProject.images.before})`,
                                                width: `${sliderPosition}%`
                                            }}
                                        ></div>

                                        {/* Slider Handle */}
                                        <div
                                            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 hover:bg-blue-400 transition-colors"
                                            style={{ left: `${sliderPosition}%` }}
                                        >
                                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-slate-200">
                                                <Activity size={16} className="text-blue-600" />
                                            </div>
                                        </div>

                                        {/* Labels */}
                                        <span className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-sm border border-white/20">
                                            Oct 2025 (Before)
                                        </span>
                                        <span className="absolute top-4 right-4 bg-blue-600/80 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-sm shadow-lg border border-white/20">
                                            Jan 2026 (Current)
                                        </span>

                                        {/* Interactive Area */}
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={sliderPosition}
                                            onChange={(e) => setSliderPosition(e.target.value)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                                        />
                                    </div>

                                    {/* Analysis Result */}
                                    {analysisResult && (
                                        <div className={`p-8 ${analysisResult.bg}`}>
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-xl ${analysisResult.color.replace('text', 'bg')}/10 flex items-center justify-center shrink-0`}>
                                                    <analysisResult.icon className={analysisResult.color} size={24} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className={`text-xl font-black uppercase ${analysisResult.color}`}>{analysisResult.status}</h3>
                                                        <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded uppercase">AI Confidence: {analysisResult.confidence}</span>
                                                    </div>
                                                    <p className="text-slate-700 font-medium leading-relaxed">
                                                        {analysisResult.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                            <Map size={48} className="text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-600 mb-2">Select a Project to Audit</h3>
                            <p className="text-sm text-slate-400 max-w-sm">
                                Choose a project from the left panel to initiate temporal satellite analysis and change detection.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SatelliteAnalysis;
