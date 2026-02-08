/**
 * State and types for the newsletter processing pipeline (clean → summarize → classify).
 */

/** Input to the pipeline: raw HTML from the newsletter body */
export interface PipelineInput {
  rawHtml: string;
}

/** State passed through the LangGraph; each node reads and writes a subset */
export interface PipelineState {
  /** Raw HTML input (set once at entry) */
  rawHtml: string;
  /** Plain text after stripping HTML (set by clean node) */
  cleanedText: string;
  /** View-in-browser URL if found (set by clean node) */
  viewInBrowserLink: string | null;
  /** ~50-word summary (set by summarize node) */
  summary: string | null;
  /** 1–3 topic tags (set by classify node) */
  tags: string[];
}

/** Result returned after the pipeline completes (for callers and persistence) */
export interface PipelineResult {
  cleanedText: string;
  viewInBrowserLink: string | null;
  summary: string | null;
  tags: string[];
}
