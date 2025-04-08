'use client';

import React, { useEffect, useRef, useState } from 'react';

interface NotificationAudioProps {
  sound: string;
  onEnded: () => void;
}

// 全局音頻管理器，用於控制所有音頻的播放
const audioManager = {
  currentAudio: null as HTMLAudioElement | null,
  isPlaying: false,
  
  // 停止當前播放的音頻
  stopCurrentAudio: function() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.isPlaying = false;
    }
  },
  
  // 設置當前播放的音頻
  setCurrentAudio: function(audio: HTMLAudioElement) {
    this.stopCurrentAudio();
    this.currentAudio = audio;
    this.isPlaying = true;
  }
};

const NotificationAudio: React.FC<NotificationAudioProps> = ({ sound, onEnded }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [audioPath, setAudioPath] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 檢查音頻文件是否存在
  const checkAudioFile = async (path: string): Promise<boolean> => {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('檢查音頻文件失敗:', error);
      return false;
    }
  };

  // 暫停所有主音樂
  const pauseAllMainAudio = () => {
    const mainAudioSelectors = [
      'audio[src*="ocean.mp3"]', 
      'audio[src*="rain.mp3"]', 
      'audio[src*="fire.mp3"]', 
      'audio[src*="s0.mp3"]', 
      'audio[src*="66666.mp3"]', 
      'audio[src*="sssss.mp3"]', 
      'audio[src*="88888.mp3"]', 
      'audio[src*="51.mp3"]', 
      'audio[src*="50.mp3"]', 
      'audio[src*="dog.mp3"]', 
      'audio[src*="sheep.mp3"]', 
      'audio[src*="el.mp3"]', 
      'audio[src*="0000.mp3"]', 
      'audio[src*="cat.mp3"]', 
      'audio[src*="duck.mp3"]', 
      'audio[src*="bear.mp3"]', 
      'audio[src*="frog.mp3"]'
    ];
    
    mainAudioSelectors.forEach(selector => {
      const audioElements = document.querySelectorAll(selector);
      audioElements.forEach(audio => {
        if (audio instanceof HTMLAudioElement) {
          audio.pause();
        }
      });
    });
  };

  // 恢復所有主音樂
  const resumeAllMainAudio = () => {
    const mainAudioSelectors = [
      'audio[src*="ocean.mp3"]', 
      'audio[src*="rain.mp3"]', 
      'audio[src*="fire.mp3"]', 
      'audio[src*="s0.mp3"]', 
      'audio[src*="66666.mp3"]', 
      'audio[src*="sssss.mp3"]', 
      'audio[src*="88888.mp3"]', 
      'audio[src*="51.mp3"]', 
      'audio[src*="50.mp3"]', 
      'audio[src*="dog.mp3"]', 
      'audio[src*="sheep.mp3"]', 
      'audio[src*="el.mp3"]', 
      'audio[src*="0000.mp3"]', 
      'audio[src*="cat.mp3"]', 
      'audio[src*="duck.mp3"]', 
      'audio[src*="bear.mp3"]', 
      'audio[src*="frog.mp3"]'
    ];
    
    mainAudioSelectors.forEach(selector => {
      const audioElements = document.querySelectorAll(selector);
      audioElements.forEach(audio => {
        if (audio instanceof HTMLAudioElement) {
          audio.play().catch(err => console.error('恢復主音樂播放失敗:', err));
        }
      });
    });
  };

  // 重試播放音頻
  const retryPlayAudio = (audio: HTMLAudioElement) => {
    if (retryCount.current >= maxRetries) {
      console.error(`已達到最大重試次數 (${maxRetries})，放棄播放`);
      setHasError(true);
      // 即使失敗也調用 onEnded，但設置 isEnded 為 true
      setIsEnded(true);
      onEnded();
      return;
    }

    retryCount.current += 1;
    console.log(`重試播放 (${retryCount.current}/${maxRetries})`);
    
    // 清除之前的重試計時器
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    // 設置新的重試計時器
    retryTimeoutRef.current = setTimeout(async () => {
      // 重新檢查文件是否存在
      const fileExists = await checkAudioFile(audioPath);
      if (!fileExists) {
        console.error(`音頻文件不存在: ${audioPath}`);
        setHasError(true);
        setIsEnded(true);
        onEnded();
        return;
      }

      audio.load();
      audio.play()
        .then(() => {
          console.log('重試播放成功');
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('重試播放失敗:', err);
          retryPlayAudio(audio);
        });
    }, 1000 * retryCount.current); // 增加重試間隔
  };

  // 強制播放音頻
  const forcePlayAudio = async (audio: HTMLAudioElement) => {
    try {
      // 暫停主音樂
      pauseAllMainAudio();
      
      // 確保音頻從頭開始播放
      audio.currentTime = 0;
      
      // 設置為當前播放的音頻
      audioManager.setCurrentAudio(audio);
      
      // 嘗試播放
      await audio.play();
      console.log('音頻開始播放');
      setIsPlaying(true);
    } catch (error) {
      console.error('強制播放失敗:', error);
      retryPlayAudio(audio);
    }
  };

  // 初始化音頻
  useEffect(() => {
    if (!sound) {
      console.log('未提供音頻文件，跳過播放');
      return;
    }

    // 重置狀態
    setIsEnded(false);
    setIsLoaded(false);
    setIsPlaying(false);
    setHasError(false);
    retryCount.current = 0;
    setShouldPlay(false);
    setIsVisible(true);

    // 設置音頻文件路徑
    const path = `/audio/${sound}`;
    setAudioPath(path);
    console.log('準備播放通知音頻:', path);

    // 檢查文件是否存在
    checkAudioFile(path).then(exists => {
      if (!exists) {
        console.error(`音頻文件不存在: ${path}`);
        setHasError(true);
        setIsEnded(true);
        onEnded();
        return;
      }

      // 創建新的音頻元素
      const audio = new Audio(path);
      audioRef.current = audio;

      // 設置音量為最大
      audio.volume = 1.0;

      // 監聽聲音播放結束事件
      const handleEnded = () => {
        console.log('聲音播放完成');
        setIsPlaying(false);
        setIsEnded(true);
        // 恢復主音樂播放
        resumeAllMainAudio();
        // 調用 onEnded 關閉彈窗
        onEnded();
      };

      // 監聽播放中斷事件
      const handleAbort = () => {
        console.log('聲音播放被中斷');
        setIsPlaying(false);
        setIsEnded(true);
        resumeAllMainAudio();
        onEnded();
      };

      // 監聽播放暫停事件
      const handlePause = () => {
        console.log('聲音播放被暫停');
        setIsPlaying(false);
      };

      // 監聽播放開始事件
      const handlePlay = () => {
        console.log('聲音開始播放');
        setIsPlaying(true);
      };

      // 添加錯誤處理
      audio.onerror = (error) => {
        console.error('音頻加載失敗:', error);
        retryPlayAudio(audio);
      };

      // 添加加載完成事件
      audio.oncanplaythrough = async () => {
        console.log('音頻加載完成，準備播放');
        setIsLoaded(true);
        setShouldPlay(true);
      };

      // 添加加載中事件
      audio.onloadstart = () => {
        console.log('開始加載音頻');
      };

      // 添加加載進度事件
      audio.onprogress = () => {
        console.log('音頻加載中...');
      };

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('abort', handleAbort);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('play', handlePlay);

      // 開始加載音頻
      audio.load();

      // 清理函數
      return () => {
        console.log('清理音頻資源');
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
        
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.src = '';
          audioRef.current.removeEventListener('ended', handleEnded);
          audioRef.current.removeEventListener('abort', handleAbort);
          audioRef.current.removeEventListener('pause', handlePause);
          audioRef.current.removeEventListener('play', handlePlay);
          audioRef.current = null;
        }
      };
    });
  }, [sound, onEnded]);

  // 監聽 shouldPlay 狀態變化，當音頻加載完成時嘗試播放
  useEffect(() => {
    if (shouldPlay && audioRef.current && !isPlaying && isVisible) {
      console.log('嘗試播放已加載的音頻');
      forcePlayAudio(audioRef.current);
    }
  }, [shouldPlay, isPlaying, isVisible]);

  // 如果音頻播放失敗，顯示錯誤信息
  if (hasError) {
    console.error(`無法播放音頻: ${audioPath}`);
  }

  return null;
};

export default NotificationAudio; 