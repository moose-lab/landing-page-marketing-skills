---
name: nano-banana-2-image-assets
description: Generate commercial AI images with Nano Banana 2 via WaveSpeed.ai for landing pages, marketing, and product assets. Use when building hero backgrounds, product shots, lifestyle imagery, abstract visuals, or icon sets. Includes 12 image presets across 5 categories (hero backgrounds, product shots, lifestyle, abstract/texture, icons/UI), an HTML asset scanner for detecting image slots, trend-driven prompt enrichment via web search, and CLI generation commands with a gallery UI.
---

# Nano Banana 2 Image Asset Skill (WaveSpeed.ai)

## When to Use This Skill
Use this skill when the user wants to:
- Generate AI images for landing pages, marketing sites, or product pages
- Create hero background images, product photography, or lifestyle imagery
- Produce commercial-grade images for ecommerce, fashion, or brand marketing
- Build an image asset gallery with reproducible prompts
- Scan an HTML file to detect where images are needed and auto-generate them
- Enrich image prompts with current visual trends from web search

## Quick Start
```bash
export WAVESPEED_API_KEY=your_key
node cli/index.js list-presets --model nano-banana-2
node cli/index.js generate-images --model nano-banana-2 --dry-run --output ./public/demos
node cli/index.js generate-images --model nano-banana-2 --presets hero_gradient_mesh,product_floating --output ./public/demos
node landing/server.js  # -> http://localhost:3000 -> Images tab
```

## Full Automation Workflow

When a user asks you to generate image assets, follow this 7-step workflow:

### Step 1: Parse Intent
Extract from the user's request:
- **Asset type**: hero background, product shot, lifestyle photo, abstract texture, icon/UI element
- **Brand identity**: colors, typography style, mood (minimal, bold, luxurious, playful)
- **Target platform**: landing page, social media, email campaign, ecommerce listing
- **Specific needs**: particular dimensions, file format, transparency requirements

### Step 2: Select Categories
Map user intent to preset categories:

| User Intent | Recommended Category | Presets |
|---|---|---|
| Landing page hero section | hero_backgrounds | `hero_gradient_mesh`, `hero_abstract_waves`, `hero_dark_geometric` |
| Product listing / ecommerce | product_shots | `product_floating`, `product_lifestyle_flat_lay`, `product_clean_studio` |
| Social media / blog imagery | lifestyle | `lifestyle_urban_outdoor`, `lifestyle_cozy_indoor`, `lifestyle_workspace` |
| Background textures / patterns | abstract_texture | `abstract_fluid_art`, `abstract_geometric_pattern`, `abstract_organic_texture` |
| UI elements / app icons | icons_ui | `icon_3d_glossy`, `icon_flat_minimal`, `icon_gradient_app` |
| Full asset library | all categories | all 12 presets |

### Step 3: Customize Prompts
Create a custom presets file that adapts prompts to the user's brand:

1. Copy the structure from `skills/nano-banana-2/image-presets.json`
2. Rewrite prompts to reference the user's brand colors, product, and aesthetic
3. Adjust settings (aspect ratio, resolution, format) based on intended use
4. Save to `public/demos/custom-image-presets.json`

Example customization for a fintech startup "PayFlow":
```json
{
  "version": "1.0.0",
  "provider": "wavespeed",
  "model": "wavespeed-ai/nano-banana-2",
  "default_settings": {
    "aspect_ratio": "16:9",
    "resolution": "2k",
    "output_format": "png"
  },
  "presets": {
    "payflow_hero": {
      "label": "PayFlow Hero Background",
      "category": "hero_backgrounds",
      "description": "Dark gradient hero with abstract financial data visualization",
      "prompt": "Abstract dark navy gradient background with flowing streams of luminous teal and gold data points, subtle grid lines suggesting financial charts, bokeh light particles, ultra-clean digital aesthetic, 4K, no text, no UI elements",
      "settings": { "aspect_ratio": "16:9", "resolution": "2k", "output_format": "png" },
      "tags": ["fintech", "hero", "dark-mode"]
    }
  }
}
```

### Step 4: Analyze HTML Assets
Scan the user's HTML files to detect where image assets are needed:
```bash
node cli/index.js analyze-assets --input ./public/index.html
```
This identifies:
- Hero sections needing background images
- Product cards with placeholder images
- Gallery containers waiting for content
- Icon slots and UI element placeholders

