'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './MusicPlayer.module.css';
import { useRouter } from 'next/navigation';

// 定義不同情況的提示窗文案
const notificationMessages = {
  hungry: {
    title: '媽媽 / 爸爸，我需要你 🥺',
    message: '偵測到寶寶的哭聲，可能是餓了或想要抱抱。已幫您播放「溫柔的雨聲」🌧️，希望能讓寶寶安心入睡～',
    sound: '偵測到寶寶的.mp3'
  },
  briefCry: {
    title: '寶寶短暫哭了一下，但現在安靜了 😊',
    message: '或許只是睡夢中小小驚醒，已播放輕柔的搖籃曲 🎶，幫助寶寶再次入眠～',
    sound: '寶寶短暫哭了.mp3'
  },
  longCry: {
    title: '別擔心，我來幫你安撫寶寶 🍼',
    message: '寶寶哭了一段時間，可能是想要您的關心。建議查看是否需要餵奶、換尿布或輕輕拍背安撫，我們也已播放舒緩的噓聲 🎶',
    sound: '寶寶哭了一段.mp3'
  },
  morning: {
    title: '寶寶早晨的哭聲，是想要開始新的一天嗎？🌞',
    message: '聽起來是醒來的聲音，您可以溫柔地抱起寶寶，和他說早安 👶💛 如果還想讓他多睡一會兒，已幫您播放「輕柔的鳥鳴聲」🕊️',
    sound: '聽起來是醒來.mp3'
  },
  night: {
    title: '夜深了，寶寶還有些不安嗎？💤',
    message: '有時候，夜晚會讓寶寶感到沒有安全感。已播放安眠曲 💓，希望能讓他像回到媽媽懷裡一樣安心～',
    sound: '有時候，夜晚.mp3'
  },
  default: {
    title: '偵測到哭聲',
    message: '正在為您播放音樂，希望能讓寶寶安心～',
    sound: '偵測到哭聲.mp3'
  }
} as const;

// 定義不同情況對應的音樂類型
const situationMusicMap = {
  hungry: 'rain', // 餓了或想要抱抱
  briefCry: 'lullaby', // 短暫哭了一下
  longCry: 'shush', // 哭了一段時間
  morning: 'bird', // 早晨的哭聲
  night: 'cradle', // 夜晚的不安
  default: 'ocean' // 默認情況
} as const;

type SituationType = keyof typeof situationMusicMap;
type NotificationType = keyof typeof notificationMessages;

export interface MusicPlayerProps {
  onModeChange?: (mode: string) => void;
}

