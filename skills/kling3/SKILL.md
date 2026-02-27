---
name: kling3-video-demos
description: Generate multi-scene AI video demos with Kling 3.0 via WaveSpeed.ai and embed them on your landing page. Use when building product demos, social videos, cinematic hero sections, or any AI-generated video showcase. Includes 10 commercial scene presets (ecommerce 360, fashion editorial, lifestyle POV, anime action, live-action drama, food mukbang, cyberpunk city, luxury car, fitness, skincare beauty) with fine-tuned multi-prompt prompts, CLI generation commands, and a Node.js landing page gallery with reproducible prompts.
---

# Kling 3.0 Video Demo Skill (WaveSpeed.ai)

## When to Use This Skill
Use this skill when the user wants to:
- Generate AI videos with Kling 3.0 for a landing page
- Create multi-scene or multi-shot product demo videos
- Produce hot trending video types for social, marketing, or ecommerce
- Build a video demo gallery/showcase page
- Customize video prompts for their specific product/brand

## Quick Start
```bash
export WAVESPEED_API_KEY=your_key
node cli/index.js list-scenes --model kling3
node cli/index.js generate-demo --model kling3 --scenes all --dry-run
node cli/index.js generate-demo --model kling3 --scenes ecommerce_product_360,fashion_editorial
node landing/server.js  # → http://localhost:3000
```

## Full Automation Workflow

When a user asks you to generate video demos, follow this workflow:

### Step 1: Parse Intent
Extract from the user's request:
- **Product type**: SaaS, ecommerce, fashion, AI tool, etc.
- **Brand tone**: professional, playful, cinematic, minimal
- **Target audience**: developers, consumers, B2B, social media
- **Specific needs**: hero section, social ads, product demo, before/after

### Step 2: Select Scenes
Map user intent to scene presets:

| User Intent | Recommended Scenes |
|---|---|
| Ecommerce / product listing | `ecommerce_product_360`, `food_mukbang` |
| Fashion / clothing brand | `fashion_editorial`, `skincare_beauty` |
| Social media / viral content | `attractive_lifestyle_pov`, `fitness_transformation` |
| Entertainment / gaming | `anime_action_scene`, `cyberpunk_city` |
| Film / streaming promo | `live_action_drama`, `luxury_car_reveal` |
| Automotive / luxury brand | `luxury_car_reveal`, `ecommerce_product_360` |
| Beauty / skincare brand | `skincare_beauty`, `fashion_editorial` |
| Food / restaurant marketing | `food_mukbang`, `attractive_lifestyle_pov` |
| Full demo gallery | all 10 scenes |

### Step 3: Customize Prompts
Create a custom presets file that adapts prompts to the user's product:

1. Copy the structure from `skills/kling3/scene-presets.json`
2. Rewrite prompts to reference the user's specific product, brand colors, UI, etc.
3. Adjust settings (duration, aspect ratio) based on intended use
4. Save to `public/demos/custom-presets.json`

Example customization for a SaaS product called "TaskFlow":
```json
{
  "version": "3.0.0",
  "provider": "wavespeed",
  "models": {
    "std": "kwaivgi/kling-v3.0-std/text-to-video",
    "pro": "kwaivgi/kling-v3.0-pro/text-to-video"
  },
  "default_model": "std",
  "scenes": {
    "product_showcase": {
      "label": "TaskFlow Dashboard Reveal",
      "description": "Clean reveal of the TaskFlow dashboard UI",
      "settings": { "aspect_ratio": "16:9", "duration": 8, "sound": false, "cfg_scale": 0.6 },
      "model_tier": "pro",
      "multi_prompt": [
        { "prompt": "Sleek laptop on minimal desk, TaskFlow dashboard visible on screen, clean UI with purple accent colors, slow zoom in, soft ambient lighting, 4K cinematic", "duration": 4 },
        { "prompt": "Close-up of the TaskFlow interface, task cards animating into organized columns, satisfying micro-interactions, premium SaaS aesthetic", "duration": 4 }
      ]
    }
  }
}
```

### Step 4: Generate Videos
```bash
# With custom presets
node cli/index.js generate-demo --model kling3 --custom-presets ./public/demos/custom-presets.json --scenes all

# Or with built-in presets for specific scenes
node cli/index.js generate-demo --model kling3 --scenes ecommerce_product_360,fashion_editorial,anime_action_scene
```

### Step 5: Smart Cover Selection
After video generation, select the best highlight moment as the video cover/thumbnail. Every video asset needs an eye-catching cover — the default first-frame approach misses the most visually compelling moments.

```bash
# Generate AI-scored smart covers for all completed videos
node cli/index.js smart-cover --manifest ./public/demos/kling3-demos.json

# Optional: enhance the selected cover frame with Nano Banana 2
node cli/index.js smart-cover --manifest ./public/demos/kling3-demos.json --enhance
```

