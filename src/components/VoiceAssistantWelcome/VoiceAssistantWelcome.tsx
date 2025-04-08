import Image from 'next/image';
import styles from '../../app/features/voice-assistant/page.module.css';  // 使用相同的樣式文件

export default function VoiceAssistantWelcome() {
  return (
    <>
      <div className={styles.logoWrapper}>
        <div className={styles.logoBackground} />
        <div className={styles.logoBackground2} />
        <div className={styles.logoBackground3} />
        <Image 
          src="/logo-02.png"
          alt="Logo"
          width={245}
          height={100}
          className={styles.logo}
          style={{ height: 'auto' }}
        />
      </div>
      <h1 className={styles.title}>嗨！我是餵寶 育兒的貼心小助手！</h1>
      <p className={styles.subtitle}>
        我可以幫你解答育兒的問題、尋找友善店家、安撫寶寶，請把任務交給我吧~
      </p>
    </>
  );
} 