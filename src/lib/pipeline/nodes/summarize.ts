import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NewsletterState } from "../state";
import { PROMPTS } from "../prompts";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    maxOutputTokens: 100,
    temperature: 0.1,
    apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

export async function summarizeNode(state: NewsletterState): Promise<Partial<NewsletterState>> {
    const { cleanedText } = state;
    if (!cleanedText) return { summary: "No content to summarize." };

    const prompt = PROMPTS.SUMMARIZE(cleanedText.slice(0, 10000));

    try {
        const response = await model.invoke(prompt);
        const summary = typeof response.content === 'string' ? response.content : "Error generating summary";
        return { summary };
    } catch (error) {
        console.error("Summarization error:", error);
        return { summary: "Error generating summary." };
    }
}
