
// Types of notifications
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'alert';

// Define AlertLevel type to ensure consistency throughout the application
export type AlertLevel = 'low' | 'moderate' | 'high' | 'severe';

// Sound configuration for different notification types
const soundMap: Record<NotificationType, string> = {
  info: '/sounds/info.mp3',
  success: '/sounds/success.mp3',
  warning: '/sounds/warning.mp3',
  error: '/sounds/error.mp3',
  alert: '/sounds/alert.mp3',
};

// Volume levels for different notification types
const volumeMap: Record<NotificationType, number> = {
  info: 0.3,
  success: 0.4,
  warning: 0.6,
  error: 0.8,
  alert: 1.0,
};

// Cache for audio elements to prevent recreating them
const audioCache: Record<string, HTMLAudioElement> = {};

// Flag to track if sounds are enabled
let soundsEnabled = false;

/**
 * Enable or disable notification sounds
 * @param enable - Whether to enable sounds
 */
export const setSoundsEnabled = (enable: boolean): void => {
  soundsEnabled = enable;
  console.log(`Notification sounds ${enable ? 'enabled' : 'disabled'}`);
  
  // Test sound when enabling
  if (enable) {
    playNotificationSound('info', 0.2).catch(err => 
      console.warn('Error playing test sound:', err)
    );
  }
};

/**
 * Check if sounds are enabled
 * @returns Whether sounds are enabled
 */
export const areSoundsEnabled = (): boolean => {
  return soundsEnabled;
};

// Initialize the audio elements to fix autoplay issues
export const initializeAudio = (): void => {
  Object.entries(soundMap).forEach(([type, url]) => {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.volume = 0;
    
    // Create user interaction to allow autoplay later
    const playAndPause = () => {
      audio.play()
        .then(() => {
          setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
          }, 10);
        })
        .catch(err => console.warn(`Could not preload ${type} sound:`, err));
    };
    
    // Add event listener for user interaction
    document.addEventListener('click', function handleClick() {
      playAndPause();
      document.removeEventListener('click', handleClick);
    }, { once: true });
    
    // Store in cache
    audioCache[url] = audio;
  });
};

/**
 * Play a notification sound
 * @param type - Type of notification
 * @param volume - Optional volume override (0.0 to 1.0)
 * @returns Promise that resolves when the sound finishes playing
 */
export const playNotificationSound = async (
  type: NotificationType = 'info', 
  volume?: number
): Promise<void> => {
  // If sounds are disabled, return immediately
  if (!soundsEnabled) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    try {
      const soundUrl = soundMap[type];
      
      // If we've already created this audio element, reuse it
      if (!audioCache[soundUrl]) {
        const audio = new Audio(soundUrl);
        audio.preload = 'auto';
        audioCache[soundUrl] = audio;
      }
      
      const audio = audioCache[soundUrl];
      audio.volume = volume !== undefined ? volume : volumeMap[type];
      
      // Add event listeners
      const onEnded = () => {
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
        resolve();
      };
      
      const onError = (error: ErrorEvent) => {
        console.error('Error playing notification sound:', error);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
        reject(error);
      };
      
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);
      
      // Play the sound
      audio.currentTime = 0; // Reset to start
      audio.play().catch(error => {
        console.warn('Could not play notification sound:', error, 'URL:', soundUrl);
        resolve(); // Resolve anyway to not block the flow
      });
    } catch (error) {
      console.error('Error setting up notification sound:', error);
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

// Initialize audio on module load
if (typeof document !== 'undefined') {
  initializeAudio();
}
