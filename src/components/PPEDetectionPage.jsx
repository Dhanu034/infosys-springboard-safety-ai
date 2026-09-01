import React, { useState } from 'react';
import { Upload, ShieldCheck, AlertTriangle, Cpu, Sparkles, CheckCircle2, XCircle, Info, Clock, RefreshCw, FileText } from 'lucide-react';
import { analyzeSafetyImage } from '../services/api';

export default function PPEDetectionPage({ selectedProject }) {
  const [zoneName, setZoneName] = useState('General Work Zone');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const zones = [
    { name: 'General Work Zone', helmet: true, vest: false, harness: false, mult: 1.0, icon: '🏗️' },
    { name: 'Excavation Zone', helmet: true, vest: true, harness: false, mult: 1.2, icon: '🚜' },
    { name: 'Vehicle Movement Zone', helmet: true, vest: true, harness: false, mult: 1.3, icon: '🚚' },
    { name: 'Electrical Work Zone', helmet: true, vest: true, harness: false, mult: 1.3, icon: '⚡' },
    { name: 'Work-at-Height Zone', helmet: true, vest: true, harness: true, mult: 1.5, icon: '🪜' },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setErrorMsg(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const data = await analyzeSafetyImage(selectedFile, selectedProject.id, zoneName);
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to analyze image. Please ensure Python FastAPI backend is running on port 8000.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentZoneObj = zones.find(z => z.name === zoneName) || zones[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner Title */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-cyan-400" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">PPE Safety Detection</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Milestone 2 AI Module
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            AI-powered worker PPE compliance analysis using Ultralytics YOLO & Autonomous SafetyAgent.
          </p>
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 pl-2">Active Zone:</span>
          <select
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            className="bg-slate-950 text-xs font-bold text-cyan-300 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
          >
            {zones.map((z) => (
              <option key={z.name} value={z.name} className="bg-slate-900 text-slate-200">
                {z.icon} {z.name} ({z.mult}x Risk)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zone Requirement Rules Card */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Mandatory Zone Rules:</span>
          <span className={`px-2 py-0.5 rounded ${currentZoneObj.helmet ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
            Helmet: {currentZoneObj.helmet ? 'REQUIRED' : 'OPTIONAL'}
          </span>
          <span className={`px-2 py-0.5 rounded ${currentZoneObj.vest ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
            Safety Vest: {currentZoneObj.vest ? 'REQUIRED' : 'OPTIONAL'}
          </span>
          <span className={`px-2 py-0.5 rounded ${currentZoneObj.harness ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'}`}>
            Harness: {currentZoneObj.harness ? 'REQUIRED (Manual Review)' : 'NOT REQUIRED'}
          </span>
        </div>
        <div className="text-slate-400">
          Zone Risk Multiplier: <span className="font-bold text-cyan-400">{currentZoneObj.mult}x</span>
        </div>
      </div>

      {/* Main Upload & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Upload & Control Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4 text-cyan-400" />
              Upload Site Image for Analysis
            </h3>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 transition-colors rounded-xl p-6 text-center bg-slate-950/50 cursor-pointer relative group"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  Drag & Drop site photo or <span className="text-cyan-400 underline">Browse</span>
                </p>
                <p className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP (Max 10MB)</p>
              </div>
            </div>

            {/* Image Preview Box */}
            {previewUrl && (
              <div className="mt-4 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <img src={previewUrl} alt="Upload Preview" className="w-full h-48 object-cover" />
                <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-1 rounded text-[10px] font-mono text-slate-300">
                  Original Upload Ready
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              className={`w-full mt-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                !selectedFile
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : isAnalyzing
                  ? 'bg-cyan-600 text-white cursor-wait animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 glow-cyan'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Running YOLO & SafetyAgent Analysis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze Safety & PPE Compliance</span>
                </>
              )}
            </button>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: YOLO Output & Analysis Results */}
        <div className="lg:col-span-7 space-y-4">
          {!analysisResult && !isAnalyzing && (
            <div className="glass-panel p-12 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[380px]">
              <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-600 flex items-center justify-center mb-4">
                <Cpu className="h-8 w-8" />
              </div>
              <h4 className="text-base font-bold text-slate-300">No Image Analyzed Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Upload a construction site image and click "Analyze Safety" to detect workers, helmets, and vests using YOLO AI.
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="glass-panel p-12 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[380px]">
              <RefreshCw className="h-10 w-10 text-cyan-400 animate-spin mb-4" />
              <h4 className="text-base font-bold text-slate-200">Executing Object Detection Pipeline</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Ultralytics YOLO Inference ➔ Spatial Head/Torso Matching ➔ SafetyAgent Evaluation
              </p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* Summary KPIs Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-mono">Workers Detected</p>
                  <p className="text-xl font-bold text-slate-100 mt-0.5">{analysisResult.total_workers_detected}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-mono">Compliant Workers</p>
                  <p className="text-xl font-bold text-emerald-400 mt-0.5">{analysisResult.compliant_workers_count}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-mono">Violations Found</p>
                  <p className="text-xl font-bold text-red-400 mt-0.5">{analysisResult.violations_detected_count}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-mono">Safety Score</p>
                  <p className="text-xl font-bold text-cyan-400 mt-0.5">{analysisResult.overall_safety_score}%</p>
                </div>
              </div>

              {/* Annotated Image Box */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-cyan-400" /> YOLO Annotated Detection Output
                  </span>
                  <span className="text-slate-400">{analysisResult.processing_time_ms} ms</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img
                    src={analysisResult.annotated_image_url}
                    alt="YOLO Detection Result"
                    className="w-full h-auto max-h-[420px] object-contain mx-auto"
                  />
                </div>
              </div>

              {/* Per-Worker Compliance Cards */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Individual Worker Spatial Analysis Cards
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysisResult.workers_compliance?.map((w) => (
                    <div
                      key={w.anonymous_worker_id}
                      className={`p-3.5 rounded-xl border ${
                        w.decision_status === 'compliant'
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                          : w.decision_status === 'needs_human_review'
                          ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                          : 'bg-red-950/20 border-red-500/40 text-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 font-mono text-xs">
                        <span className="font-bold">{w.anonymous_worker_id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-900 border border-slate-800">
                          {w.decision_status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs space-y-1 mt-2">
                        <div className="flex justify-between text-slate-300">
                          <span>Helmet Detected:</span>
                          <span className={w.has_helmet ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            {w.has_helmet ? 'YES' : 'MISSING'}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Vest Detected:</span>
                          <span className={w.has_vest ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            {w.has_vest ? 'YES' : 'MISSING'}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                          <span>Calculated Risk:</span>
                          <span className="font-bold text-slate-200">{w.final_risk_score}/100 ({w.risk_category})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations Box */}
              {analysisResult.recommendations?.length > 0 && (
                <div className="bg-cyan-950/40 border border-cyan-500/30 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> SafetyAgent Recommendations
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {analysisResult.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mandatory Disclaimer */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <Info className="h-4 w-4 shrink-0 text-amber-400" />
                <span>{analysisResult.disclaimer}</span>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
