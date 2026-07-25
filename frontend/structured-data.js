// Structured Data (JSON-LD) for SEO
// This helps search engines and AI crawlers understand the site content

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Des2 Library",
  "description": "Your gateway to infinite knowledge. Browse thousands of books, read reviews, and discover your next great read.",
  "url": "https://des2library.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://des2library.com/?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

// Inject structured data into the page
(function injectStructuredData() {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(structuredData);
  document.head.appendChild(script);
})();