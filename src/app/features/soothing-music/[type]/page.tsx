'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Player from '../components/Player/Player';
import AnimationPlayer from '../components/AnimationPlayer/AnimationPlayer';
import Image from 'next/image';
import styles from './page.module.css';
import { NotificationAudio } from '../components/NotificationAudio';

// 定義音樂列表
const naturalMusicList = [
  {
    type: 'ocean',
    title: '海浪聲',
    audioSrc: '/audio/ocean.mp3',
    imageSrc: '/images/content.jpg'
  },
  {
    type: 'rain',
    title: '下雨聲',
    audioSrc: '/audio/rain.mp3',
    imageSrc: '/images/Rain drops.jpg'
  },
  {
    type: 'fire',
    title: '燒柴聲',
    audioSrc: '/audio/fire.mp3',
    imageSrc: '/images/fire.jpg'
  },
  {
    type: 'bird',
    title: '鳥叫聲',
    audioSrc: '/audio/s0.mp3',
    imageSrc: '/images/s0.jpg'
  },
  {
    type: 'stream',
    title: '溪流聲',
    audioSrc: '/audio/水.mp3',
    imageSrc: '/images/66666.jpg'
  },
  {
    type: 'wind',
    title: '風聲',
    audioSrc: '/audio/sssss.mp3',
    imageSrc: '/images/sssss.jpg'
  },
  {
    type: 'lullaby',
    title: '安眠曲',
    audioSrc: '/audio/88888.mp3',
    imageSrc: '/images/50.png'
  },
  {
    type: 'cradle',
    title: '搖籃曲',
    audioSrc: '/audio/51.mp3',
    imageSrc: '/images/51.png'
  },
  {
    type: 'shush',
    title: '噓聲',
    audioSrc: '/audio/50.mp3',
    imageSrc: '/images/00.jpg'
  }
];

const animationMusicList = [
  {
    type: 'dog',
    title: '小狗',
    audioSrc: '/audio/dog.mp3',
    imageSrc: '/images/dog.svg'
  },
  {
    type: 'sheep',
    title: '小羊',
    audioSrc: '/audio/sheep.mp3',
    imageSrc: '/images/sheep.png'
  },
  {
    type: 'elephant',
    title: '大象',
    audioSrc: '/audio/el.mp3',
    imageSrc: '/images/el.svg'
  },
  {
    type: 'rattle',
    title: '搖鈴',
    audioSrc: '/audio/0000.mp3',
    imageSrc: '/images/00000.svg'
  },
  {
    type: 'cat',
    title: '貓咪',
    audioSrc: '/audio/cat.mp3',
    imageSrc: '/images/cat.svg'
  },
  {
    type: 'duck',
    title: '小鴨',
    audioSrc: '/audio/duck.mp3',
    imageSrc: '/images/duck.svg'
  },
  {
    type: 'bear',
    title: '小熊',
    audioSrc: '/audio/bear.mp3',
    imageSrc: '/images/Bear.svg'
  },
  {
    type: 'frog',
    title: '青蛙',
    audioSrc: '/audio/frog.mp3',
    imageSrc: '/images/frog.svg'
  }
];

// 合併音樂列表（用於查找當前音樂）
const musicList = [...naturalMusicList, ...animationMusicList];

// 定義不同情況的提示窗文案
const notificationMessages = {
  rain: {
    title: '媽媽 / 爸爸，我需要你 🥺',
    message: '偵測到寶寶的哭聲，可能是餓了或想要抱抱。已幫您播放「溫柔的雨聲」🌧️，希望能讓寶寶安心入睡～',
    sound: '偵測到寶寶的.mp3'
  },
  lullaby: {
    title: '寶寶短暫哭了一下，但現在安靜了 😊',
    message: '或許只是睡夢中小小驚醒，已播放輕柔的搖籃曲 🎶，幫助寶寶再次入眠～',
    sound: '寶寶短暫哭了.mp3'
  },
  shush: {
    title: '別擔心，我來幫你安撫寶寶 🍼',
    message: '寶寶哭了一段時間，可能是想要您的關心。建議查看是否需要餵奶、換尿布或輕輕拍背安撫，我們也已播放舒緩的噓聲 🎶',
    sound: '寶寶哭了一段.mp3'
  },
  birds: {
    title: '寶寶早晨的哭聲，是想要開始新的一天嗎？🌞',
    message: '聽起來是醒來的聲音，您可以溫柔地抱起寶寶，和他說早安 👶💛 如果還想讓他多睡一會兒，已幫您播放「輕柔的鳥鳴聲」🕊️',
    sound: '聽起來是醒來.mp3'
  },
  cradle: {
    title: '夜深了，寶寶還有些不安嗎？💤',
    message: '有時候，夜晚會讓寶寶感到沒有安全感。已播放安眠曲 💓，希望能讓他像回到媽媽懷裡一樣安心～',
    sound: '有時候，夜晚.mp3'
  },
  default: {
    title: '偵測到哭聲',
    message: '正在為您播放音樂，希望能讓寶寶安心～',
    sound: '偵測到哭聲.mp3'
  }
};

