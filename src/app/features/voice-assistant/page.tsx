'use client';
import { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';
import Image from 'next/image';
import { Message, ChatState } from './types';
import ChatHistory from '../../../components/ChatHistory/ChatHistory';
import { useRouter } from 'next/navigation';

export default function VoiceAssistantPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [activeNav, setActiveNav] = useState<number | null>(6);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
  });

  // 預設育兒問題
  const parentingQuestions = [
    "寶寶發燒了，該如何處理？",
    "如何培養寶寶的閱讀習慣？",
    "寶寶挑食怎麼辦？",
    "如何訓練寶寶自主入睡？",
    "寶寶情緒不穩定時該如何安撫？",
    "如何培養寶寶的社交能力？",
    "寶寶語言發展遲緩怎麼辦？",
    "如何處理寶寶的分離焦慮？",
    "寶寶不愛運動怎麼辦？",
    "如何培養寶寶的自理能力？"
  ];

  // 隨機發送育兒問題
  const sendRandomParentingQuestion = async () => {
    const randomIndex = Math.floor(Math.random() * parentingQuestions.length);
    const randomQuestion = parentingQuestions[randomIndex];
    setInputMessage(randomQuestion);
    
    // 自動發送問題
    const userMessage: Message = {
      role: 'user',
      content: randomQuestion,
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: undefined,
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...chatState.messages, userMessage],
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error: any) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '發送訊息失敗，請稍後再試',
      }));

      setTimeout(() => {
        setChatState(prev => ({ ...prev, error: undefined }));
      }, 3000);
    }
  };

  // 播放打招呼聲音
  useEffect(() => {
    // 創建音頻元素
    audioRef.current = new Audio('/audio/嗨 ! 我是.mp3');
    
    // 播放聲音
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('播放聲音失敗:', error);
      });
    }
    
    // 組件卸載時清理
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 組織歷史記錄格式
  const organizeHistory = () => {
    const history: { [key: string]: any[] } = {};
    
    // 確保只在客戶端執行
    if (typeof window !== 'undefined') {
      // 從 localStorage 讀取所有歷史記錄
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        try {
          const messages: Message[] = JSON.parse(savedMessages);
          
          messages.forEach(msg => {
            const date = new Date().toLocaleDateString();
            if (!history[date]) {
              history[date] = [];
            }
            history[date].push({
              content: msg.content,
              timestamp: new Date().toLocaleTimeString()
            });
          });
        } catch (error) {
          console.error('Error parsing chat history:', error);
        }
      }
    }

    return Object.entries(history).map(([date, messages]) => ({
      date,
      messages
    }));
  };

  // 保存消息到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && chatState.messages.length > 0) {
      const savedMessages = localStorage.getItem('chatHistory');
      let allMessages: Message[] = [];
      
      if (savedMessages) {
        try {
          allMessages = JSON.parse(savedMessages);
        } catch (error) {
          console.error('Error parsing chat history:', error);
        }
      }
      
      // 將當前對話添加到歷史記錄中，避免重複添加
      const currentMessages = chatState.messages;
      const uniqueMessages = [...allMessages];
      
      currentMessages.forEach(msg => {
        // 檢查消息是否已經存在於歷史記錄中
        const isDuplicate = uniqueMessages.some(
          existingMsg => 
            existingMsg.content === msg.content && 
            existingMsg.role === msg.role
        );
        
        if (!isDuplicate) {
          uniqueMessages.push(msg);
        }
      });
      
      // 保存到歷史記錄
      localStorage.setItem('chatHistory', JSON.stringify(uniqueMessages));
    }
  }, [chatState.messages]);

  // 從 localStorage 加載歷史記錄
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          if (Array.isArray(parsedMessages)) {
            setChatState(prev => ({
              ...prev,
              messages: parsedMessages
            }));
          }
        } catch (error) {
          console.error('Error parsing chat history:', error);
        }
      }
    }
  }, []);

  // 監聽消息變化，自動滾動到底部
  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);  // 當消息數組變化時觸發

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - suggestionsRef.current!.offsetLeft);
    setScrollLeft(suggestionsRef.current!.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - suggestionsRef.current!.offsetLeft;
    const walk = (x - startX) * 2;
    suggestionsRef.current!.scrollLeft = scrollLeft - walk;
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: undefined,
    }));

    setInputMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...chatState.messages, userMessage],
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error: any) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '發送訊息失敗，請稍後再試',
      }));

      setTimeout(() => {
        setChatState(prev => ({ ...prev, error: undefined }));
      }, 3000);
    }
  };

  // 檢查 URL 參數和重置聊天狀態
  useEffect(() => {
    // 清除之前的聊天記錄
    localStorage.removeItem('chatHistory');
    
    // 重置聊天狀態
    setChatState({
      messages: [],
      isLoading: false,
      error: undefined
    });
    
    // 安全地清除 URL 參數
    if (typeof window !== 'undefined') {
      try {
        if (window.history && window.history.state !== null) {
          window.history.replaceState({}, '', '/features/voice-assistant');
        }
      } catch (error) {
        console.error('Failed to update history state:', error);
      }
    }
  }, []); // 在組件掛載時執行一次

  // 判斷是否顯示歡迎畫面
  const showWelcome = chatState.messages.length === 0;

  // 處理導覽按鈕點擊
  const handleNavClick = (num: number) => {
    setActiveNav(num);
    switch (num) {
      case 6:
        // 如果點擊的是第一個按鈕（編號6），保存當前對話並重置聊天狀態
        if (chatState.messages.length > 0) {
          // 如果有對話記錄，先保存到 localStorage
          const savedMessages = localStorage.getItem('chatHistory');
          let allMessages: Message[] = [];
          
          // 如果已經有保存的對話，先讀取出來
          if (savedMessages) {
            try {
              allMessages = JSON.parse(savedMessages);
            } catch (error) {
              console.error('Error parsing chat history:', error);
            }
          }
          
          // 將當前對話添加到歷史記錄中，避免重複添加
          const currentMessages = chatState.messages;
          const uniqueMessages = [...allMessages];
          
          currentMessages.forEach(msg => {
            // 檢查消息是否已經存在於歷史記錄中
            const isDuplicate = uniqueMessages.some(
              existingMsg => 
                existingMsg.content === msg.content && 
                existingMsg.role === msg.role
            );
            
            if (!isDuplicate) {
              uniqueMessages.push(msg);
            }
          });
          
          // 保存更新後的歷史記錄
          localStorage.setItem('chatHistory', JSON.stringify(uniqueMessages));
        }

        setChatState({
          messages: [],
          isLoading: false,
          error: undefined
        });
        break;
      case 7:
        router.push('/features/friendly-nursing-map');
        break;
      case 8:
        router.push('/features/soothing-music');
        break;
      case 9:
        router.push('/features/Tutorial');
        break;
    }
  };

  const handleButtonClick = (index: number) => {
    setActiveButton(index);
    switch(index) {
      case 0: // 尋找友善空間
        router.push('/features/friendly-nursing-map');
        break;
      case 1: // 安撫功能
        router.push('/features/soothing-music');
        break;
      case 2: // 背帶使用
        router.push('/features/Tutorial');
        break;
      case 3: // 育兒知識
        // 發送隨機育兒問題
        sendRandomParentingQuestion();
        break;
    }
  };

  return (
    <div className={styles.phoneContainer}>
      <ChatHistory 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        histories={organizeHistory()}
      />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <span className={styles.anxinwei}>安心餵</span>
            <Image 
              src="/line.png"
              alt="line"
              width={40}
              height={40}
              style={{ height: 'auto', cursor: 'pointer' }}
              className={styles.lineIcon}
              onClick={() => setIsHistoryOpen(true)}
            />
            <Image 
              src="/User.png"
              alt="User"
              width={40}
              height={40}
              className={styles.userIcon}
              onClick={() => router.push('/features/baby-page')}
            />
          </div>
        </div>

        <div className={styles.content}>
          {showWelcome ? (
            <>
              <div className={styles.logoWrapper}>
                <Image 
                  src="/logo-02.png"
                  alt="Logo"
                  width={245}
                  height={100}
                  className={styles.logo}
                  style={{ height: 'auto' }}
                />
              </div>
              <h1 className={styles.title}>嗨！我是餵寶 育兒的貼心小助手！</h1>
              <p className={styles.subtitle}>
                我可以幫你解答育兒的問題、尋找友善店家、安撫寶寶，請把任務交給我吧~
              </p>
            </>
          ) : (
            <div className={styles.chatMessages} ref={chatContainerRef}>
              {chatState.messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`${styles.message} ${
                    message.role === 'user' ? styles.userMessage : styles.assistantMessage
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {chatState.isLoading && (
                <div className={styles.loadingMessage}>
                  <span>餵寶思考中</span>
                  <span className={styles.loadingDots}></span>
                </div>
              )}
              {chatState.error && (
                <div className={styles.errorMessage}>
                  {chatState.error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.bottomSection}>
          {showWelcome && (
            <div className={styles.suggestionsWrapper}>
              <div 
                className={styles.suggestions} 
                ref={suggestionsRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={() => setIsDragging(false)}
                onMouseUp={() => setIsDragging(false)}
                onMouseMove={handleMouseMove}
              >
                {["尋找友善空間", "安撫功能", "背帶使用", "育兒知識"].map((text, index) => (
                  <button 
                    key={index} 
                    className={`${styles.suggestionButton} ${activeButton === index ? styles.activeButton : ''}`}
                    onMouseDown={() => setActiveButton(index)}
                    onMouseUp={() => {
                      setActiveButton(null);
                      handleButtonClick(index);
                    }}
                    onMouseLeave={() => setActiveButton(null)}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.inputArea}>
            <input
              type="text"
              placeholder="Type a message"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className={styles.input}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <button className={styles.voiceButton}>
              <Image 
                src="/Mic.png"
                alt="Voice"
                width={25}
                height={25}
              />
            </button>
            <button
              className={styles.sendButton}
              onClick={handleSendMessage}
            >
              <Image 
                src="/Sent.png"
                alt="Send"
                width={30}
                height={30}
              />
            </button>
          </div>
        </div>

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