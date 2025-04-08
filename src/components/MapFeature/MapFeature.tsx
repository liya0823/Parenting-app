'use client';
import * as React from 'react';
import styles from './MapFeature.module.css';
import { useRouter } from 'next/navigation';

const MapFeature: React.FC = () => {
  const router = useRouter();

  const handleScreenClick = () => {
    router.push('/cry-detection');
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
            <img src="/03.png" alt="Map Feature Logo" className={styles.logo} />
          </div>
          <h1 className={styles.title}>地圖功能</h1>
          <p className={styles.subtitle}>
            {`可查看您所在位置附近的
友善哺乳店家資訊`}
          </p>
          <div className={styles.pageIndicators}>
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`${styles.dot} ${i === 2 ? styles.activeDot : ''}`} 
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

export default MapFeature; 