export default function MusicTypePage({ params }: { params: { type: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoplay = searchParams?.get('autoplay') === 'true';
  const [fadeOut, setFadeOut] = useState(false);
  const mainAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isMainAudioReady, setIsMainAudioReady] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);

  // 初始化音頻上下文
  const initAudioContext = async () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  // 播放音頻
  const playAudio = async () => {
    if (!mainAudioRef.current) return;
    
    try {
      await initAudioContext();
      const playPromise = mainAudioRef.current.play();
      if (playPromise !== undefined) {
        await playPromise;
        console.log('音頻播放成功');
      }
    } catch (error) {
      console.error('播放音頻失敗:', error);
      if (isIOS) {
        // 為 iOS 設備添加點擊事件監聽器
        const playOnTouch = async () => {
          try {
            await mainAudioRef.current?.play();
            document.removeEventListener('touchstart', playOnTouch);
          } catch (e) {
            console.error('iOS 觸摸播放失敗:', e);
          }
        };
        document.addEventListener('touchstart', playOnTouch);
      }
    }
  };

  // 初始化主音樂
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const musicData = getMusicData();
    const audio = new Audio(musicData.audioSrc);
    audio.loop = true;
    mainAudioRef.current = audio;

    const handleCanPlay = async () => {
      console.log('音頻已準備就緒');
      setIsMainAudioReady(true);
      if (autoplay) {
        await playAudio();
      }
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.load();

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      if (mainAudioRef.current) {
        mainAudioRef.current.pause();
        mainAudioRef.current.src = '';
      }
    };
  }, [autoplay]);

  // 判斷是否為動畫音樂
  const isAnimationMusic = ['dog', 'sheep', 'elephant', 'rattle', 'cat', 'duck', 'bear', 'frog'].includes(params.type);
  
  // 根據當前音樂類型選擇對應的列表
  const currentList = isAnimationMusic ? animationMusicList : naturalMusicList;
  const currentIndex = currentList.findIndex(music => music.type === params.type);

  const getMusicData = () => {
    const music = musicList.find(m => m.type === params.type);
    if (music) {
      return music;
    }
    return {
      title: '未知音樂',
      audioSrc: '',
      imageSrc: '/images/default.jpg'
    };
  };

  const musicData = getMusicData();

  const handlePrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentList.length - 1;
    router.push(`/features/soothing-music/${currentList[prevIndex].type}`);
  };

  const handleNext = () => {
    const nextIndex = currentIndex < currentList.length - 1 ? currentIndex + 1 : 0;
    router.push(`/features/soothing-music/${currentList[nextIndex].type}`);
  };

  const handleBack = () => {
    setFadeOut(true);
    setTimeout(() => {
      router.push('/features/soothing-music');
    }, 500);
  };

  return (
    <div className={`${styles.container} ${fadeOut ? styles.fadeOut : ''}`}>
      {/* 根據類型返回不同的播放器 */}
      {isAnimationMusic ? (
        <AnimationPlayer
          audioSrc={musicData.audioSrc}
          imageSrc={musicData.imageSrc}
          title={musicData.title}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onClose={handleBack}
          type={params.type}
        />
      ) : (
        <Player
          audioSrc={musicData.audioSrc}
          imageSrc={musicData.imageSrc}
          title={musicData.title}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onClose={handleBack}
          type={params.type}
        />
      )}
    </div>
  );
} 