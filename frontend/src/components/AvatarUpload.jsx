import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Upload } from 'lucide-react';

const AvatarUpload = ({ user }) => {
  const [uploading, setUploading] = useState(false);
  const { updateUserProfile } = useAuth();

  const handleUpload = async (file) => {
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        // For now, just update with a data URL
        // In production, upload to server and get URL
        const avatarUrl = e.target.result;
        await updateUserProfile({ avatar_url: avatarUrl });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
        {user?.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt="Profile Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-2xl font-bold text-gray-600">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
        )}
      </div>
      
      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          <Camera className="w-4 h-4" />
        )}
      </label>
      
      <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity pointer-events-none"></div>
    </div>
  );
};

export default AvatarUpload;
