// simple-docs-crawler.js
// A simple documentation crawler and indexer for RAG applications

import 'dotenv/config';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import fs from "fs/promises";
import * as cheerio from "cheerio";
import puppeteer from 'puppeteer';

// Configuration
const START_URL = "https://aptos.dev/en/build/smart-contracts";
const OUTPUT_FILE = "docs.txt";
const MAX_PAGES = 100; // Limit the number of pages to crawl

/**
 * Loads a page using Puppeteer with full JavaScript execution
 */
async function loadPageWithPuppeteer(url) {
  console.log(`Loading with Puppeteer: ${url}`);
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to a large size to ensure we can see everything
    await page.setViewport({ width: 1280, height: 1024 });
    
    // Go to the URL and wait for the page to be fully loaded
    await page.goto(url, { 
      waitUntil: "networkidle2",
      timeout: 30000
    });
    
    // Wait a bit more for any delayed JavaScript rendering
    await page.waitForTimeout(2000);
    
    // Get page content
    const html = await page.content();
    const title = await page.title();
    
    return { html, title };
  } catch (error) {
    console.error(`Error loading ${url} with Puppeteer:`, error.message);
    return { html: "", title: "" };
  } finally {
    await browser.close();
  }
}

/**
 * Extracts clean code from HTML code blocks, with special handling for Shiki blocks
 */
function extractCodeFromHtml($, codeBlock) {
  const $codeBlock = $(codeBlock);
  let codeText = "";
  let language = "unknown";
  
  // Case 1: Regular code blocks
  if (!$codeBlock.hasClass('shiki') && !$codeBlock.parent().hasClass('shiki')) {
    codeText = $codeBlock.text().trim();
    
    // Try to detect language from classes
    const classAttr = $codeBlock.attr('class') || '';
    if (classAttr.includes('language-') || classAttr.includes('lang-')) {
      const langMatch = classAttr.match(/(language|lang)-([a-zA-Z0-9]+)/);
      if (langMatch && langMatch[2]) {
        language = langMatch[2];
      }
    }
    
    // Process token-based syntax highlighting
    if ($codeBlock.find('.token-line, .token').length > 0) {
      codeText = "";
      $codeBlock.find('.token-line').each((_, line) => {
        codeText += $(line).text().trim() + '\n';
      });
    }
  }
  // Case 2: Shiki-highlighted code blocks (like in Aptos docs)
  else {
    let targetElement = $codeBlock.hasClass('shiki') ? $codeBlock : $codeBlock.parent('.shiki');
    
    // Extract language from class
    const classAttr = targetElement.attr('class') || '';
    const langMatch = classAttr.match(/language-([a-zA-Z0-9]+)/);
    if (langMatch && langMatch[1]) {
      language = langMatch[1];
    }
    
    // Extract code from line spans
    targetElement.find('.line').each((_, line) => {
      codeText += $(line).text() + '\n';
    });
  }
  
  return { code: codeText.trim(), language };
}

/**
 * Extract clean content from HTML, removing navigation, scripts, etc.
 */
function extractCleanContent($, selector) {
  // Clone the content to avoid modifying the original
  const $content = $(selector).clone();
  
  // Remove navigation, headers, footers, etc.
  $content.find('nav, header, footer, .sidebar, .navbar, .nav, .menu, .navigation, script, style, [role="navigation"], .toc, .pagination, .breadcrumbs').remove();
  
  return $content;
}

/**
 * Process a single documentation page
 */
