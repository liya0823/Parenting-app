'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

export default function Tutorial() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState<number | null>(9);
  const [activeTab, setActiveTab] = useState('背帶穿法');
  const [volume, setVolume] = useState(0);
  const [showSoundAlert, setShowSoundAlert] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>();
  const lastTriggerTimeRef = useRef<number>(0);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const soundStartTimeRef = useRef<number | null>(null);
  const soundDetectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);
  const [isPlayingNotification, setIsPlayingNotification] = useState(false);

  // 初始化音頻處理
  useEffect(() => {
    let cleanupFunction: (() => void) | undefined;
    let isComponentMounted = true;
    
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
        source.connect(analyser);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // 降低音量閾值，使檢測更靈敏
        const volumeThreshold = 45;
        
        // 初始化提示音
        if (notificationAudioRef.current) {
          notificationAudioRef.current.pause();
          notificationAudioRef.current.currentTime = 0;
          notificationAudioRef.current = null;
        }
        
        // 暫停麥克風的函數
        const pauseMicrophone = () => {
          if (mediaStreamRef.current && !isPlayingRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => {
              track.enabled = false;
            });
            isListeningRef.current = false;
            isPlayingRef.current = true;
          }
        };
        
        // 恢復麥克風的函數
        const resumeMicrophone = () => {
          if (mediaStreamRef.current && isPlayingRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => {
              track.enabled = true;
            });
            isListeningRef.current = true;
            isPlayingRef.current = false;
          }
        };
        
        const checkVolume = () => {
          if (!isListeningRef.current || !isComponentMounted) return;
          
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          
          // 更新音量指示器
          setVolume(Math.min(100, (average / 128) * 100));
          
          if (average > volumeThreshold) {
            if (soundStartTimeRef.current === null && !isPlayingNotification) {
              soundStartTimeRef.current = Date.now();
              
              soundDetectionTimeoutRef.current = setTimeout(() => {
                if (!isComponentMounted) return;
                
                // 如果 1.5 秒後仍然在檢測中，則觸發提示
                if (soundStartTimeRef.current !== null && !isPlayingNotification) {
                  setShowSoundAlert(true);
                  setIsPlayingNotification(true);
                  
                  // 暫停麥克風
                  pauseMicrophone();
                  
                  // 確保清理舊的音頻實例
                  if (notificationAudioRef.current) {
                    notificationAudioRef.current.pause();
                    notificationAudioRef.current.currentTime = 0;
                    notificationAudioRef.current = null;
                  }
                  
                  // 創建新的音頻實例並設置音量
                  const audio = new Audio();
                  audio.src = '/audio/偵測提示.mp3';
                  audio.volume = 1.0;
                  notificationAudioRef.current = audio;
                  
                  // 直接嘗試播放
                  audio.play()
                    .then(() => {
                      console.log('Audio started playing');
                      if (!isComponentMounted) return;
                      
                      // 等待音頻播放完成
                      audio.addEventListener('ended', () => {
                        console.log('Audio finished playing');
                        if (!isComponentMounted) return;
                        
                        // 播放完成後恢復麥克風
                        resumeMicrophone();
                        // 清理音頻實例
                        if (notificationAudioRef.current) {
                          notificationAudioRef.current.pause();
                          notificationAudioRef.current.currentTime = 0;
                          notificationAudioRef.current = null;
                        }
                        setIsPlayingNotification(false);
                      }, { once: true });
                    })
                    .catch(error => {
                      console.error('Error playing notification sound:', error);
                      if (!isComponentMounted) return;
                      
                      // 發生錯誤時也要恢復麥克風
                      resumeMicrophone();
                      // 清理音頻實例
                      if (notificationAudioRef.current) {
                        notificationAudioRef.current.pause();
                        notificationAudioRef.current.currentTime = 0;
                        notificationAudioRef.current = null;
                      }
                      setIsPlayingNotification(false);
                      
                      // 重試播放
                      setTimeout(() => {
                        if (!isComponentMounted) return;
                        console.log('Retrying audio playback');
                        audio.play().catch(console.error);
                      }, 1000);
                    });
                  
                  // 顯示提示後，延遲 2 秒跳轉到舒緩音樂頁面
                  setTimeout(() => {
                    if (!isComponentMounted) return;
                    router.push('/features/soothing-music');
                  }, 4000);
                  
                  // 5 秒後隱藏提示
                  setTimeout(() => {
                    if (!isComponentMounted) return;
                    setShowSoundAlert(false);
                  }, 5000);
                  
                  // 重置檢測狀態
                  soundStartTimeRef.current = null;
                }
              }, 1500);
            }
          } else {
            // 如果聲音低於閾值，重置計時器
            if (soundStartTimeRef.current !== null) {
              soundStartTimeRef.current = null;
              if (soundDetectionTimeoutRef.current) {
                clearTimeout(soundDetectionTimeoutRef.current);
                soundDetectionTimeoutRef.current = null;
              }
            }
          }
          
          if (isListeningRef.current && isComponentMounted) {
            requestAnimationFrame(checkVolume);
          }
        };
        
        // 初始化麥克風狀態
        isListeningRef.current = true;
        isPlayingRef.current = false;
        checkVolume();
        
        // 設置清理函數
        cleanupFunction = () => {
          isComponentMounted = false; // 標記組件已卸載
          isListeningRef.current = false; // 停止聲音檢測
          
          // 停止所有音頻相關的活動
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
          }
          if (audioContext) {
            audioContext.close();
          }
          // 清理計時器
          if (soundDetectionTimeoutRef.current) {
            clearTimeout(soundDetectionTimeoutRef.current);
          }
          // 清理提示音
          if (notificationAudioRef.current) {
            notificationAudioRef.current.pause();
            notificationAudioRef.current.currentTime = 0;
            notificationAudioRef.current = null;
          }
          setIsPlayingNotification(false);
        };
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };
    
    initAudio();
    
    // 確保在組件卸載時執行清理
    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [router]);

  const handleNavClick = (num: number) => {
    setActiveNav(num);
    switch (num) {
      case 6:
        router.push('/features/voice-assistant');
        break;
      case 7:
        router.push('/features/friendly-nursing-map');
        break;
      case 8:
        router.push('/features/soothing-music');
        break;
      case 9:
        // 已經在教學頁面，不需要跳轉
        break;
    }
  };

  const tabs = ['背帶穿法', 'FAQ'];

  return (
    <div className={styles.phoneContainer}>
      <div className={styles.topOverlay} />
      <div className={styles.tutorial}>教學</div>
      <Image
        src="/images/user-icon.png"
        alt="User Icon"
        width={40}
        height={40}
        className={styles.userIcon}
        onClick={() => router.push('/features/profile')}
      />
      <div className={styles.container}>
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tab} ${activeTab === '背帶穿法' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('背帶穿法')}
          >
            背帶穿法
          </button>
          <button
            className={`${styles.tab} ${activeTab === '常見問題' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('常見問題')}
          >
            常見問題
          </button>
        </div>
        <div className={styles.content}>
          {activeTab === '背帶穿法' && (
            <div className={styles.videoSection}>
              <div className={styles.videoWrapper}>
                <div className={styles.videoTitle}>背帶穿法教學</div>
                <div className={styles.videoContainer}>
                  <video
                    className={styles.video}
                    controls
                    playsInline
                    poster="/images/video-poster.jpg"
                  >
                    <source src="/videos/tutorial1.mp4" type="video/mp4" />
                    您的瀏覽器不支持視頻播放。
                  </video>
                </div>
              </div>
              <div className={styles.videoWrapper}>
                <div className={styles.videoTitle}>背帶調整教學</div>
                <div className={styles.videoContainer}>
                  <video
                    className={styles.video}
                    controls
                    playsInline
                    poster="/images/video-poster.jpg"
                  >
                    <source src="/videos/tutorial2.mp4" type="video/mp4" />
                    您的瀏覽器不支持視頻播放。
                  </video>
                </div>
              </div>
            </div>
          )}
          {activeTab === '常見問題' && (
            <div className={styles.faqSection}>
              <div className={styles.faqCategory}>
                <div className={styles.categoryHeader}>
                  <Image
                    src="/images/faq-icon.png"
                    alt="FAQ Icon"
                    width={30}
                    height={30}
                    className={styles.categoryIcon}
                  />
                  <h3 className={styles.categoryTitle}>背帶使用常見問題</h3>
                </div>
                <div className={styles.faqItem}>
                  <div className={styles.faqQuestion}>如何正確調整背帶？</div>
                  <div className={styles.faqAnswer}>
                    請參考我們的背帶調整教學視頻，確保背帶緊貼寶寶身體，但不會過緊。寶寶應該能夠自由活動，同時保持安全。
                  </div>
                </div>
                <div className={styles.faqItem}>
                  <div className={styles.faqQuestion}>背帶適合多大年齡的寶寶？</div>
                  <div className={styles.faqAnswer}>
                    我們的背帶適合 0-36 個月的寶寶使用。不同年齡段有不同的背法，請參考背帶穿法教學視頻。
                  </div>
                </div>
                <div className={styles.faqItem}>
                  <div className={styles.faqQuestion}>如何清洗背帶？</div>
                  <div className={styles.faqAnswer}>
                    建議使用溫和的洗衣液手洗，避免使用漂白劑。洗後自然晾乾，不要使用烘乾機。
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 聲音檢測提示窗 */}
      {showSoundAlert && (
        <div className={styles.soundAlert}>
          <div className={styles.alertContent}>
            <span className={styles.alertIcon}>🍼</span>
            <span className={styles.alertText}>偵測到可能的寶寶哭聲，幫您確認中…</span>
          </div>
        </div>
      )}

      <nav className={styles.navbar}>
        <button 
          className={`${styles.navButton} ${activeNav === 6 ? styles.activeNav : ''}`}
          onClick={() => handleNavClick(6)}
        >
          <Image src="/06.png" alt="AI助手" width={40} height={40} />
          <span className={styles.navText}>AI助手</span>
        </button>
        <button 
          className={`${styles.navButton} ${activeNav === 7 ? styles.activeNav : ''}`}
          onClick={() => handleNavClick(7)}
        >
          <Image src="/07.png" alt="友善地圖" width={40} height={40} />
          <span className={styles.navText}>友善地圖</span>
        </button>
        <button 
          className={`${styles.navButton} ${activeNav === 8 ? styles.activeNav : ''}`}
          onClick={() => handleNavClick(8)}
        >
          <Image src="/08.png" alt="安撫音樂" width={40} height={40} />
          <span className={styles.navText}>安撫音樂</span>
        </button>
        <button 
          className={`${styles.navButton} ${activeNav === 9 ? styles.activeNav : ''}`}
          onClick={() => handleNavClick(9)}
        >
          <Image src="/09.png" alt="背帶教學" width={40} height={40} />
          <span className={styles.navText}>背帶教學</span>
        </button>
      </nav>
    </div>
  );
} 