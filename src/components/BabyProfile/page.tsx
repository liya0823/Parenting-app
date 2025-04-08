'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './BabyProfile.module.css';

export default function BabyProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    image: '/44.png'
  });

  useEffect(() => {
    const savedData = localStorage.getItem('babyProfile');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('babyProfile', JSON.stringify(formData));
    router.push('/features/baby-page');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.phoneContainer}>
        <Image
          src="/Back.png"
          alt="返回"
          width={55}
          height={55}
          className={styles.backIcon}
          onClick={() => router.back()}
        />
        
        <div className={styles.header}>
          <h1>編輯寶寶檔案</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>寶寶名字</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="請輸入寶寶名字"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>出生日期</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            儲存
          </button>
        </form>
      </div>
    </div>
  );
} 