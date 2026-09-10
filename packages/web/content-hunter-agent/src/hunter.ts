import type { ContentIdea, TargetAudience, AppConfig } from './types.js'

interface HuntParams {
  audience?: TargetAudience | 'all'
  focusAngle?: string
  count?: number
}

const SEED_IDEAS: ContentIdea[] = [
  // Wedding Couples (Middle Layer / Trust)
  {
    id: 'idea-w-1',
    title: 'The 3 Audio Catastrophes in Wedding Films (And How We Avoid Them)',
    angle: 'Craft Truth / Client Protection',
    audience: 'couples',
    layer: 'middle',
    recommendedFormat: 'reel',
    whyItBuildsTrust: 'Educates couples on microphone placement during vows and wind resistance without insulting other vendors.',
    resonanceScore: 96,
    tags: ['audio', 'wedding-vows', 'mistakes-to-avoid', 'trust'],
  },
  {
    id: 'idea-w-2',
    title: 'How I Wait: Why We Don’t Tell You to "Smile at the Camera"',
    angle: 'Observational / Behind The Lens',
    audience: 'couples',
    layer: 'middle',
    recommendedFormat: 'reel',
    whyItBuildsTrust: 'Removes the terror of feeling stiff or posed all day by showing patient cinema-verite observation.',
    resonanceScore: 98,
    tags: ['how-i-wait', 'unposed', 'candids', 'cinematography'],
  },
  {
    id: 'idea-w-3',
    title: '5 Questions Your Wedding Videographer Hopes You Ask Before Booking',
    angle: 'Buyer Defense / Education',
    audience: 'couples',
    layer: 'middle',
    recommendedFormat: 'carousel',
    whyItBuildsTrust: 'Positions the creator as an industry advocate who helps couples avoid contract traps and delivery delays.',
    resonanceScore: 94,
    tags: ['carousel', 'contracts', 'pricing-truth', 'save-worthy'],
  },
  {
    id: 'idea-w-4',
    title: 'POV: When the Father of the Bride Takes His First Breath Before the Aisle',
    angle: 'Emotional Craft & Presence',
    audience: 'couples',
    layer: 'middle',
    recommendedFormat: 'pov',
    whyItBuildsTrust: 'Demonstrates deep sensitivity to sacred family moments rather than just showy equipment.',
    resonanceScore: 99,
    tags: ['pov-overlay', 'family-emotion', 'deep-caption'],
  },
  {
    id: 'idea-w-5',
    title: 'Why 4K and 8K Don’t Matter If Your Video Color Looks Like a Smartphone Filter',
    angle: 'Technical De-mystification',
    audience: 'couples',
    layer: 'middle',
    recommendedFormat: 'reel',
    whyItBuildsTrust: 'Shows why archival color grading ensures the film looks timeless 25 years from now.',
    resonanceScore: 91,
    tags: ['color-grading', 'timeless', 'technical-truth'],
  },

  // Big Business Owners (Middle Layer / Trust)
  {
    id: 'idea-b-1',
    title: 'Why $25k Commercials Flop on Instagram (And What Actually Converts)',
    angle: 'Executive Strategy / ROI',
    audience: 'business',
    layer: 'middle',
    recommendedFormat: 'carousel',
    whyItBuildsTrust: 'Speaks entrepreneur-to-entrepreneur about customer psychology and authentic storytelling vs glossy fluff.',
    resonanceScore: 97,
    tags: ['roi', 'business-video', 'carousel', 'marketing'],
  },
  {
    id: 'idea-b-2',
    title: 'The "Founder Freeze": How to Sound Effortless on Camera in 3 Steps',
    angle: 'Executive Presence / Practical Coaching',
    audience: 'business',
    layer: 'middle',
    recommendedFormat: 'reel',
    whyItBuildsTrust: 'Directly tackles the executive fear of appearing robotic or uncharismatic on camera.',
    resonanceScore: 95,
    tags: ['camera-confidence', 'leadership', 'talking-head'],
  },
  {
    id: 'idea-b-3',
    title: 'How I Wait on Corporate Sets: Capturing What Your CEO Won’t Say in the Script',
    angle: 'Documentary Storytelling',
    audience: 'business',
    layer: 'middle',
    recommendedFormat: 'reel',
    whyItBuildsTrust: 'Proves how unscripted b-roll and authentic interaction creates brand authority.',
    resonanceScore: 93,
    tags: ['how-i-wait', 'corporate-doc', 'b-roll'],
  },
  {
    id: 'idea-b-4',
    title: 'POV: You Stopped Making Promotional Ads and Started Making Brand Documentaries',
    angle: 'Strategic Paradigm Shift',
    audience: 'business',
    layer: 'middle',
    recommendedFormat: 'pov',
    whyItBuildsTrust: 'Highlights the cultural shift away from hard sales pitches toward educational brand equity.',
    resonanceScore: 92,
    tags: ['pov-overlay', 'brand-equity', 'caption-value'],
  },
  {
    id: 'idea-b-5',
    title: 'The Anatomy of a High-Trust Case Study Video',
    angle: 'Framework / Breakdown',
    audience: 'business',
    layer: 'middle',
    recommendedFormat: 'carousel',
    whyItBuildsTrust: 'Shares the exact narrative framework that makes prospective enterprise clients trust your service.',
    resonanceScore: 96,
    tags: ['case-study', 'framework', 'carousel-blueprint'],
  },
]

