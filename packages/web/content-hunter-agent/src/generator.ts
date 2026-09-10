import type {
  ContentScript,
  ContentFormat,
  TargetAudience,
  AppConfig,
  ShotItem,
  CarouselSlide,
  PovOverlaySpec,
} from './types.js'
import { memoryStore } from './memory.js'

interface GenerateParams {
  ideaId?: string
  topic?: string
  format?: ContentFormat
  audience?: TargetAudience
}

export async function generateContentScript(params: GenerateParams, config?: AppConfig): Promise<ContentScript> {
  const audience = params.audience || 'couples'
  const format = params.format || 'reel'
  const topic = params.topic || (audience === 'couples'
    ? 'How to protect your vows audio in outdoor wind'
    : 'Why business videos fail when founders memorize scripts')

  // Check if live LLM is requested and configured
  if (config?.apiKey && config.apiKey.trim().length > 0) {
    try {
      const llmScript = await callLlmScriptGeneration(topic, format, audience, config)
      if (llmScript) {
        memoryStore.add({
          type: 'script',
          audience,
          content: `Generated script for "${topic}" (${format}) via LLM`,
          tags: [format, audience, 'ai-generated'],
        })
        return llmScript
      }
    } catch (err) {
      console.warn('Live LLM script generation failed, falling back to knowledge engine:', err)
    }
  }

  // Knowledge Engine Generation adhering to content-skill-graph rules
  const isCouples = audience === 'couples'
  const title = topic

  // 1. Five Trust-First Hooks
  const hookOptions = isCouples ? [
    'There is one moment in every wedding ceremony that most videographers miss because they are staring at the bride.',
    'The best wedding film you will ever watch is usually shot with the least amount of camera movement.',
    'Watch how long I wait before I press record during a father-daughter dance.',
    '3 things a wedding videographer should tell you before you sign their contract, but rarely do.',
    'Last Saturday at 11:30 PM, the venue turned off the lights right before the sparkler exit. Here is what we did.',
  ] : [
    'If you are a business owner getting in front of a camera this month, do not make this lighting mistake.',
    'Why having an expensive 8K cinema camera won\'t save a boring company story.',
    'Before we roll cameras on a $50k commercial, this is the 10-minute ritual I run with the founder.',
    'Why big companies waste $20k on corporate videos that get 40 views (and how to fix it).',
    'A CEO told me: "I hate how my voice sounds on video". Here is the 2-minute fix we used on set.',
  ]

  // 2. Full Script with "One Long Hold" and "[How I Wait]"
  const fullScript = isCouples ? `[Visual: Steady camera, waist-up shot in natural window light. Eye contact. Calm, measured delivery.]

"There is one moment in every wedding ceremony that most videographers miss... because they are staring exclusively at the bride.

[Pause: 0.5s breath]

When the bride reaches the altar and takes the groom's hand, everyone is watching her smile. But if you look two feet to the left, you will see the father of the bride taking his very first breath in twenty minutes.

[Camera: One Long Hold. 4 seconds of stillness. No frantic cutaway.]

[Signature Beat: How I Wait]
I don't pan the camera. I don't shout instructions. I just wait with the lens steady on his eyes until that quiet, unscripted exhale happens.

[Visual: Speaker returns to lens, grounded tone]

A lot of videographers treat weddings like music videos. They run around with gimbals, doing fast spins and slow-motion hair flips. But twenty years from now, you won't care about a fancy camera transition. You will care about whether someone caught the exact way your father looked at you before he let go.

[Takeaway]
When you interview videographers, don't ask what camera they shoot on. Ask them how they observe the room when nothing is planned. Because the real memory is always what happens in between the poses."`
    : `[Visual: Steady tripod shot in an uncluttered studio or office. Clean audio, room warmth.]

"If you are a business owner getting in front of a camera this month, please do not memorize a script.

[Pause: 0.5s natural breath]

The fastest way to make a brilliant founder sound like a robotic infomercial is to give them a teleprompter and ask them to read bullet points.

[Camera: One Long Hold. Unhurried posture, arms relaxed.]

[Signature Beat: How I Wait]
When I direct CEOs for brand documentaries, we never hit record on the first question. We sit down, have coffee for ten minutes, and I wait until their shoulders visibly drop and their conversational cadence returns.

[Visual: Speaker gestures naturally to camera]

Your clients don't buy your company because your commercial looks like a perfume ad. They buy because they believe you know what you are doing, and they trust you won't waste their time. High production value isn't flashy 3D graphics; it's clarity, confidence, and letting your natural authority breathe.

[Takeaway]
Next time you shoot a founder video, ditch the script. Frame the problem, look into the lens like you're talking to a peer over lunch, and let the truth do the selling."`

  // 3. Shot List
  const shotList: ShotItem[] = isCouples ? [
    {
      shotNumber: 1,
      framing: 'Medium Close-up (35mm or 50mm, f/2.0)',
      cameraMovement: 'Locked-off Tripod (One Long Hold)',
      durationSeconds: 12,
      description: 'Direct to camera. Warm window illumination. Honest eye-level conversation.',
      audioVisualCue: 'Natural speaking voice, room acoustic warmth.',
    },
    {
      shotNumber: 2,
      framing: 'Over-the-Shoulder / Behind-the-Lens (85mm)',
      cameraMovement: 'Static hold with slight natural hand breathing',
      durationSeconds: 8,
      description: '[How I Wait] Filmmaker standing unobtrusively at the back of the ceremony aisle, viewfinder to eye, patient observation.',
      audioVisualCue: 'Low ambient room audio, distant ceremony murmur.',
    },
    {
      shotNumber: 3,
      framing: 'Medium Wide Context Shot',
      cameraMovement: 'Slow, subtle slider creep (almost imperceptible)',
      durationSeconds: 15,
      description: 'Filmmaker demonstrating camera observation vs frantic gimbal spinning.',
      audioVisualCue: 'Dialogue resumes with calm authority.',
    },
    {
      shotNumber: 4,
      framing: 'Close-up on hands & gear',
      cameraMovement: 'Static macro hold',
      durationSeconds: 6,
      description: 'Adjusting manual focus ring deliberately; showing reverence for the physical craft.',
      audioVisualCue: 'Tactile mechanical click sound.',
    },
    {
      shotNumber: 5,
      framing: 'Return to Medium Close-up',
      cameraMovement: 'Locked-off One Long Hold',
      durationSeconds: 12,
      description: 'Closing delivery. Reassuring, grounded conclusion without hard pitch.',
      audioVisualCue: 'Quiet background chord enters gently and fades.',
    },
  ] : [
    {
      shotNumber: 1,
      framing: 'Medium Close-up (50mm lens, eye-level)',
      cameraMovement: 'Locked-off Tripod',
      durationSeconds: 10,
      description: 'Speaker addressing founder dilemmas directly with open body language.',
      audioVisualCue: 'Crisp, broadcast-quality dry voice.',
    },
    {
      shotNumber: 2,
      framing: 'Wide Studio / Behind The Scenes',
      cameraMovement: 'Static Hold',
      durationSeconds: 8,
      description: '[How I Wait] Filmmaker sitting across from an executive, drinking coffee, waiting for natural posture.',
      audioVisualCue: 'Subtle ambient office presence.',
    },
    {
      shotNumber: 3,
      framing: 'Close-up on monitor review',
      cameraMovement: 'Slow push in',
      durationSeconds: 10,
      description: 'Color grading timeline displaying authentic documentary footage vs glossy ad.',
      audioVisualCue: 'Spoken breakdown of customer trust.',
    },
    {
      shotNumber: 4,
      framing: 'Return to Medium Close-up',
      cameraMovement: 'Locked-off One Long Hold',
      durationSeconds: 14,
      description: 'Direct call to action: focus on clarity, ditch teleprompters.',
      audioVisualCue: 'Closing thought, confident sign-off.',
    },
  ]

  // 4. 5-Slide Carousel Breakdown
  const carouselSlides: CarouselSlide[] = isCouples ? [
    {
      slideNumber: 1,
      headline: 'The 3 Audio Mistakes That Ruin Wedding Films',
      bodyText: 'Why 50% of your wedding movie is sound — and what happens when videographers rely on venue microphones.',
      visualCue: 'Minimalist dark backdrop with bold ivory typography and a subtle waveform icon.',
      layoutNote: 'High-contrast hook frame designed for feed thumb-stop.',
    },
    {
      slideNumber: 2,
      headline: 'Mistake 01: The Outdoor Wind Gamble',
      bodyText: 'Coastal and hilltop ceremonies are gorgeous, but a 15mph gust obliterates lapel microphones unless directional deadcat wind-screens and dual-channel backups are deployed.',
      visualCue: 'Side-by-side photograph showing bare mic capsule vs protected capsule.',
      layoutNote: 'Problem & technical solution pairing.',
    },
    {
      slideNumber: 3,
      headline: 'Mistake 02: Relying on the DJ Board Alone',
      bodyText: 'DJs optimize their audio for dance floors, which often peaks and distorts speech. A professional filmmaker places independent 32-bit float recorders directly on the officiant and groom.',
      visualCue: 'Diagram showing independent audio redundancy.',
      layoutNote: 'De-risking explanation for the client.',
    },
    {
      slideNumber: 4,
      headline: 'Mistake 03: The Unchecked Vows Whisper',
      bodyText: 'Couples almost always whisper their vows through tears. If gain stages aren’t monitored live, the most intimate promise of your life is buried in noise floor.',
      visualCue: 'Emotional silhouette photo of couple with audio monitor visual.',
      layoutNote: 'Emotional resonance grounded in craft truth.',
    },
    {
      slideNumber: 5,
      headline: 'Before You Sign a Contract: Ask This One Question',
      bodyText: '"What is your backup audio workflow if a recorder fails during our vows?" A true professional answers in 5 seconds.\n\nSave this checklist for your vendor meetings.',
      visualCue: 'Checklist badge with Save button callout.',
      layoutNote: 'Actionable client takeaway driving saves.',
    },
  ] : [
    {
      slideNumber: 1,
      headline: 'Why $25k Commercials Flop on Instagram',
      bodyText: 'The unspoken reason why glossy corporate commercials get scrolled past, while raw founder stories build multi-million dollar trust.',
      visualCue: 'Bold typography with split contrast background.',
      layoutNote: 'Pattern interrupt title frame.',
    },
    {
      slideNumber: 2,
      headline: 'The Gloss Trap: Perfection Feels Like Advertising',
      bodyText: 'When modern consumers see drone flyovers and actors smiling unnaturally, their brain categorizes it as "Sponsored Ad" within 0.4 seconds and swipes away.',
      visualCue: 'Retention curve chart showing drop-off on generic ads.',
      layoutNote: 'Psychological breakdown of the viewer.',
    },
    {
      slideNumber: 3,
      headline: 'The Power of "One Long Hold"',
      bodyText: 'Documentary pacing signals unhurried confidence. When you look into a lens and deliver value without frantic edits, you communicate that your company is stable and authoritative.',
      visualCue: 'Still frame from an executive documentary interview.',
      layoutNote: 'Articulating the craft methodology.',
    },
    {
      slideNumber: 4,
      headline: 'The 3 Pillars of High-Converting Video',
      bodyText: '1. Acknowledging the exact pain point your client felt this morning.\n2. Demonstrating practical proof without buzzwords.\n3. Zero hard pitch — inviting them to learn more.',
      visualCue: 'Three-tiered architectural pyramid diagram.',
      layoutNote: 'Strategic framework.',
    },
    {
      slideNumber: 5,
      headline: 'Stop Selling. Start Documenting.',
      bodyText: 'Your prospects want to see the people, the craft, and the standards behind your product.\n\nSave this framework for your Q3 brand planning.',
      visualCue: 'Save card and summary statement.',
      layoutNote: 'High save-rate ending.',
    },
  ]

  // 5. POV Overlay Spec
  const povSpec: PovOverlaySpec = isCouples ? {
    overlayText: 'POV: You hired a filmmaker who cares more about how the room felt than flashy transitions.',
    videoSetting: '7-second slow handheld or tripod shot: filmmaker waiting quietly beside ceremony arch, watching guests arrive with camera down, observing before shooting.',
    loopDurationSeconds: 7,
    captionHeadline: 'Why the quietest moments are the ones you end up rewatching 20 years later.',
    captionBody: `Most people assume wedding videography is about capturing the big checklist: the dress, the flowers, the cake cut, the first kiss.

And yes, those matter. But what you will actually look for when you are 50 years old sitting on the couch is the things you were too overwhelmed to see on the day.

How your mother held her hands together during the processional.
The way your groom closed his eyes for two seconds when the doors opened.
How your grandfather laughed at a toast from the back corner of the room.

We don't interrupt those moments. We don't ask people to repeat an emotional embrace because "the lighting was off". We learn how to wait, how to listen to the room, and how to hold a frame long enough for real life to happen.

If you are planning your wedding right now: make sure your video team knows how to be still.`,
    callToAction: 'Save this reminder when planning your wedding day timeline.',
  } : {
    overlayText: 'POV: You stopped spending $30k on glossy commercial ads and let your founder speak like a human.',
    videoSetting: '7-second atmospheric b-roll: coffee steaming beside camera monitor, founder laughing naturally off-camera before interview begins.',
    loopDurationSeconds: 7,
    captionHeadline: 'Why polished corporate perfection is killing your customer conversion.',
    captionBody: `For the last ten years, companies believed that looking "professional" meant spending $30,000 on studio lights, hair/makeup, and actors reciting scripted corporate manifestos.

Here is the problem: the modern consumer has developed an immune system against fake corporate perfection.

The moment a video looks like a television ad, people tune out. What actually moves contracts, closes enterprise deals, and attracts elite talent is truth.

When a founder sits down, speaks unhurriedly, explains the hard engineering problems they solved, and shares real domain knowledge without trying to sell you something every 15 seconds — trust is created instantly.

Video is the highest-leverage medium in business today, but only if you use it to show what is real.`,
    callToAction: 'Save this framework before your next video campaign.',
  }

  const caption = isCouples
    ? `${hookOptions[0]}\n\nHere is what 500+ hours behind a camera at weddings has taught me:\n\nThe real art of wedding videography isn't directing people — it's waiting for them to forget you're in the room.\n\nWhen we shoot a wedding, we don't ask you to pose or fake a smile. We hold the frame, watch the room, and let the real story breathe.\n\nSave this post for your wedding planning journey.`
    : `${hookOptions[0]}\n\nHere is the unedited truth about corporate video:\n\nYour clients don't want a perfume commercial. They want to know if you can solve their problem, and they want to see the human behind the company.\n\nWhen you stop memorizing scripts and speak with calm domain authority, your conversion jumps.\n\nSave this for your next executive content session.`

  const hashtags = isCouples
    ? ['#WeddingVideography', '#WeddingFilmmaker', '#CinematicWedding', '#WeddingPlanningTips', '#DocumentaryWedding', '#RealWeddingMoments']
    : ['#BusinessStorytelling', '#ExecutivePresence', '#FounderContent', '#VideoMarketingROI', '#Entrepreneurship', '#BrandDocumentary']

  const scriptResult: ContentScript = {
    id: `script-${Date.now()}`,
    ideaId: params.ideaId,
    title,
    audience,
    format,
    layer: 'middle',
    hookOptions,
    selectedHookIndex: 0,
    fullScript,
    pacingNotes: 'One Long Hold: 6-12s per shot. Natural micro-breaths. Avoid rapid zoom cuts. Let room audio breathe.',
    signaturePause: 'Hold 4s on [How I Wait] observational cut with ambient room acoustics.',
    shotList,
    carouselSlides,
    povSpec,
    caption,
    hashtags,
    createdAt: new Date().toISOString(),
  }

  // Save to memory store
  memoryStore.add({
    type: 'script',
    audience,
    content: `Script: "${title}" (${format} format for ${audience}). Hooks: ${hookOptions[0]}`,
    tags: [format, audience, 'script', 'middle-layer'],
  })

  return scriptResult
}

async function callLlmScriptGeneration(
  topic: string,
  format: ContentFormat,
  audience: TargetAudience,
  config: AppConfig,
): Promise<ContentScript | null> {
  const endpoint = config.apiBaseUrl || 'https://api.deepseek.com/v1/chat/completions'
  const prompt = `Write a complete Instagram content production package for an Entrepreneur & Video Creator who shoots and edits videos.
Audience: ${audience}
Format: ${format}
Topic: ${topic}
Inviolable Rules:
- Voice: Calm authority, craftsman, educator, no cheap or fake promises, never hard-sell, purely educate & fun.
- Style: "One Long Hold" cinematography, "how I wait" signature observational pause, natural room audio.
- Generate 5 distinct hooks, full script with stage directions [One Long Hold] and [How I Wait], 5-shot list, 5-slide carousel, POV overlay spec, and caption with hashtags.
Return strictly JSON matching ContentScript schema.`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are an elite short-form video director and scriptwriter.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) return null
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  const content = data.choices?.[0]?.message?.content
  if (!content) return null
  return JSON.parse(content)
}
