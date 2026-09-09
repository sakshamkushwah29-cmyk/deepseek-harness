# @deepseek-ai/dsh-virtual-pet

A Tamagotchi-style virtual pet web app with Browserbase/Stagehand integration for automated care.

## Features

- 🐱 **Virtual Pet**: Feed, play, sleep, clean, and give treats
- 📊 **Stats**: Hunger, Energy, Happiness, Cleanliness
- 💰 **Economy**: Coins, XP, Leveling system
- 💾 **Persistence**: Auto-saves to localStorage
- 🌐 **Browserbase Integration**: Automate pet care via Stagehand

## Quick Start

### Run the Web App

```bash
cd packages/web/virtual-pet
npm run dev
```

Open http://localhost:3081 in your browser.

### Browserbase Automation

First, copy the example env file:

```bash
cp .env.example .env
```

Then run automation scripts:

```bash
# Check pet status
npm run pet:check

# Feed pet
npm run pet:feed

# Play with pet
npm run pet:play

# Full care routine (feeds, plays, cleans, sleeps as needed)
npm run pet:full-care
```

## Pet Stats

| Stat | Decay Rate | Restored By |
|------|------------|-------------|
| Hunger | -8%/hour | Feed (+30), Treat (+15) |
| Energy | -5%/hour | Sleep (+2%/sec), Treat |
| Happiness | -3%/hour | Play (+25), Clean (+10), Treat (+40) |
| Cleanliness | -4%/hour | Clean (+100) |

## Actions

| Action | Cost | Effects |
|--------|------|---------|
| Feed | 5🪙 | +30 Hunger, +5 Happiness, +5 XP |
| Play | 10🪙 | +25 Happiness, -15 Energy, -10 Hunger, +10 XP |
| Sleep | Free | +2 Energy/sec, -0.5 Hunger/sec |
| Clean | 3🪙 | +100 Cleanliness, +10 Happiness, +3 XP |
| Treat | 15🪙 | +40 Happiness, +15 Hunger, +20 XP |

## Browserbase Integration

The automation scripts use Stagehand with Browserbase's Model Gateway (gemini-2.5-flash). They:

1. Launch a cloud Chrome browser
2. Navigate to your pet URL
3. Use natural language to find and click buttons
4. Extract structured pet status data
4. Report back the results

Perfect for:
- Checking on your pet while away
- Automated daily care routines
- Integrating with schedulers/cron jobs
- Building agent workflows that care for the pet

## Local Development

The pet runs entirely in the browser with localStorage persistence. No backend database needed.

The Browserbase scripts work with any accessible URL (local via tunnel, deployed, etc.).