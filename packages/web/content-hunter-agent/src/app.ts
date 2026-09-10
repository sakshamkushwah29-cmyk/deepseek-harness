import fastify, { FastifyInstance } from 'fastify'
import fastifyStatic from '@fastify/static'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { huntIdeas } from './hunter.js'
import { generateContentScript } from './generator.js'
import { runSwarmWeeklyGeneration } from './swarm.js'
import { memoryStore } from './memory.js'
import type { AppConfig, TargetAudience, ContentFormat } from './types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({ logger: process.env.NODE_ENV !== 'production' ? true : false })

  // In-memory app configuration for user session
  const currentConfig: AppConfig = {
    apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '',
    apiBaseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1/chat/completions',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    activeProvider: (process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY) ? 'deepseek' : 'local',
  }

  // Register static assets if public folder exists locally
  const publicDir = join(__dirname, '../public')
  if (existsSync(publicDir)) {
    await app.register(fastifyStatic, {
      root: publicDir,
      prefix: '/',
      wildcard: false,
    })
  }

  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    service: 'content-hunter-agent',
    version: '0.1.0',
    mode: currentConfig.activeProvider,
    memoryStats: memoryStore.getStats(),
    timestamp: new Date().toISOString(),
  }))

  // Configuration API
  app.get('/api/config', async () => ({
    activeProvider: currentConfig.activeProvider,
    model: currentConfig.model,
    apiBaseUrl: currentConfig.apiBaseUrl,
    hasApiKey: Boolean(currentConfig.apiKey && currentConfig.apiKey.length > 0),
  }))

  app.post<{ Body: AppConfig }>('/api/config', async (request) => {
    const { apiKey, apiBaseUrl, model, activeProvider } = request.body || {}
    if (apiKey !== undefined) currentConfig.apiKey = apiKey.trim()
    if (apiBaseUrl !== undefined) currentConfig.apiBaseUrl = apiBaseUrl.trim()
    if (model !== undefined) currentConfig.model = model.trim()
    if (activeProvider !== undefined) currentConfig.activeProvider = activeProvider
    else if (currentConfig.apiKey && currentConfig.apiKey.length > 0) currentConfig.activeProvider = 'deepseek'
    else currentConfig.activeProvider = 'local'

    return {
      success: true,
      message: 'Configuration updated successfully',
      activeProvider: currentConfig.activeProvider,
      model: currentConfig.model,
    }
  })

  // Idea Hunter API
  app.post<{
    Body: { audience?: TargetAudience | 'all'; focusAngle?: string; count?: number }
  }>('/api/hunt', async (request) => {
    const { audience = 'all', focusAngle, count = 6 } = request.body || {}
    const ideas = await huntIdeas({ audience, focusAngle, count }, currentConfig)
    return { success: true, ideas, count: ideas.length }
  })

  // Script & Production Generator API
  app.post<{
    Body: { ideaId?: string; topic?: string; format?: ContentFormat; audience?: TargetAudience }
  }>('/api/generate', async (request) => {
    const { ideaId, topic, format = 'reel', audience = 'couples' } = request.body || {}
    const script = await generateContentScript({ ideaId, topic, format, audience }, currentConfig)
    return { success: true, script }
  })

  // 5-Day Weekly Trust Grid API
  app.get('/api/weekly-plan', async () => {
    const plan = await runSwarmWeeklyGeneration(currentConfig)
    return { success: true, plan, count: plan.length }
  })

  app.post('/api/weekly-plan/generate', async () => {
    const plan = await runSwarmWeeklyGeneration(currentConfig)
    return { success: true, plan, count: plan.length }
  })

  // Memory Explorer API (TencentDB Agent Memory inspired)
  app.get('/api/memory', async () => {
    const memories = memoryStore.getAll()
    const stats = memoryStore.getStats()
    return { success: true, memories, stats }
  })

  app.post<{
    Body: { type: 'rule' | 'feedback' | 'blacklist' | 'idea'; content: string; tags?: string[]; audience?: TargetAudience }
  }>('/api/memory', async (request, reply) => {
    const { type = 'rule', content, tags = [], audience } = request.body || {}
    if (!content || content.trim().length === 0) {
      return reply.status(400).send({ error: 'Content is required' })
    }
    const entry = memoryStore.add({ type, content, tags, audience })
    return { success: true, entry }
  })

  // Content Skill Graph Browser API
  const possibleSkillGraphDirs = [
    join(__dirname, '../content-skill-graph'),
    join(__dirname, '../../content-skill-graph'),
    join(process.cwd(), 'content-skill-graph'),
    join(process.cwd(), 'packages/web/content-hunter-agent/content-skill-graph'),
  ]
  const skillGraphDir = possibleSkillGraphDirs.find(d => existsSync(d)) || possibleSkillGraphDirs[0]

  app.get('/api/skill-graph', async () => {
    const sections = ['platforms', 'voice', 'engine', 'audience']
    const tree: Record<string, string[]> = { root: ['index.md'] }

    if (existsSync(skillGraphDir)) {
      for (const section of sections) {
        const secPath = join(skillGraphDir, section)
        if (existsSync(secPath)) {
          tree[section] = readdirSync(secPath).filter(f => f.endsWith('.md'))
        }
      }
    }

    return { success: true, tree }
  })

  app.get<{
    Params: { section: string; name: string }
  }>('/api/skill-graph/:section/:name', async (request, reply) => {
    const { section, name } = request.params
    const targetPath = section === 'root'
      ? join(skillGraphDir, name)
      : join(skillGraphDir, section, name)

    if (!existsSync(targetPath)) {
      return reply.status(404).send({ error: 'Skill graph document not found' })
    }

    const content = readFileSync(targetPath, 'utf-8')
    return { success: true, section, name, content }
  })

  return app
}
