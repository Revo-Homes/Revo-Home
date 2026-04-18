import { useState } from 'react';
import { Plus, X, Youtube, AlertCircle } from 'lucide-react';

function YoutubeLinksInput({ links = [], onChange }) {
  const [newLink, setNewLink] = useState('');
  const [error, setError] = useState('');

  const validateYoutubeUrl = (url) => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return pattern.test(url);
  };

  const handleAddLink = () => {
    if (!newLink.trim()) return;
    
    if (!validateYoutubeUrl(newLink)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    if (links.includes(newLink.trim())) {
      setError('This link is already added');
      return;
    }

    const updatedLinks = [...links, newLink.trim()];
    onChange(updatedLinks);
    setNewLink('');
    setError('');
  };

  const handleRemoveLink = (index) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    onChange(updatedLinks);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="url"
            value={newLink}
            onChange={(e) => {
              setNewLink(e.target.value);
              if (error) setError('');
            }}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
            placeholder="Paste YouTube video link here..."
            className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 ${
              error ? 'border-red-200 focus:border-red-500' : 'border-transparent focus:border-primary'
            } rounded-2xl font-bold transition-all outline-none`}
          />
        </div>
        <button
          type="button"
          onClick={handleAddLink}
          disabled={!newLink.trim()}
          className="px-6 py-3.5 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <Plus size={20} />
          Add More
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs font-bold px-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {links.map((link, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm group animate-in slide-in-from-left-4 duration-300"
          >
            <div className="w-10 h-10 bg-red-50 text-red-500 flex items-center justify-center rounded-xl shrink-0">
              <Youtube size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-700 truncate">{link}</p>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveLink(index)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default YoutubeLinksInput;