async function processPage(url, visitedUrls) {
  try {
    console.log(`Processing: ${url}`);
    
    // Extract important URL components for metadata
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    const pathSegments = path.split('/').filter(Boolean);
    const section = pathSegments.length > 0 ? pathSegments[0] : 'home';
    
    // Load the page with Puppeteer for better JavaScript handling
    const { html, title: pageTitle } = await loadPageWithPuppeteer(url);
    
    if (!html) {
      console.error(`Failed to load ${url}`);
      return { document: null, links: [] };
    }
    
    const $ = cheerio.load(html);
    
    console.log(`Content length: ${html.length} characters`);
    
    // Get page title - try multiple approaches to get a meaningful title
    let title = pageTitle || $("title").text().trim();
    
    // If no title, try to get it from various heading elements
    if (!title) {
      title = $("h1").first().text().trim() || 
              $(".main-heading").text().trim() || 
              $("[role='heading']").first().text().trim() ||
              pathSegments[pathSegments.length - 1] || 
              'Untitled Document';
    }
    
    console.log(`Page title: ${title}`);
    
    // Try different content selectors for different sites
    const contentSelectors = [
      // Main content areas
      "main", "article", ".content", ".documentation", 
      ".docs-content", ".markdown-body", "#content", 
      ".main-content", "div[role='main']", ".article-content",
      // More specific selectors for Aptos-like sites
      ".nextra-content", ".docs-container", "main article", 
      "[data-nextra-content]", "#__docusaurus", ".docusaurus-content",
      ".nextra-body", ".docs-markdown", 
      // Last resort selectors
      "body", "#__next", "#app"
    ];
    
    // Try to find content with these selectors
    let $content;
    let contentSelector;
    for (const selector of contentSelectors) {
      if ($(selector).length > 0) {
        $content = extractCleanContent($, selector);
        contentSelector = selector;
        console.log(`Found content with selector: ${selector}`);
        break;
      }
    }
    
    // Fall back to body if no other container found
    if (!$content || $content.length === 0) {
      console.log("No content container found, using body");
      $content = extractCleanContent($, "body");
      contentSelector = "body";
    }
    
    let mainContent = "";
    const processedCodeBlocks = new Set();
    
    // Try to get the main heading if it exists
    const mainHeading = $content.find('h1').first().text().trim();
    if (mainHeading && mainHeading !== title) {
      mainContent += `# ${mainHeading}\n\n`;
      console.log(`Found main heading: ${mainHeading}`);
    } else if (title) {
      mainContent += `# ${title}\n\n`;
    }
    
    // Process headings and paragraphs
    $content.find("h1, h2, h3, h4, h5, h6, p, ul, ol, li, table").each((i, el) => {
      const tagName = el.tagName.toLowerCase();
      
      if (tagName.startsWith('h')) {
        // Headers
        const level = tagName.substring(1);
        const headerText = $(el).text().trim();
        if (headerText && headerText.length > 1) {
          mainContent += `\n${"#".repeat(parseInt(level))} ${headerText}\n\n`;
          console.log(`Found header: ${headerText}`);
        }
      } else if (tagName === 'p') {
        // Regular text
        const text = $(el).text().trim();
        if (text && text.length > 5) { // Ignore very short texts which might be UI elements
          mainContent += `${text}\n\n`;
        }
      } else if (tagName === 'ul' || tagName === 'ol') {
        // Lists - handle at this level to avoid nested processing of list items
        if ($(el).parents('ul, ol').length === 0) { // Only process top-level lists
          $(el).find('> li').each((j, li) => {
            const listText = $(li).text().trim();
            if (listText && listText.length > 3) {
              mainContent += `- ${listText}\n`;
            }
          });
          mainContent += '\n';
        }
      } else if (tagName === 'table') {
        // Tables
        mainContent += `TABLE: ${$(el).text().trim().replace(/\s+/g, ' ')}\n\n`;
      }
    });
    
    // Process code blocks with special handling for Shiki (used in Aptos docs)
    $content.find("pre code, pre.shiki, code.shiki").each((i, el) => {
      const { code, language } = extractCodeFromHtml($, el);
      if (code && !processedCodeBlocks.has(code) && code.length > 3) {
        processedCodeBlocks.add(code);
        mainContent += "```" + language + "\n" + code + "\n```\n\n";
        console.log(`Found code block (${language}): ${code.substring(0, 30)}...`);
      }
    });
    
    // Check if we have content
    if (!mainContent.trim() || mainContent.length < 200) {
      console.log("Warning: Insufficient content extracted from page!");
      
      // Try more aggressive extraction by getting text from visible elements
      mainContent = "";
      $content.find('p, h1, h2, h3, h4, h5, h6, li, td, th, div:not(:has(*))').each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 15 && !text.includes('script')) {
          mainContent += text + "\n\n";
        }
      });
      
      console.log(`Using aggressive extraction: got ${mainContent.length} characters`);
      
      // If still no good content, fall back to all text
      if (mainContent.length < 200) {
        // Get all text but do heavy cleaning
        mainContent = $content.text().trim();
        
        // IMPROVED CLEANING:
        // 1. Remove JavaScript code (anything within parentheses that's too complex)
        mainContent = mainContent.replace(/\(\(.*?\)\)/g, '');
        mainContent = mainContent.replace(/\{.*?\}/g, '');
        
        // 2. Remove any strings that look like function calls or code
        mainContent = mainContent.replace(/\w+\.\w+\([^)]*\)/g, '');
        
        // 3. Remove navigation menu items (common patterns in docs)
        const menuItemsToRemove = [
          'Skip to content', 'Submit an issue', 'Get Started', 'GitHub', 
          'Developer Setup', 'Build', 'Network', 'Resources', 'Next', 'Previous',
          'English', 'Light', 'Dark', 'Question?', 'Copy', 'Edit this page'
        ];
        for (const item of menuItemsToRemove) {
          mainContent = mainContent.replace(new RegExp(item, 'gi'), '');
        }
        
        // 4. Clean up excessive whitespace
        mainContent = mainContent.replace(/[\s\n]+/g, ' ');
        
        // 5. Try to segment content into paragraphs based on sentence endings
        mainContent = mainContent.replace(/\.\s+([A-Z])/g, '.\n\n$1');
        
        // 6. Special handling for Aptos docs - extract API documentation
        if (url.includes('aptos.dev')) {
          // Extract Move code examples if they exist
          const moveCodePattern = /(?:module|script|struct|public|fun|native|let)\s+[a-zA-Z_0-9:]+\s*(?:<.*>)?\s*\{[^}]*\}/g;
          const moveCodeMatches = mainContent.match(moveCodePattern);
          
          if (moveCodeMatches && moveCodeMatches.length > 0) {
            mainContent += "\n\nMove Code Examples:\n";
            moveCodeMatches.forEach((codeSnippet, i) => {
              mainContent += `\n\`\`\`move\n${codeSnippet}\n\`\`\`\n`;
            });
          }
        }
        
        console.log(`Using fallback with improved cleaning: extracted ${mainContent.length} characters of text`);
      }
    }
    
    // Find links to other documentation pages
    const links = new Set();
    $('a').each((_, link) => {
      const href = $(link).attr('href');
      if (href && !href.startsWith('#')) {
        // Handle both absolute and relative URLs
        let fullUrl;
        
        try {
          if (href.startsWith('http')) {
            // Absolute URL
            fullUrl = href;
          } else if (href.startsWith('/')) {
            // Root-relative URL
            fullUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
          } else {
            // Path-relative URL
            const urlDir = url.substring(0, url.lastIndexOf('/') + 1);
            fullUrl = new URL(href, urlDir).toString();
          }
          
          // Only add URLs from the same domain
          const startUrlHost = new URL(START_URL).host;
          if (fullUrl.includes(startUrlHost) && !visitedUrls.has(fullUrl)) {
            links.add(fullUrl);
            console.log(`Found link: ${fullUrl}`);
          }
        } catch (error) {
          console.error(`Error processing link ${href}:`, error.message);
        }
      }
    });
    
    // Special handling for Aptos docs
    if (domain.includes('aptos.dev')) {
      // Additional link extraction for Aptos
      $(".navbar a, .sidebar a, .table-of-contents a, .menu a, [data-nextra-link] a").each((_, link) => {
        const href = $(link).attr('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          try {
            // Normalize URL
            let fullUrl;
            if (href.startsWith('http')) {
              fullUrl = href;
            } else if (href.startsWith('/')) {
              fullUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
            } else {
              fullUrl = new URL(href, url).toString();
            }
            
            // Only add URLs from the same domain that we haven't visited
            if (fullUrl.includes(domain) && !visitedUrls.has(fullUrl) && !links.has(fullUrl)) {
              console.log(`Found Aptos menu link: ${fullUrl}`);
              links.add(fullUrl);
            }
          } catch (e) {
            console.error(`Error processing link ${href}:`, e.message);
          }
        }
      });
    }
    
    console.log(`Found ${links.size} links to other documentation pages`);
    
    // Final cleanup - remove navigation elements from the content
    mainContent = mainContent.replace(/Skip to (main content|content|navigation)/gi, '')
                           .replace(/Table of Contents/gi, '')
                           .replace(/On This Page/gi, '')
                           .replace(/\b(Previous|Next)(\s+Page)?\b/gi, '')
                           .replace(/\bCopy\b/gi, '')
                           .replace(/\bShare\b/gi, '');
    
    // Create document with extended metadata
    const doc = new Document({
      pageContent: mainContent,
      metadata: { 
        url, 
        title,
        domain,
        path,
        section,
        contentSelector,
        crawledAt: new Date().toISOString()
      }
    });
    
    return {
      document: doc,
      links: Array.from(links)
    };
  } catch (error) {
    console.error(`Error processing ${url}:`, error.message);
    return { document: null, links: [] };
  }
}

