'use client';
import React, { useState, useEffect, useRef } from 'react';
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

interface MusicPlayerProps {
  onModeChange: (mode: string) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ onModeChange }) => {
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
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioPlayingRef = useRef<boolean>(false);
  const [currentMode, setCurrentMode] = useState('hungry');
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  const handleModeChange = (mode: string) => {
    setCurrentMode(mode);
    onModeChange(mode);
    cleanupAudio();
  };

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeEventListener('ended', handleAudioEnded);
      audioRef.current = null;
    }
    isAudioPlayingRef.current = false;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleStartDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      
      source.connect(analyser);
      analyser.fftSize = 256;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkVolume = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setVolume(average);
        
        if (average > 30) {
          playNotificationSound();
        }
        
        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };
      
      checkVolume();
      setIsDetecting(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    const newAudio = new Audio('/audio/notification.mp3');
    newAudio.volume = 1.0;
    newAudio.play();
    audioRef.current = newAudio;
    
    newAudio.onended = () => {
      audioRef.current = null;
    };
  };

  const handleAudioEnded = () => {
    setIsAnimating(false);
    cleanupAudio();
  };

  const handleAudioError = (e: ErrorEvent) => {
    console.error('Audio error:', e);
    setIsPlayingSound(false);
    setIsAnimating(false);
    // 確保清理音頻實例
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // 組件卸載時清理計時器和音頻
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  return (
    <div className={`${styles.container} ${fadeOut ? styles.fadeOut : ''}`}>
      <div className={styles.header}>
        <div className={styles.logoWrapper}>
          <span className={styles.anxinwei}>安心餵</span>
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
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`${styles.soundWaveBar} ${isDetecting ? styles.animate : ''}`}
              style={{
                height: isDetecting ? `${Math.max(20, volume * 2)}px` : '20px',
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
        <div className={styles.detectionText}>
          <div className={styles.detectionRow}>
            <span className={styles.staticText}>正在偵測</span>
            <span className={styles.dots}>...</span>
          </div>
        </div>
        <button
          className={styles.startDetectionButton}
          onClick={isDetecting ? cleanupAudio : handleStartDetection}
        >
          {isDetecting ? '停止偵測' : '開始偵測'}
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer; 