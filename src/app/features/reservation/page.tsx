'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import PageWrapper from '../../../components/PageTransition';

function ReservationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeName = searchParams?.get('storeName') || '';
  const [formData, setFormData] = useState({
    adults: '',
    children: '',
    date: '',
    time: ''
  });
  const [activeTab, setActiveTab] = useState('morning');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.adults || !formData.date || !formData.time) {
      alert('請填寫完整預約資訊');
      return;
    }
    
    const searchParams = new URLSearchParams({
      storeName: storeName,
      adults: formData.adults,
      children: formData.children || '0',
      date: formData.date,
      time: formData.time
    });
    
    router.push(`/features/reservation/confirm?${searchParams.toString()}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getTimeSlots = (period: string) => {
    switch (period) {
      case 'morning':
        return ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30'];
      case 'noon':
        return ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];
      case 'afternoon':
        return ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'];
      case 'evening':
        return ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];
      default:
        return [];
    }
  };

  return (
    <div className={styles.phoneContainer}>
      <div className={styles.container}>
        {/* 店家照片區 */}
        <div className={styles.storeImageSection}>
          <Image
            src="/20.png"
            alt="Store"
            width={390}
            height={210}
            className={styles.storeImage}
          />
          <button 
            className={styles.backButton}
            onClick={() => router.push('/features/friendly-nursing-map')}
          >
            <Image
              src="/Back2.png"
              alt="Back"
              width={55}
              height={55}
            />
          </button>
        </div>

        {/* 店家資訊區 */}
        <div className={styles.storeHeader}>
          <div className={styles.storeInfo}>
            <h1 className={styles.storeName}>{storeName}</h1>
            <p className={styles.storeAddress}>台南市永康區東橋一街668號</p>
            <div className={styles.storeActions}>
              <div className={styles.actionItem}>
                <Image
                  src="/34.png"
                  alt="Phone"
                  width={20}
                  height={20}
                />
                <a href="tel:06-3055931" className={styles.actionText}>06-3055931</a>
              </div>
              <div className={styles.actionItem}>
                <Image
                  src="/35.png"
                  alt="Map"
                  width={20}
                  height={20}
                />
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=台南市永康區東橋二街68號" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionText}
                >
                  查看地圖
                </a>
              </div>
              <div 
                className={styles.actionItem}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: '日光咖啡廳',
                      text: '日光咖啡廳 - 台南市永康區東橋二街68號',
                      url: window.location.href
                    }).catch(console.error);
                  }
                }}
              >
                <Image
                  src="/36.png"
                  alt="Share"
                  width={20}
                  height={20}
                />
                <span className={styles.actionText}>分享</span>
              </div>
            </div>
          </div>
        </div>

        {/* 預約表單 */}
        <div className={styles.formSection}>
          <h2 className={styles.formTitle}>選擇訂位時段</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* 人數選擇 */}
            <div className={styles.formGroup}>
              <label>人數選擇</label>
              <div className={styles.peopleOptions}>
                <div className={styles.selectWrapper}>
                  <select 
                    name="adults"
                    className={styles.peopleSelect}
                    onChange={(e) => setFormData(prev => ({ ...prev, adults: e.target.value }))}
                  >
                    <option value="">大人</option>
                    <option value="1">1位</option>
                    <option value="2">2位</option>
                    <option value="3">3位</option>
                    <option value="4">4位</option>
                  </select>
                  <Image
                    src="/37.png"
                    alt="arrow"
                    width={25}
                    height={25}
                    className={styles.selectArrow}
                  />
                </div>
                <div className={styles.selectWrapper}>
                  <select 
                    name="children"
                    className={styles.peopleSelect}
                    onChange={(e) => setFormData(prev => ({ ...prev, children: e.target.value }))}
                  >
                    <option value="">小孩</option>
                    <option value="1">1位</option>
                    <option value="2">2位</option>
                    <option value="3">3位</option>
                    <option value="4">4位</option>
                  </select>
                  <Image
                    src="/37.png"
                    alt="arrow"
                    width={25}
                    height={25}
                    className={styles.selectArrow}
                  />
                </div>
              </div>
            </div>

            {/* 日期選擇 */}
            <div className={styles.formGroup}>
              <label>日期</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className={styles.dateInput}
              />
            </div>

            {/* 時段選擇 */}
            <div className={styles.formGroup}>
              <label>時段</label>
              <div className={styles.timeTabs}>
                <button 
                  type="button" 
                  className={`${styles.timeTab} ${activeTab === 'morning' ? styles.active : ''}`}
                  onClick={() => setActiveTab('morning')}
                >
                  早上
                </button>
                <button 
                  type="button" 
                  className={`${styles.timeTab} ${activeTab === 'noon' ? styles.active : ''}`}
                  onClick={() => setActiveTab('noon')}
                >
                  中午
                </button>
                <button 
                  type="button" 
                  className={`${styles.timeTab} ${activeTab === 'afternoon' ? styles.active : ''}`}
                  onClick={() => setActiveTab('afternoon')}
                >
                  下午
                </button>
                <button 
                  type="button" 
                  className={`${styles.timeTab} ${activeTab === 'evening' ? styles.active : ''}`}
                  onClick={() => setActiveTab('evening')}
                >
                  晚上
                </button>
              </div>
              <div className={styles.timeSlots}>
                {getTimeSlots(activeTab).map((time) => (
                  <button 
                    key={time}
                    type="button" 
                    className={`${styles.timeSlot} ${formData.time === time ? styles.active : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, time }))}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* 店家資訊 */}
            <div className={styles.restaurantInfo}>
              <h3 className={styles.infoTitle}>店家資訊</h3>
              <div className={styles.infoItem}>
                <Image
                  src="/35.png"
                  alt="Location"
                  width={20}
                  height={20}
                />
                <span className={styles.infoLabel}>位置</span>
                <span className={styles.infoText}>台南市永康區東橋二街68號</span>
              </div>
              <div className={styles.infoItem}>
                <Image
                  src="/34.png"
                  alt="Phone"
                  width={20}
                  height={20}
                />
                <span className={styles.infoLabel}>電話</span>
                <span className={styles.infoText}>06-3035931</span>
              </div>
              <div className={styles.infoItem}>
                <Image
                  src="/38.png"
                  alt="Hours"
                  width={20}
                  height={20}
                />
                <span className={styles.infoLabel}>營業時間</span>
                <span className={styles.infoText}>營業至23:00</span>
              </div>
              <div className={styles.infoItem}>
                <Image
                  src="/39.png"
                  alt="Facilities"
                  width={20}
                  height={20}
                />
                <span className={styles.infoLabel}>設施</span>
                <span className={styles.infoText}>奶瓶 清洗區 休息區 加熱設備</span>
              </div>
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

export default function ReservationPage() {
  return (
    <PageWrapper>
      <ReservationContent />
    </PageWrapper>
  );
} 