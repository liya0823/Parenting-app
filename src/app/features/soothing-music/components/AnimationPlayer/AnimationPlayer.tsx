'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './AnimationPlayer.module.css';

interface AnimationPlayerProps {
  title: string;
  audioSrc: string;
  imageSrc: string;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  type: string;
}

const AnimationPlayer: React.FC<AnimationPlayerProps> = ({ 
  title, 
  audioSrc, 
  imageSrc, 
  onClose, 
  onPrevious, 
  onNext,
  type 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNav, setActiveNav] = useState(8);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldAutoPlay = searchParams?.get('autoplay') === 'true';

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

  return (
    <div className={styles.container}>
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
        <div className={styles.animalTitle}>
          {type === 'dog' ? '狗狗汪汪' :
           type === 'sheep' ? '小羊咩咩' :
           type === 'elephant' ? '大象轟轟' :
           type === 'rattle' ? '沙鈴拎拎' :
           type === 'cat' ? '喵咪喵喵' :
           type === 'duck' ? '鴨子嘎嘎' :
           type === 'bear' ? '熊熊啾啾' :
           type === 'frog' ? '青蛙呱呱' : '動物'}
        </div>
      </div>
      <div className={styles.phoneContainer}>
        <audio ref={audioRef} src={audioSrc} />
        <span className={styles.anxinwei}>安撫音樂</span>
        
        <Image
          src="/Back3.png"
          alt="返回"
          width={55}
          height={55}
          className={styles.backIcon}
          onClick={onClose}
        />
        <Image
          src="/User.png"
          alt="使用者"
          width={40}
          height={40}
          className={styles.userIcon}
          onClick={() => router.push('/features/baby-page')}
        />

        <div className={styles.mainContent}>
          <div className={`${styles.imageContainer} ${isPlaying ? styles.playing : ''}`}>
            <Image
              src={imageSrc}
              alt={title}
              width={300}
              height={300}
              className={styles.animalImage}
            />
          </div>

          <div className={styles.controls}>
            <Image
              src="/L.png"
              alt="上一首"
              width={50}
              height={50}
              onClick={onPrevious}
              className={styles.controlButton}
            />
            <button 
              className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`} 
              onClick={handlePlayPause}
            >
              <Image
                src={isPlaying ? '/c2.png' : '/C33.png'}
                alt={isPlaying ? '暫停' : '播放'}
                width={124}
                height={124}
              />
            </button>
            <Image
              src="/R.png"
              alt="下一首"
              width={50}
              height={50}
              onClick={onNext}
              className={styles.controlButton}
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

export default AnimationPlayer; 