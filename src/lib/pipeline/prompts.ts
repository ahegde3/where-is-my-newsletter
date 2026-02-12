export const PROMPTS = {
  CLASSIFY: (content: string) => `Classify this newsletter into 1–3 topic tags from: [Tech, Business, Finance, AI, Design, Software Development , Productivity, Crypto]. Return only comma-separated tags.
  
  Content:
  ${content}
  `,
  SUMMARIZE: (content: string) => `Summarize this newsletter in exactly 50 words or fewer. Be concise and informative.
  
  Newsletter Content:
  ${content}
  `,
  EXTRACT_LINK: (html: string) => `You are extracting a link from an HTML email. You must ONLY return links that actually exist in the HTML provided.

**CRITICAL: DO NOT make up, invent, or hallucinate URLs. If you cannot find a real link in the HTML, return "NONE".**

PRIORITY ORDER (check in this order):
1. **Links inside heading tags (<h1>, <h2>, <h3>)** - Look for <a href="..."> tags inside headings
   - Substack newsletters put the main article link in the h1: <h1><a href="https://substack.com/app-link/post?publication_id=...">Title</a></h1>
2. **"View in browser" links** - Links with text like "View in Browser", "Read online", "Web version"
3. **Main article links** - Links with long descriptive text (blog titles, article headlines)

WHAT TO EXTRACT:
- Extract the EXACT value of the href="..." attribute from an <a> tag
- The URL must start with http:// or https://
- Common patterns:
  * substack.com/app-link/post?publication_id=...
  * substack.com/p/article-title
  * medium.com/blog/article-id
  * Links with tracking parameters are okay

WHAT NOT TO DO:
- DO NOT create example.com URLs
- DO NOT guess or invent URLs based on the content
- DO NOT extract partial URLs
- If the HTML doesn't contain a clear article or "view in browser" link, return "NONE"

Return ONLY one of:
- The full URL from the href attribute (e.g., https://substack.com/app-link/post?publication_id=817132&post_id=187148454&...)
- The word "NONE" if no relevant link exists

HTML:
${html}
`,
};
