import { useRef } from 'react';
import { X, Edit2, FileText, Image as ImageIcon } from 'lucide-react';

function FileUploadCard({ file, preview, onRemove, onReplace, type = 'file' }) {
  const fileInputRef = useRef(null);

  const isImage = (f) => {
    return f?.type?.startsWith('image/') || (typeof f === 'string' && (f.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null));
  };

  const getFileName = (f) => {
    if (f instanceof File) return f.name;
    if (typeof f === 'string') return f.split('/').pop();
    return 'File';
  };

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const newFile = e.target.files?.[0];
    if (newFile) {
      onReplace(newFile);
    }
  };

  const previewUrl = preview || (file instanceof File ? URL.createObjectURL(file) : file);

  return (
    <div className="relative group bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all animate-in fade-in zoom-in-95 duration-300">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-50 mb-3 border border-gray-50">
        {isImage(file || previewUrl) ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
            <FileText size={40} className="text-gray-200" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Document</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={handleEditClick}
            className="w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-xl backdrop-blur-md transition-all flex items-center justify-center"
            title="Replace File"
          >
            <Edit2 size={18} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="w-10 h-10 bg-red-500/80 hover:bg-red-500 text-white rounded-xl backdrop-blur-md transition-all flex items-center justify-center"
            title="Remove File"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="px-1">
        <p className="text-[11px] font-bold text-gray-500 truncate mb-1">
          {getFileName(file || previewUrl)}
        </p>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isImage(file || previewUrl) ? 'bg-orange-400' : 'bg-blue-400'}`}></div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
            {isImage(file || previewUrl) ? 'Image' : 'PDF / Document'}
          </span>
        </div>
      </div>

      {/* Hidden input for replacement */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={isImage(file || previewUrl) ? "image/*" : "image/*,application/pdf"}
        className="hidden"
      />
    </div>
  );
}

export default FileUploadCard;
