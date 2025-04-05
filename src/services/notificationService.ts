// Types of notifications
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'alert';

// Define AlertLevel type to ensure consistency throughout the application
export type AlertLevel = 'low' | 'moderate' | 'high' | 'severe';

// Sound configuration for different notification types
const soundMap: Record<NotificationType, string> = {
  info: 'https://cdn.freesound.org/previews/536/536113_11861866-lq.mp3',
  success: 'https://cdn.freesound.org/previews/320/320775_5260872-lq.mp3',
  warning: 'https://cdn.freesound.org/previews/274/274607_5099947-lq.mp3',
  error: 'https://cdn.freesound.org/previews/560/560446_7031806-lq.mp3',
  alert: 'https://cdn.freesound.org/previews/397/397355_4284968-lq.mp3',
};

// Volume levels for different notification types
const volumeMap: Record<NotificationType, number> = {
  info: 0.4,
  success: 0.5,
  warning: 0.6,
  error: 0.7,
  alert: 0.8,
};

// Flag to track if sounds are enabled
let soundsEnabled = false;

/**
 * Enable or disable notification sounds
 * @param enable - Whether to enable sounds
 */
export const setSoundsEnabled = (enable: boolean): void => {
  soundsEnabled = enable;
  console.log(`Notification sounds ${enable ? 'enabled' : 'disabled'}`);
  
  // Save the setting to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('cosmic-sounds-enabled', JSON.stringify(enable));
  }
  
  // Test sound when enabling
  if (enable) {
    playNotificationSound('info', 0.3).catch(err => 
      console.warn('Error playing test sound:', err)
    );
  }
};

/**
 * Check if sounds are enabled
 * @returns Whether sounds are enabled
 */
export const areSoundsEnabled = (): boolean => {
  if (typeof window !== 'undefined') {
    const savedSetting = localStorage.getItem('cosmic-sounds-enabled');
    if (savedSetting !== null) {
      soundsEnabled = JSON.parse(savedSetting);
    }
  }
  return soundsEnabled;
};

/**
 * Check if audio is available and use the cached audio if possible
 */
const getAudio = (url: string): HTMLAudioElement => {
  // Check if we have the preloaded audio in the global cache
  if (typeof window !== 'undefined' && window.cosmicSoundCache && window.cosmicSoundCache[url]) {
    return window.cosmicSoundCache[url];
  }
  
  // Otherwise create a new audio element
  const audio = new Audio(url);
  audio.preload = 'auto';
  
  // Cache it for future use
  if (typeof window !== 'undefined') {
    window.cosmicSoundCache = window.cosmicSoundCache || {};
    window.cosmicSoundCache[url] = audio;
  }
  
  return audio;
};

/**
 * Play a notification sound
 * @param type - Type of notification
 * @param volume - Optional volume override (0.0 to 1.0)
 * @returns Promise that resolves when the sound finishes playing
 */
export const playNotificationSound = (
  type: NotificationType = 'info', 
  volume?: number
): Promise<void> => {
  // If sounds are disabled, return immediately
  if (!soundsEnabled) {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    try {
      const soundUrl = soundMap[type];
      
      // Get the audio element (either cached or new)
      const audio = getAudio(soundUrl);
      
      // Set volume
      audio.volume = volume !== undefined ? volume : volumeMap[type];
      
      // Reset position
      audio.currentTime = 0;
      
      // Play the sound
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Sound started playing successfully
            console.log(`Playing ${type} sound`);
            
            // Resolve when the sound finishes
            audio.onended = () => {
              resolve();
            };
            
            // Also resolve after a timeout in case the sound fails to end event
            setTimeout(resolve, 4000);
          })
          .catch(error => {
            console.warn('Could not play sound:', error);
            resolve(); // Resolve anyway to not block the flow
          });
      } else {
        // Older browsers might not return a promise
        setTimeout(resolve, 1000);
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
      resolve(); // Resolve anyway to not block the flow
    }
  });
};

/**
 * Play notification sound based on activity level
 * @param activityLevel - Current space weather activity level
 */
export const playActivityLevelSound = (
  activityLevel: AlertLevel
): void => {
  // Map activity levels to notification types
  const typeMap: Record<AlertLevel, NotificationType> = {
    'low': 'info',
    'moderate': 'warning',
    'high': 'error',
    'severe': 'alert'
  };
  
  const notificationType = typeMap[activityLevel];
  playNotificationSound(notificationType).catch(err => 
    console.warn(`Failed to play ${activityLevel} activity sound:`, err)
  );
};

// Configuration for toast notifications
export const toastDuration = 3000; // 3 seconds is less intrusive
export const autoCloseToasts = true; // Auto-close all toasts

// Initialize sounds on first import
if (typeof window !== 'undefined') {
  // Check localStorage for saved setting
  const savedSetting = localStorage.getItem('cosmic-sounds-enabled');
  if (savedSetting !== null) {
    soundsEnabled = JSON.parse(savedSetting);
  }
}