### Step 5: Enrich with Trends via Web Search
Before generating, the agent performs web searches to incorporate current visual trends:
- Search for "[industry] website design trends 2026" to identify popular visual styles
- Search for "[product type] commercial photography trends" for product shots
- Search for "landing page hero image trends" for hero backgrounds
- Incorporate trending color palettes, composition styles, and visual effects into prompts

Example enrichment flow:
1. Agent searches: "fintech landing page design trends 2026"
2. Discovers: "glassmorphism, dark mode with neon accents, 3D abstract shapes"
3. Enriches prompt: adds "glassmorphism frosted card elements, subtle neon teal glow" to the hero preset

### Step 6: Generate Images
```bash
# With custom presets
node cli/index.js generate-images --model nano-banana-2 --custom-presets ./public/demos/custom-image-presets.json --output ./public/demos

# Or with built-in presets for specific categories
node cli/index.js generate-images --model nano-banana-2 --presets hero_gradient_mesh,product_floating --output ./public/demos

# All presets
node cli/index.js generate-images --model nano-banana-2 --output ./public/demos
```

### Step 7: Verify Output
```bash
node landing/server.js
# Open http://localhost:3000 -> click "Images (Nano Banana 2)" tab
# Verify images render, prompts are shown, categories filter correctly
```

## Model Capabilities (Nano Banana 2 via WaveSpeed)

- **T2I** (text-to-image): high-quality commercial image generation
- **Resolution**: up to 2K output
- **Aspect ratios**: 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3
- **Output formats**: PNG (default), JPEG, WebP
- **Style control**: photorealistic, illustration, 3D render, flat design
- **Speed**: fast inference (~3-8 seconds per image)
- **Pricing**: ~$0.01-0.03 per image (cost-effective for batch generation)

## Image Presets (12 Presets, 5 Categories)

### Hero Backgrounds (3 presets)

| Key | Label | Aspect Ratio | Description |
|---|---|---|---|
| `hero_gradient_mesh` | Gradient Mesh Hero | 16:9 | Vibrant gradient mesh background with flowing color transitions. For SaaS, tech, and startup landing pages. |
| `hero_abstract_waves` | Abstract Wave Hero | 16:9 | Dynamic abstract wave forms with depth and motion blur. For creative agencies, portfolios, and modern brands. |
| `hero_dark_geometric` | Dark Geometric Hero | 16:9 | Dark background with subtle geometric patterns and accent lighting. For fintech, enterprise, and developer tools. |

### Product Shots (3 presets)

| Key | Label | Aspect Ratio | Description |
|---|---|---|---|
| `product_floating` | Floating Product Shot | 1:1 | Product floating in clean studio space with soft shadows. For ecommerce listings and product pages. |
| `product_lifestyle_flat_lay` | Lifestyle Flat Lay | 4:3 | Styled flat lay arrangement with props and natural lighting. For social media, blog posts, and brand marketing. |
| `product_clean_studio` | Clean Studio Shot | 1:1 | Minimal white studio product photography with rim lighting. For Amazon, Shopify, and catalog listings. |

### Lifestyle (3 presets)

| Key | Label | Aspect Ratio | Description |
|---|---|---|---|
| `lifestyle_urban_outdoor` | Urban Outdoor Lifestyle | 16:9 | Outdoor urban setting with natural light and candid framing. For fashion, fitness, and lifestyle brands. |
| `lifestyle_cozy_indoor` | Cozy Indoor Lifestyle | 4:3 | Warm indoor setting with soft lighting and comfortable aesthetic. For home goods, food, and wellness brands. |
| `lifestyle_workspace` | Modern Workspace | 16:9 | Clean modern desk setup with tech and design elements. For SaaS, productivity tools, and remote work brands. |

### Abstract / Texture (3 presets)

| Key | Label | Aspect Ratio | Description |
|---|---|---|---|
| `abstract_fluid_art` | Fluid Art Texture | 1:1 | Flowing fluid art with rich color mixing and organic movement. For backgrounds, overlays, and creative assets. |
| `abstract_geometric_pattern` | Geometric Pattern | 16:9 | Precise geometric pattern with modern color palette. For tech branding, presentations, and UI backgrounds. |
| `abstract_organic_texture` | Organic Texture | 1:1 | Natural organic texture with depth and tactile quality. For luxury brands, packaging, and premium assets. |

