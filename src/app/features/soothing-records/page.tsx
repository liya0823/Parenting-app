'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface TimelineItem {
  time: string;
  description: string;
}

interface SoothingRecord {
  startTime: string;
  endTime: string;
  description: string;
  timeline: TimelineItem[];
}

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

function CalendarModal({ isOpen, onClose, onSelect }: CalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2)); // 2025年3月

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = [];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className={styles.calendarDay}></div>);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const isSelected = i === 7; // 預設選中7號
    days.push(
      <button
        key={i}
        className={`${styles.calendarDay} ${isSelected ? styles.selectedDay : ''}`}
        onClick={() => {
          onSelect(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
          onClose();
        }}
      >
        {i}
      </button>
    );
  }

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.calendarModal} onClick={e => e.stopPropagation()}>
        <div className={styles.calendarHeader}>
          <button onClick={prevMonth} className={styles.calendarNavButton}>
            <Image src="/49.png" alt="上個月" width={24} height={24} />
          </button>
          <h2>{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</h2>
          <button onClick={nextMonth} className={styles.calendarNavButton}>
            <Image src="/50.png" alt="下個月" width={24} height={24} />
          </button>
        </div>
        <div className={styles.calendarWeekdays}>
          {weekDays.map(day => (
            <div key={day} className={styles.weekday}>{day}</div>
          ))}
        </div>
        <div className={styles.calendarDays}>
          {days}
        </div>
      </div>
    </div>
  );
}

export default function SoothingRecords() {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 2, 7)); // 2025年3月7日

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const records: SoothingRecord[] = [
    {
      startTime: '09:20',
      endTime: '09:30',
      description: '偵測到哭聲 開始進行安撫',
      timeline: [
        { time: '09:20', description: '偵測到哭聲 開始進行安撫' },
        { time: '09:22', description: '系統撥放了嬰兒安眠曲' },
        { time: '09:24', description: '哭聲持續' },
        { time: '09:25', description: '系統更改成嗚聲' },
        { time: '09:30', description: '哭聲結束，結束安撫' }
      ]
    },
    {
      startTime: '12:00',
      endTime: '12:20',
      description: '偵測到哭聲 開始進行安撫',
      timeline: [
        { time: '12:00', description: '偵測到哭聲 開始進行安撫' },
        { time: '12:05', description: '系統撥放了嬰兒安眠曲' },
        { time: '12:10', description: '哭聲減弱' },
        { time: '12:15', description: '系統持續播放安眠曲' },
        { time: '12:20', description: '哭聲結束，結束安撫' }
      ]
    },
    {
      startTime: '14:45',
      endTime: '15:00',
      description: '偵測到哭聲 開始進行安撫',
      timeline: [
        { time: '14:45', description: '偵測到哭聲 開始進行安撫' },
        { time: '14:48', description: '系統撥放了白噪音' },
        { time: '14:52', description: '切換為搖籃曲' },
        { time: '14:55', description: '哭聲漸弱' },
        { time: '15:00', description: '寶寶入睡，結束安撫' }
      ]
    },
    {
      startTime: '17:30',
      endTime: '17:45',
      description: '偵測到哭聲 開始進行安撫',
      timeline: [
        { time: '17:30', description: '偵測到哭聲 開始進行安撫' },
        { time: '17:33', description: '系統播放大自然音效' },
        { time: '17:38', description: '切換為輕音樂' },
        { time: '17:42', description: '哭聲減弱' },
        { time: '17:45', description: '寶寶平靜，結束安撫' }
      ]
    },
    {
      startTime: '20:15',
      endTime: '20:30',
      description: '偵測到哭聲 開始進行安撫',
      timeline: [
        { time: '20:15', description: '偵測到哭聲 開始進行安撫' },
        { time: '20:18', description: '系統播放搖籃曲' },
        { time: '20:22', description: '哭聲持續，調整音量' },
        { time: '20:25', description: '切換為輕柔白噪音' },
        { time: '20:30', description: '寶寶安靜，結束安撫' }
      ]
    },
    {
      startTime: '22:00',
      endTime: '22:15',
      description: '偵測到哭聲 開始進行安撫',
      timeline: [
        { time: '22:00', description: '偵測到哭聲 開始進行安撫' },
        { time: '22:03', description: '播放晚安音樂' },
        { time: '22:08', description: '哭聲減弱' },
        { time: '22:12', description: '系統降低音量' },
        { time: '22:15', description: '寶寶入睡，結束安撫' }
      ]
    }
  ];

  const toggleExpand = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.phoneContainer}>
        <div className={styles.header}>
          <Image
            src="/Back3.png"
            alt="返回"
            width={55}
            height={55}
            className={styles.backIcon}
            onClick={() => router.back()}
          />
          <h1>安撫紀錄</h1>
          <button 
            className={styles.calendarButton}
            onClick={() => setIsCalendarOpen(true)}
          >
            <Image
              src="/Calendar.png"
              alt="日曆"
              width={35}
              height={35}
            />
          </button>
        </div>

        <div className={styles.dateHeader}>
          <div className={styles.date}>{selectedDate.getDate()}日</div>
          <div className={styles.weekday}>週{['日','一','二','三','四','五','六'][selectedDate.getDay()]}</div>
        </div>

        <div className={styles.recordsList} style={{marginTop: '0px', height: 'calc(100vh - 120px)', overflowY: 'scroll', WebkitOverflowScrolling: 'touch'}}>
          {records.map((record, index) => (
            <div key={index} className={styles.recordItem}>
              <div className={styles.recordContent}>
                <div className={styles.timeRange}>
                  <div>{record.startTime}</div>
                  {!expandedItems.includes(index) && <div>{record.endTime}</div>}
                </div>
                <div className={styles.recordDescription}>
                  {expandedItems.includes(index) ? (
                    <div className={styles.timeline}>
                      {record.timeline.map((item, timelineIndex) => (
                        <div key={timelineIndex} className={styles.timelineItem}>
                          <div className={styles.timelineTime}>{item.time}</div>
                          <div className={styles.timelineDescription}>{item.description}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div>{record.description}</div>
                      <div>結束安撫</div>
                    </>
                  )}
                </div>
                <button 
                  className={styles.expandButton}
                  onClick={() => toggleExpand(index)}
                >
                  <Image
                    src={expandedItems.includes(index) ? "/47.png" : "/48.png"}
                    alt="展開"
                    width={30}
                    height={30}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        <CalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          onSelect={handleDateSelect}
        />
      </div>
    </div>
  );
} 