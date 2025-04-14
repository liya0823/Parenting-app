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
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<typeof notificationMessages[NotificationType] | null>(null);
  
  // 音效元素引用
  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const maxRetries = 3;
  const loadingPromisesRef = useRef<{ [key: string]: Promise<HTMLAudioElement | null> }>({});

  // 預加載單個音效
  const preloadAudio = async (audioFile: string, retryCount = 0): Promise<HTMLAudioElement | null> => {
    // 檢查是否已經有正在進行的加載
    const existingPromise = loadingPromisesRef.current[audioFile];
    if (existingPromise) {
      return existingPromise;
    }

    const loadPromise = new Promise<HTMLAudioElement | null>(async (resolve) => {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        
        const loadAudioPromise = new Promise<void>((loadResolve, loadReject) => {
          const timeoutId = setTimeout(() => {
            console.log(`音效預加載超時: ${audioFile}`);
            loadReject(new Error('預加載超時'));
          }, 5000);

          audio.oncanplaythrough = () => {
            clearTimeout(timeoutId);
            console.log(`音效預加載成功: ${audioFile}`);
            loadResolve();
          };

          audio.onerror = () => {
            clearTimeout(timeoutId);
            console.error(`音效預加載失敗: ${audioFile}`);
            loadReject(new Error('預加載失敗'));
          };
        });

        audio.src = audioFile;
        await loadAudioPromise;
        resolve(audio);
      } catch (error) {
        console.error(`音效預加載失敗 (嘗試 ${retryCount + 1}/${maxRetries}):`, error);
        if (retryCount < maxRetries - 1) {
          console.log(`重試預加載: ${audioFile}`);
          const retryResult = await preloadAudio(audioFile, retryCount + 1);
          resolve(retryResult);
        } else {
          resolve(null);
        }
      } finally {
        delete loadingPromisesRef.current[audioFile];
      }
    });

    loadingPromisesRef.current[audioFile] = loadPromise;
    return loadPromise;
  };

  // 播放音效（帶重試機制）
  const playAudioWithRetry = async (audio: HTMLAudioElement, retryCount = 0): Promise<void> => {
    try {
      audio.currentTime = 0;
      audio.volume = 1.0;

      const playPromise = audio.play();
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('播放超時')), 5000);
      });

      await Promise.race([playPromise, timeoutPromise]);
    } catch (error) {
      console.error(`音效播放失敗 (嘗試 ${retryCount + 1}/${maxRetries}):`, error);
      if (retryCount < maxRetries - 1) {
        console.log('重試播放音效');
        await new Promise(resolve => setTimeout(resolve, 500));
        await playAudioWithRetry(audio, retryCount + 1);
      }
    }
  };

  // 預加載所有音效
  useEffect(() => {
    const preloadAllAudio = async () => {
      try {
        // 預加載偵測音效
        const detectionAudio = await preloadAudio('/audio/哭聲偵測中.mp3');
        if (detectionAudio) {
          audioElementsRef.current['detection'] = detectionAudio;
        }

        // 預加載提示音效
        const audioFiles = Object.values(notificationMessages).map(msg => `/audio/${msg.sound}`);
        const loadPromises = audioFiles.map(async (audioFile) => {
          const audio = await preloadAudio(audioFile);
          if (audio) {
            audioElementsRef.current[audioFile] = audio;
          }
        });

        await Promise.all(loadPromises);
        console.log('所有音效預加載完成');
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
      loadingPromisesRef.current = {};
    };
  }, []);

  const startDetection = async () => {
    if (isDetecting) return;
    setIsDetecting(true);

    try {
      // 播放偵測音效
      const detectionAudio = audioElementsRef.current['detection'];
      if (detectionAudio) {
        await playAudioWithRetry(detectionAudio);
      }
      
      // 等待 2 秒
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 選擇情境
      const situations: SituationType[] = ['hungry', 'briefCry', 'longCry', 'morning', 'night', 'default'];
      const randomSituation = situations[Math.floor(Math.random() * situations.length)];
      const musicType = situationMusicMap[randomSituation];
      const message = notificationMessages[randomSituation];

      // 顯示提示窗
      setShowNotification(true);
      setNotificationMessage(message);

      // 播放提示音（不等待）
      const audioPath = `/audio/${message.sound}`;
      const notificationAudio = audioElementsRef.current[audioPath];
      if (notificationAudio) {
        playAudioWithRetry(notificationAudio).catch(() => {});
      }

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