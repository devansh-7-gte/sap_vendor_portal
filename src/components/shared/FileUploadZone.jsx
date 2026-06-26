import React, { useState, useRef } from 'react';
import { UploadCloud, File, Trash2, Loader2, AlertCircle } from 'lucide-react';

export default function FileUploadZone({ 
  label = "Upload Document", 
  onUploadComplete, 
  onFileRemoved, 
  value = null, // Current uploaded file info: { documentId, originalName, url }
  linkedTo = "Profile",
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx"
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const getHeaders = () => {
    const headers = {};
    if (typeof window !== 'undefined') {
      const clerkId = localStorage.getItem('clerk_user_id') || 'mock_vendor_id';
      if (clerkId) {
        headers['x-vendor-id'] = clerkId;
      }
    }
    return headers;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateFile = (file) => {
    const allowedExtensions = accept.split(',');
    const fileExt = `.${file.name.split('.').pop().toLowerCase()}`;
    
    if (!allowedExtensions.includes(fileExt)) {
      return `File type not permitted. Allowed: ${accept}`;
    }

    // Limits check: Images 5MB, Docs 10MB
    const isImage = file.type.startsWith('image/');
    const limit = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    
    if (file.size > limit) {
      return `File too large. Max size: ${isImage ? '5MB (Image)' : '10MB (Document)'}`;
    }

    return null;
  };

  const uploadFile = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(15);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('linkedTo', linkedTo);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      setProgress(40);
      
      const response = await fetch(`${baseUrl}/uploads`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData
      });

      setProgress(85);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      setProgress(100);
      setUploading(false);

      if (onUploadComplete) {
        onUploadComplete({
          documentId: result.documentId,
          originalName: result.originalName,
          url: result.url
        });
      }
    } catch (err) {
      console.error('[Upload Error]', err);
      setError(err.message || 'Network upload failed');
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!value || !value.documentId) return;

    if (confirm(`Remove file "${value.originalName}"?`)) {
      setUploading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${baseUrl}/uploads/${value.documentId}`, {
          method: 'DELETE',
          headers: getHeaders()
        });

        if (!response.ok) {
          throw new Error('Failed to delete file from server');
        }

        setUploading(false);
        if (onFileRemoved) {
          onFileRemoved();
        }
      } catch (err) {
        console.error('[Delete Error]', err);
        setError(err.message || 'Failed to delete file');
        setUploading(false);
      }
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-1.5 w-full">
      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">{label}</span>
      
      {/* ERROR MESSAGE CARD */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-2 rounded text-red-950 flex items-start gap-2 animate-fade-in">
          <AlertCircle className="size-3.5 text-red-600 shrink-0 mt-0.5" />
          <span className="text-[10px] font-semibold leading-normal pr-4">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-[10px] hover:underline cursor-pointer select-none">Dismiss</button>
        </div>
      )}

      {value ? (
        /* UPLOADED FILE PREVIEW CARD (Steel Scaffold aesthetics) */
        <div className="bg-white border border-stone-200 rounded p-2.5 flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <div className="size-7 rounded bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-500 shrink-0">
              <File className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-stone-800 truncate leading-tight">{value.originalName}</p>
              <p className="text-[9px] text-stone-400 font-mono mt-0.5">Uploaded &bull; {value.size ? formatSize(value.size) : 'Link Attached'}</p>
            </div>
          </div>
          
          <button
            onClick={handleRemove}
            disabled={uploading}
            className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-stone-50 transition-all rounded cursor-pointer shrink-0 disabled:opacity-50"
            title="Remove File"
          >
            {uploading ? <Loader2 className="size-4 animate-spin text-stone-500" /> : <Trash2 className="size-4" />}
          </button>
        </div>
      ) : (
        /* DROP ZONE */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[100px] bg-stone-50/50 hover:bg-stone-50 border-stone-300 hover:border-amber-500 select-none ${
            isDragActive ? 'border-amber-500 bg-amber-50/20' : ''
          } ${uploading ? 'pointer-events-none opacity-80' : ''}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleChange}
            accept={accept}
            className="hidden"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="space-y-2 flex flex-col items-center">
              <Loader2 className="size-6 animate-spin text-amber-500" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-stone-700">Uploading attachment...</p>
                <div className="w-24 bg-stone-200 h-1 rounded-full overflow-hidden border border-stone-300/40">
                  <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 flex flex-col items-center">
              <UploadCloud className={`size-6 transition-colors ${isDragActive ? 'text-amber-500 animate-bounce' : 'text-stone-400'}`} />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-stone-700">
                  {isDragActive ? "Drop here to attach" : "Drag files here or click to browse"}
                </p>
                <p className="text-[9px] text-stone-400 font-mono">
                  Supports PDF, DOC, DOCX, XLS, JPG, PNG (Max {accept.includes('png') ? '5MB images' : '10MB documents'})
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
