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
  const [isDetecting, setIsDetecting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); // 控制聲波動畫
  const [isPlayingSound, setIsPlayingSound] = useState(false); // 控制提示音播放
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const soundTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    if (mode === 'manual') {
      router.push('/features/soothing-music/playlist');
    }
  };

  const handleStartDetection = () => {
    setIsDetecting(true);
    setIsAnimating(true); // 開始聲波動畫
    
    // 創建音頻元素，使用正確的音頻文件路徑
    const audio = new Audio('/audio/偵測提示.mp3');
    audioRef.current = audio;
    
    // 設置4秒後播放提示音
    soundTimerRef.current = setTimeout(() => {
      setIsPlayingSound(true); // 開始播放提示音
      
      // 嘗試播放音頻
      audio.play().catch(error => {
        console.error('Autoplay failed:', error);
        // 添加點擊事件監聽器以處理自動播放限制
        document.addEventListener('click', () => {
          audio.play();
        }, { once: true });
      });
    }, 4000);

    // 設置重定向計時器
    redirectTimerRef.current = setTimeout(() => {
      // 從 situationMusicMap 中隨機選擇一個情況
      const situations = Object.keys(situationMusicMap) as (keyof typeof situationMusicMap)[];
      const randomSituation = situations[Math.floor(Math.random() * situations.length)];
      const musicType = situationMusicMap[randomSituation];
      
      // 跳轉到對應的音樂頁面
      router.push(`/features/soothing-music/playlist/${musicType}`);
    }, 4000);
  };

  // 組件卸載時清理計時器和音頻
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
      if (soundTimerRef.current) {
        clearTimeout(soundTimerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
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
          className={`${styles.backgroundCircle} ${isAnimating ? styles.animate : ''}`}
        />
        <div className={styles.soundWave}>
          {[90, 70, 85, 55, 45, 85, 65].map((height, index) => (
            <div
              key={index}
              className={`${styles.soundWaveBar} ${isAnimating ? styles.animate : ''}`}
              style={{
                height: `${height}px`,
                animationDelay: isAnimating ? `${index * 0.2}s` : '0s'
              }}
            />
          ))}
        </div>
        <div className={styles.detectionText}>
          {!isDetecting ? (
            <button 
              className={styles.startDetectionButton}
              onClick={handleStartDetection}
            >
              開始偵測
            </button>
          ) : (
            <div className={styles.detectionRow}>
              <span className={styles.staticText}>哭聲偵測中</span>
              <span className={styles.dots}>...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer; 