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
  
  // 簡化的音效播放函數
  const playSound = async (soundFile: string): Promise<void> => {
    try {
      const audio = new Audio(soundFile);
      audio.volume = 1.0;
      
      // 設置超時保護（3秒）
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log(`音效播放超時: ${soundFile}`);
          resolve();
        }, 3000);
      });
      
      // 播放音效
      const playPromise = audio.play().then(() => {
        return new Promise<void>((resolve) => {
          audio.onended = () => resolve();
        });
      });
      
      // 使用 Promise.race 來處理超時
      await Promise.race([playPromise, timeoutPromise]);
    } catch (error) {
      console.error('音效播放錯誤:', error);
      // 即使出錯也繼續執行
    }
  };

  const startDetection = async () => {
    if (isDetecting) return;
    setIsDetecting(true);

    try {
      // 播放偵測音效（不等待完成）
      playSound('/audio/哭聲偵測中.mp3').catch(() => {
        console.log('偵測音效播放失敗，繼續執行');
      });
      
      // 等待 2 秒（縮短等待時間）
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 選擇情境
      const situations: SituationType[] = ['hungry', 'briefCry', 'longCry', 'morning', 'night', 'default'];
      const randomSituation = situations[Math.floor(Math.random() * situations.length)];
      const musicType = situationMusicMap[randomSituation];
      const message = notificationMessages[randomSituation];

      // 顯示提示窗
      setShowNotification(true);
      setNotificationMessage(message);

      // 播放提示音（不等待完成）
      playSound(`/audio/${message.sound}`).catch(() => {
        console.log('提示音播放失敗，繼續執行');
      });

      // 立即開始淡出動畫
      setFadeOut(true);

      // 0.5秒後跳轉（縮短跳轉時間）
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