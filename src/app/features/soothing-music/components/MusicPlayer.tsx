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
  const alertBufferRef = useRef<AudioBuffer | null>(null);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化音頻上下文和加載音頻
  const initAudioContext = async () => {
    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        console.log('AudioContext 創建成功:', audioContextRef.current.state);
      }

      // 如果音頻上下文被暫停，恢復它
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('AudioContext 恢復成功:', audioContextRef.current.state);
      }

      // 只有在還沒有加載音頻時才加載
      if (!detectionBufferRef.current) {
        console.log('開始加載偵測音效...');
        try {
          const detectionResponse = await fetch('/audio/detecting.mp3');
          if (!detectionResponse.ok) {
            throw new Error(`HTTP error! status: ${detectionResponse.status}`);
          }
          const detectionArrayBuffer = await detectionResponse.arrayBuffer();
          console.log('偵測音效 ArrayBuffer 大小:', detectionArrayBuffer.byteLength);
          
          detectionBufferRef.current = await audioContextRef.current.decodeAudioData(
            detectionArrayBuffer,
            (buffer) => {
              console.log('偵測音效解碼成功:', {
                duration: buffer.duration,
                numberOfChannels: buffer.numberOfChannels,
                sampleRate: buffer.sampleRate,
                length: buffer.length
              });
              return buffer;
            },
            (error) => {
              console.error('偵測音效解碼失敗:', error);
              return null;
            }
          );
        } catch (error) {
          console.error('加載偵測音效失敗:', error);
        }
      }

      if (!alertBufferRef.current) {
        console.log('開始加載提示音...');
        try {
          const alertResponse = await fetch('/audio/alert.mp3');
          if (!alertResponse.ok) {
            throw new Error(`HTTP error! status: ${alertResponse.status}`);
          }
          const alertArrayBuffer = await alertResponse.arrayBuffer();
          console.log('提示音 ArrayBuffer 大小:', alertArrayBuffer.byteLength);
          
          alertBufferRef.current = await audioContextRef.current.decodeAudioData(
            alertArrayBuffer,
            (buffer) => {
              console.log('提示音解碼成功:', {
                duration: buffer.duration,
                numberOfChannels: buffer.numberOfChannels,
                sampleRate: buffer.sampleRate,
                length: buffer.length
              });
              return buffer;
            },
            (error) => {
              console.error('提示音解碼失敗:', error);
              return null;
            }
          );
        } catch (error) {
          console.error('加載提示音失敗:', error);
        }
      }

      return detectionBufferRef.current !== null || alertBufferRef.current !== null;
    } catch (error) {
      console.error('初始化音頻失敗:', error);
      return false;
    }
  };

  // 清理函數
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const playAudioBuffer = async (buffer: AudioBuffer | null) => {
    console.log('準備播放音頻，Buffer 狀態:', {
      buffer: buffer ? {
        duration: buffer.duration,
        numberOfChannels: buffer.numberOfChannels,
        sampleRate: buffer.sampleRate,
        length: buffer.length
      } : null,
      audioContext: audioContextRef.current?.state
    });

    if (!buffer || !audioContextRef.current) {
      console.error('無法播放音頻：', !buffer ? 'Buffer 為空' : 'AudioContext 未初始化');
      return;
    }

    try {
      // 確保音頻上下文是運行狀態
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('AudioContext 恢復成功:', audioContextRef.current.state);
      }

      // 創建音頻源
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
      console.log('音頻播放成功開始');

      // 監聽播放結束
      source.onended = () => {
        console.log('音頻播放完成');
      };
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

      try {
        // 初始化音頻上下文和加載音頻
        const initialized = await initAudioContext();
        console.log('音頻初始化結果:', initialized);
        
        if (initialized) {
          console.log('偵測音效 Buffer 狀態:', detectionBufferRef.current);
          // 播放偵測音效
          await playAudioBuffer(detectionBufferRef.current);
        }
      } catch (error) {
        console.error('音頻播放失敗:', error);
      }
      
      // 設置計時器，4000毫秒後播放提示音並跳轉
      redirectTimerRef.current = setTimeout(async () => {
        if (activeMode === 'auto') {
          try {
            console.log('提示音 Buffer 狀態:', alertBufferRef.current);
            // 播放提示音
            await playAudioBuffer(alertBufferRef.current);
          } catch (error) {
            console.error('提示音播放失敗:', error);
          }

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