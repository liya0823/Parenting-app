'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import styles from './Welcome.module.css';

const Welcome: React.FC = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/login?tab=register');
  };

  const handleScreenClick = () => {
    router.push('/voice-assistant-intro');
  };

  return (
    <div className={styles.phoneContainer} onClick={handleScreenClick}>
      <div className={styles.container}>
        <div className={styles.content}>
          <img src="/logo.png" alt="Logo" className={styles.logo} />
          <h1 className={styles.title}>安心餵</h1>
          <p className={styles.subtitle}>您的哺育小助手</p>
          
          <div className={styles.pageIndicators}>
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`${styles.dot} ${i === 0 ? styles.activeDot : ''}`} 
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

export default Welcome; 