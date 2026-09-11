import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  FileCheck,
  HelpCircle
} from 'lucide-react';
import { uploadComplianceDocument } from '../../services/api';

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'];
const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const CATEGORIES = [
  { id: 'site_safety_plan', label: 'Site Safety & Compliance Plan' },
  { id: 'equipment_cert', label: 'Equipment & Rigging Certification' },
  { id: 'inspection_log', label: 'Safety Audit / Inspection Log' },
  { id: 'permit_to_work', label: 'Permit to Work (Height / Electrical)' },
  { id: 'training_cert', label: 'Worker PPE Training & Induction' },
  { id: 'insurance_policy', label: 'Contractor Liability Insurance Policy' }
];

export default function DocumentUploadModal({ isOpen, onClose, onUploadSuccess, projectId = "PRJ-101" }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const validateAndSetFile = (file) => {
    setErrorMessage(null);
    setUploadResult(null);

    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(`Unsupported format "${ext}". Please select a PDF or image file (${ALLOWED_EXTENSIONS.join(', ')}).`);
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File exceeds ${MAX_FILE_SIZE_MB}MB limit (selected: ${(file.size / (1024*1024)).toFixed(1)}MB).`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || uploading) return;

    try {
      setUploading(true);
      setErrorMessage(null);
      
      const result = await uploadComplianceDocument(selectedFile, projectId, category);
      setUploadResult(result);
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to upload and parse compliance document.");
    } finally {
      setUploading(false);
    }
  };

  const handleResetAndClose = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#162032] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden glow-cyan flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3c494c]/30 flex items-center justify-between bg-[#101415]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#e0e3e5] font-sans">Ingest Compliance Document</h3>
              <p className="text-[11px] font-mono text-[#859397]">PDF / SCANNED DOCUMENT OCR PARSER // {projectId}</p>
            </div>
          </div>
          
          <button
            onClick={handleResetAndClose}
            disabled={uploading}
            className="p-1.5 rounded-lg text-[#859397] hover:text-[#e0e3e5] hover:bg-[#1d2022] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Regulatory Disclaimer Banner */}
          <div className="p-3 rounded-xl bg-[#101415] border border-[#3c494c]/30 text-[11px] font-mono text-[#bbc9cd] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>
              Automated AI Assessment — Requires Qualified Safety Supervisor Review. All extractions are decision-support signals.
            </span>
          </div>

          {/* Form */}
          {!uploadResult ? (
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#bbc9cd] mb-1.5 font-sans">
                  Document Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={uploading}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#101415] border border-[#3c494c]/40 text-xs font-mono text-[#e0e3e5] focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag and Drop Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : selectedFile
                    ? 'border-emerald-500/50 bg-emerald-950/10'
                    : 'border-[#3c494c]/40 hover:border-cyan-500/40 bg-[#101415]/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_EXTENSIONS.join(',')}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <FileCheck className="h-10 w-10 mx-auto text-emerald-400" />
                    <div>
                      <p className="text-xs font-mono font-bold text-[#e0e3e5] truncate max-w-sm mx-auto">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
                        {(selectedFile.size / (1024*1024)).toFixed(2)} MB • Ready for Ingestion
                      </p>
                    </div>
                    <span className="inline-block text-[10px] font-mono text-[#859397] underline hover:text-cyan-300">
                      Click or drop another file to replace
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud className="h-10 w-10 mx-auto text-cyan-400/80" />
                    <p className="text-xs font-semibold text-[#e0e3e5] font-sans">
                      Drag & Drop compliance PDF / Scanned image here
                    </p>
                    <p className="text-[11px] font-mono text-[#859397]">
                      or click to browse from device (Max {MAX_FILE_SIZE_MB}MB)
                    </p>
                    <p className="text-[10px] font-mono text-[#859397] opacity-75">
                      Supported: PDF, PNG, JPG, JPEG, WebP, BMP, TIFF
                    </p>
                  </div>
                )}
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  disabled={uploading}
                  className="px-4 py-2 rounded-lg bg-[#191c1e] text-[#bbc9cd] hover:text-[#e0e3e5] text-xs font-mono font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-mono font-black flex items-center gap-2 shadow-md glow-cyan transition-all"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>PARSING DOCUMENT...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      <span>START INGESTION & RULE EVALUATION</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            /* Upload Success & Result Summary */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-mono font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Document Ingested & Evaluated Successfully!</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-emerald-500/20 text-[#bbc9cd]">
                  <div>
                    <span className="text-[#859397]">Document:</span> {uploadResult.filename}
                  </div>
                  <div>
                    <span className="text-[#859397]">Method:</span> {uploadResult.extraction_method.toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[#859397]">Pages:</span> {uploadResult.page_count}
                  </div>
                  <div>
                    <span className="text-[#859397]">Status:</span> {uploadResult.status}
                  </div>
                  {uploadResult.issuing_authority && (
                    <div className="col-span-2">
                      <span className="text-[#859397]">Authority:</span> {uploadResult.issuing_authority}
                    </div>
                  )}
                  {uploadResult.expiry_date && (
                    <div className="col-span-2">
                      <span className="text-[#859397]">Expiry Date:</span> {new Date(uploadResult.expiry_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Extracted Text Preview */}
              {uploadResult.extracted_text_preview && (
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#859397]">
                    EXTRACTED TEXT PREVIEW
                  </label>
                  <div className="p-3 rounded-lg bg-[#101415] border border-[#3c494c]/30 text-xs font-mono text-[#e0e3e5] max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {uploadResult.extracted_text_preview}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-mono font-black"
                >
                  DONE & RETURN TO AUDIT
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
