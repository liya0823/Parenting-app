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
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化 AudioContext
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioContextClass();

    // 預加載音效
    const loadAudio = async () => {
      try {
        const response = await fetch('/audio/哭聲偵測中.mp3');
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current?.decodeAudioData(arrayBuffer);
        if (audioBuffer) {
          audioBufferRef.current = audioBuffer;
          console.log('音效加載成功');
        }
      } catch (error) {
        console.error('音效加載失敗:', error);
      }
    };

    loadAudio();

    return () => {
      cleanup();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

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

  const playAudioBuffer = async () => {
    if (!audioContextRef.current || !audioBufferRef.current) {
      console.error('AudioContext 或 AudioBuffer 未初始化');
      return;
    }

    try {
      // 確保之前的音頻源已經停止和斷開連接
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }

      // 創建新的音頻源
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      
      // 創建增益節點來控制音量
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 1.0; // 設置初始音量
      
      // 連接音頻節點
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      sourceNodeRef.current = source;

      // 監聽播放結束
      source.onended = () => {
        console.log('音效播放結束');
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current = null;
        }
      };

      // 播放音效
      source.start(0);
      console.log('音效播放成功');

    } catch (error) {
      console.error('音效播放失敗:', error);
      cleanup();
      setIsDetecting(false);
      
      // 如果是 iOS 設備，特別處理
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        console.log('檢測到 iOS 設備，使用特殊處理');
        try {
          // 嘗試重新初始化 AudioContext
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          await audioContextRef.current.resume();
          
          // 重新加載音效
          const response = await fetch('/audio/哭聲偵測中.mp3');
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          audioBufferRef.current = audioBuffer;
          
          // 立即重試播放
          await playAudioBuffer();
        } catch (retryError) {
          console.error('iOS 重試播放失敗:', retryError);
        }
      }
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
    
    cleanup(); // 先清理之前的狀態
    setIsDetecting(true);
    console.log('開始偵測流程');

    try {
      // 確保 AudioContext 已初始化
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        
        // 如果是新創建的 AudioContext，需要加載音效
        const response = await fetch('/audio/哭聲偵測中.mp3');
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        audioBufferRef.current = audioBuffer;
      }

      // 如果是 iOS 設備，確保在用戶交互時恢復 AudioContext
      if (/iPhone|iPad|iPod/.test(navigator.userAgent) && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // 播放偵測音效
      await playAudioBuffer();

      // 設置計時器
      redirectTimerRef.current = setTimeout(handleRedirect, 4000);
    } catch (error) {
      console.error('開始偵測時發生錯誤:', error);
      cleanup();
      setIsDetecting(false);
    }
  };

  const handleModeChange = (mode: string) => {
    cleanup(); // 切換模式時清理音頻
    setActiveMode(mode);
    setIsDetecting(false);
    onModeChange?.(mode);
    if (mode === 'manual') {
      router.push('/features/soothing-music/playlist');
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