'use client';
import { useState, useEffect, useRef } from 'react';
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

const MusicPlayer = () => {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState('auto'); // 'auto' or 'manual'
  const [fadeOut, setFadeOut] = useState(false);
  const [detectedSituation, setDetectedSituation] = useState<keyof typeof situationMusicMap | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    if (mode === 'manual') {
      window.location.href = '/features/soothing-music/playlist';
    }
  };

  // 播放哭聲偵測中的聲音
  useEffect(() => {
    // 創建一個隱藏的 audio 元素
    const audioElement = document.createElement('audio');
    audioElement.src = '/audio/哭聲偵測中.mp3';
    audioElement.volume = 1.0;
    audioElement.autoplay = true;
    audioElement.loop = false;
    
    // 添加到 DOM 中
    document.body.appendChild(audioElement);
    
    // 嘗試播放
    const playSound = () => {
      // 使用 Promise 處理播放
      const playPromise = audioElement.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('音頻開始播放');
          })
          .catch(error => {
            console.error('自動播放失敗:', error);
            // 如果自動播放失敗，添加點擊事件監聽器
            const playOnClick = () => {
              audioElement.play()
                .then(() => {
                  console.log('點擊後音頻開始播放');
                  document.removeEventListener('click', playOnClick);
                })
                .catch(console.error);
            };
            document.addEventListener('click', playOnClick);
          });
      }
    };
    
    // 確保音頻已加載
    audioElement.addEventListener('canplaythrough', playSound, { once: true });
    
    // 如果音頻已經可以播放，立即播放
    if (audioElement.readyState >= 3) {
      playSound();
    }
    
    // 組件卸載時清理
    return () => {
      audioElement.pause();
      audioElement.currentTime = 0;
      document.body.removeChild(audioElement);
    };
  }, []);

  // 自動跳轉邏輯
  useEffect(() => {
    // 清除之前的計時器
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }
    
    // 設置新的計時器，4000毫秒後跳轉
    redirectTimerRef.current = setTimeout(() => {
      // 如果是自動模式，隨機選擇一個情況
      if (activeMode === 'auto') {
        // 獲取所有可能的情況
        const situations = Object.keys(situationMusicMap) as Array<keyof typeof situationMusicMap>;
        // 隨機選擇一個情況
        const randomSituation = situations[Math.floor(Math.random() * situations.length)];
        setDetectedSituation(randomSituation);
        
        // 根據情況選擇對應的音樂類型
        const musicType = situationMusicMap[randomSituation];
        
        console.log('4000毫秒後跳轉到音樂播放頁面:', musicType);
        
        setFadeOut(true);
        setTimeout(() => {
          // 添加 autoplay 參數
          router.push(`/features/soothing-music/${musicType}?autoplay=true`);
        }, 500);
      }
    }, 4000);
    
    // 清理函數
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [activeMode, router]);

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
          className={styles.backgroundCircle}
        />
        <div className={styles.soundWave}>
          {[90, 70, 85, 55, 45, 85, 65].map((height, index) => (
            <div
              key={index}
              className={styles.soundWaveBar}
              style={{
                height: `${height}px`,
                animationDelay: `${index * 0.2}s`
              }}
            />
          ))}
        </div>
        <div className={styles.detectionText}>
          <div className={styles.detectionRow}>
            <span className={styles.staticText}>哭聲偵測中</span>
            <span className={styles.dots}>...</span>
          </div>
  
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer; 