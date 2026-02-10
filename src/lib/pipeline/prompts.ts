export const PROMPTS = {
    CLASSIFY: (content: string) => `Classify this newsletter into 1–3 topic tags from: [tech, business, finance, ai, design,"Software Development", productivity, crypto]. Return only comma-separated tags.
  
  Content:
  ${content}
  `,
    SUMMARIZE: (content: string) => `Summarize this newsletter in exactly 50 words or fewer. Be concise and informative.
  
  Newsletter Content:
  ${content}
  `,
    EXTRACT_LINK: (html: string) => `Extract the main newsletter article link from this HTML email.

Look for:
1. "View in browser" / "Read online" / "Web version" links
2. Main article/post links (e.g., Substack post URLs like "substack.com/p/...", blog post links)
3. Primary content links (usually near the headline or top of the email)

Return ONLY the full URL, nothing else. If no relevant link is found, return "NONE".

HTML:
${html}
`,
};
