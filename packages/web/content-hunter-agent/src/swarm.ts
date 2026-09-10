import type { WeeklyPostItem, TargetAudience, AppConfig } from './types.js'
import { generateContentScript } from './generator.js'
import { memoryStore } from './memory.js'

export interface SwarmPipelineEvent {
  step: 'hunter' | 'crafter' | 'writer' | 'director' | 'gatekeeper' | 'completed'
  agent: string
  description: string
  timestamp: string
}

export async function runSwarmWeeklyGeneration(config?: AppConfig): Promise<WeeklyPostItem[]> {

  const planMatrix: Array<{
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
    audience: TargetAudience
    format: 'reel' | 'carousel' | 'pov'
    topic: string
  }> = [
    {
      day: 'Monday',
      audience: 'couples',
      format: 'reel',
      topic: 'The 3 Audio Catastrophes in Wedding Films (And How We Avoid Them)',
    },
    {
      day: 'Tuesday',
      audience: 'business',
      format: 'carousel',
      topic: 'Why $25k Commercials Flop on Instagram (And What Actually Converts)',
    },
    {
      day: 'Wednesday',
      audience: 'couples',
      format: 'pov',
      topic: 'POV: When the Father of the Bride Takes His First Breath Before the Aisle',
    },
    {
      day: 'Thursday',
      audience: 'business',
      format: 'reel',
      topic: 'The "Founder Freeze": How to Sound Effortless on Camera in 3 Steps',
    },
    {
      day: 'Friday',
      audience: 'couples',
      format: 'carousel',
      topic: '5 Questions Your Wedding Videographer Hopes You Ask Before Booking',
    },
  ]

  const weeklySchedule: WeeklyPostItem[] = []

  for (const item of planMatrix) {
    const script = await generateContentScript({
      topic: item.topic,
      format: item.format,
      audience: item.audience,
    }, config)

    weeklySchedule.push({
      day: item.day,
      audience: item.audience,
      format: item.format,
      layer: 'middle',
      topic: item.topic,
      script,
    })
  }

  memoryStore.add({
    type: 'rule',
    content: 'Weekly Trust Grid planned: 5 middle-layer posts for couples and business owners.',
    tags: ['weekly-schedule', 'middle-layer', 'swarm-forge'],
  })

  return weeklySchedule
}