/**
 * Main function to crawl and index documentation
 */
async function crawlAndIndexDocumentation() {
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY environment variable is not set.");
    console.error("Please set your OpenAI API key in the .env file.");
    return;
  }

  console.log(`Starting documentation crawl from: ${START_URL}`);
  
  // For Aptos docs, let's manually add some known documentation pages
  // This helps with sites that use client-side rendering where links aren't easily detected
  const visitedUrls = new Set();
  let urlsToVisit = [START_URL];
  
  // If we're crawling Aptos docs, add some known documentation paths
  if (START_URL.includes('aptos.dev')) {
    console.log("Detected Aptos docs - adding known documentation pages");
    const aptosBaseUrl = new URL(START_URL).origin;
    const knownPaths = [
      "/en/build/smart-contracts",
      "/en/build/smart-contracts/get-started",
      "/en/build/smart-contracts/why-move",
      "/en/build/smart-contracts/create-package",
      "/en/build/smart-contracts/compiling",
      "/en/build/smart-contracts/testing",
      "/en/build/smart-contracts/deployment",
      "/en/build/smart-contracts/debugging",
      "/en/build/aptos-standards",
      "/en/build/move-language",
      "/en/build/apis",
      "/en/build/sdks"
    ];
    
    for (const path of knownPaths) {
      const fullUrl = aptosBaseUrl + path;
      if (!urlsToVisit.includes(fullUrl)) {
        console.log(`Adding known Aptos docs page: ${fullUrl}`);
        urlsToVisit.push(fullUrl);
      }
    }
  }
  
  const documents = [];
  
  // Process URLs breadth-first until we run out or hit the limit
  while (urlsToVisit.length > 0 && documents.length < MAX_PAGES) {
    const url = urlsToVisit.shift();
    
    if (visitedUrls.has(url)) continue;
    visitedUrls.add(url);
    
    const { document, links } = await processPage(url, visitedUrls);
    
    if (document) {
      documents.push(document);
    }
    
    // Add new links to our queue
    for (const link of links) {
      if (!visitedUrls.has(link) && !urlsToVisit.includes(link)) {
        urlsToVisit.push(link);
      }
    }
  }
  
  console.log(`Crawled ${documents.length} pages`);
  
  // Split documents for better retrieval
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  
  const splitDocs = await textSplitter.splitDocuments(documents);
  console.log(`Split into ${splitDocs.length} chunks`);
  
  // Save content to text file
  let outputContent = "";
  for (const doc of splitDocs) {
    outputContent += "--- DOCUMENT START ---\n";
    outputContent += `URL: ${doc.metadata.url}\n`;
    outputContent += `TITLE: ${doc.metadata.title}\n`;
    outputContent += `SELECTOR: ${doc.metadata.contentSelector}\n`;
    outputContent += "CONTENT:\n";
    outputContent += doc.pageContent;
    outputContent += "\n--- DOCUMENT END ---\n\n";
  }
  
  await fs.writeFile(OUTPUT_FILE, outputContent);
  console.log(`Saved content to ${OUTPUT_FILE}`);
  
  // Create vector store
  try {
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      new OpenAIEmbeddings()
    );
    
    const vectorStorePath = OUTPUT_FILE.replace(/\.[^.]+$/, '') + "_vector_store.json";
    
    // Save a simple representation of the vector store
    // Since 'serialize' might not be available, we create our own
    const serializedData = {
      vectors: vectorStore._vectorstoreType ? vectorStore._vectors : [],
      documents: splitDocs.map(doc => ({
        pageContent: doc.pageContent,
        metadata: doc.metadata
      }))
    };
    
    await fs.writeFile(
      vectorStorePath,
      JSON.stringify(serializedData, null, 2)
    );
    
    console.log(`Vector store saved to ${vectorStorePath}`);
  } catch (error) {
    console.error("Error creating vector store:", error.message);
    console.log("Document content was saved, but vector store creation failed.");
  }
  
  console.log("Done!");
}

// Run the crawler
crawlAndIndexDocumentation().catch(console.error);