### Icons / UI (3 presets)

| Key | Label | Aspect Ratio | Description |
|---|---|---|---|
| `icon_3d_glossy` | 3D Glossy Icon | 1:1 | Glossy 3D rendered icon with soft lighting and reflections. For app stores, feature sections, and marketing. |
| `icon_flat_minimal` | Flat Minimal Icon | 1:1 | Clean flat design icon with bold colors and simple shapes. For dashboards, feature lists, and documentation. |
| `icon_gradient_app` | Gradient App Icon | 1:1 | Modern gradient app icon with rounded corners and depth. For app store listings and mobile marketing. |

## Prompt Engineering Rules (Images)

1. **Subject + Setting + Lighting**: "Wireless headphones floating above a white marble surface, soft directional studio light, gentle shadow"
2. **Style keywords**: "photorealistic", "product photography", "commercial quality", "4K", "high detail"
3. **Composition**: "centered composition", "rule of thirds", "negative space on left for text overlay"
4. **Color direction**: specify palette — "cool blue and teal tones", "warm earth tones", "monochromatic with gold accent"
5. **Negative specification**: describe what to exclude — "no text, no watermark, no people, no branding"
6. **Format awareness**: for hero images, leave space for text overlay; for product shots, use clean backgrounds
7. **Trend integration**: incorporate current visual trends discovered via web search

## API Payload (WaveSpeed.ai)

```json
POST https://api.wavespeed.ai/api/v3/wavespeed-ai/nano-banana-2/text-to-image
Authorization: Bearer ${WAVESPEED_API_KEY}

{
  "prompt": "Minimalist wireless earbuds floating above a clean white surface, soft studio lighting from upper left, gentle drop shadow, photorealistic product photography, 4K detail, no text, no branding",
  "size": "1024x1024",
  "output_format": "png"
}
```

Response:
```json
{
  "id": "task-abc123",
  "status": "completed",
  "result": {
    "image_url": "https://cdn.wavespeed.ai/outputs/..."
  }
}
```

## Trend-Driven Prompt Enrichment

The agent enriches prompts at runtime by performing web searches before generation:

1. **Industry trends**: Search for visual design trends specific to the user's industry
2. **Color trends**: Look up trending color palettes (e.g., Pantone Color of the Year, trending gradients)
3. **Composition trends**: Research popular layout and composition styles for the asset type
4. **Platform-specific**: Check platform-specific best practices (e.g., Shopify product photo guidelines, hero image dimensions)

Example enrichment:
```
Original prompt: "Hero background for a SaaS landing page"

Agent searches:
  - "SaaS landing page hero design trends 2026"
  - "modern gradient background trends"

Enriched prompt: "Abstract dark gradient background transitioning from deep indigo #1a0a2e to electric violet #7c3aed, with floating glassmorphism card elements, subtle grid lines, soft bokeh light particles in teal and white, ultra-clean digital aesthetic, wide composition with negative space center-right for headline text, 4K, no text, no UI mockups"
```

## Adding Custom Presets

Edit `skills/nano-banana-2/image-presets.json` or create a custom presets file:
```json
"my_custom_preset": {
  "label": "My Custom Image",
  "category": "product_shots",
  "description": "What this image is for",
  "prompt": "Detailed prompt describing the desired image...",
  "settings": {
    "aspect_ratio": "1:1",
    "resolution": "2k",
    "output_format": "png"
  },
  "tags": ["product", "ecommerce", "minimal"]
}
```

## Combining with Kling 3.0 Video Skill

For full multi-modal asset generation:
```bash
# Generate all video demos
node cli/index.js generate-demo --model kling3 --scenes all

# Smart cover: select best highlight moment as video thumbnail
node cli/index.js smart-cover --manifest ./public/demos/kling3-demos.json

# Generate all image assets
node cli/index.js generate-images --model nano-banana-2 --output ./public/demos

# Serve the unified gallery
node landing/server.js
# -> Videos tab: Kling 3.0 video demos (with smart covers)
# -> Images tab: Nano Banana 2 image assets
```

Always run `smart-cover` after video generation — it selects the most visually compelling frame as the video thumbnail using multi-factor AI scoring (color variance, detail, brightness balance).
