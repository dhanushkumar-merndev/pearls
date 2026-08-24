const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { CATEGORIES } = require('./data');

const SITE_URL = 'https://www.pearlaesthetic.in/service';
const OUTPUT_FILE = path.join(__dirname, 'scraped_content.json');

// A helper function to create slugs from service names
function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function scrapeAll() {
  const scrapedData = {};
  const promises = [];
  const CONCURRENCY = 10;
  let running = 0;
  let index = 0;

  // Flatten all services from CATEGORIES
  const allServices = [];
  CATEGORIES.forEach(cat => {
    cat.groups.forEach(group => {
      group.services.forEach(service => {
        const [name] = service;
        allServices.push(name);
      });
    });
  });

  console.log(`Starting scrape of ${allServices.length} services...`);

  return new Promise((resolve) => {
    function processNext() {
      if (index >= allServices.length) {
        if (running === 0) resolve(scrapedData);
        return;
      }

      const name = allServices[index++];
      const slug = toSlug(name);
      const url = `${SITE_URL}/${slug}`;
      running++;

      // We use built-in fetch in Node 18+
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.text();
        })
        .then(html => {
          const $ = cheerio.load(html);
          
          let definitionHTML = '';
          const defContainer = $('.procedure-container .mt-4').first();
          if (defContainer.length) {
            definitionHTML = defContainer.html().trim();
          }

          const reviews = [];
          $('.testimonial-item').each((_, el) => {
            const author = $(el).find('h6').text().trim();
            const text = $(el).find('p').text().trim();
            const stars = $(el).find('.fas.fa-star').length;
            if (author && text) {
              reviews.push({ author, text, stars });
            }
          });

          scrapedData[name] = {
            definition: definitionHTML,
            reviews: reviews
          };
        })
        .catch(err => {
          console.error(`Failed to scrape ${name} (${url}):`, err.message);
          scrapedData[name] = { definition: '', reviews: [] };
        })
        .finally(() => {
          running--;
          processNext();
        });
    }

    for (let i = 0; i < CONCURRENCY; i++) {
      processNext();
    }
  }).then((data) => {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`Scraping complete. Saved to ${OUTPUT_FILE}`);
  });
}

scrapeAll();
