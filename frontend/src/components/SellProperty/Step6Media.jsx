import React from 'react';
import { 
  ImagePlus, 
  Video, 
  FileText, 
  Globe, 
  Plus, 
  X, 
  UploadCloud, 
  Play, 
  Trash2,
  FileCheck,
  Layout
} from 'lucide-react';

const Step6Media = ({ 
  formData, 
  setFormData, 
  handleImageUpload, 
  handleImageDelete,
  handleDocumentUpload,
  handleDocumentDelete
}) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <ImagePlus className="w-6 h-6 text-primary" /> 
          Media & Documents
        </h2>
        <p className="text-sm text-gray-500 font-medium">Add high-quality visuals and documents to showcase your property.</p>
      </div>

      {/* Image Gallery Upload */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Layout size={24} />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900">Property Gallery</h4>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Upload at least 3 high-quality images</p>
            </div>
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500">
            {formData.images?.length || 0} / 15 Images
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Image Previews */}
          {(formData.imagePreviews || []).map((preview, index) => (
            <div key={index} className="aspect-square relative group rounded-[32px] overflow-hidden border-4 border-white shadow-xl animate-in zoom-in-95 duration-300">
              <img src={preview} alt="Property" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => handleImageDelete(index)}
                  className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors shadow-xl"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              {index === 0 && (
                <div className="absolute top-4 left-4 px-4 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                  Main Photo
                </div>
              )}
            </div>
          ))}

          {/* Upload Button */}
          {(!formData.images || formData.images.length < 15) && (
            <div className="relative group aspect-square">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div className="w-full h-full border-4 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center gap-4 text-gray-300 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500 group-active:scale-95 shadow-inner">
                <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-[24px] flex items-center justify-center group-hover:bg-white group-hover:text-primary transition-all shadow-sm">
                  <UploadCloud size={32} />
                </div>
                <div className="text-center px-4">
                  <span className="text-[11px] font-black uppercase tracking-widest block">Add Photos</span>
                  <span className="text-[9px] font-bold text-gray-400 mt-1 block">Drag or Click</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video & Virtual Tour */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t-2 border-gray-50">
        {/* Video Link */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
              <Video size={20} />
            </div>
            <h4 className="text-lg font-black text-gray-900">Property Video</h4>
          </div>
          <div className="relative group">
            <Play className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
            <input
              type="text"
              name="video_url"
              value={formData.video_url}
              onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
              placeholder="YouTube or Vimeo link..."
              className="w-full pl-14 pr-6 py-5 bg-white border-2 border-gray-100 rounded-[24px] focus:border-primary outline-none text-sm font-bold text-gray-900 shadow-sm"
            />
          </div>
        </div>

        {/* Virtual Tour */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
              <Globe size={20} />
            </div>
            <h4 className="text-lg font-black text-gray-900">360° Virtual Tour</h4>
          </div>
          <div className="relative group">
            <Layout className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
            <input
              type="text"
              name="virtual_tour_url"
              value={formData.virtual_tour_url}
              onChange={(e) => setFormData(prev => ({ ...prev, virtual_tour_url: e.target.value }))}
              placeholder="Link to 3D walk-through..."
              className="w-full pl-14 pr-6 py-5 bg-white border-2 border-gray-100 rounded-[24px] focus:border-primary outline-none text-sm font-bold text-gray-900 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Documents Upload */}
      <div className="pt-10 border-t-2 border-gray-50 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-900">Documents & Brochures</h4>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Upload PDF brochures or RERA certificates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Document Previews */}
          {(formData.documents || []).map((doc, index) => (
            <div key={index} className="p-6 bg-white border-2 border-gray-100 rounded-[32px] flex items-center justify-between group hover:border-primary/20 transition-all shadow-xl shadow-gray-200/40">
              <div className="flex items-center gap-4 truncate">
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-[20px] flex items-center justify-center flex-shrink-0">
                  <FileCheck size={28} />
                </div>
                <div className="truncate">
                  <h5 className="text-sm font-black text-gray-900 truncate">{doc.name}</h5>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{(doc.size / 1024 / 1024).toFixed(2)} MB • PDF</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDocumentDelete(index)}
                className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {/* Document Upload Button */}
          <div className="relative group min-h-[92px]">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleDocumentUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            <div className="w-full h-full border-2 border-dashed border-gray-100 rounded-[32px] flex items-center justify-center gap-4 text-gray-300 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500 shadow-inner px-8 py-6">
              <Plus size={24} />
              <span className="text-[11px] font-black uppercase tracking-widest">Add Document</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step6Media;
