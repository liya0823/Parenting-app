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
    let audio: HTMLAudioElement | null = null;
    let audioContext: AudioContext | null = null;
    
    const playAudio = async () => {
      try {
        console.log('開始初始化音頻...');
        
        // 創建音頻上下文
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('音頻上下文創建成功，當前狀態:', audioContext.state);
        
        // 確保音頻上下文已經啟動
        if (audioContext.state === 'suspended') {
          console.log('嘗試恢復音頻上下文...');
          await audioContext.resume();
          console.log('音頻上下文已恢復，當前狀態:', audioContext.state);
        }
        
        // 創建音頻元素
        const audioPath = '/audio/哭聲偵測中.mp3';
        console.log('嘗試加載音頻文件:', audioPath);
        audio = new Audio(audioPath);
        
        // 等待音頻加載完成
        await new Promise((resolve, reject) => {
          if (!audio) return reject('Audio element not created');
          
          audio.addEventListener('canplaythrough', () => {
            console.log('音頻文件加載完成');
            resolve(null);
          });
          
          audio.addEventListener('error', (e) => {
            console.error('音頻加載錯誤:', e);
            reject(e);
          });
          
          // 設置音頻屬性
          audio.volume = 1.0;
          audio.preload = 'auto';
        });
        
        // 創建音頻源並連接
        console.log('創建音頻源...');
        const source = audioContext.createMediaElementSource(audio);
        source.connect(audioContext.destination);
        console.log('音頻源創建並連接成功');
        
        // 嘗試播放
        try {
          console.log('嘗試播放音頻...');
          await audio.play();
          console.log('音頻開始播放');
        } catch (error) {
          console.error('播放失敗:', error);
          // 如果自動播放失敗，添加點擊事件監聽器
          const playOnClick = async () => {
            try {
              console.log('點擊事件觸發，嘗試播放...');
              if (audioContext?.state === 'suspended') {
                console.log('音頻上下文暫停，嘗試恢復...');
                await audioContext.resume();
                console.log('音頻上下文已恢復');
              }
              await audio?.play();
              console.log('點擊後音頻開始播放');
              document.removeEventListener('click', playOnClick);
            } catch (e) {
              console.error('點擊播放失敗:', e);
            }
          };
          document.addEventListener('click', playOnClick);
        }
      } catch (error) {
        console.error('音頻初始化失敗:', error);
      }
    };
    
    playAudio();
    
    // 組件卸載時清理
    return () => {
      console.log('組件卸載，清理音頻資源...');
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio = null;
      }
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
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