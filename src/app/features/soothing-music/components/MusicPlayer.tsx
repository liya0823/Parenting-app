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
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化 AudioContext
  const initAudioContext = async () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        console.log('AudioContext 初始化成功');
      }

      // 確保 AudioContext 是運行狀態
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('AudioContext 已恢復運行');
      }

      // 檢查並載入音效
      if (!audioBufferRef.current) {
        console.log('開始載入音效...');
        const response = await fetch('/audio/哭聲偵測中.mp3');
        console.log('音效載入狀態:', response.status);
        if (!response.ok) {
          throw new Error(`音效載入失敗: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
        console.log('音效載入成功');
      }

      setIsAudioInitialized(true);
    } catch (error) {
      console.error('音效初始化失敗:', error);
      setIsAudioInitialized(false);
    }
  };

  // 清理函數
  const cleanup = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
  };

  // 播放音效
  const playAudioBuffer = async () => {
    if (!audioContextRef.current || !audioBufferRef.current || !gainNodeRef.current) {
      console.error('音效系統未初始化');
      return;
    }

    try {
      // 確保 AudioContext 是運行狀態
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // 停止之前的音效（如果有）
      cleanup();

      // 創建新的音源
      sourceNodeRef.current = audioContextRef.current.createBufferSource();
      sourceNodeRef.current.buffer = audioBufferRef.current;

      // 設置音量（確保不是 0）
      gainNodeRef.current.gain.value = 1.0;

      // 連接音源
      sourceNodeRef.current.connect(gainNodeRef.current);

      // 監聽播放結束
      sourceNodeRef.current.onended = () => {
        console.log('音效播放結束');
        cleanup();
      };

      // 開始播放
      sourceNodeRef.current.start(0);
      console.log('音效開始播放');

    } catch (error) {
      console.error('音效播放失敗:', error);
      cleanup();
      setIsDetecting(false);
    }
  };

  const startDetection = async () => {
    if (isDetecting) return;
    
    cleanup();
    setIsDetecting(true);
    console.log('開始偵測流程');

    // 先設置跳轉計時器，確保一定會跳轉
    console.log('設置 4 秒後跳轉');
    redirectTimerRef.current = setTimeout(() => {
      console.log('4 秒時間到，執行跳轉');
      handleRedirect();
    }, 4000);

    // 嘗試播放音效，但不影響跳轉
    try {
      if (!isAudioInitialized) {
        await initAudioContext();
      }
      await playAudioBuffer();
    } catch (error) {
      console.error('音效播放失敗，但會繼續跳轉:', error);
      // 不需要清理 redirectTimerRef，讓它繼續計時
    }
  };

  const handleRedirect = () => {
    console.log('準備跳轉，當前模式:', activeMode);
    
    // 確保一定會跳轉
    const situations = Object.keys(situationMusicMap) as Array<keyof typeof situationMusicMap>;
    const randomSituation = situations[Math.floor(Math.random() * situations.length)];
    setDetectedSituation(randomSituation);
    
    const musicType = situationMusicMap[randomSituation];
    console.log('即將跳轉到音樂播放頁面:', musicType);
    
    setFadeOut(true);
    
    // 使用 window.location 直接跳轉，確保一定會跳轉
    setTimeout(() => {
      console.log('執行跳轉到:', `/features/soothing-music/${musicType}?autoplay=true`);
      window.location.href = `/features/soothing-music/${musicType}?autoplay=true`;
    }, 500);
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

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      cleanup();
      if (audioContextRef.current) {
        audioContextRef.current.close();
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