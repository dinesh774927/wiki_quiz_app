import requests
import logging
from bs4 import BeautifulSoup
from typing import Optional, Dict

logger = logging.getLogger(__name__)

def scrape_wikipedia(target_url: str) -> Optional[Dict[str, str]]:
    """
    Retrieves and parses content from a Wikipedia article.
    Extracts the headline, introductory summary, and primary body text.
    """
    try:
        # Standard headers to ensure we aren't blocked by simple bot detection
        browser_headers = {
            'User-Agent': (
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/120.0.0.0 Safari/537.36'
            )
        }
        
        request_output = requests.get(target_url, headers=browser_headers, timeout=10)
        request_output.raise_for_status()
        
        dom = BeautifulSoup(request_output.content, 'html.parser')
        
        # Primary headline extraction
        headline_node = dom.find('h1', id='firstHeading')
        if not headline_node:
            logger.warning(f"Could not find primary heading for {target_url}")
            return None
            
        final_title = headline_node.get_text()
        
        # Target the main content container
        content_container = dom.find('div', class_='mw-parser-output')
        if not content_container:
            # Fallback to general content area if parser-output isn't explicit
            content_container = dom.find('div', id='mw-content-text')
            
        if not content_container:
            logger.error(f"Failed to isolate content body for {target_url}")
            return None

        # Gather meaningful text blocks (ignoring references, sidebars, etc.)
        paragraphs = content_container.find_all('p', recursive=True)
        
        # Build summary from the opening paragraphs
        lead_sections = []
        for p in paragraphs:
            text = p.get_text().strip()
            if text:
                lead_sections.append(text)
            if len(lead_sections) >= 3:
                break
        
        abstract = "\n\n".join(lead_sections)
        
        # Compile full corpus for semantic processing
        corpus_chunks = [p.get_text() for p in paragraphs if p.get_text().strip()]
        full_corpus = "\n".join(corpus_chunks)
            
        # Truncate to a reasonable character limit for LLM context optimization
        optimized_corpus = full_corpus[:25000]

        # Extract top-level sections (headings)
        section_nodes = content_container.find_all('h2')
        # Filter out common non-content headings
        excluded_headings = {'contents', 'references', 'external links', 'see also', 'notes', 'bibliography'}
        sections_found = [
            h.get_text().replace('[edit]', '').strip() 
            for h in section_nodes 
            if h.get_text().lower().replace('[edit]', '').strip() not in excluded_headings
        ]

        return {
            "title": final_title,
            "summary": abstract,
            "full_text": optimized_corpus,
            "sections": sections_found
        }

    except requests.RequestException as req_err:
        logger.error(f"Network error during scrape of {target_url}: {req_err}")
    except Exception as general_err:
        logger.error(f"Unexpected parsing failure for {target_url}: {general_err}")
        
    return None
