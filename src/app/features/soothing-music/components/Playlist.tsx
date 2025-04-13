import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './Playlist.module.css';

const Playlist = () => {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState('manual');
  const [activeNav, setActiveNav] = useState(8); // 預設選中音樂頁面
  
  // 添加哭聲檢測相關的狀態和引用
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
  }, []);

  useEffect(() => {
    // Handle scroll momentum
    const scrollableContent = document.querySelector(`.${styles.scrollableContent}`);
    if (scrollableContent) {
      let touchStartY = 0;
      let scrollTop = 0;
      let yVelocity = 0;
      let lastY = 0;
      let yAnimationId: number | null = null;

      const applyVerticalMomentum = () => {
        if (Math.abs(yVelocity) > 0.5) {
          scrollableContent.scrollTop += yVelocity;
          yVelocity *= 0.92;
          yAnimationId = requestAnimationFrame(applyVerticalMomentum);
        } else if (yAnimationId) {
          cancelAnimationFrame(yAnimationId);
        }
      };

      const touchStartHandler = (e: TouchEvent) => {
        touchStartY = e.touches[0].pageY;
        scrollTop = scrollableContent.scrollTop;
        lastY = e.touches[0].pageY;
        yVelocity = 0;
        if (yAnimationId) {
          cancelAnimationFrame(yAnimationId);
        }
      };

      const touchMoveHandler = (e: TouchEvent) => {
        yVelocity = (lastY - e.touches[0].pageY) * 0.8;
        lastY = e.touches[0].pageY;
      };

      const touchEndHandler = () => {
        requestAnimationFrame(applyVerticalMomentum);
      };

      scrollableContent.addEventListener('touchstart', touchStartHandler as EventListener);
      scrollableContent.addEventListener('touchmove', touchMoveHandler as EventListener);
      scrollableContent.addEventListener('touchend', touchEndHandler);

      return () => {
        scrollableContent.removeEventListener('touchstart', touchStartHandler as EventListener);
        scrollableContent.removeEventListener('touchmove', touchMoveHandler as EventListener);
        scrollableContent.removeEventListener('touchend', touchEndHandler);
        if (yAnimationId) {
          cancelAnimationFrame(yAnimationId);
        }
      };
    }

    const containers = document.querySelectorAll(`.${styles.gridContainer}`);
    
    containers.forEach(container => {
      let isDown = false;
      let startX: number;
      let scrollLeft: number;

      const htmlContainer = container as HTMLDivElement;

      const handleMouseDown = (e: Event) => {
        const mouseEvent = e as MouseEvent;
        isDown = true;
        htmlContainer.style.cursor = 'grabbing';
        startX = mouseEvent.pageX - htmlContainer.offsetLeft;
        scrollLeft = htmlContainer.scrollLeft;
      };

      const handleMouseLeave = () => {
        isDown = false;
        htmlContainer.style.cursor = 'grab';
      };

      const handleMouseUp = () => {
        isDown = false;
        htmlContainer.style.cursor = 'grab';
      };

      const handleMouseMove = (e: Event) => {
        if (!isDown) return;
        const mouseEvent = e as MouseEvent;
        mouseEvent.preventDefault();
        const x = mouseEvent.pageX - htmlContainer.offsetLeft;
        const walk = (x - startX) * 2;
        htmlContainer.scrollLeft = scrollLeft - walk;
      };

      const handleTouchStart = (e: Event) => {
        const touchEvent = e as TouchEvent;
        isDown = true;
        startX = touchEvent.touches[0].pageX - htmlContainer.offsetLeft;
        scrollLeft = htmlContainer.scrollLeft;
      };

      const handleTouchEnd = () => {
        isDown = false;
      };

      const handleTouchMove = (e: Event) => {
        if (!isDown) return;
        const touchEvent = e as TouchEvent;
        const x = touchEvent.touches[0].pageX - htmlContainer.offsetLeft;
        const walk = (x - startX) * 2;
        htmlContainer.scrollLeft = scrollLeft - walk;
      };

      htmlContainer.addEventListener('mousedown', handleMouseDown);
      htmlContainer.addEventListener('mouseleave', handleMouseLeave);
      htmlContainer.addEventListener('mouseup', handleMouseUp);
      htmlContainer.addEventListener('mousemove', handleMouseMove);
      htmlContainer.addEventListener('touchstart', handleTouchStart);
      htmlContainer.addEventListener('touchend', handleTouchEnd);
      htmlContainer.addEventListener('touchmove', handleTouchMove);

      return () => {
        htmlContainer.removeEventListener('mousedown', handleMouseDown);
        htmlContainer.removeEventListener('mouseleave', handleMouseLeave);
        htmlContainer.removeEventListener('mouseup', handleMouseUp);
        htmlContainer.removeEventListener('mousemove', handleMouseMove);
        htmlContainer.removeEventListener('touchstart', handleTouchStart);
        htmlContainer.removeEventListener('touchend', handleTouchEnd);
        htmlContainer.removeEventListener('touchmove', handleTouchMove);
      };
    });
  }, []);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    if (mode === 'auto') {
      router.push('/features/soothing-music');
    }
  };

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
        router.push('/features/Tutorial');
        break;
    }
  };
  return (
    <div className={styles.container}>
      {showSoundAlert && (
        <div className={styles.soundAlert}>
          <div className={styles.alertContent}>
            <Image
              src="/images/crying.png"
              alt="crying"
              width={40}
              height={40}
              className={styles.alertIcon}
            />
            <div className={styles.alertText}>
              檢測到寶寶哭聲
              <br />
              正在播放安撫音樂...
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
      <div className={styles.phoneContainer}>
        <div className={styles.headerMask}></div>
        <div className={styles.bottomMask}></div>
        <div className={styles.mainContent}>
          {/* Natural Music */}
          <div className={styles.categoryTitle}>自然音樂</div>
          <div className={styles.gridContainer}>
            <div className={styles.gridRow}>
              {[
                { src: '/images/content.jpg', label: '海浪聲', type: 'ocean' },
                { src: '/images/Rain drops.jpg', label: '下雨聲', type: 'rain' },
                { src: '/images/fire.jpg', label: '燒柴聲', type: 'fire' },
                { src: '/images/s0.jpg', label: '鳥叫聲', type: 'bird' },
                { src: '/images/sssss.jpg', label: '風聲', type: 'wind' },
                { src: '/images/66666.jpg', label: '溪流聲', type: 'stream' }
              ].map((item, index) => (
                <div key={index} className={styles.gridItem} onClick={() => router.push(`/features/soothing-music/${item.type}`)}>
                  <Image src={item.src} alt={item.label} className={styles.bgImg} width={127} height={156} />
                  <Image src="/43.png" alt="Label" className={styles.labelImg} width={112} height={28} />
                  <div className={styles.labelText}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Baby Music */}
          <div className={styles.categoryTitle}>寶寶音樂</div>
          <div className={styles.gridContainer}>
            <div className={styles.gridRow}>
              {[
                { src: '/images/51.png', label: '噓聲', type: 'shush' },
                { src: '/images/50.png', label: '安眠曲', type: 'lullaby' },
                { src: '/images/00.jpg', label: '搖籃曲', type: 'cradle' }
              ].map((item, index) => (
                <div key={index} className={styles.gridItem} onClick={() => router.push(`/features/soothing-music/${item.type}`)}>
                  <Image src={item.src} alt={item.label} className={styles.bgImg} width={127} height={156} />
                  <Image src="/43.png" alt="Label" className={styles.labelImg} width={112} height={28} />
                  <div className={styles.labelText}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Animation Soothing */}
          <div className={styles.categoryTitle}>動畫安撫</div>
          <div className={styles.gridContainer}>
            <div className={styles.gridRow}>
              {[
                { src: '/images/dog.svg', label: '狗狗', type: 'dog' },
                { src: '/images/sheep.png', label: '羊咩咩', type: 'sheep' },
                { src: '/images/el.svg', label: '大象', type: 'elephant' },
                { src: '/images/00000.svg', label: '沙鈴', type: 'rattle' }
              ].map((item, index) => (
                <div key={index} className={`${styles.gridItem} ${styles.animalGridItem}`} onClick={() => router.push(`/features/soothing-music/${item.type}`)}>
                  <Image src={item.src} alt={item.label} className={styles.animalImg} width={89} height={109} />
                  <Image src="/43.png" alt="Label" className={styles.labelImg} width={112} height={28} />
                  <div className={styles.labelText}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.gridContainer}>
            <div className={styles.gridRow}>
              {[
                { src: '/images/cat.svg', label: '喵咪', type: 'cat' },
                { src: '/images/duck.svg', label: '鴨子', type: 'duck' },
                { src: '/images/Bear.svg', label: '熊熊', type: 'bear' },
                { src: '/images/frog.svg', label: '青蛙', type: 'frog' }
              ].map((item, index) => (
                <div key={index} className={`${styles.gridItem} ${styles.animalGridItem}`} onClick={() => router.push(`/features/soothing-music/${item.type}`)}>
                  <Image src={item.src} alt={item.label} className={styles.animalImg} width={89} height={109} />
                  <Image src="/43.png" alt="Label" className={styles.labelImg} width={112} height={28} />
                  <div className={styles.labelText}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
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
    </div>
  );
};

export default Playlist; 