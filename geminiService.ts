
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, BankAccount, Category } from "./types";

export const getFinancialAdvice = async (
  accounts: BankAccount[],
  transactions: Transaction[],
  categories: Category[]
): Promise<string> => {
  // 使用 process.env.API_KEY 直接進行檢查，符合安全性與規範
  if (!process.env.API_KEY || process.env.API_KEY === "undefined") {
    return "目前是展示模式，設定 API_KEY 後我可以給你更多專業建議喔！✨";
  }

  // Always use new GoogleGenAI({ apiKey: process.env.API_KEY }) directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const recentExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .slice(-5)
    .map(t => `${t.note}: ${t.amount}`);

  const prompt = `你是一位可愛又專業的理財管家 Finny。
我的目前資產總額：${totalBalance} 元。
最近的消費紀錄：${recentExpenses.length > 0 ? recentExpenses.join(', ') : '尚無消費紀錄'}。
請根據這些數據，用溫暖且帶點可愛表情符號的方式給我一點理財建議。請指名優點與需要改進的地方，限制在 150 字以內。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    // 使用 .text 屬性獲取結果
    return response.text || "Finny 正在想事情，請稍後再問我～";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "哎呀，Finny 腦袋打結了，請檢查 API 金鑰是否正確！";
  }
};

export const parseQuickAdd = async (text: string, categories: Category[]): Promise<Partial<Transaction> | null> => {
  if (!process.env.API_KEY || process.env.API_KEY === "undefined") return null;

  // Always use new GoogleGenAI({ apiKey: process.env.API_KEY }) directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const schema = {
    type: Type.OBJECT,
    properties: {
      amount: { type: Type.NUMBER, description: "金額" },
      type: { type: Type.STRING, enum: ['INCOME', 'EXPENSE'], description: "收入或支出" },
      note: { type: Type.STRING, description: "簡短備註" },
      categoryName: { type: Type.STRING, description: "類別名稱" }
    },
    required: ['amount', 'type', 'note', 'categoryName']
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `請從這段文字中解析出財務資訊： "${text}"。
      類別必須從以下清單中挑選一個最合適的：${categories.map(c => c.name).join(', ')}。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    // 使用 .text 屬性並進行安全解析
    const result = JSON.parse(response.text || '{}');
    const category = categories.find(c => c.name === result.categoryName);
    
    return {
      amount: result.amount,
      type: result.type as any,
      note: result.note,
      categoryId: category?.id || categories[0].id,
      date: Date.now()
    };
  } catch (error) {
    console.error("AI Parse Error:", error);
    return null;
  }
};