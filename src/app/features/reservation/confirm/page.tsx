'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import PageWrapper from '../../../../components/PageTransition';

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const getParam = (key: string) => {
    return searchParams?.get(key) || '';
  };

  const adults = getParam('adults');
  const children = getParam('children');
  const date = getParam('date');
  const time = getParam('time');
  const storeName = getParam('storeName');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking confirmed:', {
      ...formData,
      adults,
      children,
      date,
      time
    });
    
    const successParams = new URLSearchParams({
      storeName,
      adults,
      children,
      date,
      time,
      customerName: formData.name
    });
    
    router.push(`/features/reservation/success?${successParams.toString()}`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 週${['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}`;
  };

  return (
    <div className={styles.phoneContainer}>
      <div className={styles.container}>
        <div className={styles.header}>
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
          <h1 className={styles.title}>選擇訂位與填寫聯絡資訊</h1>
        </div>

        <div className={styles.bookingInfo}>
          <h2 className={styles.storeName}>{storeName}</h2>
          <div className={styles.bookingDetails}>
            <Image
              src="/40.png"
              alt="People"
              width={25}
              height={25}
              className={styles.bookingIcon}
            />
            <span>{adults}位大人 {children !== '0' ? `${children}位小孩` : ''}</span>
          </div>
          <div className={styles.bookingDetails}>
            <Image
              src="/41.png"
              alt="Calendar"
              width={25}
              height={25}
              className={styles.bookingIcon}
            />
            <span>{formatDate(date)}</span>
          </div>
          <div className={styles.bookingDetails}>
            <Image
              src="/38.png"
              alt="Time"
              width={25}
              height={25}
              className={styles.bookingIcon}
            />
            <span>{time}</span>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.formTitle}>聯絡資訊</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>訂位人姓名</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>訂位人手機號碼</label>
              <div className={styles.phoneInput}>
                <input
                  type="text"
                  value="+886"
                  readOnly
                  className={styles.phonePrefix}
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`${styles.input} ${styles.phoneNumber}`}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>訂位人Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>其他備註</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="有任何特殊需求或有特別需要我們為您準備的地方，可以先告訴我們喔！"
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              確認預約
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <PageWrapper>
      <ConfirmContent />
    </PageWrapper>
  );
} 