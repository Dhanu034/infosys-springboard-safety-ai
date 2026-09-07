import React, { useState } from 'react';
import { Upload, ShieldCheck, AlertTriangle, Cpu, Sparkles, CheckCircle2, XCircle, Info, Clock, RefreshCw, HardHat, FileText, Check, AlertOctagon } from 'lucide-react';
import { analyzeSafetyImage } from '../services/api';
import ChartPanel from './ui/ChartPanel';
import MetricCard from './ui/MetricCard';
import RiskBadge from './ui/RiskBadge';
import StatusPill from './ui/StatusPill';
import BilingualLabel from './ui/BilingualLabel';
import EmptyState from './ui/EmptyState';
import LoadingState from './ui/LoadingState';

/**
 * PPEDetectionPage Component (Phase 3 Redesign)
 * Milestone 2 Vision Inference workspace styled with Industrial Precision Glassmorphism.
 */
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
      <div className="glass-panel p-6 border-accent-cyan flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shrink-0 glow-cyan">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <BilingualLabel
                  en="PPE Safety Vision Detector"
                  ta="பாதுகாப்பு கவசம் AI ஆய்வு"
                  enClassName="text-xl font-bold tracking-tight text-slate-100 font-sans"
                />
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Milestone 2 Active
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                YOLOv8 Computer Vision Object Detection & Autonomous Multi-Worker SafetyAgent
              </p>
            </div>
          </div>
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-2 bg-[#0b0f10] border border-slate-800 p-2 rounded-xl">
          <span className="text-xs font-mono font-semibold text-slate-400 pl-2">Active Zone:</span>
          <select
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            className="bg-slate-900 text-xs font-mono font-bold text-cyan-300 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
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
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-slate-400">Mandatory Rules:</span>
          <span className={`px-2.5 py-0.5 rounded-full border ${currentZoneObj.helmet ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            Helmet: {currentZoneObj.helmet ? 'REQUIRED' : 'OPTIONAL'}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full border ${currentZoneObj.vest ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            Safety Vest: {currentZoneObj.vest ? 'REQUIRED' : 'OPTIONAL'}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full border ${currentZoneObj.harness ? 'bg-amber-500/15 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            Harness: {currentZoneObj.harness ? 'REQUIRED' : 'NOT REQUIRED'}
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
          <ChartPanel
            title="Upload Site Image for Analysis"
            titleTa="தள புகைப்பட பதிவேற்றம்"
            icon={Upload}
          >
            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 transition-colors rounded-xl p-6 text-center bg-[#0b0f10]/80 cursor-pointer relative group"
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
                <p className="text-[11px] font-mono text-slate-500">Supports JPG, PNG, WEBP (Max 10MB)</p>
              </div>
            </div>

            {/* Image Preview Box */}
            {previewUrl && (
              <div className="mt-4 relative rounded-xl overflow-hidden border border-slate-800 bg-[#0b0f10]">
                <img src={previewUrl} alt="Upload Preview" className="w-full h-48 object-cover" />
                <div className="absolute bottom-2 left-2 bg-[#0b0f10]/90 px-2 py-1 rounded text-[10px] font-mono text-cyan-300 border border-slate-800">
                  Original Upload Ready
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              className={`w-full mt-4 py-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all border ${
                !selectedFile
                  ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                  : isAnalyzing
                  ? 'bg-cyan-600 text-slate-950 border-cyan-400 cursor-wait animate-pulse'
                  : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 border-cyan-300 shadow-lg glow-cyan font-black'
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
              <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-mono">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </ChartPanel>
        </div>

        {/* Right Column: YOLO Output & Analysis Results */}
        <div className="lg:col-span-7 space-y-4">
          {!analysisResult && !isAnalyzing && (
            <EmptyState
              title="No Image Analyzed Yet"
              titleTa="படம் எதுவும் பகுப்பாய்வு செய்யப்படவில்லை"
              message="Upload a construction site image and click 'Analyze Safety' to detect workers, hardhats, vests, and calculate risk."
              icon={Cpu}
              className="min-h-[380px]"
            />
          )}

          {isAnalyzing && (
            <LoadingState
              message="Executing Object Detection & Spatial Matching..."
              messageTa="YOLO மாதிரி இயங்குகிறது..."
              className="min-h-[380px]"
            />
          )}

          {analysisResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* Summary KPIs Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-panel p-3.5 border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-mono">Workers Detected</p>
                  <p className="text-2xl font-bold font-mono text-slate-100 mt-0.5">{analysisResult.total_workers_detected}</p>
                </div>
                <div className="glass-panel p-3.5 border-accent-low">
                  <p className="text-[11px] text-emerald-400/80 font-mono">Compliant Workers</p>
                  <p className="text-2xl font-bold font-mono text-emerald-300 mt-0.5">{analysisResult.compliant_workers_count}</p>
                </div>
                <div className="glass-panel p-3.5 border-accent-critical">
                  <p className="text-[11px] text-red-400/80 font-mono">Violations Found</p>
                  <p className="text-2xl font-bold font-mono text-red-300 mt-0.5">{analysisResult.violations_detected_count}</p>
                </div>
                <div className="glass-panel p-3.5 border-accent-cyan">
                  <p className="text-[11px] text-cyan-400/80 font-mono">Safety Score</p>
                  <p className="text-2xl font-bold font-mono text-cyan-300 mt-0.5">{analysisResult.overall_safety_score}%</p>
                </div>
              </div>

              {/* Annotated Image Box */}
              <ChartPanel
                title="YOLO Annotated Detection Output"
                titleTa="கண்டறிதல் வெளியீடு"
                icon={Sparkles}
                badge={
                  <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {analysisResult.processing_time_ms} ms
                  </span>
                }
              >
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0b0f10]">
                  <img
                    src={analysisResult.annotated_image_url}
                    alt="YOLO Detection Result"
                    className="w-full h-auto max-h-[420px] object-contain mx-auto"
                  />
                </div>
              </ChartPanel>

              {/* Per-Worker Compliance Cards */}
              <ChartPanel
                title="Individual Worker Spatial Analysis Cards"
                titleTa="தனிப்பட்ட தொழிலாளர் இணக்க மதிப்பீடு"
                icon={HardHat}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysisResult.workers_compliance?.map((w) => (
                    <div
                      key={w.anonymous_worker_id}
                      className={`p-4 rounded-xl border glass-panel ${
                        w.decision_status === 'compliant'
                          ? 'border-accent-low bg-emerald-950/10'
                          : w.decision_status === 'needs_human_review'
                          ? 'border-accent-cyan bg-cyan-950/10'
                          : 'border-accent-critical bg-red-950/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 font-mono text-xs">
                        <span className="font-bold text-slate-100">{w.anonymous_worker_id}</span>
                        <StatusPill status={w.decision_status.replace('_', ' ')} />
                      </div>
                      <div className="text-xs space-y-1.5 font-mono">
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
                        <div className="flex justify-between text-slate-400 text-[11px] pt-1.5 border-t border-slate-800">
                          <span>Calculated Risk:</span>
                          <span className="font-bold text-slate-200">{w.final_risk_score}/100 ({w.risk_category})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartPanel>

              {/* Recommendations Box */}
              {analysisResult.recommendations?.length > 0 && (
                <div className="glass-panel border-accent-cyan p-4">
                  <h4 className="text-xs font-bold font-mono text-cyan-300 mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-cyan-400" /> SafetyAgent Recommendations
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-200 font-sans">
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
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 font-mono">
                <Info className="h-4 w-4 shrink-0 text-amber-400" />
                <span>{analysisResult.disclaimer || "AI detections are decision-support signals and require safety supervisor verification."}</span>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
