'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

export default function Tutorial() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState<number | null>(9);
  const [activeTab, setActiveTab] = useState('背帶穿法');

  const handleNavClick = (num: number) => {
    setActiveNav(num);
    switch (num) {
      case 6:
        router.push('/features/voice-assistant');
        break;
      case 7:
        router.push('/features/friendly-nursing-map');
        break;
      case 8:
        router.push('/features/soothing-music');
        break;
      case 9:
        // 已經在教學頁面，不需要跳轉
        break;
    }
  };

  const tabs = ['背帶穿法', 'FAQ'];

  return (
    <div className={styles.phoneContainer}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <span className={styles.tutorial}>背帶教學</span>
            <Image
              src="/User.png"
              alt="使用者"
              width={40}
              height={40}
              className={styles.userIcon}
              onClick={() => router.push('/features/baby-page')}
            />
          </div>
        </div>
        {/* 頂部白色遮擋 */}
        <div className={styles.topOverlay} />
        
       

        {/* 頂部標籤導航 */}
        <div className={styles.tabContainer}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 主要內容區域 */}
        <div className={styles.content}>
          {activeTab === '背帶穿法' && (
            <div className={styles.videoSection}>
              <div className={styles.videoWrapper}>
                <div className={styles.videoContainer}>
                  <video 
                    controls
                    className={styles.video}
                    playsInline
                    preload="metadata"
                    width="100%"
                    height="100%"
                    poster="/tutorial1-cover.jpg"
                  >
                    <source src="/tutorial1.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className={styles.videoTitle}>穿上背帶</div>
              </div>
              <div className={styles.videoWrapper}>
                <div className={styles.videoContainer}>
                  <video 
                    controls
                    className={styles.video}
                    playsInline
                    preload="metadata"
                    width="100%"
                    height="100%"
                    poster="/tutorial2-cover.jpg"
                  >
                    <source src="/tutorial2.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className={styles.videoTitle}>切換哺乳姿勢</div>
              </div>
            </div>
          )}

          {activeTab === 'FAQ' && (
            <div className={styles.faqSection}>
              <div className={styles.searchContainer}>
                <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="搜尋問題..."
                  onChange={(e) => {
                    // 這裡可以添加搜尋邏輯
                  }}
                />
              </div>
              <div className={styles.faqCategory}>
                <div className={styles.categoryHeader}>
                  <Image src="/30.png" alt="基本使用" width={30} height={30} className={styles.categoryIcon} />
                  <h2 className={styles.categoryTitle}>基本使用</h2>
                </div>
                <div className={styles.faqItem}>
                  <h3>如何正確穿戴背帶？</h3>
                  <p>請確保腰帶貼合腰部，肩帶均勻分佈重量，並調整扣具使背帶穩固但不緊繃。可以參考 APP 內的教學影片。</p>
                </div>
                <div className={styles.faqItem}>
                  <h3>如何調整背帶讓寶寶更舒適？</h3>
                  <ul>
                    <li>寶寶的頭部應靠近你的胸口，親吻額頭時不需低頭太多。</li>
                    <li>確保寶寶的背部有支撐，但不會壓迫到脊椎。</li>
                    <li>讓寶寶的腿呈現「M」型，膝蓋略高於屁股，符合人體工學。</li>
                  </ul>
                </div>
                <div className={styles.faqItem}>
                  <h3>寶寶幾個月可以開始使用背帶？</h3>
                  <p>建議新生兒使用適合嬰兒的模式，3 個月後可逐步調整為不同姿勢。請依照寶寶的發育狀況調整背帶方式。</p>
                </div>
                <div className={styles.faqItem}>
                  <h3>如何判斷背帶是否合身？</h3>
                  <p>背帶應該要能夠緊貼寶寶的身體，但不要太緊。寶寶的臉部應該要保持可見，且下巴不要貼近胸部。</p>
                </div>
              </div>

              <div className={styles.faqCategory}>
                <div className={styles.categoryHeader}>
                  <Image src="/31.png" alt="安全相關" width={30} height={30} className={styles.categoryIcon} />
                  <h2 className={styles.categoryTitle}>安全相關</h2>
                </div>
                <div className={styles.faqItem}>
                  <h3>如何確保寶寶在背帶內的呼吸順暢？</h3>
                  <p>隨時觀察寶寶的臉部，避免臉部貼緊你的身體或背帶布料，確保下巴不會壓在胸口上，以防呼吸受阻。</p>
                </div>
                <div className={styles.faqItem}>
                  <h3>使用背帶時，哪些情況下需要特別注意？</h3>
                  <ul>
                    <li>不要在劇烈運動（如跑步、騎車）時使用。</li>
                    <li>低頭檢查寶寶的姿勢是否正確，避免駝背或過度彎曲脖子。</li>
                  </ul>
                </div>
              </div>

              <div className={styles.faqCategory}>
                <div className={styles.categoryHeader}>
                  <Image src="/32.png" alt="清潔與維護" width={30} height={30} className={styles.categoryIcon} />
                  <h2 className={styles.categoryTitle}>清潔與維護</h2>
                </div>
                <div className={styles.faqItem}>
                  <h3>背帶可以機洗嗎？</h3>
                  <p>大部分背帶可機洗，但建議使用洗衣袋並選擇溫和模式。請參考產品標籤的洗滌說明。</p>
                </div>
                <div className={styles.faqItem}>
                  <h3>如何存放背帶？</h3>
                  <p>建議捲起或折疊存放於乾燥處，避免長時間受潮或曝曬，以延長使用壽命。</p>
                </div>
              </div>

              <div className={styles.faqCategory}>
                <div className={styles.categoryHeader}>
                  <Image src="/33.png" alt="其他問題" width={30} height={30} className={styles.categoryIcon} />
                  <h2 className={styles.categoryTitle}>其他問題</h2>
                </div>
                <div className={styles.faqItem}>
                  <h3>爸爸也可以用這款背帶嗎？</h3>
                  <p>當然可以！可調式肩帶，適合不同體型的照顧者使用。</p>
                </div>
                <div className={styles.faqItem}>
                  <h3>使用背帶時，可以給寶寶哺乳嗎？</h3>
                  <p>可以！你可以切換成哺乳姿勢位置，讓寶寶更容易吸吮，並使用遮布提供隱私。</p>
                </div>
                <div className={styles.faqItem}>
                  <h3>背帶會不會影響寶寶的髖關節發育？</h3>
                  <p>只要確保寶寶腿部呈現「M」型，並正確調整座位高度，背帶不會影響寶寶的髖關節發育，反而有助於支撐。</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 導航欄 */}
        <nav className={styles.navbar}>
          <button 
            className={`${styles.navButton} ${activeNav === 6 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(6)}
          >
            <Image src="/06.png" alt="AI助手" width={40} height={40} />
            <span className={styles.navText}>AI助手</span>
          </button>
          <button 
            className={`${styles.navButton} ${activeNav === 7 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(7)}
          >
            <Image src="/07.png" alt="友善地圖" width={40} height={40} />
            <span className={styles.navText}>友善地圖</span>
          </button>
          <button 
            className={`${styles.navButton} ${activeNav === 8 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(8)}
          >
            <Image src="/08.png" alt="安撫音樂" width={40} height={40} />
            <span className={styles.navText}>安撫音樂</span>
          </button>
          <button 
            className={`${styles.navButton} ${activeNav === 9 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(9)}
          >
            <Image src="/09.png" alt="背帶教學" width={40} height={40} />
            <span className={styles.navText}>背帶教學</span>
          </button>
        </nav>
      </div>
    </div>
  );
} 