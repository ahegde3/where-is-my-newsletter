
import { StateGraph, END } from "@langchain/langgraph";
import { NewsletterState } from "./state";
import { cleanNode } from "./nodes/clean";
import { summarizeNode } from "./nodes/summarize";
import { classifyNode } from "./nodes/classify";
import { extractLinkNode } from "./nodes/extractLink";

// Conditional routing: extract link with LLM only if library-based extraction failed
function shouldExtractLink(state: NewsletterState): string {
    return state.viewInBrowserLink ? "summarize" : "extractLink";
}

// Define the graph
const workflow = new StateGraph<NewsletterState>({
    channels: {
        htmlBody: {
            reducer: (x: string, y: string) => y ? y : x,
            default: () => ""
        },
        cleanedText: {
            reducer: (x?: string, y?: string) => y ? y : x,
            default: () => undefined
        },
        viewInBrowserLink: {
            reducer: (x?: string, y?: string) => y ? y : x,
            default: () => undefined
        },
        summary: {
            reducer: (x?: string, y?: string) => y ? y : x,
            default: () => undefined
        },
        topics: {
            reducer: (x?: string[], y?: string[]) => y ? y : x,
            default: () => []
        },
        error: {
            reducer: (x?: string, y?: string) => y ? y : x,
            default: () => undefined
        }
    }
})
    .addNode("clean", cleanNode)
    .addNode("extractLink", extractLinkNode)
    .addNode("summarize", summarizeNode)
    .addNode("classify", classifyNode)
    .addEdge("__start__", "clean")
    .addConditionalEdges("clean", shouldExtractLink, {
        "extractLink": "extractLink",
        "summarize": "summarize"
    })
    .addEdge("extractLink", "summarize")
    .addEdge("summarize", "classify")
    .addEdge("classify", "__end__");

// Compile the graph
export const graph = workflow.compile();

/**
 * Process a single newsletter HTML body through the pipeline.
 */
export async function processNewsletter(htmlBody: string) {
    try {
        const result = await graph.invoke({ htmlBody });
        return result;
    } catch (error) {
        console.error("Pipeline execution error:", error);
        throw error;
    }
}
