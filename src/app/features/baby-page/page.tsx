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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedProfile = localStorage.getItem('babyProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
      } catch (error) {
        console.error('Error parsing saved profile:', error);
      }
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
        try {
          localStorage.setItem('babyProfile', JSON.stringify(updatedProfile));
        } catch (error) {
          console.error('Error saving profile:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!mounted) {
    return (
      <div className={styles.container}>
        <div className={styles.phoneContainer}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.phoneContainer}>
        <div className={styles.backIcon}>
          <Image
            src="/Back3.png"
            alt="返回"
            width={55}
            height={55}
            onClick={() => router.back()}
            priority
          />
        </div>
        
        <div className={styles.header}>
          <h1>寶寶檔案</h1>
        </div>

        <div className={styles.profileContent}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer} onClick={handleImageClick}>
              <div className={styles.avatarWrapper}>
                <Image
                  src={profile.image}
                  alt="Baby Profile Picture"
                  width={130}
                  height={130}
                  className={styles.avatar}
                  priority
                />
              </div>
              <div className={styles.addButton}>
                <Image 
                  src="/Add Image.png"
                  alt="Add Image"
                  width={30}
                  height={30}
                  priority
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

        <button
          className={styles.logoutButton}
          onClick={() => router.push('/welcome')}
          aria-label="登出"
        >
          <Image
            src="/Logout.png"
            alt="登出"
            width={40}
            height={40}
            priority
          />
        </button>

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