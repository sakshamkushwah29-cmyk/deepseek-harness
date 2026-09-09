import { Stagehand } from '@browserbasehq/stagehand';
import dotenv from 'dotenv';

dotenv.config();

const PET_URL = process.env.PET_URL || 'http://localhost:3081';

async function feedPet() {
  console.log('🐱 Starting Browserbase session to feed your pet...');

  const stagehand = new Stagehand({
    env: 'BROWSERBASE',
    modelName: 'google/gemini-2.5-flash',
  });

  await stagehand.init();
  const page = stagehand.page;

  try {
    console.log(`📍 Navigating to ${PET_URL}...`);
    await page.goto(PET_URL, { waitUntil: 'domcontentloaded' });

    console.log('👁️ Observing feed button...');
    const feedBtn = await page.observe('Find the Feed button');
    console.log('🖱️ Clicking Feed button...');
    await page.act(feedBtn);

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

    console.log('✅ Pet Status After Feeding:');
    console.log(JSON.stringify(status, null, 2));
    console.log('🍎 Your pet has been fed!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await stagehand.close();
    console.log('🔚 Browserbase session closed');
  }
}

feedPet();