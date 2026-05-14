"use client";

export type SoundType = 'click' | 'success' | 'error' | 'menu';

const sounds: Record<SoundType, string> = {
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  menu: '/sounds/menu-click.mp3',
};

// Use a singleton audio context if needed, or just new Audio
export const playSound = (type: SoundType) => {
  if (typeof window === 'undefined') return;
  
  try {
    const audio = new Audio(sounds[type]);
    audio.volume = 0.4;
    audio.play().catch(e => {
        // Handle cases where browser blocks auto-play
        // console.warn("Sound play failed:", e);
    });
  } catch (error) {
    // console.error("Error playing sound:", error);
  }
};
