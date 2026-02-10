import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NewsletterState } from "../state";
import { PROMPTS } from "../prompts";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    maxOutputTokens: 50,
    temperature: 0.1,
    apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

export async function classifyNode(state: NewsletterState): Promise<Partial<NewsletterState>> {
    const { summary, cleanedText } = state;
    const textToClassify = summary ? summary + "\n\n" + (cleanedText?.slice(0, 1000) ?? "") : cleanedText?.slice(0, 1500) ?? "";

    if (!textToClassify) return { topics: [] };

    const prompt = PROMPTS.CLASSIFY(textToClassify);

    try {
        const response = await model.invoke(prompt);
        const text = typeof response.content === 'string' ? response.content : "";
        const topics = text.split(",").map((t) => t.trim().toLowerCase()).filter(t => t.length > 0);
        return { topics };
    } catch (error) {
        console.error("Classification error:", error);
        return { topics: [] };
    }
}
