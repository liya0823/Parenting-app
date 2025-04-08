'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

export default function CancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getParam = (key: string) => {
    return searchParams?.get(key) || '';
  };

  const storeName = getParam('storeName');
  const phone = '06-3035931';
  const address = '台南市永康區東橋二街68號';
  const date = getParam('date');
  const time = getParam('time');
  const adults = getParam('adults');
  const children = getParam('children');
  const customerName = getParam('customerName');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 週${weekdays[date.getDay()]}`;
  };

  return (
    <div className={styles.phoneContainer}>
      <div className={styles.container}>
        <button 
          className={styles.backButton}
          onClick={() => router.back()}
        >
          <Image
            src="/Back3.png"
            alt="Back"
            width={50}
            height={50}
          />
        </button>

        <div className={styles.content}>
          <div className={styles.storeInfo}>
            <h1 className={styles.storeName}>{storeName}</h1>
            <p className={styles.phone}>{phone}</p>
            <p className={styles.address}>{address}</p>
          </div>

          <div className={styles.reservationCard}>
            <p className={styles.greeting}>{customerName}您好</p>
            <p className={styles.confirmText}>您的訂位已取消</p>

            <div className={styles.cancelIcon}>
              <Image
                src="/calendar-x.png"
                alt="Cancelled"
                width={100}
                height={100}
              />
            </div>

            <div className={styles.reservationDetails}>
              <p className={styles.dateTime}>{formatDate(date)}</p>
              <p className={styles.time}>{time}</p>
              <p className={styles.people}>{adults}位大人 {children !== '0' ? `${children}位小孩` : ''}</p>
            </div>
          </div>

          <button 
            className={styles.historyButton}
            onClick={() => {/* 处理查看预约记录的逻辑 */}}
          >
            預約記錄
          </button>
          <button 
            className={styles.mapButton} 
            onClick={() => router.push('/features/friendly-nursing-map')}
          >
            回地圖
          </button>
        </div>
      </div>
    </div>
  );
} 