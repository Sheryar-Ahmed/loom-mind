const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const logger = require('../utils/logger');

/**
 * URL Fetcher Service
 * Fetches and parses web pages to extract content
 */
class UrlFetcherService {
  /**
   * Fetch and parse URL content
   * @param {string} url - URL to fetch
   * @returns {Promise<Object>} Parsed content
   */
  async fetchUrl(url) {
    let parsedUrl;
    
    try {
      // Validate URL
      parsedUrl = new URL(url);
      logger.info(`Fetching URL: ${url}`);

      // Fetch page with better headers
      const response = await axios.get(url, {
        timeout: 20000,
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      // Check if we got HTML
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
        logger.warn(`Non-HTML content type: ${contentType} for URL: ${url}`);
      }

      logger.info(`Fetched ${response.data.length} bytes from ${url}`);

      // Parse HTML
      const $ = cheerio.load(response.data);

      // Extract metadata
      const metadata = this.extractMetadata($, parsedUrl);
      logger.info(`Extracted metadata - Title: "${metadata.title}"`);

      // Extract main content
      const content = this.extractContent($);
      logger.info(`Extracted content - Length: ${content.length} characters`);

      // Validate extraction was successful
      if (!metadata.title || metadata.title === parsedUrl.hostname) {
        logger.warn(`Could not extract proper title from ${url}`);
      }
      
      if (!content || content.length < 100) {
        logger.warn(`Extracted very little or no content from ${url} (${content.length} chars)`);
      }

      return {
        ...metadata,
        text: content,
        url,
        domain: parsedUrl.hostname,
      };
    } catch (error) {
      // Detailed error logging
      logger.error(`❌ URL fetch FAILED for ${url}`);
      logger.error(`Error type: ${error.name}`);
      logger.error(`Error message: ${error.message}`);
      
      if (error.response) {
        logger.error(`HTTP Status: ${error.response.status}`);
        logger.error(`Response headers: ${JSON.stringify(error.response.headers)}`);
      } else if (error.request) {
        logger.error(`No response received - Network error or timeout`);
      }
      
      logger.error(`Full error: ${error.stack}`);

      // Return basic info with error details
      if (!parsedUrl) {
        parsedUrl = new URL(url);
      }
      
      return {
        title: parsedUrl.hostname,
        url,
        domain: parsedUrl.hostname,
        text: '',
        summary: `Failed to fetch: ${error.message}`,
        error: error.message,
      };
    }
  }

  /**
   * Extract metadata from page
   * @param {Object} $ - Cheerio instance
   * @param {Object} parsedUrl - Parsed URL object
   * @returns {Object} Metadata
   */
  extractMetadata($, parsedUrl) {
    // Try different sources for title
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      parsedUrl.hostname;

    // Try different sources for description
    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    // Extract image
    const imageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      '';

    // Extract author
    const author =
      $('meta[name="author"]').attr('content') ||
      $('meta[property="article:author"]').attr('content') ||
      '';

    // Extract published date
    const publishedDate =
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[name="publish_date"]').attr('content') ||
      '';

    // Extract language
    const language = $('html').attr('lang') || 'en';

    // Extract favicon
    let favicon =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      '/favicon.ico';

    // Make favicon absolute URL
    if (favicon && !favicon.startsWith('http')) {
      favicon = new URL(favicon, parsedUrl.origin).href;
    }

    return {
      title: this.cleanText(title),
      summary: this.cleanText(description),
      imageUrl: imageUrl || null,
      author: this.cleanText(author),
      publishedDate: publishedDate || null,
      language,
      favicon,
    };
  }

  /**
   * Extract main content from page
   * @param {Object} $ - Cheerio instance
   * @returns {string} Extracted text content
   */
  extractContent($) {
    // Remove unwanted elements before extraction
    $('script, style, nav, header, footer, aside, iframe, noscript, .sidebar, .ad, .advertisement, .comments, #comments').remove();

    // Try multiple selectors in order of preference
    const selectors = [
      'article',
      'main',
      '[role="main"]',
      '.post-content',
      '.article-content',
      '.entry-content',
      '.content',
      '#content',
      '.post',
      '.article',
      '.story-body',
      '.post-body',
      'body'
    ];

    let bestContent = '';
    let maxLength = 0;

    // Try each selector and keep the one with most content
    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        const text = element.text();
        if (text.length > maxLength) {
          maxLength = text.length;
          bestContent = text;
        }
      }
    }

    // If we still have very little content, try getting all paragraphs
    if (maxLength < 200) {
      const paragraphs = $('p').map((i, el) => $(el).text()).get().join('\n');
      if (paragraphs.length > maxLength) {
        bestContent = paragraphs;
      }
    }

    return this.cleanText(bestContent);
  }

  /**
   * Clean extracted text
   * @param {string} text - Text to clean
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    if (!text) return '';

    return (
      text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
        .trim()
        .substring(0, 50000)
    ); // Limit to 50k characters
  }

  /**
   * Validate if URL is accessible
   * @param {string} url - URL to validate
   * @returns {Promise<boolean>} True if accessible
   */
  async isUrlAccessible(url) {
    try {
      const response = await axios.head(url, {
        timeout: 5000,
        maxRedirects: 5,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new UrlFetcherService();
