export type TargetAudience = 'couples' | 'business' | 'hybrid'
export type ContentFormat = 'reel' | 'carousel' | 'pov'
export type ContentLayer = 'top' | 'middle' | 'bottom'

export interface ContentIdea {
  id: string
  title: string
  angle: string
  audience: TargetAudience
  layer: ContentLayer
  recommendedFormat: ContentFormat
  whyItBuildsTrust: string
  resonanceScore: number
  tags: string[]
}

export interface ShotItem {
  shotNumber: number
  framing: string
  cameraMovement: string
  durationSeconds: number
  description: string
  audioVisualCue: string
}

export interface CarouselSlide {
  slideNumber: number
  headline: string
  bodyText: string
  visualCue: string
  layoutNote: string
}

export interface PovOverlaySpec {
  overlayText: string
  videoSetting: string
  loopDurationSeconds: number
  captionHeadline: string
  captionBody: string
  callToAction: string
}

export interface ContentScript {
  id: string
  ideaId?: string
  title: string
  audience: TargetAudience
  format: ContentFormat
  layer: ContentLayer
  hookOptions: string[]
  selectedHookIndex: number
  fullScript: string
  pacingNotes: string
  signaturePause: string // The "How I Wait" beat
  shotList: ShotItem[]
  carouselSlides?: CarouselSlide[]
  povSpec?: PovOverlaySpec
  caption: string
  hashtags: string[]
  createdAt: string
}

export interface WeeklyPostItem {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
  audience: TargetAudience
  format: ContentFormat
  layer: ContentLayer
  topic: string
  script?: ContentScript
}

export interface MemoryEntry {
  id: string
  timestamp: string
  type: 'idea' | 'script' | 'feedback' | 'rule' | 'blacklist'
  audience?: TargetAudience
  content: string
  tags: string[]
}

export interface AppConfig {
  apiKey?: string
  apiBaseUrl?: string
  model?: string
  activeProvider?: 'deepseek' | 'openai' | 'local'
}
