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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    onModeChange?.(mode);
    if (mode === 'manual') {
      router.push('/features/soothing-music/playlist');
    }
  };

  const startDetection = () => {
    if (!isDetecting) {
      setIsDetecting(true);
      
      // 立即播放偵測音效
      const detectionAudio = new Audio('/audio/哭聲偵測中.mp3');
      detectionAudio.volume = 1.0;
      detectionAudio.play()
        .then(() => {
          console.log('偵測音效播放成功');
        })
        .catch(error => {
          console.error('偵測音效播放失敗:', error);
        });
      
      // 預先創建提示音元素
      const alertAudio = new Audio('/audio/提示音.mp3');
      alertAudio.volume = 1.0;
      audioRef.current = alertAudio;

      // 設置計時器，4000毫秒後播放提示音並跳轉
      redirectTimerRef.current = setTimeout(() => {
        if (activeMode === 'auto') {
          // 播放提示音
          alertAudio.play()
            .then(() => {
              console.log('提示音播放成功');
            })
            .catch(error => {
              console.error('提示音播放失敗:', error);
              // 如果播放失敗，立即重試一次
              alertAudio.play().catch(err => console.error('提示音重試失敗:', err));
            });

          const situations = Object.keys(situationMusicMap) as Array<keyof typeof situationMusicMap>;
          const randomSituation = situations[Math.floor(Math.random() * situations.length)];
          setDetectedSituation(randomSituation);
          
          const musicType = situationMusicMap[randomSituation];
          console.log('準備跳轉到音樂播放頁面:', musicType);
          
          setFadeOut(true);
          setTimeout(() => {
            // 在跳轉前停止音頻播放
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
            }
            router.push(`/features/soothing-music/${musicType}?autoplay=true`);
          }, 500);
        }
      }, 4000);
    }
  };

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
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