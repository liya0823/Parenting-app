'use client';

import { useEffect, useRef } from 'react';

interface NotificationAudioProps {
  sound: string;
  onEnded: () => void;
  isModalVisible: boolean;
  isPageReady: boolean;
}

export const NotificationAudio: React.FC<NotificationAudioProps> = ({
  sound,
  onEnded,
  isModalVisible,
  isPageReady,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedRef = useRef(false);
  const mainAudioPausedRef = useRef(false);

  // 暫停主音頻
  const pauseMainAudio = () => {
    const mainAudioPatterns = [
      'ocean.mp3', 'rain.mp3', 'fire.mp3', 's0.mp3',
      '66666.mp3', 'sssss.mp3', '88888.mp3', '51.mp3',
      '50.mp3', 'dog.mp3', 'sheep.mp3', 'el.mp3',
      '0000.mp3', 'cat.mp3', 'duck.mp3', 'bear.mp3',
      'frog.mp3'
    ];

    const allAudios = document.querySelectorAll('audio');
    const mainAudios = Array.from(allAudios).filter(audio => {
      if (!(audio instanceof HTMLAudioElement)) return false;
      return mainAudioPatterns.some(pattern => audio.src.includes(pattern));
    }) as HTMLAudioElement[];

    let wasPlaying = false;
    mainAudios.forEach(audio => {
      if (!audio.paused) {
        wasPlaying = true;
        audio.pause();
      }
    });
    
    mainAudioPausedRef.current = wasPlaying;
  };

  // 恢復主音頻
  const resumeMainAudio = () => {
    if (!mainAudioPausedRef.current) return;

    const mainAudioPatterns = [
      'ocean.mp3', 'rain.mp3', 'fire.mp3', 's0.mp3',
      '66666.mp3', 'sssss.mp3', '88888.mp3', '51.mp3',
      '50.mp3', 'dog.mp3', 'sheep.mp3', 'el.mp3',
      '0000.mp3', 'cat.mp3', 'duck.mp3', 'bear.mp3',
      'frog.mp3'
    ];

    const allAudios = document.querySelectorAll('audio');
    const mainAudios = Array.from(allAudios).filter(audio => {
      if (!(audio instanceof HTMLAudioElement)) return false;
      return mainAudioPatterns.some(pattern => audio.src.includes(pattern));
    }) as HTMLAudioElement[];

    mainAudios.forEach(audio => {
      audio.play().catch(() => {});
    });
  };

  // 播放提示音
  const playNotification = async () => {
    // 防止重複播放
    if (!isModalVisible || !isPageReady || hasPlayedRef.current) {
      return;
    }

    try {
      // 標記為已播放，防止重複
      hasPlayedRef.current = true;
      
      // 暫停主音頻
      pauseMainAudio();
      
      // 如果已經有音頻在播放，先停止它
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      
      // 創建新音頻實例
      audioRef.current = new Audio(`/audio/${sound}`);
      
      // 設置事件處理器
      audioRef.current.onended = () => {
        // 恢復主音頻
        resumeMainAudio();
        // 調用回調
        onEnded();
        // 清理音頻實例
        audioRef.current = null;
      };
      
      // 播放提示音
      await audioRef.current.play();
    } catch (error) {
      console.error('Failed to play notification:', error);
      // 恢復主音頻
      resumeMainAudio();
      // 調用回調
      onEnded();
      // 清理音頻實例
      audioRef.current = null;
    }
  };

  // 當 modal 可見時播放音頻
  useEffect(() => {
    if (isModalVisible && isPageReady && !hasPlayedRef.current) {
      // 使用 setTimeout 確保在 DOM 完全加載後播放
      const timer = setTimeout(() => {
        playNotification();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isModalVisible, isPageReady]);

  // 重置狀態
  useEffect(() => {
    if (!isModalVisible) {
      hasPlayedRef.current = false;
      mainAudioPausedRef.current = false;
    }
  }, [isModalVisible]);

  // 清理
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, []);

  return null;
}; 