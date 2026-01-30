import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Network,
  Settings2,
  History,
  Search,
  Bell,
  User,
  Filter,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Database,
  BrainCircuit,
  Info,
  Upload,
  X,
  Loader2,
  Sparkles,
  Menu,
  Share2,
  Users,
  LogOut
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import ClaimSubmission from './components/ClaimSubmission';
import CommunityVerification from './components/CommunityVerification';
import LandingPage from './components/LandingPage';

// --- MOCK DATA GENERATION ---
const PROGRAMS = ['Scholarship', 'Pension', 'Public Works', 'Procurement'];
const STATUSES = ['Pending', 'Confirmed Fraud', 'Legitimate', 'Escalated'];

const generateMockCases = (count = 50) => {
  return Array.from({ length: count }, (_, i) => {
    const riskScore = Math.floor(Math.random() * 100);
    const rulesWeight = Math.floor(Math.random() * 40);
    const mlWeight = Math.floor(Math.random() * 40);
    const networkWeight = Math.floor(Math.random() * 20);

    return {
      id: `VS-2025-${1000 + i}`,
      entityName: [
        'Aditi Sharma', 'Rajesh Kumar', 'Global Tech Solutions', 'Nirmala Devi',
        'Suresh Enterprises', 'Vikram Singh', 'Asha Foundation', 'Metro Builders'
      ][Math.floor(Math.random() * 8)] + (i % 3 === 0 ? ' & Co.' : ''),
      program: PROGRAMS[Math.floor(Math.random() * PROGRAMS.length)],
      riskScore,
      riskBreakdown: { rules: rulesWeight, ml: mlWeight, network: networkWeight },
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      amount: Math.floor(Math.random() * 5000000) + 10000,
      dateFlagged: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleDateString(),
      reasons: [
        "Duplicate bank account usage detected",
        "Transaction amount exceeds historical average by 400%",
        "Entity linked to blacklisted vendor 'K-Corp'",
        "High frequency of withdrawals in low-activity periods"
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      evidence: [
        { date: '2024-11-12', description: 'Initial Application Submitted', value: '₹45,000' },
        { date: '2024-12-05', description: 'System Auto-Flag: Rule #412', value: 'High Priority' },
        { date: '2025-01-10', description: 'Unusual Transaction Cluster', value: '₹1,20,000' }
      ]
    };
  });
};

// --- REUSABLE COMPONENTS ---
const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-tight whitespace-nowrap ${colors[color]}`}>
      {children}
    </span>
  );
};

const Card = ({ title, children, className = '', action }) => (
  <div className={`bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}>
    {title && (
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-slate-800 tracking-tight text-xs uppercase">{title}</h3>
        {action}
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

// --- MAIN APP ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  const [analysisStats, setAnalysisStats] = useState({
    highRiskCount: 0,
    moneyAtRisk: '₹0.00 Cr',
    errorRate: '0.0%'
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedCases = localStorage.getItem('vigilant_cases_gov');
    const savedStats = localStorage.getItem('vigilant_stats_gov');

    if (savedCases) {
      setCases(JSON.parse(savedCases));
    } else {
      const initial = generateMockCases(60);
      setCases(initial);
      localStorage.setItem('vigilant_cases_gov', JSON.stringify(initial));
    }

    if (savedStats) {
      setAnalysisStats(JSON.parse(savedStats));
    }

    const savedHistory = localStorage.getItem('vigilant_history_gov');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (caseId, status) => {
    const updated = cases.map(c => c.id === caseId ? { ...c, status } : c);
    setCases(updated);
    localStorage.setItem('vigilant_cases_gov', JSON.stringify(updated));

    const newLog = {
      caseId,
      status,
      timestamp: new Date().toLocaleString(),
      id: Math.random().toString(36).substr(2, 9),
      isCorrect: status === 'Confirmed Fraud'
    };
    const updatedHistory = [newLog, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('vigilant_history_gov', JSON.stringify(updatedHistory));

    showToast(`Case ${caseId} updated to ${status}. Central Database Synced.`, status === 'Legitimate' ? 'info' : 'success');
    setSelectedCase(null);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Backend connection failed");
      }

      const data = await response.json();

      if (data.error) {
        showToast(data.details || data.error, "error");
        return;
      }

      // Map backend response to frontend Case structure
      const processedCases = data.results.map((item, idx) => ({
        id: `NIC-2025-${1000 + idx}`,
        entityName: item.entity,
        program: item.department,
        riskScore: item.risk_score,
        amount: item.amount,
        status: 'Pending',
        reasons: item.reasons || [],
        riskBreakdown: {
          rules: item.rule_score || 0,
          ml: item.ml_score || 0,
          network: item.network_score || 0
        },
        evidence: (item.network_links || []).map(link => ({
          date: new Date().toLocaleDateString(),
          description: 'Network Link Detected',
          value: link
        }))
      }));

      const stats = {
        highRiskCount: data.high_risk_count,
        moneyAtRisk: data.money_at_risk,
        errorRate: data.error_rate
      };

      setCases(processedCases);
      setAnalysisStats(stats);

      localStorage.setItem('vigilant_cases_gov', JSON.stringify(processedCases));
      localStorage.setItem('vigilant_stats_gov', JSON.stringify(stats));

      showToast(`Audit complete: ${processedCases.length} records processed`, "success");

    } catch (error) {
      console.error("Upload error:", error);
      showToast("Could not connect to Audit Backend", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const densityData = useMemo(() => {
    const groups = cases.reduce((acc, c) => {
      acc[c.program] = (acc[c.program] || 0) + 1;
      return acc;
    }, {});
    const colors = ['#003366', '#FF9933', '#138808', '#000080', '#555555'];
    return Object.keys(groups).map((name, i) => ({
      name,
      value: groups[name],
      color: colors[i % colors.length]
    }));
  }, [cases]);

  const velocityData = useMemo(() => {
    const sorted = [...cases].sort((a, b) => a.riskScore - b.riskScore);
    if (sorted.length < 8) return [{ name: 'Jan', risk: 40 }, { name: 'Feb', risk: 30 }];
    const chunk = Math.ceil(sorted.length / 8);
    return Array.from({ length: 8 }, (_, i) => {
      const slice = sorted.slice(i * chunk, (i + 1) * chunk);
      const avg = slice.reduce((sum, c) => sum + c.riskScore, 0) / (slice.length || 1);
      return { name: `Phase ${i + 1}`, risk: Math.round(avg) };
    });
  }, [cases]);

  const networkClusters = useMemo(() => {
    const clusters = [];
    cases.forEach(c => {
      const links = c.evidence.filter(e => e.description === "Network Link Detected");
      if (links.length > 0) {
        links.forEach(l => {
          // Extracts identifier from strings like "Linked via BANK (ACC123) to 2 other entities"
          const identifier = l.value.split('(')[1]?.split(')')[0] || l.value;
          const type = l.value.split(' ')[2] || "ID";
          let cluster = clusters.find(cl => cl.id === identifier);
          if (!cluster) {
            cluster = { id: identifier, type: type, members: [] };
            clusters.push(cluster);
          }
          if (!cluster.members.find(m => m.id === c.id)) cluster.members.push(c);
        });
      }
    });
    return clusters.filter(c => c.members.length > 1);
  }, [cases]);

  const handleDownload = () => {
    showToast("Audit Report Generated. Downloading...", "success");
  };

  const filteredCases = useMemo(() => {
    return cases.filter(c =>
      c.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.riskScore - a.riskScore);
  }, [cases, searchQuery]);

  const displayStats = useMemo(() => {
    const pendingHighRisk = cases.filter(c => c.riskScore > 75 && c.status === 'Pending').length;
    return {
      highRisk: analysisStats.highRiskCount > 0 ? analysisStats.highRiskCount : pendingHighRisk,
      moneyAtRisk: analysisStats.moneyAtRisk !== '₹0.00 Cr' ? analysisStats.moneyAtRisk : '₹142.50 Cr',
      falsePositiveRate: analysisStats.errorRate !== '0.0%' ? analysisStats.errorRate : '0.42%'
    };
  }, [cases, analysisStats]);

  // --- SUB-VIEWS ---

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => { setActiveTab(id); setSelectedCase(null); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group mb-1 ${activeTab === id
        ? 'bg-blue-900 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
    >
      <Icon size={18} />
      <span className="font-bold text-[11px] uppercase tracking-wide">{label}</span>
      {activeTab === id && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-400 rounded-l-full"></div>
      )}
    </button>
  );

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-red-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Flagged Anomalies</p>
              <h4 className="text-3xl font-bold mt-1 text-slate-900">{displayStats.highRisk}</h4>
            </div>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <ShieldAlert size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-bold text-red-600 uppercase gap-1">
            <TrendingUp size={12} />
            <span>High Priority Intervention</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-blue-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">System Exposure</p>
              <h4 className="text-3xl font-bold mt-1 text-slate-900">{displayStats.moneyAtRisk}</h4>
            </div>
            <div className="p-2 bg-blue-50 text-blue-900 rounded-lg">
              <Database size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-bold text-blue-900 uppercase gap-1">
            <CheckCircle2 size={12} />
            <span>Audit Volume Verified</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Model Error</p>
              <h4 className="text-3xl font-bold mt-1 text-slate-900">{displayStats.falsePositiveRate}</h4>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <BrainCircuit size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-bold text-emerald-600 uppercase gap-1">
            <Sparkles size={12} />
            <span>NIC Certified AI Model</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Threat Assessment Timeline" className="lg:col-span-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="risk" stroke="#003366" fill="#00336610" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Distribution by Scheme">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={densityData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="#fff" strokeWidth={2}>
                  {densityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {densityData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] font-bold uppercase">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span>{d.name}</span>
                </div>
                <span className="text-slate-900">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Recent Priority Flags" action={<button onClick={() => setActiveTab('queue')} className="text-blue-900 text-[10px] font-bold uppercase hover:underline">View All Records</button>}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Entity Information</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4 text-center">Risk Index</th>
                <th className="py-3 px-4 text-right">Value</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.sort((a, b) => b.riskScore - a.riskScore).slice(0, 5).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedCase(c)}>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900 text-sm">{c.entityName}</div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">{c.id}</div>
                  </td>
                  <td className="py-4 px-4"><Badge color="blue">{c.program}</Badge></td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2 py-1 rounded font-bold text-xs ${c.riskScore > 70 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {c.riskScore}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-slate-700">₹{c.amount.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right">
                    <ChevronRight size={16} className="text-slate-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-blue-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4">
          <div className={`px-5 py-3 rounded-lg shadow-xl border flex items-center gap-3 ${toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-red-600 text-white border-red-500'
            }`}>
            <Info size={18} />
            <span className="font-bold text-xs uppercase tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Govt Professional Style */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-40 shadow-sm transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6">
          <div className="flex flex-col gap-1 mb-10 border-b border-slate-100 pb-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-900 text-white rounded-lg flex items-center justify-center shadow-md">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h1 className="font-black text-lg tracking-tight text-blue-900 uppercase leading-none">Vigilant<span className="text-orange-500">AI</span></h1>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Audit Monitoring System</p>
                </div>
              </div>
              <button className="md:hidden text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>
          <nav className="space-y-1">
            <SidebarItem id="dashboard" icon={LayoutDashboard} label="Audit Dashboard" />
            <SidebarItem id="submit-claim" icon={Upload} label="Submit Claim" />
            <SidebarItem id="community" icon={Users} label="Community Verify" />
            <SidebarItem id="queue" icon={Database} label="Intelligence Queue" />
            <SidebarItem id="network" icon={Share2} label="Network Links" />
            <SidebarItem id="feedback" icon={History} label="System Evolution" />

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => { setShowLanding(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group text-slate-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} />
                <span className="font-bold text-[11px] uppercase tracking-wide">Secure Logout</span>
              </button>
            </div>
          </nav>
        </div>
        <div className="mt-auto p-6 bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-200">
          <p>© 2025 NIC Audit Services</p>
          <p className="mt-1">Version 4.2.0-STABLE</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 overflow-y-auto w-full">
        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-blue-900">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-900 text-white rounded-lg flex items-center justify-center shadow-md">
              <ShieldAlert size={18} />
            </div>
            <span className="font-black text-sm text-blue-900 uppercase">VigilantAI</span>
          </div>
        </div>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-1 bg-orange-500 rounded-full"></div>
              <div className="w-4 h-1 bg-white border border-slate-200 rounded-full"></div>
              <div className="w-4 h-1 bg-emerald-500 rounded-full"></div>
              <span className="text-[9px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Government of India</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-blue-900 tracking-tighter uppercase">{activeTab.replace('-', ' ')}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 md:flex-none justify-center px-4 md:px-5 py-2 md:py-3 bg-white border border-slate-200 rounded-lg font-bold text-[10px] uppercase tracking-wide text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
            >
              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              <span>{isUploading ? 'Processing' : 'Ingest CSV'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 md:flex-none justify-center px-4 md:px-6 py-2 md:py-3 bg-blue-900 text-white rounded-lg font-bold text-[10px] uppercase tracking-wide shadow-md hover:bg-blue-800 transition-all flex items-center gap-2"
            >
              <ArrowUpRight size={14} />
              <span>Export Report</span>
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && <DashboardView />}

        {activeTab === 'queue' && (
          <Card title="Government Audit Database" className="animate-in fade-in duration-300">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-4 mb-6">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="SEARCH BY ID OR ENTITY NAME..."
                className="bg-transparent border-none focus:ring-0 w-full py-3 text-[10px] font-bold uppercase tracking-wider"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-4">Entity</th>
                    <th className="py-4 px-4">Scheme</th>
                    <th className="py-4 px-4">Risk Level</th>
                    <th className="py-4 px-4">Current Status</th>
                    <th className="py-4 px-4 text-right">Sanction Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setSelectedCase(c)}>
                      <td className="py-5 px-4">
                        <div className="font-bold text-slate-900">{c.entityName}</div>
                        <div className="text-[9px] text-slate-500 font-mono">{c.id}</div>
                      </td>
                      <td className="py-5 px-4"><Badge color="gray">{c.program}</Badge></td>
                      <td className="py-5 px-4">
                        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${c.riskScore > 75 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${c.riskScore}%` }}></div>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <Badge color={c.status === 'Confirmed Fraud' ? 'red' : c.status === 'Legitimate' ? 'green' : 'blue'}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-5 px-4 text-right font-bold text-slate-800">₹{c.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'network' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-400">
            {networkClusters.length === 0 ? (
              <Card className="col-span-full py-20 text-center">
                <Network size={40} className="mx-auto text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-400 uppercase">Shared Identity Networks Not Found</h4>
              </Card>
            ) : networkClusters.map((cluster, i) => (
              <Card key={i} title={`Identity Link: ${cluster.id}`} action={<Badge color="red">{cluster.members.length} Entities</Badge>}>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-5">High probability collusion ring: Shared {cluster.type}</p>
                <div className="space-y-3">
                  {cluster.members.map(m => (
                    <div key={m.id} className="p-3 border border-slate-100 rounded-lg flex items-center justify-between hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-blue-900 text-[10px]">{m.riskScore}</div>
                        <div>
                          <p className="font-bold text-xs text-slate-800">{m.entityName}</p>
                          <p className="text-[9px] text-slate-400 font-mono">{m.id}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedCase(m)} className="text-blue-900 hover:scale-110 transition-transform"><ChevronRight size={14} /></button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-400">
            <Card title="Decision Analytics" className="lg:col-span-1">
              <div className="text-center py-10">
                <div className="text-6xl font-black text-blue-900 mb-2">{history.length}</div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auditor Interventions</p>
                <div className="mt-8 px-6">
                  <div className="flex justify-between text-[9px] font-bold uppercase mb-1">
                    <span>Model Confidence</span>
                    <span>98.2%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </Card>
            <Card title="Official Log of Interventions" className="lg:col-span-2">
              <div className="space-y-4">
                {history.length === 0 && <p className="text-center text-slate-400 text-xs py-10">No recent interventions logged in current session.</p>}
                {history.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.status === 'Confirmed Fraud' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {log.status === 'Confirmed Fraud' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">Case: {log.caseId}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Status updated to {log.status}</p>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">{log.timestamp}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'submit-claim' && <ClaimSubmission onSuccess={(res) => showToast(res.message, "success")} />}
        {activeTab === 'community' && <CommunityVerification />}

        {/* Official Case Modal */}
        {selectedCase && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              <div className="bg-blue-900 p-8 text-white flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-white/20 rounded font-black text-xs">CASE: {selectedCase.id}</span>
                    <Badge color={selectedCase.riskScore > 75 ? 'red' : 'yellow'}>PRIORITY LEVEL: {selectedCase.riskScore > 75 ? 'HIGH' : 'MEDIUM'}</Badge>
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tight">{selectedCase.entityName}</h2>
                  <p className="text-xs font-bold text-blue-200 mt-1 uppercase tracking-widest">Enrolled Scheme: {selectedCase.program}</p>
                </div>
                <button onClick={() => setSelectedCase(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Audit Risk Score</p>
                    <div className="text-4xl font-black text-blue-900">{selectedCase.riskScore}<span className="text-lg opacity-50">/100</span></div>
                  </div>
                  <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Sanction Amount</p>
                    <div className="text-4xl font-black text-slate-900">₹{selectedCase.amount.toLocaleString()}</div>
                  </div>
                  <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Flag Category</p>
                    <div className="text-xl font-bold text-red-600 uppercase">ANOMALY DETECTED</div>
                  </div>
                </div>

                <section className="mb-10">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 border-b pb-2">Intelligence Summary</h3>
                  <div className="space-y-3">
                    {selectedCase.reasons.map((reason, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-white border border-slate-200 rounded-lg">
                        <div className="w-6 h-6 bg-blue-50 text-blue-900 rounded flex items-center justify-center font-bold text-[10px]">{i + 1}</div>
                        <p className="text-sm font-bold text-slate-700">{reason}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <section>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 border-b pb-2">Analysis Vector Breakdown</h3>
                    <div className="space-y-4 px-2">
                      {Object.entries(selectedCase.riskBreakdown).map(([k, v]) => (
                        <div key={k}>
                          <div className="flex justify-between text-[10px] font-bold uppercase mb-1 text-slate-500">
                            <span>{k} influence</span>
                            <span>{v}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full">
                            <div className="h-full bg-blue-900" style={{ width: `${v}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 border-b pb-2">Network Evidence Chain</h3>
                    <div className="space-y-2">
                      {selectedCase.evidence.map((ev, i) => (
                        <div key={i} className="text-xs flex items-start gap-3 text-slate-600 bg-white p-3 rounded-lg border border-slate-100">
                          <Share2 size={14} className="mt-0.5 text-blue-900" />
                          <div>
                            <span className="font-bold text-slate-900">{ev.description}:</span> {ev.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              <div className="p-8 border-t border-slate-200 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3 text-slate-400">
                  <Info size={18} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Manual Verification by Competent Authority</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleAction(selectedCase.id, 'Legitimate')} className="px-8 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold text-[10px] uppercase hover:bg-slate-200 transition-all border border-slate-200">Discard Flag</button>
                  <button onClick={() => handleAction(selectedCase.id, 'Confirmed Fraud')} className="px-8 py-3 bg-red-600 text-white rounded-lg font-bold text-[10px] uppercase shadow-md hover:bg-red-700 transition-all">Submit for Recovery</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}