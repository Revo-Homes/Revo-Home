import { Upload, Youtube } from 'lucide-react';
import YoutubeLinksInput from './YoutubeLinksInput';
import FileUploadCard from './FileUploadCard';

function PropertyMediaForm({ formData, setFormData, mediaPreviews, setMediaPreviews, onMediaChange, onMediaRemove, onMediaReplace }) {
  const mediaCategories = [
    { key: 'photos', label: 'Photos (Main Images)', description: 'Maximum 10 high-quality images' },
    { key: 'floor_plan', label: 'Floor Plan (PDF/Image)', description: 'Detailed floor layout' },
    { key: 'master_plan', label: 'Master Plan', description: 'Overall property site plan' },
    { key: 'documents', label: 'Property Documents', description: 'Agreement, RERA, etc.' },
    { key: 'virtual_tour', label: '360° Tour Images', description: 'Panoramic photos' }
  ];

  const handleYoutubeChange = (links) => {
    setFormData(prev => ({ ...prev, youtubeLinks: links }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, category) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Create a mock event to reuse onMediaChange
      const mockEvent = {
        target: {
          files: files
        }
      };
      onMediaChange(mockEvent, category);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* YouTube Section */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-50 text-red-500 flex items-center justify-center rounded-[18px]">
            <Youtube size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Virtual Tours</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Add YouTube Video Links</p>
          </div>
        </div>
        <YoutubeLinksInput 
          links={formData.youtubeLinks || []} 
          onChange={handleYoutubeChange} 
        />
      </div>

      {/* Media Upload Sections */}
      <div className="space-y-8">
        {mediaCategories.map((cat) => (
          <div 
            key={cat.key} 
            className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, cat.key)}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 text-gray-400 flex items-center justify-center rounded-[18px]">
                  <Upload size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">{cat.label}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{cat.description}</p>
                </div>
              </div>
              
              <div className="relative group overflow-hidden">
                <button
                  type="button"
                  className="px-6 py-3 bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-primary transition-all shadow-lg shadow-gray-900/10"
                >
                  Upload New
                </button>
                <input
                  type="file"
                  multiple={cat.key === 'photos' || cat.key === 'documents' || cat.key === 'virtual_tour'}
                  accept={cat.key === 'documents' ? "image/*,application/pdf" : "image/*"}
                  onChange={(e) => onMediaChange(e, cat.key)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Previews Grid */}
            {mediaPreviews[cat.key] && mediaPreviews[cat.key].length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mediaPreviews[cat.key].map((p, idx) => (
                  <FileUploadCard
                    key={idx}
                    file={formData[cat.key][idx]}
                    preview={p}
                    onRemove={() => onMediaRemove(idx, cat.key)}
                    onReplace={(newFile) => onMediaReplace(idx, cat.key, newFile)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[28px] bg-gray-50/50">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                  <Upload size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400">No files uploaded yet</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PropertyMediaForm;
