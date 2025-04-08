'use client';
import { useState } from 'react';
import styles from './ChatHistory.module.css';

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  histories: {
    date: string;
    messages: {
      content: string;
      timestamp: string;
    }[];
  }[];
}

export default function ChatHistory({ isOpen, onClose, histories }: ChatHistoryProps) {
  return (
    <>
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={onClose}  /* 點擊遮罩關閉 */
      />
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2>聊天記錄</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <div className={styles.content}>
          {histories.map((day, index) => (
            <div key={index} className={styles.dayGroup}>
              <div className={styles.date}>{day.date}</div>
              {day.messages.map((msg, msgIndex) => (
                <div key={msgIndex} className={styles.historyItem}>
                  <div className={styles.message}>{msg.content}</div>
                  <div className={styles.time}>{msg.timestamp}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
} 