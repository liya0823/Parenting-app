'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Player.module.css';

interface PlayerProps {
  title: string;
  audioSrc: string;
  imageSrc: string;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  type: string;
}

const Player: React.FC<PlayerProps> = ({ title, audioSrc, imageSrc, onClose, onPrevious, onNext, type }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNav, setActiveNav] = useState(8); // 預設選中音樂頁面
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldAutoPlay = searchParams?.get('autoplay') === 'true';

  // 定義所有可用的音樂類型
  const musicTypes = [
    // 自然聲音
    'ocean', 'rain', 'fire', 'bird', 'stream', 'wind', 'lullaby', 'cradle', 'shush',
    // 動畫聲音
    'dog', 'sheep', 'elephant', 'rattle', 'cat', 'duck', 'bear', 'frog'
  ];

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

  // 隨機播放功能
  const handleShuffle = () => {
    const currentType = type;
    let newType;
    do {
      newType = musicTypes[Math.floor(Math.random() * musicTypes.length)];
    } while (newType === currentType); // 確保不會選到當前正在播放的音樂

    // 直接跳轉到一般播放音樂頁面，不帶 autoplay 參數
    router.push(`/features/soothing-music/${newType}`);
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.loop = true;

      const handleEnded = () => {
        setIsPlaying(false);
      };

      const handleError = () => {
        setIsPlaying(false);
      };

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    }
  }, []);

  useEffect(() => {
    if (shouldAutoPlay && audioRef.current) {
      audioRef.current.play().catch(error => {
        console.log('Auto-play failed:', error);
      });
      setIsPlaying(true);
    }
  }, [shouldAutoPlay]);

  // 添加防止滚动的事件监听器
  useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    // 防止触摸滑动
    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('wheel', preventDefault, { passive: false });
    
    // 防止滚动
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('touchmove', preventDefault);
      document.removeEventListener('wheel', preventDefault);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logoWrapper}>
          <span className={styles.anxinwei}>安撫音樂</span>
          <Image
            src="/User2.png"
            alt="使用者"
            width={40}
            height={40}
            className={styles.userIcon}
            onClick={() => router.push('/features/baby-page')}
          />
        </div>
        <div className={styles.songTitle}>
          {type === 'ocean' ? '海浪聲' :
           type === 'rain' ? '下雨聲' :
           type === 'fire' ? '燒柴聲' :
           type === 'bird' ? '鳥叫聲' :
           type === 'wind' ? '風聲' :
           type === 'stream' ? '溪流聲' :
           type === 'shush' ? '噓聲' :
           type === 'lullaby' ? '安眠曲' :
           type === 'cradle' ? '搖籃曲' :
           type === 'dog' ? '狗狗' :
           type === 'sheep' ? '羊咩咩' :
           type === 'elephant' ? '大象' :
           type === 'rattle' ? '沙鈴' :
           type === 'cat' ? '喵咪' :
           type === 'duck' ? '鴨子' :
           type === 'bear' ? '熊熊' :
           type === 'frog' ? '青蛙' : '安撫音樂'}
        </div>
      </div>
      <div className={styles.phoneContainer}>
        <audio ref={audioRef} src={audioSrc} />
        
        <Image
          src="/Back2.png"
          alt="返回"
          width={55}
          height={55}
          className={styles.backIcon}
          onClick={onClose}
        />

        <div className={styles.mainContent}>
          <Image
            src={imageSrc}
            alt={title}
            fill
            priority
            quality={100}
            className={styles.backgroundImage}
          />
          
          <div className={styles.playerControls}>
            <Image
              src="/Restart.png"
              alt="重新播放"
              width={40}
              height={40}
              className={styles.restartButton}
              onClick={handleRestart}
            />
            <Image
              src="/L1.png"
              alt="上一首"
              width={50}
              height={50}
              onClick={onPrevious}
            />
            <button className={styles.playButton} onClick={handlePlayPause}>
              <Image
                src={isPlaying ? '/pause.png' : '/play.png'}
                alt={isPlaying ? '暫停' : '播放'}
                width={124}
                height={124}
              />
            </button>
            <Image
              src="/Right.png"
              alt="下一首"
              width={50}
              height={50}
              onClick={onNext}
            />
            <Image
              src="/Shuffle.png"
              alt="隨機播放"
              width={35}
              height={35}
              className={styles.shuffleButton}
              onClick={handleShuffle}
            />
          </div>
        </div>

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

export default Player;
