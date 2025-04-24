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
  const maxRetries = 3;

  // 添加哭聲檢測相關的狀態和引用
  const [volume, setVolume] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>();
  const lastTriggerTimeRef = useRef<number>(0);
  const soundStartTimeRef = useRef<number | null>(null);
  const soundDetectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);
  const [isPlayingNotification, setIsPlayingNotification] = useState(false);

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
      gainNode.gain.value = 1.0;

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

  // 預加載單個音效
  const preloadSingleAudio = async (audioFile: string, retryCount = 0): Promise<HTMLAudioElement | null> => {
    try {
      const audio = new Audio(audioFile);
      audio.preload = 'auto';
      
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          console.log(`音效預加載超時: ${audioFile}`);
          reject(new Error('預加載超時'));
        }, 5000);

        audio.oncanplaythrough = () => {
          clearTimeout(timeoutId);
          console.log(`音效預加載成功: ${audioFile}`);
          resolve();
        };

        audio.onerror = () => {
          clearTimeout(timeoutId);
          console.error(`音效預加載失敗: ${audioFile}`);
          reject(new Error('預加載失敗'));
        };

        audio.load();
      });

      return audio;
    } catch (error) {
      console.error(`音效預加載失敗 (嘗試 ${retryCount + 1}/${maxRetries}):`, error);
      if (retryCount < maxRetries - 1) {
        console.log(`重試預加載: ${audioFile}`);
        return preloadSingleAudio(audioFile, retryCount + 1);
      }
      return null;
    }
  };

  // 播放音效的通用函數
  const playAudioWithRetry = async (audio: HTMLAudioElement, retryCount = 0): Promise<void> => {
    try {
      audio.currentTime = 0;
      await audio.play();
      
      return new Promise<void>((resolve) => {
        const handleEnded = () => {
          console.log('音效播放完成');
          audio.removeEventListener('ended', handleEnded);
          resolve();
        };
        
        const handleError = async (error: Event) => {
          console.error('音效播放出錯:', error);
          audio.removeEventListener('error', handleError);
          if (retryCount < maxRetries - 1) {
            console.log('重試播放音效');
            await playAudioWithRetry(audio, retryCount + 1);
          }
          resolve();
        };

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        // 設置超時保護
        setTimeout(() => {
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('error', handleError);
          console.log('音效播放超時，繼續執行');
          resolve();
        }, 10000);
      });
    } catch (error) {
      console.error(`音效播放失敗 (嘗試 ${retryCount + 1}/${maxRetries}):`, error);
      if (retryCount < maxRetries - 1) {
        return playAudioWithRetry(audio, retryCount + 1);
      }
    }
  };

  // 預加載所有音效
  useEffect(() => {
    const preloadAllAudio = async () => {
      try {
        // 預加載偵測音效
        const detectionAudio = await preloadSingleAudio('/audio/哭聲偵測中.mp3');
        if (detectionAudio) {
          audioElementsRef.current['detection'] = detectionAudio;
        }

        // 預加載其他音效
        const audioFiles = Object.values(notificationMessages).map(msg => `/audio/${msg.sound}`);
        for (const audioFile of audioFiles) {
          const audio = await preloadSingleAudio(audioFile);
          if (audio) {
            audioElementsRef.current[audioFile] = audio;
          }
        }
      } catch (error) {
        console.error('預加載音效失敗:', error);
      }
    };

    preloadAllAudio();
    
    return () => {
      // 清理所有音效元素
      Object.values(audioElementsRef.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      audioElementsRef.current = {};
    };
  }, []);

  const startDetection = async () => {
    if (isDetecting) return;
    
    cleanup();
    setIsDetecting(true);

    try {
      console.log('開始偵測流程:', new Date().toISOString());
      
      // 播放偵測音效
      const detectionAudio = audioElementsRef.current['detection'];
      if (detectionAudio) {
        await playAudioWithRetry(detectionAudio);
      }
      
      console.log('偵測音效播放完成:', new Date().toISOString());

      // 等待 4 秒
      await new Promise<void>(resolve => setTimeout(resolve, 4000));
      console.log('4 秒延遲結束:', new Date().toISOString());

      // 選擇情境和準備音效
      const situations: SituationType[] = ['hungry', 'briefCry', 'longCry', 'morning', 'night', 'default'];
      const randomSituation = situations[Math.floor(Math.random() * situations.length)];
      const musicType = situationMusicMap[randomSituation];
      const message = notificationMessages[randomSituation];

      try {
        // 顯示提示窗
        setDetectedSituation(randomSituation);
        setNotificationMessage(message);
        setShowNotification(true);

        // 播放提示音
        const notificationAudio = audioElementsRef.current[`/audio/${message.sound}`];
        if (notificationAudio) {
          console.log('提示音開始播放:', new Date().toISOString());
          await playAudioWithRetry(notificationAudio);
          console.log('提示音播放完成:', new Date().toISOString());
        }

        // 開始淡出動畫
        console.log('開始頁面淡出:', new Date().toISOString());
        setFadeOut(true);

        // 等待淡出動畫完成後跳轉（1秒）
        await new Promise<void>(resolve => setTimeout(resolve, 1000));
        
        // 跳轉到音樂頁面
        console.log('執行頁面跳轉:', new Date().toISOString());
        router.push(`/features/soothing-music/${musicType}?autoplay=true&start=${Date.now()}`);

      } catch (error) {
        console.error('提示音播放過程發生錯誤:', error);
        setFadeOut(true);
        setTimeout(() => {
          router.push(`/features/soothing-music/${musicType}?autoplay=true&start=${Date.now()}`);
        }, 1000);
      }

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

  // 初始化音頻處理
  useEffect(() => {
    let cleanupFunction: (() => void) | undefined;
    let isComponentMounted = true;
    let lastDetectionTime = 0;
    const DETECTION_COOLDOWN = 30000; // 增加冷卻時間到 30 秒
    let isNavigating = false; // 添加導航鎖
    
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isComponentMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        mediaStreamRef.current = stream;
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRef.current = analyser;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const volumeThreshold = 55;
        const detectionWindow = 10;
        let detectionCount = 0;
        
        const checkVolume = () => {
          if (!isListeningRef.current || !isComponentMounted || isNavigating) return;
          
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          
          if (average > volumeThreshold) {
            detectionCount++;
            
            if (detectionCount >= detectionWindow) {
              const now = Date.now();
              if (now - lastDetectionTime >= DETECTION_COOLDOWN && !isNavigating) {
                lastDetectionTime = now;
                
                if (soundStartTimeRef.current === null && !isPlayingNotification) {
                  soundStartTimeRef.current = now;
                  
                  soundDetectionTimeoutRef.current = setTimeout(() => {
                    if (!isComponentMounted || isNavigating) return;
                    
                    if (soundStartTimeRef.current !== null && !isPlayingNotification) {
                      isNavigating = true; // 設置導航鎖
                      setIsPlayingNotification(true);
                      startDetection(); // 直接調用檢測函數，不顯示提示窗
                      soundStartTimeRef.current = null;
                      
                      // 30 秒後重置導航鎖
                      setTimeout(() => {
                        isNavigating = false;
                      }, DETECTION_COOLDOWN);
                    }
                  }, 1500);
                }
              }
            }
          } else {
            detectionCount = Math.max(0, detectionCount - 1);
            
            if (detectionCount === 0 && soundStartTimeRef.current !== null) {
              soundStartTimeRef.current = null;
              if (soundDetectionTimeoutRef.current) {
                clearTimeout(soundDetectionTimeoutRef.current);
                soundDetectionTimeoutRef.current = null;
              }
            }
          }
          
          if (isListeningRef.current && isComponentMounted && !isNavigating) {
            animationFrameRef.current = requestAnimationFrame(checkVolume);
          }
        };
        
        isListeningRef.current = true;
        isPlayingRef.current = false;
        checkVolume();
        
        cleanupFunction = () => {
          isComponentMounted = false;
          isListeningRef.current = false;
          isNavigating = false;
          
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
          }
          if (audioContext) {
            audioContext.close();
          }
          if (soundDetectionTimeoutRef.current) {
            clearTimeout(soundDetectionTimeoutRef.current);
          }
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          setIsPlayingNotification(false);
        };
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };
    
    initAudio();
    
    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, []);

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