'use client';
import * as React from 'react';
import styles from './MusicMode.module.css';
import { useRouter } from 'next/navigation';

const MusicMode: React.FC = () => {
  const router = useRouter();

  const handleScreenClick = () => {
    router.push('/welcome');
  };

  const handleRegister = () => {
    router.push('/login?tab=register');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className={styles.phoneContainer} onClick={handleScreenClick}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div style={{ width: '100%', textAlign: 'center', paddingRight: '20px' }}>
            <img src="/05.png" alt="Music Mode Logo" className={styles.logo} />
          </div>
          <h1 className={styles.title}>音樂模式</h1>
          <p className={styles.subtitle}>
            {`可播放舒適的音樂
來安撫寶寶的情緒`}
          </p>
          <div className={styles.pageIndicators}>
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`${styles.dot} ${i === 4 ? styles.activeDot : ''}`} 
              />
            ))}
          </div>
        </div>
        
        <div className={styles.buttonGroup}>
          <button 
            className={styles.startButton}
            onClick={(e) => {
              e.stopPropagation();
              handleRegister();
            }}
          >
            開始使用
          </button>
          <button 
            className={styles.loginButton}
            onClick={(e) => {
              e.stopPropagation();
              handleLogin();
            }}
          >
            登入
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicMode; 