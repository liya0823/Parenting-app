import { NextResponse } from 'next/server';

// 預設回覆列表
const defaultResponses = {
  greeting: [
    "嗨！我是餵寶，很高興見到你！有什麼我可以幫你的嗎？",
    "你好啊！我是餵寶，今天想聊聊什麼呢？",
    "歡迎來到餵寶的育兒小天地！有什麼想問的都可以問我喔！"
  ],
  crying: [
    "寶寶哭鬧是很正常的，讓我們一起來了解可能的原因：\n\n💡 常見原因：\n1. 肚子餓了\n2. 需要換尿布\n3. 想睡覺\n4. 身體不舒服\n\n❤️ 建議做法：\n1. 先檢查尿布是否需要更換\n2. 確認是否到了餵奶時間\n3. 輕輕搖晃或抱著寶寶\n4. 播放輕柔的音樂\n\n如果持續哭鬧，建議觀察寶寶的體溫和其他症狀，必要時諮詢醫生。",
    "寶寶哭鬧時，爸爸媽媽一定很心疼。讓我們來看看可以怎麼安撫：\n\n✨ 安撫小技巧：\n1. 輕柔地抱著寶寶\n2. 輕拍或輕搖\n3. 輕聲說話或唱歌\n4. 提供奶嘴\n\n💡 如果以上方法都沒有效果，建議：\n1. 檢查寶寶體溫\n2. 觀察是否有其他症狀\n3. 確認是否剛餵完奶\n4. 必要時諮詢醫生\n\n記住，你做得很好！照顧寶寶需要耐心，我們一起加油！",
    "寶寶哭鬧時，爸爸媽媽辛苦了！讓我們一起來了解可能的原因和解決方法：\n\n💡 可能的原因：\n1. 生理需求（餓了、想睡、需要換尿布）\n2. 環境因素（太冷、太熱、太吵）\n3. 身體不適\n\n❤️ 建議的安撫方式：\n1. 輕柔地抱著寶寶\n2. 輕聲說話或唱歌\n3. 輕輕搖晃\n4. 提供奶嘴\n\n如果持續哭鬧，建議觀察寶寶的體溫和其他症狀，必要時諮詢醫生。"
  ],
  default: [
    "我了解你的困擾。讓我們一起來討論這個問題，看看有什麼解決方案。",
    "這個情況確實需要特別注意。我建議可以試試以下方法：\n\n1. 保持冷靜\n2. 細心觀察\n3. 適時尋求專業建議\n\n記住，你做得很好！照顧寶寶需要耐心，我們一起加油！",
    "謝謝你分享這個情況。讓我們一起來分析可能的解決方案。"
  ]
};

// 根據訊息內容選擇合適的預設回覆
function getDefaultResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('嗨') || lowerMessage.includes('你好') || lowerMessage.includes('哈囉')) {
    return defaultResponses.greeting[Math.floor(Math.random() * defaultResponses.greeting.length)];
  }
  
  if (lowerMessage.includes('哭') || lowerMessage.includes('鬧') || lowerMessage.includes('吵')) {
    return defaultResponses.crying[Math.floor(Math.random() * defaultResponses.crying.length)];
  }
  
  return defaultResponses.default[Math.floor(Math.random() * defaultResponses.default.length)];
}

// 重試函數
async function fetchWithRetry(url: string, options: any, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempt ${i + 1} of ${maxRetries}`);
      const response = await fetch(url, options);
      
      let errorData;
      try {
        const text = await response.text(); // 先獲取原始文本
        console.log('Raw response:', text);
        
        try {
          errorData = JSON.parse(text); // 嘗試解析為 JSON
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          throw new Error(`Invalid response: ${text.substring(0, 100)}...`);
        }
      } catch (e) {
        console.error('Failed to read response:', e);
        throw e;
      }
      
      if (!response.ok) {
        console.log(`Error response:`, errorData);
        
        if (errorData.error?.message?.includes('负载已饱和')) {
          const waitTime = 2000 * (i + 1);
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        throw new Error(errorData.error?.message || 'API request failed');
      }
      
      return errorData; // 如果成功，返回已解析的數據
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
      
      const waitTime = 3000 * (i + 1);
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw new Error('Max retries reached');
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log('Sending messages:', messages);

    // 獲取用戶最後一條訊息
    const lastUserMessage = messages
      .filter((msg: any) => msg.role === 'user')
      .pop()?.content || '';

    const systemPrompt = `你是一個專業又親切的育兒助手，名字叫「餵寶」。請注意以下要點：
1. 用溫暖、鼓勵的語氣回答
2. 稱呼用戶為「爸爸媽媽」
3. 給予具體且實用的建議
4. 適時表達關心和支持
5. 使用繁體中文回答
6. 回答要簡潔易懂
7. 重要重點可以用符號標示，如：💡、❤️、✨
8. 在合適時機給予鼓勵，如：「你做得很好！」、「這個階段確實不容易，但你一定可以的！」`;

    try {
      const data = await fetchWithRetry(
        `${process.env.OPENAI_API_BASE_URL}/v1/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content
              }))
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        }
      );

      console.log('API Response:', data);

      if (data.error) {
        throw new Error(data.error.message || 'OpenAI API returned an error');
      }

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenAI API');
      }

      return NextResponse.json({
        message: data.choices[0].message.content,
      });
    } catch (error) {
      console.error('API call failed:', error);
      // 返回錯誤信息而不是默認回覆
      return NextResponse.json(
        { 
          error: '與 AI 助手通信時發生錯誤',
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { 
        error: '系統暫時無法回應，請稍後再試',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 