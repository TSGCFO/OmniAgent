import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const webScraper = createTool({
  id: "web-scraper",
  description: "Scrape and extract content from web pages for research and analysis",
  inputSchema: z.object({
    url: z.string().url().describe("The URL of the webpage to scrape"),
    selector: z.string().optional().describe("CSS selector to extract specific content (optional)"),
  }),
  outputSchema: z.object({
    content: z.string(),
    title: z.string().optional(),
    url: z.string(),
  }),
  execute: async ({ context: { url, selector }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info(`🌐 [WebScraper] Scraping URL: ${url}`, { selector });
    
    try {
      // Fetch the webpage
      const response = await fetch(url);
      const html = await response.text();
      
      // Simple extraction - in production, you'd use a proper HTML parser
      // Extract title
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : "";
      
      // Extract body text (simplified)
      let content = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // Remove styles
        .replace(/<[^>]+>/g, " ") // Remove HTML tags
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();
      
      // Limit content size
      if (content.length > 5000) {
        content = content.substring(0, 5000) + "...";
      }
      
      logger?.info(`✅ [WebScraper] Successfully scraped content`, { 
        contentLength: content.length,
        title 
      });
      
      return {
        content,
        title,
        url,
      };
    } catch (error) {
      logger?.error(`❌ [WebScraper] Failed to scrape URL: ${url}`, { error });
      throw new Error(`Failed to scrape webpage: ${error}`);
    }
  },
});