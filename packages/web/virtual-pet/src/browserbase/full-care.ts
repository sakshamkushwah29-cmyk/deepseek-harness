import { Stagehand } from '@browserbasehq/stagehand';
import dotenv from 'dotenv';

dotenv.config();

const PET_URL = process.env.PET_URL || 'http://localhost:3081';

async function fullCare() {
  console.log('🐱 Starting full care routine for your pet via Browserbase...');

  const stagehand = new Stagehand({
    env: 'BROWSERBASE',
    modelName: 'google/gemini-2.5-flash',
  });

  await stagehand.init();
  const page = stagehand.page;

  try {
    console.log(`📍 Navigating to ${PET_URL}...`);
    await page.goto(PET_URL, { waitUntil: 'domcontentloaded' });

    // Get initial status
    console.log('📊 Checking initial status...');
    const initial = await page.extract({
      instruction: 'Get hunger, energy, happiness, cleanliness, and coins',
      schema: {
        type: 'object',
        properties: {
          hunger: { type: 'number' },
          energy: { type: 'number' },
          happiness: { type: 'number' },
          cleanliness: { type: 'number' },
          coins: { type: 'number' },
        },
      },
    });

    console.log('Initial status:', initial);

    // Feed if hungry
    if (initial.hunger < 50) {
      console.log('🍎 Pet is hungry, feeding...');
      const feedBtn = await page.observe('Find the Feed button');
      await page.act(feedBtn);
      await page.waitForTimeout(1500);
    }

    // Play if unhappy
    if (initial.happiness < 50) {
      console.log('🎮 Pet is sad, playing...');
      const playBtn = await page.observe('Find the Play button');
      await page.act(playBtn);
      await page.waitForTimeout(1500);
    }

    // Clean if dirty
    if (initial.cleanliness < 50) {
      console.log('🧼 Pet is dirty, cleaning...');
      const cleanBtn = await page.observe('Find the Clean button');
      await page.act(cleanBtn);
      await page.waitForTimeout(1500);
    }

    // Sleep if tired (but only if energy is very low)
    if (initial.energy < 20) {
      console.log('😴 Pet is exhausted, putting to sleep...');
      const sleepBtn = await page.observe('Find the Sleep button');
      await page.act(sleepBtn);
      await page.waitForTimeout(1500);

      // Wake up after a moment
      console.log('☀️ Waking up...');
      const wakeBtn = await page.observe('Find the Wake Up button');
      await page.act(wakeBtn);
      await page.waitForTimeout(1500);
    }

    // Final status
    console.log('📊 Final status check...');
    const final = await page.extract({
      instruction: 'Get the pet name, hunger, energy, happiness, cleanliness, coins, level, and XP',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          hunger: { type: 'number' },
          energy: { type: 'number' },
          happiness: { type: 'number' },
          cleanliness: { type: 'number' },
          coins: { type: 'number' },
          level: { type: 'number' },
          xp: { type: 'string' },
        },
      },
    });

    console.log('✅ Final Pet Status:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🐱 Name: ${final.name || '(unnamed)'}`);
    console.log(`♥ Hunger: ${initial.hunger}% → ${final.hunger}%`);
    console.log(`⚡ Energy: ${initial.energy}% → ${final.energy}%`);
    console.log(`😊 Happiness: ${initial.happiness}% → ${final.happiness}%`);
    console.log(`🧹 Cleanliness: ${initial.cleanliness}% → ${final.cleanliness}%`);
    console.log(`🪙 Coins: ${initial.coins} → ${final.coins}`);
    console.log(`⭐ Level: ${final.level}`);
    console.log(`📈 XP: ${final.xp}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Full care routine complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await stagehand.close();
    console.log('🔚 Browserbase session closed');
  }
}

fullCare();