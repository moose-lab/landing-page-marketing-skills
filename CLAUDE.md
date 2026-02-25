# landing-page-marketing-skills

AI video generation skills for Claude Code. Generate multi-scene Kling 3.0 video demos and embed them on a landing page — with one CLI command.

## Quick Commands

```bash
# Install dependencies
npm install

# See available scene presets
npm run list

# Dry-run: inspect prompts without API calls
npm run generate:dry

# Generate all demo videos (requires PIAPI_KEY)
export PIAPI_KEY=your_key_here
npm run generate

# Start landing page gallery
npm run serve
# → http://localhost:3000
```

## Install This Skill via npx

```bash
npx skills add moose-lab/landing-page-marketing-skills
```

## Project Structure

```
skills/kling3/        ← Skill definition + scene presets
cli/                  ← CLI commands (generate-demo, list-scenes, status)
landing/              ← Node.js landing page server
public/               ← Static assets + demo gallery HTML
.claude-plugin/       ← Claude Code plugin marketplace config
```

## Available Skills

- `kling3-video-demos` — Generate multi-scene AI video demos with Kling 3.0 Omni

See `skills/kling3/SKILL.md` for full documentation.
