'use client';
import * as React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SplashScreen.module.css';

const SplashScreen: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/welcome');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={styles.phoneContainer}>
      <div className={styles.splashContainer}>
        <img src="/logo.png" alt="Logo" className={styles.logo} />
      </div>
    </div>
  );
};

export default SplashScreen;