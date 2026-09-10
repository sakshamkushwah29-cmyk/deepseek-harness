import { Stagehand } from '@browserbasehq/stagehand'
import dotenv from 'dotenv'

dotenv.config()

const PET_URL = process.env.PET_URL || 'http://localhost:3081'

async function checkPet() {
  console.log('🐱 Checking on your pet via Browserbase...')

  const stagehand = new Stagehand({
    env: 'BROWSERBASE',
    modelName: 'google/gemini-2.5-flash',
  })

  await stagehand.init()
  const page = stagehand.page

  try {
    console.log(`📍 Navigating to ${PET_URL}...`)
    await page.goto(PET_URL, { waitUntil: 'domcontentloaded' })

    console.log('📊 Extracting pet status...')
    const status = await page.extract({
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
    })

    console.log('✅ Current Pet Status:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`🐱 Name: ${status.name || '(unnamed)'}`)
    console.log(`♥ Hunger: ${status.hunger}%`)
    console.log(`⚡ Energy: ${status.energy}%`)
    console.log(`😊 Happiness: ${status.happiness}%`)
    console.log(`🧹 Cleanliness: ${status.cleanliness}%`)
    console.log(`🪙 Coins: ${status.coins}`)
    console.log(`⭐ Level: ${status.level}`)
    console.log(`📈 XP: ${status.xp}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━')

    // Check if pet needs care
    const needs = []
    if (status.hunger < 30) needs.push('🍎 Food')
    if (status.energy < 30) needs.push('😴 Sleep')
    if (status.happiness < 30) needs.push('🎮 Play')
    if (status.cleanliness < 30) needs.push('🧼 Clean')

    if (needs.length > 0) {
      console.log(`\n⚠️ Your pet needs: ${needs.join(', ')}`)
    } else {
      console.log('\n✨ Your pet is happy and healthy!')
    }
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await stagehand.close()
    console.log('🔚 Browserbase session closed')
  }
}

checkPet()