The smart cover system:
1. Extracts 12 candidate frames at key positions throughout each video (5%, 10%, 18%, 25%, 33%, 40%, 50%, 58%, 67%, 75%, 85%, 92%)
2. Scores each frame using multiple quality factors:
   - **Color variance** (30% weight): higher color variety = more visually engaging
   - **File size** (25% weight): larger compressed size = more visual detail
   - **Edge density** (25% weight): more edges = sharper, more detailed frame
   - **Brightness balance** (20% weight): penalizes too dark or too bright frames
3. Selects the frame with the highest composite score as the cover
4. Optionally enhances the selected frame via Nano Banana 2 edit API for cinematic color grading

Always run smart cover after generating videos — high-quality covers significantly improve user engagement and click-through rates.

### Step 6: Verify Output
```bash
node landing/server.js
# Open http://localhost:3000 → scroll to Gallery section
# Verify videos play with smart covers, prompts are shown, aspect ratios are correct
```

## Model Capabilities (Kling 3.0 via WaveSpeed)

- **T2V** (text-to-video): detailed cinematic prompts
- **Multi-prompt**: multiple scenes in one video, each with own prompt + duration
- **Native audio**: synchronized sound effects and ambient audio
- **Aspect ratios**: 16:9, 9:16, 1:1
- **Duration**: 3–15 seconds (flexible)
- **CFG scale**: 0.0 (creative) → 1.0 (strict), default 0.5
- **Negative prompt**: exclude unwanted elements

## Available Models (WaveSpeed)

| Model | Endpoint | Best For |
|-------|----------|----------|
| Kling 3.0 Std | `kwaivgi/kling-v3.0-std/text-to-video` | Fast, cost-effective |
| Kling 3.0 Pro | `kwaivgi/kling-v3.0-pro/text-to-video` | Higher quality |
| Kling O3 Std | `kwaivgi/kling-video-o3-std/text-to-video` | Omni standard |
| Kling O3 Pro | `kwaivgi/kling-video-o3-pro/text-to-video` | Best quality |

## Commercial Scene Presets (V3)

| Key | Label | Tier | Duration | Ratio | Audio |
|---|---|---|---|---|---|
| `ecommerce_product_360` | Ecommerce Product 360° Showcase | std | 8s | 16:9 | — |
| `fashion_editorial` | Fashion Editorial Model Walk | pro | 8s | 9:16 | sound |
| `attractive_lifestyle_pov` | Attractive Lifestyle POV | std | 8s | 9:16 | sound |
| `anime_action_scene` | Anime Action Battle | std | 8s | 16:9 | sound |
| `live_action_drama` | Live-Action Cinematic Drama | pro | 10s | 16:9 | sound |
| `food_mukbang` | Food Mukbang / ASMR Close-up | std | 8s | 9:16 | sound |
| `cyberpunk_city` | Cyberpunk Urban Night | std | 10s | 16:9 | sound |
| `luxury_car_reveal` | Luxury Car Commercial | pro | 10s | 16:9 | sound |
| `fitness_transformation` | Fitness / Body Transformation | std | 8s | 9:16 | sound |
| `skincare_beauty` | Skincare / Beauty Ad | pro | 8s | 9:16 | — |

## Prompt Engineering Rules

1. **Subject + Action + Environment**: "A woman walks through neon-lit Tokyo at night"
2. **Camera direction**: "slow dolly zoom", "aerial top-down", "rack focus"
3. **Style/mood**: "cinematic 4K", "golden hour", "hyperrealistic"
4. **Multi-prompt**: establish → action → reaction → close
5. **Negative prompt**: use to exclude "blurry, low quality, watermark, text overlay"
6. **Avoid**: vague adjectives alone — pair "beautiful" with a concrete visual

## API Payload (WaveSpeed.ai)

```json
POST https://api.wavespeed.ai/api/v3/kwaivgi/kling-v3.0-std/text-to-video
Authorization: Bearer ${WAVESPEED_API_KEY}

{
  "prompt": "...",
  "negative_prompt": "blurry, low quality, watermark",
  "duration": 5,
  "aspect_ratio": "16:9",
  "cfg_scale": 0.5,
  "sound": true,
  "multi_prompt": [
    { "prompt": "Shot 1...", "duration": 3 },
    { "prompt": "Shot 2...", "duration": 3 }
  ]
}
```

## Adding Custom Scenes

Edit `skills/kling3/scene-presets.json` or create a custom presets file:
```json
"my_custom_scene": {
  "label": "My Scene",
  "description": "What it's for",
  "settings": {
    "aspect_ratio": "16:9",
    "duration": 8,
    "sound": false,
    "cfg_scale": 0.5
  },
  "model_tier": "pro",
  "negative_prompt": "blurry, watermark",
  "multi_prompt": [
    { "prompt": "Shot 1 description...", "duration": 4 },
    { "prompt": "Shot 2 description...", "duration": 4 }
  ]
}
```

## Updating Skills

```bash
node cli/index.js update-skills
```
This pulls the latest scene presets and skill definitions from the remote repository.
