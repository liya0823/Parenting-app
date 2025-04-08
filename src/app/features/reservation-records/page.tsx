'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface ReservationRecord {
  date: string;
  time: string;
  location: string;
  people: number;
}

interface MonthlyRecords {
  month: string;
  records: ReservationRecord[];
}

export default function ReservationRecords() {
  const router = useRouter();
  const [openMonths, setOpenMonths] = useState<string[]>(['2024年01月']);

  const handleNavigationClick = () => {
    window.open('https://maps.google.com/?q=22.991234,120.203456', '_blank');
  };

  const handleReservationInfoClick = () => {
    router.push('/features/reservation/success');
  };

  const historicalRecords: MonthlyRecords[] = [
    {
      month: '2024年01月',
      records: [
        { date: '26日', time: '09:30', location: '海底撈', people: 2 },
        { date: '15日', time: '19:30', location: '甜點店', people: 3 },
        { date: '10日', time: '10:50', location: '咖啡廳', people: 2 },
      ]
    },
    {
      month: '2023年12月',
      records: [
        { date: '30日', time: '18:00', location: '餐廳', people: 4 },
      ]
    },
    {
      month: '2023年11月',
      records: [
        { date: '15日', time: '12:30', location: '火鍋店', people: 5 },
      ]
    }
  ];

  const toggleMonth = (month: string) => {
    setOpenMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.phoneContainer}>
        <Image
          src="/Back3.png"
          alt="返回"
          width={55}
          height={55}
          className={styles.backIcon}
          onClick={() => router.back()}
        />
        
        <div className={styles.header}>
          <h1>預約紀錄</h1>
        </div>

        <div className={styles.content}>
          {/* 今日預約卡片 */}
          <div className={styles.todayCard}>
            <div className={styles.todayHeader}>
              <span>今天</span>
            </div>
            
            <div className={styles.todayContent}>
              <div className={styles.timeSection}>
                <div className={styles.contentRow}>
                  <div className={styles.iconWrapper}>
                    <Image src="/38.png" alt="時間" width={25} height={25} />
                  </div>
                  <div className={styles.textWrapper}>
                    <span>17:00</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.locationSection}>
                <div className={styles.contentRow}>
                  <div className={styles.iconWrapper}>
                    <Image src="/46.png" alt="地點" width={20} height={25} />
                  </div>
                  <div className={styles.textWrapper}>
                    <span>日光咖啡廳</span>
                  </div>
                  <button className={styles.navigationButton} onClick={handleNavigationClick}>
                    <Image src="/12.png" alt="前往" width={100} height={50} />
                  </button>
                </div>
              </div>
              
              <div className={styles.equipmentSection}>
                <div className={styles.contentRow}>
                  <div className={styles.iconWrapper}>
                    <Image src="/39.png" alt="設備" width={25} height={25} />
                  </div>
                  <div className={styles.textWrapper}>
                    <span>加熱設備</span>
                  </div>
                  <button className={styles.infoButton} onClick={handleReservationInfoClick}>
                    <Image src="/45.png" alt="預約資訊" width={100} height={50} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 歷史預約清單 */}
          <div className="space-y-3">
            {historicalRecords.map((monthData) => (
              <div key={monthData.month} className={styles.monthGroup}>
                <button
                  className={styles.monthButton}
                  onClick={() => toggleMonth(monthData.month)}
                >
                  <span>{monthData.month}</span>
                  <Image 
                    src={openMonths.includes(monthData.month) ? "/47.png" : "/48.png"}
                    alt="展開"
                    width={32}
                    height={32}
                  />
                </button>
                {openMonths.includes(monthData.month) && (
                  <div className={styles.expandedRecords}>
                    {monthData.records.map((record, index) => (
                      <div key={index} className={styles.recordItem}>
                        <span className={styles.recordDate}>{record.date}</span>
                        <div className={styles.recordInfo}>
                          <Image src="/38.png" alt="時間" width={20} height={20} />
                          <span>{record.time}</span>
                        </div>
                        <div className={styles.recordLocation}>
                          <Image src="/46.png" alt="地點" width={20} height={25} />
                          <span>{record.location}</span>
                        </div>
                        <span className={styles.recordPeople}>{record.people}人</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 