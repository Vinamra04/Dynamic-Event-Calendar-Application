import { useState, useEffect } from 'react';
import { createApi } from 'unsplash-js';
import './styles/customize-calendar.css';
import { FiRefreshCcw } from 'react-icons/fi';

// Import default media with correct paths
import defaultImage from './images/background1.jpeg';
import defaultVideo from './vid/background.mp4';

// Default backgrounds array
const defaultBackgrounds = [
  {
    id: 'default-image',
    type: 'image',
    src: defaultImage,
    title: 'Default Background'
  },
  {
    id: 'default-video',
    type: 'video',
    src: defaultVideo,
    title: 'Default Video'
  }
];

// Add adjustColor function directly in the file since it's only used here
const adjustColor = (color, amount) => {
  const hex = color.replace('#', '');
  const r = Math.max(Math.min(parseInt(hex.slice(0, 2), 16) + amount, 255), 0);
  const g = Math.max(Math.min(parseInt(hex.slice(2, 4), 16) + amount, 255), 0);
  const b = Math.max(Math.min(parseInt(hex.slice(4, 6), 16) + amount, 255), 0);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Get stored backgrounds from localStorage
const getStoredBackgrounds = () => {
  const stored = localStorage.getItem('customBackgrounds');
  return stored ? JSON.parse(stored) : [];
};

const unsplash = createApi({
  accessKey: '5a3M1jmQ9oH-H5u77OYn22tGW_qpgBDwbQk3M0_C8MQ'
});

function CustomizeCalendar({ onClose }) {
  const [activeTab, setActiveTab] = useState('default');
  const [unsplashImages, setUnsplashImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('themeColor') || '#219ebc';
  });
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [previewBackground, setPreviewBackground] = useState(null);
  const [customBackgrounds, setCustomBackgrounds] = useState(getStoredBackgrounds());
  const [allBackgrounds, setAllBackgrounds] = useState([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('themeColor');
    if (savedTheme) {
      applyTheme(savedTheme);
    }
  }, []);

  // Restore original background/theme when component unmounts or on cancel
  useEffect(() => {
    const originalTheme = localStorage.getItem('themeColor') || '#219ebc';
    const originalBackground = localStorage.getItem('activeBackground');

    return () => {
      document.documentElement.style.setProperty('--primary', originalTheme);
      if (originalBackground) {
        const bgData = JSON.parse(originalBackground);
        applyBackground(bgData);
      }
    };
  }, []);

  useEffect(() => {
    // Combine default and custom backgrounds
    const customBgs = getStoredBackgrounds();
    const combinedBgs = [...defaultBackgrounds, ...customBgs];
    setAllBackgrounds(combinedBgs);
  }, [customBackgrounds]); // Update when customBackgrounds changes

  const addCustomBackground = (background) => {
    // Create new background object
    const newBackground = {
      id: `custom-${Date.now()}`,
      ...background
    };

    // Add to the beginning of the list
    const updatedBackgrounds = [newBackground, ...customBackgrounds];
    setCustomBackgrounds(updatedBackgrounds);
    localStorage.setItem('customBackgrounds', JSON.stringify(updatedBackgrounds));
    
    return newBackground;
  };

  const applyImageBackground = (background) => {
    // Clear any existing backgrounds first
    document.body.style.background = 'none';
    document.body.style.backgroundImage = 'none';
    
    // Remove any existing video background
    const existingVideo = document.querySelector('.background-video');
    if (existingVideo) {
      existingVideo.remove();
    }

    // Apply new background
    document.body.style.backgroundImage = `url(${background.src})`;
    localStorage.setItem('activeBackground', JSON.stringify(background));
  };

  const applyVideoBackground = (background) => {
    // Clear any existing image background
    document.body.style.backgroundImage = 'none';
    
    // Remove any existing video
    const existingVideo = document.querySelector('.background-video');
    if (existingVideo) {
      existingVideo.remove();
    }

    // Create and apply new video background
    const videoElement = document.createElement('video');
    videoElement.className = 'background-video';
    videoElement.src = background.src;
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.style.position = 'fixed';
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.style.objectFit = 'cover';
    videoElement.style.zIndex = '-1';
    videoElement.style.top = '0';
    videoElement.style.left = '0';
    
    document.body.appendChild(videoElement);
    localStorage.setItem('activeBackground', JSON.stringify(background));
  };

  const showPreviewBackground = (background) => {
    setPreviewBackground(background);
    setSelectedBackground(background);
    
    // Only show preview, don't apply yet
    if (background.type === 'video') {
      const existingVideo = document.querySelector('.background-video.preview');
      if (existingVideo) {
        existingVideo.remove();
      }

      const videoElement = document.createElement('video');
      videoElement.className = 'background-video preview';
      videoElement.src = background.src;
      videoElement.autoplay = true;
      videoElement.loop = true;
      videoElement.muted = true;
      videoElement.style.position = 'fixed';
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
      videoElement.style.zIndex = '-1';
      videoElement.style.opacity = '0.7';
      videoElement.style.top = '0';
      videoElement.style.left = '0';
      
      document.body.appendChild(videoElement);
    } else {
      document.body.style.backgroundImage = `url(${background.src})`;
      document.body.style.opacity = '0.7';
    }
  };

  const applyBackground = (background) => {
    if (background.type === 'video') {
      applyVideoBackground(background);
    } else {
      applyImageBackground(background);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const isVideo = file.type.startsWith('video/');
        const newBackground = addCustomBackground({
          type: isVideo ? 'video' : 'image',
          src: reader.result,
          title: file.name
        });
        setSelectedBackground(newBackground);
        showPreviewBackground(newBackground);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    // Remove preview elements
    const previewVideo = document.querySelector('.background-video.preview');
    if (previewVideo) {
      previewVideo.remove();
    }
    
    // Clear any preview backgrounds
    document.body.style.opacity = '1';
    
    // Restore original background
    const activeBackground = localStorage.getItem('activeBackground');
    if (activeBackground) {
      const bgData = JSON.parse(activeBackground);
      if (bgData.type === 'video') {
        applyVideoBackground(bgData);
      } else {
        applyImageBackground(bgData);
      }
    } else {
      // If no active background, clear everything
      document.body.style.background = 'none';
      document.body.style.backgroundImage = 'none';
      document.body.style.backgroundColor = '#1a1e23';
    }

    // Restore original theme
    const originalTheme = localStorage.getItem('themeColor') || '#219ebc';
    applyTheme(originalTheme);
    setSelectedTheme(originalTheme);

    onClose();
  };

  const handleApply = () => {
    // Remove any preview elements
    const previewVideo = document.querySelector('.background-video.preview');
    if (previewVideo) {
      previewVideo.remove();
    }
    
    // Reset opacity
    document.body.style.opacity = '1';
    
    // Apply selected background if one is selected
    if (selectedBackground) {
      // Clear any existing backgrounds first
      document.body.style.background = 'none';
      document.body.style.backgroundImage = 'none';
      const existingVideo = document.querySelector('.background-video');
      if (existingVideo) {
        existingVideo.remove();
      }
      
      // Apply new background and store it as active
      if (selectedBackground.type === 'video') {
        applyVideoBackground(selectedBackground);
      } else {
        applyImageBackground(selectedBackground);
      }
      
      // Store as active background
      localStorage.setItem('activeBackground', JSON.stringify(selectedBackground));
      
      // Reorder backgrounds to put selected one first
      const updatedBackgrounds = [
        selectedBackground,
        ...customBackgrounds.filter(bg => bg.id !== selectedBackground.id)
      ];
      setCustomBackgrounds(updatedBackgrounds);
      localStorage.setItem('customBackgrounds', JSON.stringify(updatedBackgrounds));
    }

    // Apply and save theme
    if (selectedTheme) {
      applyTheme(selectedTheme);
    }

    onClose();
  };

  const selectUnsplashImage = async (image) => {
    const newBackground = addCustomBackground({
      type: 'image',
      src: image.urls.regular,
      title: image.alt_description || 'Unsplash Image'
    });
    setSelectedBackground(newBackground);
    showPreviewBackground(newBackground);
  };

  const searchUnsplash = async () => {
    try {
      const result = await unsplash.search.getPhotos({
        query: searchQuery,
        page: 1,
        perPage: 12,
      });
      setUnsplashImages(result.response.results);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleThemeChange = (color) => {
    setSelectedTheme(color);
    // Preview the theme immediately
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--primary-hover', adjustColor(color, -20));
    document.documentElement.style.setProperty('--hover', `${color}33`);
  };

  const applyTheme = (color) => {
    // Update CSS variables and store in localStorage
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--primary-hover', adjustColor(color, -20));
    document.documentElement.style.setProperty('--hover', `${color}33`);
    localStorage.setItem('themeColor', color);
  };

  const handleDeleteBackground = (bgToDelete, event) => {
    event.stopPropagation();

    // Remove from customBackgrounds
    const updatedBackgrounds = customBackgrounds.filter(bg => bg.id !== bgToDelete.id);
    setCustomBackgrounds(updatedBackgrounds);
    localStorage.setItem('customBackgrounds', JSON.stringify(updatedBackgrounds));

    // Check if this was the active background
    const activeBackground = localStorage.getItem('activeBackground');
    if (activeBackground) {
      const active = JSON.parse(activeBackground);
      if (active.id === bgToDelete.id) {
        // Clear from localStorage
        localStorage.removeItem('activeBackground');
        
        // Clear all backgrounds
        document.body.style.background = 'none';
        document.body.style.backgroundImage = 'none';
        const existingVideo = document.querySelector('.background-video');
        if (existingVideo) {
          existingVideo.remove();
        }

        // If there are other backgrounds, set the first one as active
        if (updatedBackgrounds.length > 0) {
          const newActive = updatedBackgrounds[0];
          localStorage.setItem('activeBackground', JSON.stringify(newActive));
          if (newActive.type === 'video') {
            applyVideoBackground(newActive);
          } else {
            applyImageBackground(newActive);
          }
        } else {
          // Reset to default background color if no backgrounds left
          document.body.style.backgroundColor = '#1a1e23';
        }
      }
    }

    // Clear selection if deleted
    if (selectedBackground?.id === bgToDelete.id) {
      setSelectedBackground(null);
      setPreviewBackground(null);
    }
  };

  // When component mounts, apply the active background
  useEffect(() => {
    const activeBackground = localStorage.getItem('activeBackground');
    if (activeBackground) {
      const bgData = JSON.parse(activeBackground);
      if (bgData.type === 'video') {
        applyVideoBackground(bgData);
      } else {
        applyImageBackground(bgData);
      }
    }
  }, []);

  const handleReset = () => {
    // Reset theme to default
    const defaultTheme = '#219ebc';
    setSelectedTheme(defaultTheme);
    applyTheme(defaultTheme);

    // Reset background
    // Clear any existing backgrounds
    document.body.style.background = 'none';
    document.body.style.backgroundImage = 'none';
    const existingVideo = document.querySelector('.background-video');
    if (existingVideo) {
      existingVideo.remove();
    }

    // Reset to default background color
    document.body.style.backgroundColor = '#1a1e23';

    // Clear active background from localStorage
    localStorage.removeItem('activeBackground');
    localStorage.setItem('themeColor', defaultTheme);

    // Clear selected background
    setSelectedBackground(null);
    setPreviewBackground(null);
  };

  return (
    <div className="customize-overlay">
      <div className="customize-modal">
        <button className="close-button" onClick={handleCancel}>×</button>
        <h2>Customize Calendar</h2>
        
        <div className="customize-tabs">
          <button 
            className={`tab-button ${activeTab === 'default' ? 'active' : ''}`}
            onClick={() => setActiveTab('default')}
          >
            My Library
          </button>
          <button 
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload Wallpaper
          </button>
          <button 
            className={`tab-button ${activeTab === 'unsplash' ? 'active' : ''}`}
            onClick={() => setActiveTab('unsplash')}
          >
            Online Library
          </button>
          <button 
            className={`tab-button ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
          >
            Color Theme
          </button>
        </div>

        <div className="customize-content">
          {activeTab === 'default' && (
            <div className="default-backgrounds">
              <div className="backgrounds-grid">
                {allBackgrounds.map((bg) => (
                  <div
                    key={bg.id}
                    className={`background-item ${selectedBackground?.id === bg.id ? 'selected' : ''}`}
                    onClick={() => showPreviewBackground(bg)}
                  >
                    {bg.type === 'video' ? (
                      <div className="video-thumbnail">
                        <video src={bg.src} muted playsInline className="preview-video" />
                        <div className="video-icon">▶</div>
                      </div>
                    ) : (
                      <img src={bg.src} alt={bg.title} />
                    )}
                    <p className="background-title">{bg.title}</p>
                    {!bg.id.startsWith('default-') && (
                      <button 
                        className="delete-background"
                        onClick={(e) => handleDeleteBackground(bg, e)}
                        title="Delete background"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="upload-section">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="file-input"
              />
              <p className="upload-info">
                Upload an image or video to use as your calendar background
              </p>
            </div>
          )}

          {activeTab === 'unsplash' && (
            <div className="unsplash-section">
              <div className="search-bar">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for images..."
                />
                <button onClick={searchUnsplash}>Search</button>
              </div>
              <div className="image-grid">
                {unsplashImages.map((image) => (
                  <div
                    key={image.id}
                    className="image-item"
                    onClick={() => selectUnsplashImage(image)}
                  >
                    <img src={image.urls.thumb} alt={image.alt_description} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="theme-section">
              <input
                type="color"
                value={selectedTheme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="color-picker"
              />
              <p className="theme-info">
                Select a color to customize your calendar's theme
              </p>
            </div>
          )}
        </div>

        <button className="reset-button" onClick={handleReset}>
          <FiRefreshCcw className="reset-icon" />
          Reset to Default
        </button>

        <div className="customize-actions">
          <div className="action-buttons">
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button className="apply-button" onClick={handleApply}>
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomizeCalendar;
