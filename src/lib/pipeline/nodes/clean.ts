import * as cheerio from "cheerio";
import { NewsletterState } from "../state";

export async function cleanNode(state: NewsletterState): Promise<Partial<NewsletterState>> {
  const { htmlBody } = state;
  const $ = cheerio.load(htmlBody);

  // 1. Extract "View in Browser" link
  // Look for common patterns in anchor text
  let viewInBrowserLink: string | undefined;
  $("a").each((_, el) => {
    const text = $(el).text().toLowerCase().trim();
    if (
      text.includes("view in browser") ||
      text.includes("read online") ||
      text.includes("open in browser") ||
      text.includes("web version")
    ) {
      const href = $(el).attr("href");
      if (href) {
        viewInBrowserLink = href;
        return false; // Break loop
      }
    }
  });

  // 2. Remove clutter
  $("script").remove();
  $("style").remove();
  $("img").remove();
  $("svg").remove();
  $("noscript").remove();
  $("iframe").remove();

  // Remove common footer elements (heuristics)
  $(".footer").remove();
  $("#footer").remove();
  $("footer").remove();
  $("[class*='unsubscribe']").remove();
  $("[id*='unsubscribe']").remove();

  // 3. Extract text
  // Replace <br> with newlines to preserve some structure
  $("br").replaceWith("\n");
  $("p").each((_, el) => {
    const text = $(el).text();
    // only append newline if paragraph is not empty
    if (text.trim().length > 0) {
      $(el).text(text + "\n");
    }
  });
  $("div").each((_, el) => {
    const text = $(el).text();
    if (text.trim().length > 0) {
      $(el).text(text + "\n");
    }
  });

  let cleanedText = $("body").text();

  // Collapse whitespace: replace multiple spaces/newlines with single space
  cleanedText = cleanedText.replace(/[ \t]+/g, " "); // collapse horizontal whitespace
  cleanedText = cleanedText.replace(/\n\s*\n/g, "\n"); // collapse multiple newlines
  cleanedText = cleanedText.trim();

  return {
    cleanedText,
    viewInBrowserLink,
  };
}
