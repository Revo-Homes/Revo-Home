import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Link, Type, Palette } from 'lucide-react';

function RichTextEditor({ value, onChange, label, required }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command, arg = null) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
    const url = prompt('Enter the link URL:');
    if (url) execCommand('createLink', url);
  };

  const changeColor = (e) => {
    execCommand('foreColor', e.target.value);
  };

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">
        {label} {required && '*'}
      </label>
      <div className="border border-gray-100 rounded-3xl overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all bg-gray-50/50">
        <div className="flex flex-wrap items-center gap-1 p-2 bg-white border-b border-gray-100">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
            title="Italic"
          >
            <Italic size={18} />
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
            title="Underline"
          >
            <Underline size={18} />
          </button>
          <div className="w-px h-6 bg-gray-100 mx-1" />
          <div className="relative group">
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 flex items-center gap-1"
              title="Text Color"
            >
              <Palette size={18} />
              <input
                type="color"
                onChange={changeColor}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </button>
          </div>
          <button
            type="button"
            onClick={addLink}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
            title="Insert Link"
          >
            <Link size={18} />
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="min-h-[200px] p-6 focus:outline-none font-medium text-gray-700 bg-transparent prose max-w-none"
          style={{ cursor: 'text' }}
        />
      </div>
    </div>
  );
}

export default RichTextEditor;
