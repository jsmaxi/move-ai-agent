# Documentation Crawler and Indexer

This script provides a simple documentation crawler and indexer for RAG (Retrieval-Augmented Generation) applications. It crawls a website, extracts content, and creates a vector store that can be used for retrieval.

## Features

- Crawls documentation websites starting from a specified URL
- Extracts content from pages including headers, paragraphs, lists, and code blocks
- Splits content into chunks for better retrieval
- Creates embeddings using OpenAI's API
- Saves content in both raw text and vector store formats

## Requirements

- Node.js
- OpenAI API key (set in .env file)

## Usage

1. Set up environment:
   ```
   npm install
   ```

2. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Run the script:
   ```
   node simple_docs_crawler.js
   ```

## Configuration

The script can be configured by modifying the following constants:

- `START_URL`: The starting URL for the crawler
- `OUTPUT_FILE`: The output file to save the extracted content
- `MAX_PAGES`: Maximum number of pages to crawl

## Limitations

The current implementation has several limitations:

1. **JavaScript-Heavy Websites**: Sites that rely heavily on client-side JavaScript (like modern documentation sites) are not properly rendered, resulting in incomplete content extraction.

2. **Navigation Elements**: The extraction still includes navigation elements and menu items which pollute the actual content.

3. **Link Discovery**: On modern sites, link discovery is challenging because links might be added dynamically by JavaScript.

## Improvement Opportunities

To create a more robust documentation crawler, consider these enhancements:

1. **Use a Headless Browser**: Replace Cheerio with Puppeteer or Playwright to fully render JavaScript-powered websites.

2. **Site-Specific Extractors**: Implement site-specific content extractors for popular documentation platforms.

3. **Better Text Cleaning**: Improve the text cleaning algorithms to better separate content from navigation elements.

4. **Structural Information**: Preserve document structure (headers, sections, code blocks) in a more systematic way.

5. **Authentication Support**: Add the ability to crawl sites that require authentication.

## Example

The script has been tested with Aptos documentation, which is a JavaScript-heavy site. While it can extract some content, a more specialized approach would be needed for optimal results.

## License

MIT 