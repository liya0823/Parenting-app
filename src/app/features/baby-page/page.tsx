'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './BabyPage.module.css';

interface BabyProfile {
  name: string;
  birthDate: string;
  image: string;
}

export default function BabyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<BabyProfile>({
    name: 'Tiffany',
    birthDate: '2025/07/10',
    image: '/44.png'
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('babyProfile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
    }
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        const updatedProfile = {
          ...profile,
          image: imageUrl
        };
        setProfile(updatedProfile);
        localStorage.setItem('babyProfile', JSON.stringify(updatedProfile));
      };
      reader.readAsDataURL(file);
    }
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
          <h1>寶寶檔案</h1>
        </div>

        <div className={styles.profileContent}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer} onClick={handleImageClick}>
              <Image
                src={profile.image}
                alt="Baby Profile Picture"
                width={130}
                height={130}
                className={styles.avatar}
              />
              <div className={styles.addButton}>
                <Image 
                  src="/Add Image.png"
                  alt="Add Image photo"
                  width={30}
                  height={30}
                />
              </div>
            </div>
            <div className={styles.babyInfo}>
              <div className={styles.babyName}>{profile.name}</div>
              <div className={styles.babyDate}>{profile.birthDate}</div>
            </div>
          </div>

          <div className={styles.buttonSection}>
            <button 
              className={styles.actionButton}
              onClick={() => router.push('/features/reservation-records')}
            >
              預約紀錄
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => router.push('/features/soothing-records')}
            >
              安撫紀錄
            </button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          style={{ display: 'none' }}
        />

      </div>
    </div>
  );
} 