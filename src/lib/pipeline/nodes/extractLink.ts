 import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NewsletterState } from "../state";
import { PROMPTS } from "../prompts";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    maxOutputTokens: 150,
    temperature: 0,
    apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

export async function extractLinkNode(state: NewsletterState): Promise<Partial<NewsletterState>> {
    // Skip if link already found by library-based extraction
    if (state.viewInBrowserLink) {
        console.log("[extractLink] Link already found, skipping LLM extraction");
        return {};
    }

    const { htmlBody } = state;
    if (!htmlBody) {
        console.log("[extractLink] No HTML body provided");
        return {};
    }

    // Pass first ~5000 chars of HTML to avoid token limits
    const prompt = PROMPTS.EXTRACT_LINK(htmlBody.slice(0, 5000));

    try {
        console.log("[extractLink] Attempting LLM-based link extraction...");
        const response = await model.invoke(prompt);
        const linkText = typeof response.content === 'string'
            ? response.content.trim()
            : "";

        // Handle "NONE" response
        if (linkText.toUpperCase() === "NONE") {
            console.log("[extractLink] LLM found no relevant link");
            return {};
        }

        // Validate it's a URL
        const isValidUrl = linkText.startsWith('http://') || linkText.startsWith('https://');

        if (isValidUrl) {
            console.log(`[extractLink] ✓ Successfully extracted link: ${linkText.substring(0, 60)}...`);
            return { viewInBrowserLink: linkText };
        } else {
            console.log(`[extractLink] Invalid URL format: ${linkText}`);
            return {};
        }
    } catch (error) {
        console.error("[extractLink] Error during link extraction:", error);
        return {};
    }
}