export async function huntIdeas(params: HuntParams, config?: AppConfig): Promise<ContentIdea[]> {
  const { audience = 'all', focusAngle, count = 6 } = params

  // Filter seed ideas based on audience
  let results = SEED_IDEAS.filter((idea) => {
    if (audience === 'all') return true
    return idea.audience === audience || idea.audience === 'hybrid'
  })

  if (focusAngle && focusAngle.trim().length > 0) {
    const q = focusAngle.toLowerCase()
    results = results.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.angle.toLowerCase().includes(q) ||
      i.tags.some(t => t.toLowerCase().includes(q)),
    )
    if (results.length === 0) {
      // Dynamic fallback idea based on custom angle
      results = [
        {
          id: `idea-custom-${Date.now()}`,
          title: `Behind The Lens: The Real Truth About ${focusAngle}`,
          angle: 'Custom Craft Exploration',
          audience: audience === 'all' ? 'hybrid' : audience,
          layer: 'middle',
          recommendedFormat: 'reel',
          whyItBuildsTrust: `Examines ${focusAngle} from a grounded craftsman perspective with zero hype.`,
          resonanceScore: 94,
          tags: [focusAngle.toLowerCase().replace(/\s+/g, '-'), 'middle-layer', 'trust'],
        },
        ...SEED_IDEAS.slice(0, 3),
      ]
    }
  }

  // If user provided LLM config and wants live generation
  if (config?.apiKey && config.apiKey.trim().length > 0) {
    try {
      const generated = await callLlmIdeaHunt(params, config)
      if (generated && generated.length > 0) {
        return generated
      }
    } catch (err) {
      console.warn('Live LLM Hunt failed, returning curated knowledge graph results:', err)
    }
  }

  // Return formatted results
  return results.slice(0, count)
}

async function callLlmIdeaHunt(params: HuntParams, config: AppConfig): Promise<ContentIdea[] | null> {
  const endpoint = config.apiBaseUrl || 'https://api.deepseek.com/v1/chat/completions'
  const prompt = `You are the Content Hunter Agent for an Instagram video creator & entrepreneur who shoots and edits videos for wedding couples and big business owners.
Persona: Knowledgeable, calm authority, "one long hold" cinematography, "how I wait", no cheap or fake promises, pure education & fun.
Target: ${params.audience ?? 'all'} (focus: ${params.focusAngle || 'Middle layer trust content'})
Generate 4 ideas in JSON array format matching:
[{"id": "idea-...", "title": "...", "angle": "...", "audience": "couples"|"business", "layer": "middle", "recommendedFormat": "reel"|"carousel"|"pov", "whyItBuildsTrust": "...", "resonanceScore": 95, "tags": ["..."]}]`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are an expert video content strategist specializing in high-trust Instagram reels and carousels.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) return null
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  const content = data.choices?.[0]?.message?.content
  if (!content) return null
  const parsed = JSON.parse(content)
  return Array.isArray(parsed) ? parsed : (parsed.ideas || null)
}
