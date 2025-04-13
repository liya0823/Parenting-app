'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import MusicPlayer, { MusicPlayerProps } from './components/MusicPlayer';

const SoothingMusicPage = () => {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState('music');

  const handleModeChange = (mode: string) => {
    setCurrentMode(mode);
    // 根據模式切換到相應的頁面
    switch (mode) {
      case 'ai':
        router.push('/features/voice-assistant');
        break;
      case 'map':
        router.push('/features/friendly-nursing-map');
        break;
      case 'music':
        router.push('/features/soothing-music');
        break;
      case 'tutorial':
        router.push('/features/Tutorial');
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
            className={`${styles.navButton} ${currentMode === 'ai' ? styles.activeNav : ''}`}
            onClick={() => handleModeChange('ai')}
          >
            <Image src="/06.png" alt="AI助手" width={40} height={40} />
            <span className={styles.navText}>AI助手</span>
          </button>
          <button 
            className={`${styles.navButton} ${currentMode === 'map' ? styles.activeNav : ''}`}
            onClick={() => handleModeChange('map')}
          >
            <Image src="/07.png" alt="友善地圖" width={40} height={40} />
            <span className={styles.navText}>友善地圖</span>
          </button>
          <button 
            className={`${styles.navButton} ${currentMode === 'music' ? styles.activeNav : ''}`}
            onClick={() => handleModeChange('music')}
          >
            <Image src="/08.png" alt="安撫音樂" width={40} height={40} />
            <span className={styles.navText}>安撫音樂</span>
          </button>
          <button 
            className={`${styles.navButton} ${currentMode === 'tutorial' ? styles.activeNav : ''}`}
            onClick={() => handleModeChange('tutorial')}
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