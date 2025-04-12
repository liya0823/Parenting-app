'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './MusicPlayer.module.css';
import { useRouter } from 'next/navigation';

// 定義不同情況對應的音樂類型
const situationMusicMap = {
  hungry: 'rain', // 餓了或想要抱抱
  briefCry: 'lullaby', // 短暫哭了一下
  longCry: 'shush', // 哭了一段時間
  morning: 'bird', // 早晨的哭聲
  night: 'cradle', // 夜晚的不安
  default: 'ocean' // 默認情況
};

const MusicPlayer = () => {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState('auto'); // 'auto' or 'manual'
  const [fadeOut, setFadeOut] = useState(false);
  const [detectedSituation, setDetectedSituation] = useState<keyof typeof situationMusicMap | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); // 控制聲波動畫
  const [isPlayingSound, setIsPlayingSound] = useState(false); // 控制提示音播放
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const soundTimerRef = useRef<NodeJS.Timeout | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioPlayingRef = useRef<boolean>(false);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    if (mode === 'manual') {
      router.push('/features/soothing-music/playlist');
    }
  };

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeEventListener('ended', handleAudioEnded);
      audioRef.current = null;
    }
    isAudioPlayingRef.current = false;
  };

  const handleStartDetection = async () => {
    setIsDetecting(true);
    setIsAnimating(true);
    
    try {
      // 清理之前的音頻實例
      cleanupAudio();
      
      // 創建新的音頻實例
      const audio = new Audio('/audio/哭聲偵測中.mp3');
      
      // 設置音頻結束事件
      audio.addEventListener('ended', handleAudioEnded);
      
      // 賦值給 ref
      audioRef.current = audio;
      isAudioPlayingRef.current = true;
      
      // 播放音頻
      await audio.play();

      // 設置重定向計時器
      redirectTimerRef.current = setTimeout(() => {
        const situations = Object.keys(situationMusicMap) as (keyof typeof situationMusicMap)[];
        const randomSituation = situations[Math.floor(Math.random() * situations.length)];
        const musicType = situationMusicMap[randomSituation];
        
        router.push(`/features/soothing-music/${musicType}?autoplay=true`);
      }, 4000);
    } catch (error) {
      console.error('Failed to play detection sound:', error);
      handleAudioEnded();
    }
  };

  const handleStopDetection = () => {
    setIsDetecting(false);
    setIsAnimating(false);
    cleanupAudio();
    
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
  };

  const handleAudioEnded = () => {
    setIsAnimating(false);
    cleanupAudio();
  };

  const handleAudioError = (e: ErrorEvent) => {
    console.error('Audio error:', e);
    setIsPlayingSound(false);
    setIsAnimating(false);
    // 確保清理音頻實例
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // 組件卸載時清理計時器和音頻
  useEffect(() => {
    return () => {
      handleStopDetection();
    };
  }, []);

  return (
    <div className={`${styles.container} ${fadeOut ? styles.fadeOut : ''}`}>
      <div className={styles.header}>
        <div className={styles.logoWrapper}>
          <span className={styles.anxinwei}>安撫音樂</span>
          <Image
            src="/User.png"
            alt="使用者"
            width={40}
            height={40}
            className={styles.userIcon}
            onClick={() => router.push('/features/baby-page')}
          />
        </div>
        <div className={styles.toggleContainer} data-mode={activeMode}>
          <button 
            className={`${styles.toggleButton} ${activeMode === 'auto' ? styles.active : ''}`}
            onClick={() => handleModeChange('auto')}
          >
            自動
          </button>
          <button 
            className={`${styles.toggleButton} ${activeMode === 'manual' ? styles.active : ''}`}
            onClick={() => handleModeChange('manual')}
          >
            手動
          </button>
        </div>
      </div>

      <div className={styles.soundWaveContainer}>
        <Image
          src="/42.png"
          alt="背景圖"
          width={350}
          height={350}
          className={`${styles.backgroundCircle} ${isAnimating ? styles.animate : ''}`}
        />
        <div className={styles.soundWave}>
          {[90, 70, 85, 55, 45, 85, 65].map((height, index) => (
            <div
              key={index}
              className={`${styles.soundWaveBar} ${isAnimating ? styles.animate : ''}`}
              style={{
                height: `${height}px`,
                animationDelay: isAnimating ? `${index * 0.2}s` : '0s'
              }}
            />
          ))}
        </div>
        <div className={styles.detectionText}>
          {!isDetecting ? (
            <button 
              className={styles.startDetectionButton}
              onClick={handleStartDetection}
            >
              開始偵測
            </button>
          ) : (
            <div className={styles.detectionRow}>
              <span className={styles.staticText}>哭聲偵測中</span>
              <span className={styles.dots}>...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer; 