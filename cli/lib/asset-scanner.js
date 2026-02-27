import fs from 'fs';
import path from 'path';

// Category mapping based on common class names and section IDs
const CONTEXT_TO_CATEGORY = {
  hero: 'hero_backgrounds',
  banner: 'hero_backgrounds',
  jumbotron: 'hero_backgrounds',
  product: 'product_shots',
  card: 'product_shots',
  item: 'product_shots',
  lifestyle: 'lifestyle',
  about: 'lifestyle',
  team: 'lifestyle',
  bg: 'abstract_decorative',
  background: 'abstract_decorative',
  pattern: 'abstract_decorative',
  texture: 'abstract_decorative',
  icon: 'icons_illustrations',
  logo: 'icons_illustrations',
  illustration: 'icons_illustrations',
};

/**
 * Scan an HTML file for image asset slots.
 * @param {string} htmlPath - Path to HTML file
 * @returns {Array<{slot: string, tag: string, selector: string, width: string|null, height: string|null, suggested_category: string, description: string}>}
 */
export function scanHtmlForAssets(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const slots = [];
  let slotIndex = 0;

  // Find <img> tags
  const imgRegex = /<img\s+([^>]*?)>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const attrs = match[1];
    const src = extractAttr(attrs, 'src');
    const width = extractAttr(attrs, 'width');
    const height = extractAttr(attrs, 'height');
    const alt = extractAttr(attrs, 'alt');
    const className = extractAttr(attrs, 'class');

    const context = inferContext(html, match.index, className);
    const category = mapToCategory(context);

    slots.push({
      slot: `img_${slotIndex++}`,
      tag: 'img',
      selector: className ? `img.${className.split(' ')[0]}` : `img[src="${src || ''}"]`,
      width: width || null,
      height: height || null,
      src: src || null,
      suggested_category: category,
      description: alt || `Image in ${context || 'unknown'} context`,
    });
  }

  // Find CSS background-image: url(...)
  const bgRegex = /background(?:-image)?\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
  while ((match = bgRegex.exec(html)) !== null) {
    const url = match[1];
    const context = inferContext(html, match.index, '');
    const category = mapToCategory(context);

    slots.push({
      slot: `bg_${slotIndex++}`,
      tag: 'css-background',
      selector: `[style*="background"]`,
      width: null,
      height: null,
      src: url,
      suggested_category: category,
      description: `Background image in ${context || 'unknown'} context`,
    });
  }

  // Find <picture> / <source> elements
  const pictureRegex = /<picture[^>]*>([\s\S]*?)<\/picture>/gi;
  while ((match = pictureRegex.exec(html)) !== null) {
    const inner = match[1];
    const srcset = extractAttrFromString(inner, 'srcset');
    const context = inferContext(html, match.index, '');
    const category = mapToCategory(context);

    slots.push({
      slot: `picture_${slotIndex++}`,
      tag: 'picture',
      selector: 'picture',
      width: null,
      height: null,
      src: srcset || null,
      suggested_category: category,
      description: `Picture element in ${context || 'unknown'} context`,
    });
  }

  return slots;
}

/**
 * Merge scanned slots with preset categories to fill gaps.
 * @param {Array} scannedSlots - Output from scanHtmlForAssets
 * @param {object} presets - Loaded presets object
 * @returns {Array} Merged asset requirements
 */
export function mergeWithTemplates(scannedSlots, presets) {
  const merged = new Map();

  // Add scanned slots
  for (const slot of scannedSlots) {
    merged.set(slot.slot, slot);
  }

  // Check which preset categories are represented
  const coveredCategories = new Set(scannedSlots.map(s => s.suggested_category));

  // Add suggestions for uncovered categories
  if (presets && presets.categories) {
    for (const [catKey, category] of Object.entries(presets.categories)) {
      if (!coveredCategories.has(catKey)) {
        merged.set(`suggested_${catKey}`, {
          slot: `suggested_${catKey}`,
          tag: 'suggestion',
          selector: null,
          width: null,
          height: null,
          src: null,
          suggested_category: catKey,
          description: `Suggested: ${category.label} — ${category.description}`,
        });
      }
    }
  }

  return [...merged.values()];
}

function extractAttr(attrString, name) {
  const regex = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i');
  const match = attrString.match(regex);
  return match ? match[1] : null;
}

function extractAttrFromString(html, name) {
  const regex = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

function inferContext(html, position, className) {
  // Look backwards from position for section/div class/id context
  const before = html.slice(Math.max(0, position - 500), position);

  // Check className first
  if (className) {
    for (const [keyword, cat] of Object.entries(CONTEXT_TO_CATEGORY)) {
      if (className.toLowerCase().includes(keyword)) return keyword;
    }
  }

  // Check surrounding HTML for section IDs, classes
  const contextRegex = /(?:class|id)\s*=\s*["']([^"']*)["']/gi;
  let contextMatch;
  let lastContext = null;
  while ((contextMatch = contextRegex.exec(before)) !== null) {
    lastContext = contextMatch[1];
  }

  if (lastContext) {
    for (const keyword of Object.keys(CONTEXT_TO_CATEGORY)) {
      if (lastContext.toLowerCase().includes(keyword)) return keyword;
    }
  }

  return lastContext || null;
}

function mapToCategory(context) {
  if (!context) return 'abstract_decorative';
  const lower = context.toLowerCase();
  for (const [keyword, category] of Object.entries(CONTEXT_TO_CATEGORY)) {
    if (lower.includes(keyword)) return category;
  }
  return 'abstract_decorative';
}
