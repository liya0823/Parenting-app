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
  const audioContextRef = useRef<AudioContext | null>(null);
  const detectionBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  // 初始化 AudioContext
  const initAudioContext = async () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        console.log('AudioContext 初始化成功');
      }

      // 確保 AudioContext 是活躍的
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('AudioContext 已恢復');
      }

      return true;
    } catch (error) {
      console.error('初始化 AudioContext 失敗:', error);
      return false;
    }
  };

  // 加載音效
  const loadDetectionSound = async () => {
    if (isLoadingRef.current || detectionBufferRef.current) return;
    
    try {
      isLoadingRef.current = true;
      console.log('開始加載音效...');
      
      const response = await fetch('/audio/哭聲偵測中.mp3');
      console.log('音效檔案狀態:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('音效檔案已下載');

      if (!audioContextRef.current) {
        await initAudioContext();
      }

      if (audioContextRef.current) {
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        detectionBufferRef.current = audioBuffer;
        console.log('音效解碼成功');
      }
    } catch (error) {
      console.error('加載音效失敗:', error);
    } finally {
      isLoadingRef.current = false;
    }
  };

  // 播放音效
  const playDetectionSound = async () => {
    try {
      // 確保 AudioContext 已初始化且活躍
      const isReady = await initAudioContext();
      if (!isReady || !audioContextRef.current) {
        throw new Error('AudioContext 未就緒');
      }

      // 如果音效尚未加載，先加載
      if (!detectionBufferRef.current) {
        await loadDetectionSound();
      }

      if (!detectionBufferRef.current) {
        throw new Error('音效未能成功加載');
      }

      // 停止之前的音效（如果有）
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      }

      // 創建新的音源
      const source = audioContextRef.current.createBufferSource();
      source.buffer = detectionBufferRef.current;
      
      // 創建音量控制
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 1.0;

      // 連接節點
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // 保存音源引用
      sourceNodeRef.current = source;

      // 監聽播放結束
      source.onended = () => {
        console.log('音效播放結束');
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current = null;
        }
      };

      // 開始播放
      source.start(0);
      console.log('音效開始播放');

    } catch (error) {
      console.error('播放音效失敗:', error);
      throw error;
    }
  };

  // 清理函數
  const cleanup = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      } catch (error) {
        console.error('停止音效時發生錯誤:', error);
      }
    }

    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
  };

  const handleRedirect = () => {
    if (activeMode !== 'auto') return;

    const situations = Object.keys(situationMusicMap) as Array<keyof typeof situationMusicMap>;
    const randomSituation = situations[Math.floor(Math.random() * situations.length)];
    setDetectedSituation(randomSituation);
    
    const musicType = situationMusicMap[randomSituation];
    console.log('準備跳轉到音樂播放頁面:', musicType);
    
    setFadeOut(true);
    setTimeout(() => {
      router.push(`/features/soothing-music/${musicType}?autoplay=true`);
    }, 500);
  };

  const startDetection = async () => {
    if (isDetecting) return;
    
    cleanup();
    setIsDetecting(true);
    console.log('開始偵測流程');

    try {
      await playDetectionSound();
      redirectTimerRef.current = setTimeout(handleRedirect, 4000);
    } catch (error) {
      console.error('偵測過程發生錯誤:', error);
      cleanup();
      setIsDetecting(false);
    }
  };

  const handleModeChange = (mode: string) => {
    cleanup();
    setActiveMode(mode);
    setIsDetecting(false);
    onModeChange?.(mode);
    if (mode === 'manual') {
      router.push('/features/soothing-music/playlist');
    }
  };

  // 預加載音效
  useEffect(() => {
    loadDetectionSound();
    return cleanup;
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