import React, { useState, useRef } from 'react';
import { 
  Video, Upload, ShieldCheck, AlertTriangle, Cpu, Sparkles, 
  CheckCircle2, XCircle, Info, Clock, RefreshCw, HardHat, 
  FileText, Check, AlertOctagon, Film, Layers, Play, ExternalLink,
  ChevronRight, Calendar, AlertCircle, Eye, BarChart3
} from 'lucide-react';
import { analyzeSafetyVideo } from '../../services/api';

/**
 * VideoSafetyAnalysisPanel Component (Post-Milestone 4 Enhancement)
 * 
 * Scope: Offline Uploaded Video Footage Analysis ONLY.
 * NOT live CCTV, RTSP, or webcam streaming.
 * Label: "Video Safety Analysis — Offline Footage"
 */
export default function VideoSafetyAnalysisPanel({ selectedProject, onNavigateTab }) {
  const [projectId, setProjectId] = useState(selectedProject?.id || 'PRJ-101');
  const [zoneName, setZoneName] = useState('General Work Zone');
  const [samplingMode, setSamplingMode] = useState('1fps');
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const fileInputRef = useRef(null);

  const projectOptions = [
    { id: 'PRJ-101', name: 'Skyline Mega Tower — Phase 3 (SMT-P3)' },
    { id: 'PRJ-102', name: 'Metro Central Railway Extension (MCR-E)' },
    { id: 'PRJ-103', name: 'Harbor Bay Bridge & Viaduct (HBB-V)' },
  ];

  const zones = [
    { name: 'General Work Zone', helmet: true, vest: false, harness: false, mult: 1.0, icon: '🏗️' },
    { name: 'Excavation Zone', helmet: true, vest: true, harness: false, mult: 1.2, icon: '🚜' },
    { name: 'Vehicle Movement Zone', helmet: true, vest: true, harness: false, mult: 1.3, icon: '🚚' },
    { name: 'Electrical Work Zone', helmet: true, vest: true, harness: false, mult: 1.3, icon: '⚡' },
    { name: 'Work-at-Height Zone', helmet: true, vest: true, harness: true, mult: 1.5, icon: '🪜' },
  ];

  const samplingOptions = [
    { value: '1fps', label: '1 FPS (Default - Recommended)', desc: 'Samples 1 frame every second for balanced speed and accuracy' },
    { value: '2fps', label: '2 FPS (High Precision)', desc: 'Samples 2 frames per second for high-density movement analysis' },
    { value: 'every_10_frames', label: 'Every 10th Frame (Fast Traversal)', desc: 'Samples frame indices modulo 10 for rapid footage audit' },
  ];

  const processVideoFile = (file) => {
    if (!file) return;

    const validExtensions = ['.mp4', '.avi', '.mov'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(ext) && !file.type.startsWith('video/')) {
      setErrorMsg("Unsupported file format. Please upload MP4, AVI, or MOV video files.");
      return;
    }

    const maxSizeBytes = 100 * 1024 * 1024; // 100 MB
    if (file.size > maxSizeBytes) {
      setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum limit of 100 MB.`);
      return;
    }

    setSelectedFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setErrorMsg(null);
    setSelectedIncident(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processVideoFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processVideoFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    try {
      const data = await analyzeSafetyVideo(selectedFile, projectId, zoneName, samplingMode);
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to analyze video footage. Please ensure the backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const videoPlayerRef = useRef(null);
  const [playerStreamMode, setPlayerStreamMode] = useState('ORIGINAL'); // 'ORIGINAL' | 'ANNOTATED' | 'KEYFRAME'
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [selectedKeyframeUrl, setSelectedKeyframeUrl] = useState(null);

  // Jump player to specific timestamp in seconds
  const seekToTimestamp = (seconds, keyframeUrl = null) => {
    if (keyframeUrl) {
      setSelectedKeyframeUrl(keyframeUrl);
    }
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = seconds;
      videoPlayerRef.current.play().catch(() => {});
    }
  };

  const currentZoneObj = zones.find(z => z.name === zoneName) || zones[0];

  // Determine active incident at current playback time
  const activeIncidentAtTime = analysisResult?.grouped_incidents?.find(
    inc => currentPlaybackTime >= inc.start_timestamp_seconds && currentPlaybackTime <= inc.end_timestamp_seconds
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title & Scope Banner */}
      <div className="glass-panel p-6 border-l-4 border-cyan-400 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shrink-0 glow-cyan">
              <Film className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
                  Video Safety Analysis
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                  Offline Footage Analysis
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1d2022] text-[#859397] border border-[#3c494c]/40">
                  POST-M4 MVP
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Sampled offline video processing • Deterministic incident grouping (10s cooldown) • Consolidated alerts
              </p>
            </div>
          </div>
        </div>

        {/* Advisory Badge */}
        <div className="flex items-center gap-2 bg-[#0b0f10] border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono text-slate-400">
          <Info className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>Advisory Decision Support — Not Live CCTV</span>
        </div>
      </div>

      {/* Configuration & Upload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Configuration & Upload Box */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-cyan-400 pl-2.5">
              <Layers className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase">Footage Parameters</h3>
            </div>

            {/* Project Selector */}
            <div>
              <label className="text-xs font-mono text-slate-300 mb-1.5 block">Target Project:</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#0b0f10] text-xs font-mono text-cyan-300 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                {projectOptions.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Zone Selector */}
            <div>
              <label className="text-xs font-mono text-slate-300 mb-1.5 block">Work Zone & Risk Multiplier:</label>
              <select
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="w-full bg-[#0b0f10] text-xs font-mono text-cyan-300 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                {zones.map((z) => (
                  <option key={z.name} value={z.name} className="bg-slate-900 text-slate-200">
                    {z.icon} {z.name} ({z.mult}x Risk Multiplier)
                  </option>
                ))}
              </select>
            </div>

            {/* Sampling Rate Selector */}
            <div>
              <label className="text-xs font-mono text-slate-300 mb-1.5 block">Frame Sampling Strategy:</label>
              <div className="grid grid-cols-1 gap-2">
                {samplingOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                      samplingMode === opt.value
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
                        : 'bg-[#0b0f10]/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="samplingMode"
                      value={opt.value}
                      checked={samplingMode === opt.value}
                      onChange={(e) => setSamplingMode(e.target.value)}
                      className="mt-0.5 text-cyan-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold block text-slate-200">{opt.label}</span>
                      <span className="text-[11px] text-slate-400">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Upload Dropzone */}
          <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 space-y-3">
            <div className="flex items-center justify-between border-l-4 border-cyan-400 pl-2.5">
              <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase">Video Uploader</h3>
              <span className="text-[10px] font-mono text-slate-400">MP4, AVI, MOV (Max 100 MB)</span>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-2xl scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-500/60 bg-emerald-950/10'
                  : 'border-[#3c494c] hover:border-cyan-400/70 hover:bg-[#1d2022]/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/avi,video/quicktime,video/x-msvideo,.mp4,.avi,.mov"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform ${
                selectedFile
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                  : 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/30'
              }`}>
                {selectedFile ? <Check className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
              </div>

              <h4 className="text-xs font-bold text-slate-200 font-sans">
                {selectedFile ? selectedFile.name : "Drag & Drop Construction Site Video"}
              </h4>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                {selectedFile
                  ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis`
                  : "or click here to browse offline video files"}
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              className={`w-full py-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all border cursor-pointer uppercase ${
                !selectedFile
                  ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                  : isAnalyzing
                  ? 'bg-cyan-600 text-slate-950 border-cyan-400 cursor-wait animate-pulse font-black'
                  : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 border-cyan-300 shadow-lg glow-cyan font-black'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing Frames & SafetyAgent Rules...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze Video Safety & PPE</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: Source Video Preview & Synchronized Telemetry Player */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 space-y-3 min-h-[380px] flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-4 border-cyan-400 pl-2.5">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase">Footage Monitor</h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {analysisResult ? "ANALYSIS COMPLETED" : isAnalyzing ? "PROCESSING..." : "STANDBY"}
                </span>
              </div>

              {/* Stream Switcher */}
              {(videoPreviewUrl || analysisResult) && (
                <div className="flex items-center gap-1 bg-[#0b0f10] p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setPlayerStreamMode('ORIGINAL')}
                    className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
                      playerStreamMode === 'ORIGINAL'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ▶️ Uploaded Video
                  </button>

                  {selectedKeyframeUrl && (
                    <button
                      type="button"
                      onClick={() => setPlayerStreamMode('KEYFRAME')}
                      className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
                        playerStreamMode === 'KEYFRAME'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🤖 YOLO Keyframe
                    </button>
                  )}

                  {analysisResult?.annotated_video_url && (
                    <button
                      type="button"
                      onClick={() => setPlayerStreamMode('ANNOTATED')}
                      className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
                        playerStreamMode === 'ANNOTATED'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      📹 AI Stream
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Video Player / Keyframe Display */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0b0f10] flex items-center justify-center min-h-[280px] flex-1">
              
              {isAnalyzing ? (
                <div className="text-center p-6 space-y-3">
                  <div className="h-12 w-12 mx-auto rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center animate-spin">
                    <RefreshCw className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 font-sans">Analyzing Video Sampling Stream...</h4>
                    <p className="text-xs font-mono text-cyan-400 mt-1">Executing YOLOv8 PPE Detector & SafetyAgent Association</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-2">Evaluating temporal cooldown grouping & consolidated alerts...</p>
                  </div>
                </div>
              ) : playerStreamMode === 'KEYFRAME' && selectedKeyframeUrl ? (
                <div className="w-full h-full flex flex-col relative group">
                  <img
                    src={selectedKeyframeUrl}
                    alt="YOLO Keyframe Evidence"
                    className="w-full max-h-[320px] object-contain mx-auto bg-black"
                  />
                  <div className="p-2 bg-[#0b0f10] border-t border-slate-800 text-[10px] font-mono text-cyan-300 flex items-center justify-between">
                    <span>YOLO Visual Telemetry Frame Overlay</span>
                    <button
                      type="button"
                      onClick={() => setPlayerStreamMode('ORIGINAL')}
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      ▶️ Switch back to video
                    </button>
                  </div>
                </div>
              ) : playerStreamMode === 'ANNOTATED' && analysisResult?.annotated_video_url ? (
                <div className="w-full h-full flex flex-col relative">
                  <video
                    src={analysisResult.annotated_video_url}
                    controls
                    playsInline
                    className="w-full max-h-[320px] object-contain mx-auto bg-black"
                  />
                  <div className="p-2 bg-[#0b0f10] border-t border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center justify-between">
                    <span>✓ YOLO Annotated Video Stream</span>
                    <a
                      href={analysisResult.annotated_video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 underline hover:text-cyan-300 flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" /> Fullscreen / Download
                    </a>
                  </div>
                </div>
              ) : videoPreviewUrl ? (
                <div className="w-full h-full flex flex-col relative">
                  <video
                    ref={videoPlayerRef}
                    src={videoPreviewUrl}
                    controls
                    playsInline
                    onTimeUpdate={(e) => setCurrentPlaybackTime(e.target.currentTime)}
                    className="w-full max-h-[320px] object-contain mx-auto bg-black"
                  />

                  {/* Synchronized HUD Banner Overlay */}
                  {analysisResult && (
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10 gap-2">
                      <div className="px-2 py-0.5 rounded bg-black/80 border border-slate-700 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 shadow-md">
                        <Clock className="h-3 w-3 text-cyan-400" />
                        <span>{currentPlaybackTime.toFixed(1)}s / {analysisResult.metadata?.duration_seconds}s</span>
                      </div>

                      {activeIncidentAtTime ? (
                        <div className="px-2 py-0.5 rounded bg-red-950/90 border border-red-500/60 text-[10px] font-mono text-red-200 flex items-center gap-1 shadow-md animate-pulse">
                          <AlertTriangle className="h-3 w-3 text-red-400" />
                          <span>INCIDENT ACTIVE: {activeIncidentAtTime.violation_type?.replace(/_/g, ' ').toUpperCase()}</span>
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 flex items-center gap-1 shadow-md">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span>ALL PPE COMPLIANT</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-2 bg-[#0b0f10] border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <Play className="h-3 w-3 text-cyan-400" /> Interactive Playback Active
                    </span>
                    <span>Click any incident below to jump to timestamp</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2 text-slate-500">
                  <Video className="h-12 w-12 mx-auto stroke-1 text-slate-600" />
                  <p className="text-xs font-mono">No video uploaded yet.</p>
                  <p className="text-[11px] text-slate-600 font-mono">Upload an MP4, AVI, or MOV file to begin offline safety inspection.</p>
                </div>
              )}
            </div>

            {/* Footnote Disclaimers */}
            <div className="p-2.5 rounded-lg bg-[#0b0f10] border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>Zone Multiplier: <strong className="text-cyan-400">{currentZoneObj.mult}x</strong></span>
              <span>Rule: {currentZoneObj.helmet ? 'Helmet Mandate' : 'General'}</span>
            </div>

          </div>

        </div>

      </div>

      {/* Analysis Results View */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Metadata & Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            <div className="glass-panel p-3.5 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-mono">Duration</p>
              <p className="text-xl font-bold font-mono text-slate-100 mt-0.5">
                {analysisResult.metadata?.duration_seconds}s
              </p>
              <p className="text-[10px] text-slate-500 font-mono">{analysisResult.metadata?.fps} FPS</p>
            </div>

            <div className="glass-panel p-3.5 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-mono">Sampled Frames</p>
              <p className="text-xl font-bold font-mono text-cyan-300 mt-0.5">
                {analysisResult.metadata?.sampled_frames}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">of {analysisResult.metadata?.total_frames} total</p>
            </div>

            <div className="glass-panel p-3.5 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-mono">Peak Personnel</p>
              <p className="text-xl font-bold font-mono text-slate-100 mt-0.5">
                {analysisResult.summary?.persons_detected}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">Simultaneous In-Frame</p>
            </div>

            <div className="glass-panel p-3.5 border-accent-critical">
              <p className="text-[11px] text-red-400/80 font-mono">Grouped Incidents</p>
              <p className="text-xl font-bold font-mono text-red-300 mt-0.5">
                {analysisResult.grouped_incidents?.length || 0}
              </p>
              <p className="text-[10px] text-red-400/60 font-mono">Consolidated Events</p>
            </div>

            <div className="glass-panel p-3.5 border-accent-cyan">
              <p className="text-[11px] text-cyan-400/80 font-mono">Highest Risk Score</p>
              <p className="text-xl font-bold font-mono text-cyan-300 mt-0.5">
                {analysisResult.summary?.highest_risk_score !== null ? `${analysisResult.summary.highest_risk_score}/100` : 'None'}
              </p>
              <p className="text-[10px] text-cyan-400/60 font-mono">Peak Escalation</p>
            </div>

            <div className="glass-panel p-3.5 border border-slate-800">
              <p className="text-[11px] text-amber-400/80 font-mono">Human Review</p>
              <p className="text-xl font-bold font-mono text-amber-300 mt-0.5">
                {analysisResult.summary?.needs_human_review || 0}
              </p>
              <p className="text-[10px] text-amber-400/60 font-mono">Low-Confidence / Ambiguity</p>
            </div>

          </div>

          {/* Grouped Temporal Incidents Section */}
          <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-4 border-cyan-400 pl-2.5">
              <div>
                <h3 className="text-sm font-bold text-[#e0e3e5] font-sans flex items-center gap-2">
                  <AlertOctagon className="h-4 w-4 text-cyan-400" />
                  Grouped Temporal Safety Incidents (10s De-duplication Cooldown)
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Consecutive frame detections consolidated deterministically into single actionable supervisor events. Click any incident to seek player.
                </p>
              </div>

              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-500/40">
                {analysisResult.grouped_incidents?.length || 0} Consolidated Incidents
              </span>
            </div>

            {(!analysisResult.grouped_incidents || analysisResult.grouped_incidents.length === 0) ? (
              <div className="p-8 rounded-xl bg-emerald-950/15 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-300 font-sans">Full PPE Compliance Observed</h4>
                <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
                  Zero safety violations or missing PPE detected across all sampled frames in {zoneName}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.grouped_incidents.map((inc) => {
                  const isCrit = inc.risk_category?.toUpperCase() === 'CRITICAL' || inc.peak_risk_score >= 75;
                  const isHigh = inc.risk_category?.toUpperCase() === 'HIGH' || inc.peak_risk_score >= 60;
                  const isActiveNow = currentPlaybackTime >= inc.start_timestamp_seconds && currentPlaybackTime <= inc.end_timestamp_seconds;

                  return (
                    <div
                      key={inc.incident_id}
                      onClick={() => seekToTimestamp(inc.start_timestamp_seconds, inc.evidence_frame_reference)}
                      className={`p-4 rounded-xl border glass-panel space-y-3 transition-all cursor-pointer hover:border-cyan-400/80 ${
                        isActiveNow
                          ? 'ring-2 ring-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.35)]'
                          : ''
                      } ${
                        isCrit
                          ? 'border-accent-critical bg-red-950/15'
                          : isHigh
                          ? 'border-amber-500/40 bg-amber-950/15'
                          : 'border-slate-800 bg-[#0b0f10]'
                      }`}
                    >
                      {/* Incident Header */}
                      <div className="flex items-center justify-between font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {inc.incident_id}
                          </span>
                          <span className="text-[11px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {inc.start_timestamp_seconds}s – {inc.end_timestamp_seconds}s
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1 hover:bg-cyan-900">
                            <Play className="h-2.5 w-2.5" /> Jump
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isCrit
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {inc.risk_category?.toUpperCase()} ({inc.peak_risk_score}/100)
                          </span>
                        </div>
                      </div>

                      {/* Violation Type */}
                      <div className="text-xs font-mono">
                        <div className="flex justify-between items-center text-slate-200">
                          <span className="font-bold text-sm text-red-300">
                            {inc.violation_type?.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {inc.occurrences_count} {inc.occurrences_count === 1 ? 'frame detection' : 'frames aggregated'}
                          </span>
                        </div>
                      </div>

                      {/* Evidence & Recommendation */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs font-mono">
                        {inc.evidence_frame_reference && (
                          <div className="sm:col-span-5 rounded-lg overflow-hidden border border-slate-800 bg-black relative group">
                            <img
                              src={inc.evidence_frame_reference}
                              alt="Incident Keyframe"
                              className="w-full h-24 object-cover cursor-pointer group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-cyan-300">
                              Click to inspect
                            </div>
                          </div>
                        )}
                        
                        <div className={inc.evidence_frame_reference ? "sm:col-span-7 space-y-1.5" : "sm:col-span-12 space-y-1.5"}>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                            {inc.recommendation || "Verify mandatory PPE compliance before authorizing active zone operations."}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span>Max Conf: <strong>{(inc.max_confidence * 100).toFixed(0)}%</strong></span>
                            <span>•</span>
                            <span>Frames: <strong>{inc.start_frame}–{inc.end_frame}</strong></span>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Keyframe Evidence Gallery */}
          {analysisResult.keyframe_evidence?.length > 0 && (
            <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 space-y-3">
              <div className="flex items-center justify-between border-l-4 border-cyan-400 pl-2.5">
                <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase">
                  Keyframe Evidence Gallery ({analysisResult.keyframe_evidence.length} Sampled Frames)
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Click any keyframe to jump video to that second</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {analysisResult.keyframe_evidence.map((kf, idx) => (
                  <div
                    key={idx}
                    onClick={() => seekToTimestamp(kf.timestamp_seconds, kf.image_url)}
                    className="rounded-xl overflow-hidden border border-slate-800 bg-[#0b0f10] group relative cursor-pointer hover:border-cyan-400 transition-all hover:scale-[1.02]"
                  >
                    <img
                      src={kf.image_url}
                      alt={`Keyframe ${kf.frame_number}`}
                      className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="p-1.5 text-[10px] font-mono flex items-center justify-between bg-slate-950/90 border-t border-slate-800">
                      <span className="text-cyan-300 font-bold flex items-center gap-1">
                        <Play className="h-2.5 w-2.5 text-cyan-400" /> {kf.timestamp_seconds}s
                      </span>
                      <span className={kf.violations_count > 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {kf.violations_count > 0 ? `${kf.violations_count} VIOL` : 'OK'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Cross-Module Navigation Callout */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                Consolidated Safety Intelligence Integrated
              </h4>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Video analysis incidents have been recorded in the database and linked to Safety Alerts & Executive Reports.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => onNavigateTab && onNavigateTab('SAFETY_ALERTS')}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Open Safety Alerts</span>
              </button>

              <button
                onClick={() => onNavigateTab && onNavigateTab('REPORTS')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Open Executive Reports</span>
              </button>

              <button
                onClick={() => onNavigateTab && onNavigateTab('SAFETY_DASHBOARD')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Safety Dashboard</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Mandatory Permanent Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-[#0b0f10] border border-[#3c494c]/40 text-center space-y-1">
        <p className="text-xs font-mono text-amber-300 font-semibold flex items-center justify-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          <span>Offline video analysis is advisory decision support. It is not live CCTV monitoring and requires supervisor review.</span>
        </p>
        <p className="text-[10px] font-mono text-slate-500">
          BuildSure AI Offline Video MVP • Strict 10s Cooldown Grouping • Zero Synthetic Hallucination
        </p>
      </div>

    </div>
  );
}
