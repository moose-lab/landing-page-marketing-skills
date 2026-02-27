# landing-page-marketing-skills

AI asset generation skills for Claude Code. Generate multi-scene Kling 3.0 video demos and Nano Banana 2 images via WaveSpeed.ai — with one CLI command.

## Quick Commands

```bash
# Install dependencies
npm install

# See available scene presets
npm run list

# Dry-run: inspect prompts without API calls
npm run generate:dry

# Generate all demo videos (requires WAVESPEED_API_KEY)
export WAVESPEED_API_KEY=your_key_here
npm run generate

# Generate with custom agent-created presets
node cli/index.js generate-demo --model kling3 --custom-presets ./my-presets.json

# Start landing page gallery
npm run serve
# → http://localhost:3000

# Update skills from remote
node cli/index.js update-skills

# List image presets
npm run list:images

# Generate images (dry run)
npm run generate:images:dry

# Generate images
npm run generate:images

# Analyze HTML for asset slots
node cli/index.js analyze-assets --input ./public/index.html

# Smart video covers
node cli/index.js smart-cover
```

## Install This Skill via npx

```bash
npx skills add moose-lab/landing-page-marketing-skills
```

## Project Structure

```
skills/kling3/        ← Skill definition + scene presets (WaveSpeed.ai)
cli/                  ← CLI commands (generate-demo, list-scenes, status, update-skills)
cli/lib/              ← WaveSpeed API wrapper, presets loader, manifest writer
landing/              ← Node.js landing page server
public/               ← Static assets + demo gallery HTML + video gallery UI
.claude-plugin/       ← Claude Code plugin marketplace config
```

## Available Skills

- `kling3-video-demos` — Generate multi-scene AI video demos with Kling 3.0 via WaveSpeed.ai
- `nano-banana-2-image-assets` — Generate commercial AI images with Nano Banana 2 for landing pages and marketing

See `skills/kling3/SKILL.md` for full documentation including the agent automation workflow.
