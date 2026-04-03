import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface DebtInsight {
  title: string;
  description: string;
  solution: string;
  priority: 'High' | 'Medium' | 'Low';
}

export const generateDebtInsights = async (
  teamProgress: any[], 
  technicalDebts: any[]
): Promise<DebtInsight[]> => {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.warn("Gemini API key not found in env variables.");
      return [];
  }

  const prompt = `
    Analyze the following engineering team onboarding and technical debt data for DevFlow. 
    Provide 3 actionable insights or recommendations for the Engineering Manager to prevent long-term technical debt and improve velocity.
    Format your response as a JSON array of objects with fields: title, description, solution, priority (High/Medium/Low).
    
    Team Data:
    ${JSON.stringify(teamProgress, null, 2)}
    
    Current Technical Debts Log:
    ${JSON.stringify(technicalDebts, null, 2)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Attempt to parse JSON from text (sometimes Gemini adds Markdown markers)
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const insights: DebtInsight[] = JSON.parse(jsonStr);
    
    return insights;
  } catch (error) {
    console.error("Gemini Insight Generation Error:", error);
    return [];
  }
};
