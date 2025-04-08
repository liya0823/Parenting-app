// 檢測是否為iOS設備
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// 檢測是否為安裝到主屏幕的應用
function isInStandaloneMode() {
  return (window.navigator.standalone) || 
         (window.matchMedia('(display-mode: standalone)').matches);
}

// 當頁面加載完成時執行
document.addEventListener('DOMContentLoaded', function() {
  // 基本的視口調整
  function adjustViewport() {
    // 設置視口元標籤
    let metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
      metaViewport = document.createElement('meta');
      metaViewport.setAttribute('name', 'viewport');
      document.head.appendChild(metaViewport);
    }
    
    // 設置基本視口屬性
    metaViewport.setAttribute('content', 
      'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover');
    
    // 使主體元素占滿整個視口高度
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    
    // 確保下一個元素也具有全高度
    if (document.getElementById('__next')) {
      document.getElementById('__next').style.minHeight = '100vh';
      document.getElementById('__next').style.overflow = 'hidden';
    }
  }
  
  // 初始調整
  adjustViewport();
  
  // 在窗口調整大小時重新調整
  window.addEventListener('resize', adjustViewport);
  
  // 如果是iOS設備
  if (isIOS()) {
    // 如果不是從主屏幕啟動的
    if (!isInStandaloneMode()) {
      // 創建一個覆蓋層，提示用戶添加到主屏幕
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = '#FACFC5';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.textAlign = 'center';
      overlay.style.padding = '20px';
      overlay.style.boxSizing = 'border-box';
      
      // 添加logo
      const logo = document.createElement('img');
      logo.src = '/logo.png';
      logo.style.width = '150px';
      logo.style.height = '150px';
      logo.style.marginBottom = '20px';
      
      // 添加指導文字
      const title = document.createElement('h2');
      title.textContent = '安裝"安心餵"應用';
      title.style.color = '#333';
      title.style.marginBottom = '15px';
      
      const instructions = document.createElement('p');
      instructions.innerHTML = '請點擊<b>分享按鈕 <span style="font-size:1.5em">↑</span></b><br>然後選擇<b>添加到主屏幕</b><br>以獲得完整的應用體驗。';
      instructions.style.fontSize = '16px';
      instructions.style.lineHeight = '1.5';
      instructions.style.color = '#333';
      
      // 組合所有元素
      overlay.appendChild(logo);
      overlay.appendChild(title);
      overlay.appendChild(instructions);
      
      // 添加到頁面
      document.body.appendChild(overlay);
    } else {
      // 如果已經是從主屏幕啟動的，強制全屏
      hideControls();
    }
  } else {
    // 非iOS設備也隱藏控制欄
    hideControls();
  }
  
  // 隱藏底部控制欄的函數
  function hideControls() {
    // 立即隱藏
    hideBottomBar();
    
    // 也在延遲後隱藏，以防頁面加載後控制欄出現
    setTimeout(hideBottomBar, 500);
    setTimeout(hideBottomBar, 1000);
    setTimeout(hideBottomBar, 2000);
    
    // 每當頁面滾動時隱藏
    window.addEventListener('scroll', hideBottomBar);
    
    // 每當頁面大小改變時隱藏
    window.addEventListener('resize', hideBottomBar);
    
    // 每當方向改變時隱藏
    window.addEventListener('orientationchange', hideBottomBar);
    
    // 每當用戶點擊頁面時隱藏
    document.addEventListener('click', hideBottomBar);
    
    // 定期檢查並隱藏控制欄
    setInterval(hideBottomBar, 1000);
  }
  
  function hideBottomBar() {
    // 使用 CSS 選擇器查找底部控制欄
    // Safari 底部控制欄通常有特定的樣式或類名
    const possibleBars = [
      '.footer-bar',
      '.bottom-bar',
      '.toolbar',
      '.nav-bar',
      'div[role="toolbar"]',
      'div[style*="bottom: 0"]',
      'nav[style*="bottom: 0"]',
      'div[style*="bottom: 0px"]',
      'div[style*="z-index: 9999"]'
    ];
    
    // 嘗試所有可能的選擇器
    possibleBars.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.display = 'none';
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        el.style.height = '0';
        el.style.overflow = 'hidden';
        el.style.pointerEvents = 'none';
      });
    });
    
    // 強制整頁內容全屏顯示
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = '0';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.bottom = '0';
    
    // 檢查是否有iframe，並處理它們
    document.querySelectorAll('iframe').forEach(iframe => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        possibleBars.forEach(selector => {
          const elements = iframeDoc.querySelectorAll(selector);
          elements.forEach(el => {
            el.style.display = 'none';
          });
        });
      } catch (e) {
        // 跨域iframe無法訪問
      }
    });
    
    // 嘗試移除任何可能是控制欄的固定元素
    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.position === 'fixed' && 
          (style.bottom === '0px' || parseInt(style.bottom) < 10) && 
          parseInt(style.height) < 100) {
        el.style.display = 'none';
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
      }
    });
    
    // 滾動到頂部以隱藏地址欄
    window.scrollTo(0, 1);
  }
}); 