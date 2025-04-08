import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './Playlist.module.css';

const Playlist = () => {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState('manual');
  const [activeNav, setActiveNav] = useState(8); // 預設選中音樂頁面

  useEffect(() => {
    // Handle scroll momentum
    const scrollableContent = document.querySelector(`.${styles.scrollableContent}`);
    if (scrollableContent) {
      let touchStartY = 0;
      let scrollTop = 0;
      let yVelocity = 0;
      let lastY = 0;
      let yAnimationId: number | null = null;

      const applyVerticalMomentum = () => {
        if (Math.abs(yVelocity) > 0.5) {
          scrollableContent.scrollTop += yVelocity;
          yVelocity *= 0.92;
          yAnimationId = requestAnimationFrame(applyVerticalMomentum);
        } else if (yAnimationId) {
          cancelAnimationFrame(yAnimationId);
        }
      };

      const touchStartHandler = (e: TouchEvent) => {
        touchStartY = e.touches[0].pageY;
        scrollTop = scrollableContent.scrollTop;
        lastY = e.touches[0].pageY;
        yVelocity = 0;
        if (yAnimationId) {
          cancelAnimationFrame(yAnimationId);
        }
      };

      const touchMoveHandler = (e: TouchEvent) => {
        yVelocity = (lastY - e.touches[0].pageY) * 0.8;
        lastY = e.touches[0].pageY;
      };

      const touchEndHandler = () => {
        requestAnimationFrame(applyVerticalMomentum);
      };

      scrollableContent.addEventListener('touchstart', touchStartHandler as EventListener);
      scrollableContent.addEventListener('touchmove', touchMoveHandler as EventListener);
      scrollableContent.addEventListener('touchend', touchEndHandler);

      return () => {
        scrollableContent.removeEventListener('touchstart', touchStartHandler as EventListener);
        scrollableContent.removeEventListener('touchmove', touchMoveHandler as EventListener);
        scrollableContent.removeEventListener('touchend', touchEndHandler);
        if (yAnimationId) {
          cancelAnimationFrame(yAnimationId);
        }
      };
    }

    const containers = document.querySelectorAll(`.${styles.gridContainer}`);
    
    containers.forEach(container => {
      let isDown = false;
      let startX: number;
      let scrollLeft: number;

      const htmlContainer = container as HTMLDivElement;

      const handleMouseDown = (e: Event) => {
        const mouseEvent = e as MouseEvent;
        isDown = true;
        htmlContainer.style.cursor = 'grabbing';
        startX = mouseEvent.pageX - htmlContainer.offsetLeft;
        scrollLeft = htmlContainer.scrollLeft;
      };

      const handleMouseLeave = () => {
        isDown = false;
        htmlContainer.style.cursor = 'grab';
      };

      const handleMouseUp = () => {
        isDown = false;
        htmlContainer.style.cursor = 'grab';
      };

      const handleMouseMove = (e: Event) => {
        if (!isDown) return;
        const mouseEvent = e as MouseEvent;
        mouseEvent.preventDefault();
        const x = mouseEvent.pageX - htmlContainer.offsetLeft;
        const walk = (x - startX) * 2;
        htmlContainer.scrollLeft = scrollLeft - walk;
      };

      const handleTouchStart = (e: Event) => {
        const touchEvent = e as TouchEvent;
        isDown = true;
        startX = touchEvent.touches[0].pageX - htmlContainer.offsetLeft;
        scrollLeft = htmlContainer.scrollLeft;
      };

      const handleTouchEnd = () => {
        isDown = false;
      };

      const handleTouchMove = (e: Event) => {
        if (!isDown) return;
        const touchEvent = e as TouchEvent;
        const x = touchEvent.touches[0].pageX - htmlContainer.offsetLeft;
        const walk = (x - startX) * 2;
        htmlContainer.scrollLeft = scrollLeft - walk;
      };

      htmlContainer.addEventListener('mousedown', handleMouseDown);
      htmlContainer.addEventListener('mouseleave', handleMouseLeave);
      htmlContainer.addEventListener('mouseup', handleMouseUp);
      htmlContainer.addEventListener('mousemove', handleMouseMove);
      htmlContainer.addEventListener('touchstart', handleTouchStart);
      htmlContainer.addEventListener('touchend', handleTouchEnd);
      htmlContainer.addEventListener('touchmove', handleTouchMove);

      return () => {
        htmlContainer.removeEventListener('mousedown', handleMouseDown);
        htmlContainer.removeEventListener('mouseleave', handleMouseLeave);
        htmlContainer.removeEventListener('mouseup', handleMouseUp);
        htmlContainer.removeEventListener('mousemove', handleMouseMove);
        htmlContainer.removeEventListener('touchstart', handleTouchStart);
        htmlContainer.removeEventListener('touchend', handleTouchEnd);
        htmlContainer.removeEventListener('touchmove', handleTouchMove);
      };
    });
  }, []);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    if (mode === 'auto') {
      router.push('/features/soothing-music');
    }
  };

  const handleNavClick = (num: number) => {
    setActiveNav(num);
    switch (num) {
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
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logoWrapper}>
          <span className={styles.anxinwei}>安撫音樂</span>
          <Image
            src="/User.png"
            alt="使用者"
            width={40}
            height={40}
            className={styles.userIcon}
            onClick={() => router.push('/features/baby-page')}
          />
        </div>
        <div className={styles.toggleContainer} data-mode={activeMode}>
          <button 
            className={`${styles.toggleButton} ${activeMode === 'auto' ? styles.active : ''}`}
            onClick={() => handleModeChange('auto')}
          >
            自動
          </button>
          <button 
            className={`${styles.toggleButton} ${activeMode === 'manual' ? styles.active : ''}`}
            onClick={() => handleModeChange('manual')}
          >
            手動
          </button>
        </div>
      </div>
      <div className={styles.phoneContainer}>
        <div className={styles.headerMask}></div>
        <div className={styles.bottomMask}></div>
        <div className={styles.mainContent}>
          {/* Natural Music */}
          <div className={styles.categoryTitle}>自然音樂</div>
          <div className={styles.gridContainer}>
            <div className={styles.gridRow}>
              {[
                { src: '/images/content.jpg', label: '海浪聲', type: 'ocean' },
                { src: '/images/Rain drops.jpg', label: '下雨聲', type: 'rain' },
                { src: '/images/fire.jpg', label: '燒柴聲', type: 'fire' },
                { src: '/images/s0.jpg', label: '鳥叫聲', type: 'bird' },
                { src: '/images/sssss.jpg', label: '風聲', type: 'wind' },
                { src: '/images/66666.jpg', label: '溪流聲', type: 'stream' }
              ].map((item, index) => (
                <div key={index} className={styles.gridItem} onClick={() => router.push(`/features/soothing-music/${item.type}`)}>
                  <Image src={item.src} alt={item.label} className={styles.bgImg} width={127} height={156} />
                  <Image src="/43.png" alt="Label" className={styles.labelImg} width={112} height={28} />
                  <div className={styles.labelText}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Baby Music */}
          <div className={styles.categoryTitle}>寶寶音樂</div>
          <div className={styles.gridContainer}>
            <div className={styles.gridRow}>
              {[
                { src: '/images/51.png', label: '噓聲', type: 'shush' },
                { src: '/images/50.png', label: '安眠曲', type: 'lullaby' },
                { src: '/images/00.jpg', label: '搖籃曲', type: 'cradle' }
              ].map((item, index) => (
                <div key={index} className={styles.gridItem} onClick={() => router.push(`/features/soothing-music/${item.type}`)}>
                  <Image src={item.src} alt={item.label} className={styles.bgImg} width={127} height={156} />
                  <Image src="/43.png" alt="Label" className={styles.labelImg} width={112} height={28} />
                  <div className={styles.labelText}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Animation Soothing */}
          <div className={styles.categoryTitle}>動畫安撫</div>
          <div className={styles.gridContainer}>
            <div className={styles.gridRow}>
              {[
                { src: '/images/dog.svg', label: '狗狗', type: 'dog' },
                { src: '/images/sheep.png', label: '羊咩咩', type: 'sheep' },
                { src: '/images/el.svg', label: '大象', type: 'elephant' },
                { src: '/images/00000.svg', label: '沙鈴', type: 'rattle' }
              ].map((item, index) => (
                <div key={index} className={`${styles.gridItem} ${styles.animalGridItem}`} onClick={() => router.push(`/features/soothing-music/${item.type}`)}>
                  <Image src={item.src} alt={item.label} className={styles.animalImg} width={89} height={109} />
                  <Image src="/43.png" alt="Label" className={styles.labelImg} width={112} height={28} />
                  <div className={styles.labelText}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.gridContainer}>
            <div className={styles.gridRow}>
              {[
                { src: '/images/cat.svg', label: '喵咪', type: 'cat' },
                { src: '/images/duck.svg', label: '鴨子', type: 'duck' },
                { src: '/images/Bear.svg', label: '熊熊', type: 'bear' },
                { src: '/images/frog.svg', label: '青蛙', type: 'frog' }
              ].map((item, index) => (
                <div key={index} className={`${styles.gridItem} ${styles.animalGridItem}`} onClick={() => router.push(`/features/soothing-music/${item.type}`)}>
                  <Image src={item.src} alt={item.label} className={styles.animalImg} width={89} height={109} />
                  <Image src="/43.png" alt="Label" className={styles.labelImg} width={112} height={28} />
                  <div className={styles.labelText}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <nav className={styles.navbar}>
          <button 
            className={`${styles.navButton} ${activeNav === 6 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(6)}
          >
            <Image src="/06.png" alt="AI助手" width={40} height={40} />
            <span className={styles.navText}>AI助手</span>
          </button>
          <button 
            className={`${styles.navButton} ${activeNav === 7 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(7)}
          >
            <Image src="/07.png" alt="友善地圖" width={40} height={40} />
            <span className={styles.navText}>友善地圖</span>
          </button>
          <button 
            className={`${styles.navButton} ${activeNav === 8 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(8)}
          >
            <Image src="/08.png" alt="安撫音樂" width={40} height={40} />
            <span className={styles.navText}>安撫音樂</span>
          </button>
          <button 
            className={`${styles.navButton} ${activeNav === 9 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(9)}
          >
            <Image src="/09.png" alt="背帶教學" width={40} height={40} />
            <span className={styles.navText}>背帶教學</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Playlist; 