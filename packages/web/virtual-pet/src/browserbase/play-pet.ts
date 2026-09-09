import { Stagehand } from '@browserbasehq/stagehand';
import dotenv from 'dotenv';

dotenv.config();

const PET_URL = process.env.PET_URL || 'http://localhost:3081';

async function playPet() {
  console.log('🐱 Starting Browserbase session to play with your pet...');

  const stagehand = new Stagehand({
    env: 'BROWSERBASE',
    modelName: 'google/gemini-2.5-flash',
  });

  await stagehand.init();
  const page = stagehand.page;

  try {
    console.log(`📍 Navigating to ${PET_URL}...`);
    await page.goto(PET_URL, { waitUntil: 'domcontentloaded' });

    console.log('👁️ Observing play button...');
    const playBtn = await page.observe('Find the Play button');
    console.log('🖱️ Clicking Play button...');
    await page.act(playBtn);

    await page.waitForTimeout(2000);

    console.log('📊 Extracting pet status...');
    const status = await page.extract({
      instruction: 'Get the pet name, hunger, energy, happiness, cleanliness, and coins',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          hunger: { type: 'number' },
          energy: { type: 'number' },
          happiness: { type: 'number' },
          cleanliness: { type: 'number' },
          coins: { type: 'number' },
        },
      },
    });

    console.log('✅ Pet Status After Playing:');
    console.log(JSON.stringify(status, null, 2));
    console.log('🎮 You played with your pet!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await stagehand.close();
    console.log('🔚 Browserbase session closed');
  }
}

playPet();