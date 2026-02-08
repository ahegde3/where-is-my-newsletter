import { BaseMessage } from "@langchain/core/messages";

export interface NewsletterState {
    // Input
    htmlBody: string;

    // Output of Clean Node
    cleanedText?: string;
    viewInBrowserLink?: string;

    // Output of Summarize Node
    summary?: string;

    // Output of Classify Node
    topics?: string[];

    // Optional: errors
    error?: string;
}
