'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import MusicPlayer from './components/MusicPlayer';

const SoothingMusicPage = () => {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState('hungry');

  const handleModeChange = (mode: string) => {
    setCurrentMode(mode);
    // 根據模式切換到相應的音樂頁面
    switch (mode) {
      case 'hungry':
        router.push('/features/soothing-music/hungry');
        break;
      case 'briefCry':
        router.push('/features/soothing-music/brief-cry');
        break;
      case 'longCry':
        router.push('/features/soothing-music/long-cry');
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.phoneContainer}>
      <div className={styles.container}>
        <main className={styles.content}>
          <MusicPlayer onModeChange={handleModeChange} />
        </main>

        <nav className={styles.navbar}>
          <button 
            className={`${styles.navButton} ${currentMode === 'hungry' ? styles.activeNav : ''}`}
            onClick={() => handleModeChange('hungry')}
          >
            <Image src="/06.png" alt="AI助手" width={40} height={40} />
            <span className={styles.navText}>AI助手</span>
          </button>
          <button 
            className={`${styles.navButton} ${currentMode === 'briefCry' ? styles.activeNav : ''}`}
            onClick={() => handleModeChange('briefCry')}
          >
            <Image src="/07.png" alt="友善地圖" width={40} height={40} />
            <span className={styles.navText}>友善地圖</span>
          </button>
          <button 
            className={`${styles.navButton} ${currentMode === 'longCry' ? styles.activeNav : ''}`}
            onClick={() => handleModeChange('longCry')}
          >
            <Image src="/08.png" alt="安撫音樂" width={40} height={40} />
            <span className={styles.navText}>安撫音樂</span>
          </button>
          <button 
            className={`${styles.navButton} ${currentMode === 'hungry' ? styles.activeNav : ''}`}
            onClick={() => handleModeChange('hungry')}
          >
            <Image src="/09.png" alt="背帶教學" width={40} height={40} />
            <span className={styles.navText}>背帶教學</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default SoothingMusicPage; 