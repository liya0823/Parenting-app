'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from '../styles/transitions.module.css';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  
  useEffect(() => {
    if (pathname) {
      setTransitionStage('fadeOut');
      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage('fadeIn');
      }, 300); // 與 CSS 過渡時間相匹配
      
      return () => clearTimeout(timeout);
    }
  }, [pathname, children]);
  
  return (
    <div
      className={`${styles.pageTransition} ${
        transitionStage === 'fadeIn' ? styles.pageEnterActive : styles.pageExitActive
      }`}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition; 