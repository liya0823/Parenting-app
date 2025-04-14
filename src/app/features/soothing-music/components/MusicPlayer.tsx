'use client';
import React, { useState, useEffect, useRef } from 'react';
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

export interface MusicPlayerProps {
  onModeChange?: (mode: string) => void;
}

const MusicPlayer = ({ onModeChange }: MusicPlayerProps) => {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState('auto');
  const [fadeOut, setFadeOut] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedSituation, setDetectedSituation] = useState<keyof typeof situationMusicMap | null>(null);
  const detectionAudioRef = useRef<HTMLAudioElement | null>(null);
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化音頻元素
  useEffect(() => {
    // 創建音頻元素
    detectionAudioRef.current = new Audio('/audio/哭聲偵測中.mp3');
    alertAudioRef.current = new Audio('/audio/偵測提示.mp3');

    // 預加載音頻
    if (detectionAudioRef.current) {
      detectionAudioRef.current.preload = 'auto';
      detectionAudioRef.current.load();
      detectionAudioRef.current.volume = 1.0;
    }
    
    if (alertAudioRef.current) {
      alertAudioRef.current.preload = 'auto';
      alertAudioRef.current.load();
      alertAudioRef.current.volume = 1.0;
    }

    return () => {
      // 清理音頻資源
      if (detectionAudioRef.current) {
        detectionAudioRef.current.pause();
        detectionAudioRef.current = null;
      }
      if (alertAudioRef.current) {
        alertAudioRef.current.pause();
        alertAudioRef.current = null;
      }
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const playAudio = async (audio: HTMLAudioElement | null) => {
    if (!audio) return;

    try {
      // 重置音頻
      audio.currentTime = 0;
      
      // 確保音頻已加載
      if (audio.readyState < 4) {
        await new Promise((resolve) => {
          audio.addEventListener('canplaythrough', resolve, { once: true });
          audio.load();
        });
      }
      
      // 播放音頻
      await audio.play();
      console.log('音頻播放成功');
    } catch (error) {
      console.error('音頻播放失敗:', error);
    }
  };

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    onModeChange?.(mode);
    if (mode === 'manual') {
      router.push('/features/soothing-music/playlist');
    }
  };

  const startDetection = async () => {
    if (!isDetecting) {
      setIsDetecting(true);
      console.log('開始偵測流程...');

      // 播放偵測音效
      await playAudio(detectionAudioRef.current);
      
      // 設置計時器，4000毫秒後播放提示音並跳轉
      redirectTimerRef.current = setTimeout(async () => {
        if (activeMode === 'auto') {
          // 播放提示音
          await playAudio(alertAudioRef.current);

          const situations = Object.keys(situationMusicMap) as Array<keyof typeof situationMusicMap>;
          const randomSituation = situations[Math.floor(Math.random() * situations.length)];
          setDetectedSituation(randomSituation);
          
          const musicType = situationMusicMap[randomSituation];
          console.log('準備跳轉到音樂播放頁面:', musicType);
          
          setFadeOut(true);
          setTimeout(() => {
            router.push(`/features/soothing-music/${musicType}?autoplay=true`);
          }, 500);
        }
      }, 4000);
    }
  };

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
          className={`${styles.backgroundCircle} ${isDetecting ? styles.playing : ''}`}
        />
        <div className={styles.soundWave}>
          {[90, 70, 85, 55, 45, 85, 65].map((height, index) => (
            <div
              key={index}
              className={`${styles.soundWaveBar} ${isDetecting ? styles.playing : ''}`}
              style={{
                height: `${height}px`,
                animationDelay: `${index * 0.2}s`
              }}
            />
          ))}
        </div>
        <div className={styles.detectionText}>
          <div className={styles.detectionRow}>
            {!isDetecting ? (
              <button 
                className={`${styles.detectionButton} ${styles.startButton}`}
                onClick={startDetection}
              >
                開始偵測
              </button>
            ) : (
              <span className={`${styles.detectingText}`}>
                哭聲偵測中<span className={styles.dots}>...</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer; 