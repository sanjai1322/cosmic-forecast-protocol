
// This script dynamically loads sound files if they don't exist
(function() {
  const soundUrls = {
    'info': 'https://cdn.freesound.org/previews/536/536113_11861866-lq.mp3',
    'success': 'https://cdn.freesound.org/previews/320/320775_5260872-lq.mp3',
    'warning': 'https://cdn.freesound.org/previews/274/274607_5099947-lq.mp3',
    'error': 'https://cdn.freesound.org/previews/560/560446_7031806-lq.mp3',
    'alert': 'https://cdn.freesound.org/previews/397/397355_4284968-lq.mp3'
  };

  // Function to check if sounds exist and download them if not
  const checkAndLoadSounds = async () => {
    for (const [name, url] of Object.entries(soundUrls)) {
      const filePath = `/sounds/${name}.mp3`;
      
      // Try to fetch the sound file
      try {
        const response = await fetch(filePath, { method: 'HEAD' });
        if (response.status === 404) {
          console.log(`Sound file ${name}.mp3 not found, using fallback URL.`);
          
          // Create a setup function to preload sounds
          const audio = new Audio();
          audio.src = url;
          
          // Preload the sound
          audio.addEventListener('canplaythrough', () => {
            console.log(`${name} sound preloaded from external source`);
          });
          
          // Cache for later use
          window.cosmicSoundCache = window.cosmicSoundCache || {};
          window.cosmicSoundCache[name] = audio;
        } else {
          console.log(`Sound file ${name}.mp3 exists.`);
        }
      } catch (error) {
        console.warn(`Error checking sound file ${name}.mp3:`, error);
        // Use fallback URL
        const audio = new Audio(url);
        
        // Cache for later use
        window.cosmicSoundCache = window.cosmicSoundCache || {};
        window.cosmicSoundCache[name] = audio;
      }
    }
  };

  // Run the check when the page loads
  window.addEventListener('load', checkAndLoadSounds);
})();
