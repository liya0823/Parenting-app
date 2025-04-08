'use client';
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Login.module.css'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const searchParams = useSearchParams()

  const socialLinks = [
    { id: 'button4', url: 'https://www.instagram.com' },
    { id: 'button2', url: 'https://www.google.com' },
    { id: 'button3', url: 'https://www.facebook.com' }
  ];

  useEffect(() => {
    const tab = searchParams?.get('tab')
    if (tab === 'register') {
      setActiveTab('register')
    }
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 這裡可以加入登入/註冊的邏輯
    
    // 登入或註冊成功後跳轉到寶寶資料頁
    router.push('/baby-profile')
  }

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank');  // 在新標籤頁打開
  };

  return (
    <div className={styles.phoneContainer}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={80} 
            height={80} 
            className={styles.logo}
            priority
          />
        </div>
        
        <div className={styles.tabContainer}>
          <button 
            className={`${styles.tab} ${activeTab === 'login' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('login')}
          >
            登入
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'register' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('register')}
          >
            註冊
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <div className={styles.inputWrapper}>
              <input
                id="email"
                type="email"
                placeholder="請輸入電子郵件"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Image 
                src="/mail.png" 
                alt="mail" 
                width={15} 
                height={15} 
                className={styles.inputIcon}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.hideButton}
              >
                <Image 
                  src={showPassword ? "/show.png" : "/hide.png"}
                  alt="toggle" 
                  width={15}
                  height={15}
                  className={styles.inputIcon}
                />
              </button>
            </div>
          </div>

          <div className={styles.rememberMe}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              id="remember"
            />
            <label htmlFor="remember">記住我</label>
          </div>

          <button type="submit" className={styles.loginButton}>
            {activeTab === 'login' ? '登入' : '註冊'}
          </button>

          {activeTab === 'login' && (
            <button type="button" className={styles.forgotPassword}>
              忘記密碼?
            </button>
          )}

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <div className={styles.socialLogin}>
            {socialLinks.map((btn) => (
              <button 
                key={btn.id} 
                type="button" 
                className={styles.socialButton}
                onClick={() => handleSocialClick(btn.url)}
              >
                <Image 
                  src={`/${btn.id === 'button4' ? 'Button4' : btn.id}.png`}
                  alt="Social Login"
                  width={45}
                  height={45}
                />
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  )
} 