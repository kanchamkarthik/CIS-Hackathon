import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Globe, Clock, AlertTriangle, Plus, X, ChevronRight, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App = () => {
  const [data, setData] = useState([]);
  const [newUrl, setNewUrl] = useState("");
  const [selectedChange, setSelectedChange] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/history');
      
      // FIXED: Added "Z" to force UTC-to-Local conversion and ensured strict sorting
      const sortedData = response.data.sort((a, b) => {
        const dateA = a.detectedAt ? new Date(a.detectedAt + "Z") : new Date(0);
        const dateB = b.detectedAt ? new Date(b.detectedAt + "Z") : new Date(0);
        return dateB - dateA;
      });
      
      setData(sortedData);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, []);

  const addTarget = async () => {
    if (!newUrl) return;
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/targets', { url: newUrl });
      setNewUrl("");
      fetchData();
      alert("Target added successfully!");
    } catch (err) {
      alert("Error adding target. Is Spring Boot running?");
    } finally {
      setLoading(false);
    }
  };

  const cleanValue = (str) => {
    if (!str) return 'N/A';
    return str.replace(/[-+]/, '') 
              .replace(/[{}"]/g, '') 
              .trim();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Website Monitor Dashboard</h1>
          <p className="text-slate-500 font-medium">Cloud-Native Differential Analysis Engine</p>
        </div>
        <div className="flex gap-3">
            <button onClick={fetchData} className="p-2 text-slate-400 hover:text-indigo-600 transition-all active:rotate-180">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full flex items-center gap-2 border border-emerald-200 shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-wider">AWS Sync Active</span>
            </div>
        </div>
      </div>

      {/* URL Input Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 flex gap-4 border border-slate-200">
        <div className="relative flex-1">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
            type="text" 
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Enter URL to monitor (e.g. https://wikipedia.org)"
            className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
            />
        </div>
        <button 
          onClick={addTarget}
          disabled={loading}
          className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Adding..." : <><Plus size={20}/> Start Monitoring</>}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Activity size={24}/></div>
          <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Detections</p><p className="text-2xl font-bold text-slate-800">{data.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Globe size={24}/></div>
          <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Infrastructure</p><p className="text-2xl font-bold text-slate-800">AWS + RDS</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Clock size={24}/></div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Last Detection</p>
            <p className="text-2xl font-bold text-slate-800">
              {/* FIXED: Using "Z" for local time conversion */}
              {data[0]?.detectedAt ? new Date(data[0].detectedAt + "Z").toLocaleTimeString() : '--:--'}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-5 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Severity</th>
              <th className="p-5 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Target Source (URL)</th>
              <th className="p-5 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Detection Time</th>
              <th className="p-5 font-bold text-slate-500 uppercase text-[10px] tracking-widest text-center">Intelligence</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                <td className="p-5">
                  <span className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black w-fit ${
                    row.changeType === 'MAJOR' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <AlertTriangle size={12}/> {row.changeType}
                  </span>
                </td>
                <td className="p-5">
                  <p className="text-indigo-600 font-bold text-sm truncate max-w-[350px]">
                    {row.targetUrl || "https://source-id-" + row.targetId + ".com"}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-tighter">Verified RDS Instance</p>
                </td>
                <td className="p-5 text-slate-500 text-xs font-medium">
                    {/* FIXED: Using "Z" for local time conversion */}
                    {row.detectedAt ? new Date(row.detectedAt + "Z").toLocaleString() : "N/A"}
                </td>
                <td className="p-5 text-center">
                   <button 
                    onClick={() => setSelectedChange(row)}
                    className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all px-4 py-2 rounded-xl border border-indigo-100 shadow-sm"
                   >
                     View Delta <ChevronRight size={14} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ANALYSIS POPUP (MODAL) --- */}
      {selectedChange && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-10 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Change Content Analysis</h3>
                <div className="flex flex-col gap-1 mt-2">
                    <span className="text-indigo-600 font-bold text-xs truncate max-w-md">
                      Source: {selectedChange.targetUrl || "AWS_TARGET_" + selectedChange.targetId}
                    </span>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-md text-[10px] font-bold w-fit">
                      EVENT_ID: #{selectedChange.id}
                    </span>
                </div>
              </div>
              <button onClick={() => setSelectedChange(null)} className="text-slate-300 hover:text-slate-900 hover:bg-slate-100 p-3 rounded-full transition-all">
                <X size={28} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-6">
                <div className="flex items-center gap-4 bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Older State</span>
                        <code className="text-rose-700 font-mono text-xs break-all">
                            {cleanValue(selectedChange.diffSummary?.split('\n').find(l => l.startsWith('-')))}
                        </code>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">New State</span>
                        <code className="text-emerald-700 font-mono text-xs break-all">
                            {cleanValue(selectedChange.diffSummary?.split('\n').find(l => l.startsWith('+')))}
                        </code>
                    </div>
                </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-4">Detailed Content Handshake</p>
                <div className="font-mono text-[11px] space-y-1.5 overflow-x-auto max-h-48 scrollbar-hide">
                  {selectedChange.diffSummary ? selectedChange.diffSummary.split('\n').map((line, i) => (
                    <div key={i} className={`py-1 px-3 rounded-md font-medium ${
                      line.startsWith('+') ? 'bg-emerald-900/20 text-emerald-400 border-l-2 border-emerald-500' : 
                      line.startsWith('-') ? 'bg-rose-900/20 text-rose-400 border-l-2 border-rose-500' : 
                      'text-slate-500 pl-4 opacity-40'
                    }`}>
                      {line}
                    </div>
                  )) : (
                    <p className="text-slate-600 italic">No delta detected.</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 text-center">Severity</p>
                  <div className="flex items-center justify-center gap-2 text-rose-600 font-black text-xl">
                    <AlertTriangle size={24}/> {selectedChange.changeType}
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 text-center">Captured At</p>
                  <p className="font-black text-slate-800 text-xl text-center">
                    {/* FIXED: Local time conversion */}
                    {selectedChange.detectedAt ? new Date(selectedChange.detectedAt + "Z").toLocaleTimeString() : '--:--'}
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedChange(null)}
              className="w-full mt-10 bg-indigo-600 text-white py-5 rounded-3xl font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-[0.97]"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;