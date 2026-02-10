export const PROMPTS = {
    CLASSIFY: (content: string) => `Classify this newsletter into 1–3 topic tags from: [tech, business, finance, ai, design,"Software Development", productivity, crypto]. Return only comma-separated tags.
  
  Content:
  ${content}
  `,
    SUMMARIZE: (content: string) => `Summarize this newsletter in exactly 50 words or fewer. Be concise and informative.
  
  Newsletter Content:
  ${content}
  `,
};
