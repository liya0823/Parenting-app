import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ChatMessage, BabyInfo } from '@/app/features/voice-assistant/types';

export const chatService = {
  // 儲存聊天訊息
  async saveMessage(message: ChatMessage, babyId: string) {
    try {
      await addDoc(collection(db, 'messages'), {
        ...message,
        babyId,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  },

  // 獲取特定寶寶的聊天記錄
  async getMessages(babyId: string) {
    try {
      const q = query(
        collection(db, 'messages'),
        where('babyId', '==', babyId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text || '',
          isUser: data.isUser || false
        } as ChatMessage;
      });
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },

  // 獲取寶寶資訊
  async getBabyInfo(babyId: string) {
    try {
      const docRef = doc(db, 'babies', babyId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as BabyInfo;
      }
      return null;
    } catch (error) {
      console.error('Error getting baby info:', error);
      return null;
    }
  },

  // 儲存寶寶資訊
  async saveBabyInfo(babyInfo: Omit<BabyInfo, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'babies'), {
        ...babyInfo,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving baby info:', error);
      return null;
    }
  },

  // 更新寶寶資訊
  async updateBabyInfo(babyId: string, babyInfo: Partial<BabyInfo>) {
    try {
      const docRef = doc(db, 'babies', babyId);
      await updateDoc(docRef, {
        ...babyInfo,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating baby info:', error);
      return false;
    }
  }
}; 