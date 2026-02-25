---
name: kling3-video-demos
description: Generate multi-scene AI video demos with Kling 3.0 Omni and embed them on your landing page. Use when building product demos, social videos, cinematic hero sections, before/after transforms, or any AI-generated video showcase. Includes 7 hot scene presets (product showcase, cinematic landscape, lifestyle reel, viral hook, explainer, fashion, before/after) with fine-tuned prompts, CLI generation commands, and a Node.js landing page gallery.
---

# Kling 3.0 Video Demo Skill

## When to Use This Skill
Use this skill when the user wants to:
- Generate AI videos with Kling 3.0 / Kling 3.0 Omni for a landing page
- Create multi-scene or multi-shot product demo videos
- Produce hot trending video types for social, marketing, or ecommerce
- Build a video demo gallery/showcase page

## Quick Start
```bash
export PIAPI_KEY=your_key
node cli/index.js list-scenes --model kling3
node cli/index.js generate-demo --model kling3 --scenes all --dry-run
node cli/index.js generate-demo --model kling3 --scenes product_showcase,cinematic_landscape
node landing/server.js  # → http://localhost:3000
```

## Model Capabilities (Kling 3.0 Omni)
- **T2V** (text-to-video): up to 2500 char prompt
- **I2V** (image-to-video): first_frame / end_frame image control
- **Multi-shot**: up to 6 scenes, 3–15s total, each shot has own prompt + duration
- **Native audio**: Chinese, English, Japanese, Korean, Spanish
- **Aspect ratios**: 16:9, 9:16, 1:1
- **Modes**: std (fast) | pro (higher quality)
- **CFG scale**: 0.0 (creative) → 1.0 (strict), default 0.5

## Hot Scene Presets
| Key | Label | Mode | Duration | Ratio | Shots |
|---|---|---|---|---|---|
| `product_showcase` | Product Showcase | pro | 8s | 16:9 | 2 |
| `cinematic_landscape` | Cinematic Landscape | pro | 12s | 16:9 | 3 |
| `lifestyle_vertical` | Lifestyle / Social Reel | pro | 8s | 9:16 | 2 |
| `before_after` | Before / After Transform | pro | 10s | 16:9 | 2 |
| `viral_hook` | Viral Hook (Short) | std | 5s | 9:16 | 1 |
| `explainer_multishot` | Product Explainer | pro | 15s | 16:9 | 3 |
| `ecommerce_fashion` | Fashion / Apparel | pro | 8s | 9:16 | 2 |

## Prompt Engineering Rules
1. **Subject + Action + Environment**: "A woman walks through neon-lit Tokyo at night"
2. **Camera direction**: "slow dolly zoom", "aerial top-down", "rack focus"
3. **Style/mood**: "cinematic 4K", "golden hour", "hyperrealistic"
4. **Multi-shot**: establish → action → reaction → close
5. **Avoid**: vague adjectives alone — pair "beautiful" with a concrete visual

## API Payload (PiAPI)
```json
POST https://api.piapi.ai/api/v1/task
{
  "model": "kling",
  "task_type": "video_generation",
  "input": {
    "model_name": "kling-v3",
    "prompt": "...",
    "duration": 5,
    "aspect_ratio": "16:9",
    "mode": "pro",
    "cfg_scale": 0.5,
    "enable_audio": true,
    "multi_shot": false,
    "multi_prompt": []
  }
}
```

## Adding Custom Scenes
Edit `skills/kling3/scene-presets.json` to add your own scene type:
```json
"my_custom_scene": {
  "label": "My Scene",
  "description": "What it's for",
  "settings": { "aspect_ratio": "16:9", "mode": "pro", "duration": 8, "enable_audio": false, "cfg_scale": 0.5 },
  "multi_shot": true,
  "shots": [
    { "prompt": "...", "duration": 4 },
    { "prompt": "...", "duration": 4 }
  ]
}
```