const MusicPlayer = ({ onModeChange }: MusicPlayerProps) => {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState('auto');
  const [fadeOut, setFadeOut] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedSituation, setDetectedSituation] = useState<SituationType | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const detectionBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<typeof notificationMessages[NotificationType] | null>(null);
  const [notificationBufferRef, setNotificationBufferRef] = useState<AudioBuffer | null>(null);
  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const loadingPromisesRef = useRef<{ [key: string]: Promise<void> }>({});
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isAudioSupported, setIsAudioSupported] = useState(true);
  const audioLoadRetryCount = useRef(0);
  const maxRetries = 3;

  // 檢測是否為移動設備
  useEffect(() => {
    const checkMobileDevice = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobileDevice(isMobile);
    };
    
    checkMobileDevice();
    window.addEventListener('resize', checkMobileDevice);
    
    return () => {
      window.removeEventListener('resize', checkMobileDevice);
    };
  }, []);

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
      setIsAudioSupported(false);
      return false;
    }
  };

  // 加載音效
  const loadAudio = async (url: string): Promise<AudioBuffer | null> => {
    try {
      console.log(`開始加載音效: ${url}`);
      
      const response = await fetch(url);
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
        console.log('音效解碼成功');
        return audioBuffer;
      }
      return null;
    } catch (error) {
      console.error('加載音效失敗:', error);
      return null;
    }
  };

  // 播放音效
  const playAudio = async (buffer: AudioBuffer): Promise<void> => {
    try {
      const isReady = await initAudioContext();
      if (!isReady || !audioContextRef.current) {
        throw new Error('AudioContext 未就緒');
      }

      // 停止之前的音效（如果有）
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
          sourceNodeRef.current.disconnect();
        } catch (error) {
          console.log('停止之前的音效時發生錯誤:', error);
        }
      }

      // 創建新的音源
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      
      // 創建音量控制
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = isMobileDevice ? 1.0 : 0.8; // 移動設備使用最大音量

      // 連接節點
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // 保存音源引用
      sourceNodeRef.current = source;

      return new Promise((resolve) => {
        source.onended = () => {
          console.log('音效播放結束');
          if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
          }
          resolve();
        };

        // 開始播放
        source.start(0);
        console.log('音效開始播放');
      });
    } catch (error) {
      console.error('播放音效失敗:', error);
      throw error;
    }
  };

  // 加載偵測音效
  const loadDetectionSound = async () => {
    if (isLoadingRef.current || detectionBufferRef.current) return;
    isLoadingRef.current = true;
    try {
      const buffer = await loadAudio('/audio/哭聲偵測中.mp3');
      if (buffer) {
        detectionBufferRef.current = buffer;
      }
    } finally {
      isLoadingRef.current = false;
    }
  };

  // 播放偵測音效
  const playDetectionSound = async () => {
    try {
      if (!audioContextRef.current) {
        await initAudioContext();
      }

      if (!detectionBufferRef.current) {
        detectionBufferRef.current = await loadAudio('/audio/哭聲偵測中.mp3');
      }

      if (audioContextRef.current && detectionBufferRef.current) {
        await playAudio(detectionBufferRef.current);
        console.log('偵測音效播放完成');
      } else {
        throw new Error('無法播放音效：AudioContext 或音效緩衝區未就緒');
      }
    } catch (error) {
      console.error('播放偵測音效失敗:', error);
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

  // 預加載音效
  const preloadAudio = async (soundFile: string): Promise<void> => {
    // 如果已經在加載中，返回現有的 Promise
    if (soundFile in loadingPromisesRef.current) {
      return loadingPromisesRef.current[soundFile];
    }
    
    // 如果已經加載完成，直接返回
    if (soundFile in audioElementsRef.current) {
      return Promise.resolve();
    }
    
    // 創建新的加載 Promise
    const loadPromise = new Promise<void>((resolve, reject) => {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        
        // 設置事件監聽器
        audio.oncanplaythrough = () => {
          console.log(`音效已加載: ${soundFile}`);
          audioElementsRef.current[soundFile] = audio;
          resolve();
        };
        
        audio.onerror = (e) => {
          console.error(`音效加載失敗: ${soundFile}`, e);
          reject(e);
        };
        
        // 設置音源
        audio.src = soundFile;
        
        // 設置超時保護（5秒）
        setTimeout(() => {
          if (!audioElementsRef.current[soundFile]) {
            console.log(`音效加載超時: ${soundFile}`);
            reject(new Error('加載超時'));
          }
        }, 5000);
      } catch (error) {
        console.error(`音效加載過程發生錯誤: ${soundFile}`, error);
        reject(error);
      }
    });
    
    // 保存 Promise 引用
    loadingPromisesRef.current[soundFile] = loadPromise;
    
    // 返回 Promise
    return loadPromise;
  };
  
  // 播放音效函數
  const playSound = async (soundFile: string): Promise<void> => {
    try {
      // 嘗試預加載音效
      await preloadAudio(soundFile);
      
      // 獲取音效元素
      const audio = audioElementsRef.current[soundFile];
      if (!audio) {
        throw new Error(`音效未加載: ${soundFile}`);
      }
      
      // 重置音效
      audio.currentTime = 0;
      audio.volume = isMobileDevice ? 1.0 : 0.8;
      
      // 播放音效
      await audio.play();
      
      // 等待音效播放完成或超時
      await new Promise<void>((resolve) => {
        const handleEnded = () => {
          console.log(`音效播放完成: ${soundFile}`);
          audio.removeEventListener('ended', handleEnded);
          resolve();
        };
        
        audio.addEventListener('ended', handleEnded);
        
        // 設置超時保護（3秒）
        setTimeout(() => {
          audio.removeEventListener('ended', handleEnded);
          console.log(`音效播放超時: ${soundFile}`);
          resolve();
        }, 4000);
      });
    } catch (error) {
      console.error(`音效播放錯誤: ${soundFile}`, error);
      // 即使出錯也繼續執行
    }
  };

  // 在組件掛載時預加載所有音效
  useEffect(() => {
    // 預加載偵測音效
    preloadAudio('/audio/哭聲偵測中.mp3').catch(() => {
      console.log('偵測音效預加載失敗，將在播放時重試');
    });
    
    // 預加載所有提示音效
    Object.values(notificationMessages).forEach(message => {
      preloadAudio(`/audio/${message.sound}`).catch(() => {
        console.log(`提示音效預加載失敗: ${message.sound}，將在播放時重試`);
      });
    });
    
    // 清理函數
    return () => {
      // 清理所有音效元素
      Object.values(audioElementsRef.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      audioElementsRef.current = {};
      loadingPromisesRef.current = {};
    };
  }, []);

  const startDetection = async () => {
    if (isDetecting) return;
    setIsDetecting(true);

    try {
      // 播放偵測音效（不等待完成）
      playSound('/audio/哭聲偵測中.mp3').catch(() => {
        console.log('偵測音效播放失敗，繼續執行');
      });
      
      // 等待 2 秒
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 選擇情境
      const situations: SituationType[] = ['hungry', 'briefCry', 'longCry', 'morning', 'night', 'default'];
      const randomSituation = situations[Math.floor(Math.random() * situations.length)];
      const musicType = situationMusicMap[randomSituation];
      const message = notificationMessages[randomSituation];

      // 顯示提示窗
      setDetectedSituation(randomSituation);
      setShowNotification(true);
      setNotificationMessage(message);

      // 播放提示音（不等待完成）
      playSound(`/audio/${message.sound}`).catch(() => {
        console.log('提示音播放失敗，繼續執行');
      });

      // 立即開始淡出動畫
      setFadeOut(true);

      // 0.5秒後跳轉
      setTimeout(() => {
        router.push(`/features/soothing-music/${musicType}?autoplay=true&start=${Date.now()}`);
      }, 500);

    } catch (error) {
      console.error('偵測過程發生錯誤:', error);
      setIsDetecting(false);
    }
  };

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    setIsDetecting(false);
    onModeChange?.(mode);
    if (mode === 'manual') {
      router.push('/features/soothing-music/playlist');
    }
  };

  return (
    <div className={`${styles.container} ${fadeOut ? styles.fadeOut : ''}`}>
      {showNotification && notificationMessage && (
        <div className={styles.notification}>
          <div className={styles.notificationContent}>
            <Image
              src="/CryBaby.png"
              alt="CryBaby"
              width={45}
              height={45}
              className={styles.notificationIcon}
            />
            <div className={styles.notificationText}>
              <p className={styles.notificationTitle}>{notificationMessage.title}</p>
              <p className={styles.notificationMessage}>{notificationMessage.message}</p>
            </div>
          </div>
        </div>
      )}
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