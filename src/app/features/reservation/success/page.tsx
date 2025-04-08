'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import PageWrapper from '../../../../components/PageTransition';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // 4秒后开始关闭动画
    const timer = setTimeout(() => {
      setIsClosing(true);
      // 等待动画完成后完全移除提示
      setTimeout(() => {
        setShowSuccess(false);
      }, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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

  const handleCancel = () => {
    // 只确认一次
    if (confirm('確定要取消訂位嗎？')) {
      // 构建取消页面的URL参数
      const cancelParams = new URLSearchParams({
        storeName: getParam('storeName'),
        customerName: getParam('customerName'),
        date: getParam('date'),
        time: getParam('time'),
        adults: getParam('adults'),
        children: getParam('children')
      }).toString();
      
      // 导航到取消页面
      router.push(`/features/reservation/cancel?${cancelParams}`);
    }
  };

  return (
    <div className={styles.phoneContainer}>
      {showSuccess && (
        <div className={`${styles.successOverlay} ${isClosing ? styles.fadeOut : ''}`}>
          <div className={styles.successPrompt}>
            <Image
              src="/success-check.png"
              alt="Success"
              width={80}
              height={80}
              className={styles.successIcon}
            />
            <p className={styles.successText}>您已成功完成訂位！</p>
          </div>
        </div>
      )}
      
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
            <p className={styles.confirmText}>您的訂位已確認</p>

            <div className={styles.reservationDetails}>
              <p className={styles.dateTime}>{formatDate(date)}</p>
              <p className={styles.time}>{time}</p>
              <p className={styles.people}>{adults}位大人 {children !== '0' ? `${children}位小孩` : ''}</p>
            </div>

            <button 
              className={styles.cancelButton}
              onClick={handleCancel}
            >
              取消訂位
            </button>

            <p className={styles.note}>座位將保留15分鐘，金時取消不另行通知。</p>
            <p className={styles.note}>如需取消座位，請按取消訂位。</p>
          </div>

          <button 
            className={styles.historyButton}
            onClick={() => {/* 处理查看预约记录的逻辑 */}}
          >
            預約記錄
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <PageWrapper>
      <SuccessContent />
    </PageWrapper>
  );
} 