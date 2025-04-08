'use client';
import * as React from 'react';
import styles from './VoiceAssistantIntro.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function VoiceAssistantIntro() {
  const router = useRouter();

  const handleScreenClick = () => {
    router.push('/map-feature');
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
            <img src="/logo-02.png" alt="Voice Assistant Logo" className={styles.logo} />
          </div>
          <h1 className={styles.title}>語音小助手</h1>
          <p className={styles.subtitle}>
            {`可透過呼叫「餵寶」
協助您解答育兒知識、安撫寶寶`}
          </p>
          <div className={styles.pageIndicators}>
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`${styles.dot} ${i === 1 ? styles.activeDot : ''}`} 
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
} 