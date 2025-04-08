'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './BabyProfile.module.css';
import Image from 'next/image';

export default function BabyProfile() {
  const router = useRouter();
  const [babyName, setBabyName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [girlImage, setGirlImage] = useState('/Baby.png');
  const [boyImage, setBoyImage] = useState('/Baby.png');
  const girlInputRef = useRef<HTMLInputElement>(null);
  const boyInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitActive, setIsSubmitActive] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!babyName || !birthDate || !gender || !agreeToTerms) {
      alert('請填寫完整資料並同意隱私權政策');
      return;
    }

    try {
      // 生成一個簡單的 ID
      const babyId = Date.now().toString();
      
      // 創建寶寶資料物件
      const babyInfo = {
        id: babyId,
        name: babyName,
        birthDate,
        gender,
        image: gender === 'female' ? girlImage : boyImage,
        createdAt: new Date().toISOString()
      };

      // 保存到 localStorage
      localStorage.setItem('currentBabyId', babyId);
      localStorage.setItem('currentBaby', JSON.stringify(babyInfo));

      // 保存所有寶寶的列表
      const savedBabies = localStorage.getItem('babies') || '[]';
      const babies = JSON.parse(savedBabies);
      babies.push(babyInfo);
      localStorage.setItem('babies', JSON.stringify(babies));

      // 跳轉到語音助手頁面並顯示歡迎詞
      router.push('/features/voice-assistant?showWelcome=true');
      
    } catch (error) {
      console.error('Error saving baby profile:', error);
      alert('保存失敗，請稍後再試');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'girl' | 'boy') => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (type === 'girl') {
        setGirlImage(imageUrl);
      } else {
        setBoyImage(imageUrl);
      }
    }
  };

  const handleAddAnother = async () => {
    if (babyName && birthDate && gender && agreeToTerms) {
      try {
        // 生成一個簡單的 ID
        const babyId = Date.now().toString();
        
        // 創建寶寶資料物件
        const babyInfo = {
          id: babyId,
          name: babyName,
          birthDate,
          gender,
          image: gender === 'female' ? girlImage : boyImage,
          createdAt: new Date().toISOString()
        };

        // 保存到寶寶列表
        const savedBabies = localStorage.getItem('babies') || '[]';
        const babies = JSON.parse(savedBabies);
        babies.push(babyInfo);
        localStorage.setItem('babies', JSON.stringify(babies));

        // 重置表單
        setBabyName('');
        setBirthDate('');
        setGender('male');
        setAgreeToTerms(false);
        setGirlImage('/Baby.png');
        setBoyImage('/Baby.png');
        setShowBackButton(true);
        alert('寶寶資料已儲存，請繼續填寫新的寶寶資料');
      } catch (error) {
        console.error('Error saving baby info:', error);
        alert('儲存失敗，請稍後再試');
      }
    } else {
      if (window.confirm('目前的資料尚未儲存，確定要清空表單嗎？')) {
        setBabyName('');
        setBirthDate('');
        setGender('male');
        setAgreeToTerms(false);
        setGirlImage('/Baby.png');
        setBoyImage('/Baby.png');
        setShowBackButton(true);
      }
    }
  };

  const handleBack = () => {
    setBabyName('');
    setBirthDate('');
    setGender('male');
    setAgreeToTerms(false);
    setGirlImage('/Baby.png');
    setBoyImage('/Baby.png');
    setShowBackButton(false);
  };

  return (
    <div className={styles.phoneContainer}>
      <div className={styles.container}>
        {showBackButton && (
          <button onClick={handleBack} className={styles.backButton}>
            <Image 
              src="/Back.png"
              alt="Back"
              width={50}
              height={50}
            />
          </button>
        )}

        <h1 className={styles.title}>寶寶資料</h1>

        <div className={styles.genderButtons}>
          <div className={styles.genderOption}>
            <button
              type="button"
              className={`${styles.genderButton} ${styles.girlButton} ${gender === 'female' ? styles.active : ''}`}
              onClick={() => setGender('female')}
            >
              <Image 
                src={girlImage}
                alt="Girl"
                width={60}
                height={60}
                className={`${gender !== 'female' ? styles.grayImage : ''} ${girlImage !== '/Baby.png' ? styles.uploadedImage : ''}`}
              />
              {gender === 'female' && (
                <div 
                  className={styles.addButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    girlInputRef.current?.click();
                  }}
                >
                  <Image 
                    src="/Add.png"
                    alt="Add photo"
                    width={8}
                    height={8}
                  />
                </div>
              )}
            </button>
            <span className={styles.genderText}>Girl</span>
            <input
              type="file"
              accept="image/*"
              ref={girlInputRef}
              onChange={(e) => handleImageUpload(e, 'girl')}
              className={styles.hiddenInput}
            />
          </div>
          
          <div className={styles.genderOption}>
            <button
              type="button"
              className={`${styles.genderButton} ${styles.boyButton} ${gender === 'male' ? styles.active : ''}`}
              onClick={() => setGender('male')}
            >
              <Image 
                src={boyImage}
                alt="Boy"
                width={60}
                height={60}
                className={`${gender !== 'male' ? styles.grayImage : ''} ${boyImage !== '/Baby.png' ? styles.uploadedImage : ''}`}
              />
              {gender === 'male' && (
                <div 
                  className={styles.addButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    boyInputRef.current?.click();
                  }}
                >
                  <Image 
                    src="/Add.png"
                    alt="Add photo"
                    width={8}
                    height={8}
                  />
                </div>
              )}
            </button>
            <span className={styles.genderText}>Boy</span>
            <input
              type="file"
              accept="image/*"
              ref={boyInputRef}
              onChange={(e) => handleImageUpload(e, 'boy')}
              className={styles.hiddenInput}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="birthday">Birthday</label>
            <div className={styles.dateInputWrapper}>
              <input
                id="birthday"
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="MM/DD/YYYY"
              />
              <Image 
                src="/Calendar.png"
                alt="Calendar"
                width={20}
                height={20}
                className={styles.calendarIcon}
              />
            </div>
          </div>

          <div className={styles.termsGroup}>
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              id="terms"
            />
            <label htmlFor="terms">我同意隱私權政策</label>
          </div>

          <button 
            type="button" 
            className={styles.submitButton}
            onClick={handleAddAnother}
          >
            <span>新建另一位寶寶</span>
            <Image 
              src={isSubmitActive ? '/Add2.png' : '/Add1.png'}
              alt="Add"
              width={30}
              height={30}
              className={styles.addIcon}
            />
          </button>
          <button 
            type="button" 
            className={styles.nextButton}
            onClick={handleSubmit}
          >
            完成建立
          </button>
        </form>
      </div>
    </div>
  );
} 