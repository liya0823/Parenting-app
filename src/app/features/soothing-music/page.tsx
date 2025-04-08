'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import MusicPlayer from './components/MusicPlayer';

export default function SoothingMusicPage() {
  const router = useRouter();
  const [activeButton, setActiveButton] = useState(8);

  const handleNavClick = (buttonId: number) => {
    setActiveButton(buttonId);
    switch (buttonId) {
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
      default:
        break;
    }
  };

  return (
    <div className={styles.phoneContainer}>
      <div className={styles.container}>
        <main className={styles.content}>
          <MusicPlayer />
        </main>

        <nav className={styles.navbar}>
          <button 
            className={`${styles.navButton} ${activeButton === 6 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(6)}
          >
            <Image src="/06.png" alt="AI助手" width={40} height={40} />
            <span className={styles.navText}>AI助手</span>
          </button>
          <button 
            className={`${styles.navButton} ${activeButton === 7 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(7)}
          >
            <Image src="/07.png" alt="友善地圖" width={40} height={40} />
            <span className={styles.navText}>友善地圖</span>
          </button>
          <button 
            className={`${styles.navButton} ${activeButton === 8 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(8)}
          >
            <Image src="/08.png" alt="安撫音樂" width={40} height={40} />
            <span className={styles.navText}>安撫音樂</span>
          </button>
          <button 
            className={`${styles.navButton} ${activeButton === 9 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(9)}
          >
            <Image src="/09.png" alt="背帶教學" width={40} height={40} />
            <span className={styles.navText}>背帶教學</span>
          </button>
        </nav>
      </div>
    </div>
  );
} 