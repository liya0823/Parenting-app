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

  // 添加音效預加載和播放相關的引用
  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const loadingPromisesRef = useRef<{ [key: string]: Promise<void> }>({});
  
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
          if (!(soundFile in audioElementsRef.current)) {
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
      // 創建新的音頻元素
      const audio = new Audio();
      audio.volume = 1.0;
      
      // 設置音源並播放
      audio.src = soundFile;
      
      // 返回一個 Promise，在音頻播放完成或出錯時解析
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          console.log('音效播放完成');
          resolve();
        };
        
        audio.onerror = (error) => {
          console.error('音效播放錯誤:', error);
          reject(error);
        };
        
        // 嘗試播放
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('播放失敗:', error);
            reject(error);
          });
        }
        
        // 設置超時保護（3秒）
        setTimeout(() => {
          if (audio.currentTime === 0) {
            console.log('音效播放超時');
            reject(new Error('播放超時'));
          }
        }, 3000);
      });
    } catch (error) {
      console.error('音效播放過程發生錯誤:', error);
      throw error;
    }
  };

  // 在組件掛載時初始化音效
  useEffect(() => {
    // 清理函數
    return () => {
      // 清理所有音效元素
      Object.values(audioElementsRef.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      audioElementsRef.current = {};
    };
  }, []);

  // 初始化音頻處理
  useEffect(() => {
    let cleanupFunction: (() => void) | undefined;
    let isComponentMounted = true;
    let lastDetectionTime = 0;
    const DETECTION_COOLDOWN = 5000; // 5秒冷卻時間
    
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
        analyser.smoothingTimeConstant = 0.8; // 增加平滑度
        source.connect(analyser);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // 降低音量閾值，使檢測更靈敏
        const volumeThreshold = 45; // 設定閾值
        const detectionWindow = 10; // 檢測窗口大小
        let detectionCount = 0; // 連續檢測計數
        
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
          
          // 檢查是否超過閾值
          if (average > volumeThreshold) {
            detectionCount++;
            
            // 如果連續多次檢測到聲音，則觸發提示
            if (detectionCount >= detectionWindow) {
              const now = Date.now();
              if (now - lastDetectionTime >= DETECTION_COOLDOWN) {
                lastDetectionTime = now;
                
                if (soundStartTimeRef.current === null && !isPlayingNotification) {
                  soundStartTimeRef.current = now;
                  
                  soundDetectionTimeoutRef.current = setTimeout(() => {
                    if (!isComponentMounted) return;
                    
                    // 如果 1.5 秒後仍然在檢測中，則觸發提示
                    if (soundStartTimeRef.current !== null && !isPlayingNotification) {
                      setShowSoundAlert(true);
                      setIsPlayingNotification(true);
                      
                      // 暫停麥克風
                      pauseMicrophone();
                      
                      // 播放提示音
                      playSound('/audio/偵測提示.mp3')
                        .then(() => {
                          if (!isComponentMounted) return;
                          
                          // 播放完成後導航到 MusicPlayer 組件
                          router.push('/features/soothing-music/components/MusicPlayer');
                          
                          // 播放完成後恢復麥克風
                          resumeMicrophone();
                          setIsPlayingNotification(false);
                        })
                        .catch(error => {
                          console.error('播放提示音失敗:', error);
                          if (!isComponentMounted) return;
                          
                          // 發生錯誤時也要恢復麥克風
                          resumeMicrophone();
                          setIsPlayingNotification(false);
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
              }
            }
          } else {
            // 如果聲音低於閾值，重置計數器
            detectionCount = Math.max(0, detectionCount - 1);
            
            // 如果聲音持續低於閾值，重置計時器
            if (detectionCount === 0 && soundStartTimeRef.current !== null) {
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
            <span className={styles.alertIcon}>🍼</span>
            <span className={styles.alertText}>偵測到可能的寶寶哭聲，幫您確認中…</span>
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