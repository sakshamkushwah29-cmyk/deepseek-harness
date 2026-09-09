import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { MemoryEntry, TargetAudience } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '../data');
const MEMORY_FILE = join(DATA_DIR, 'memory.json');

const DEFAULT_MEMORIES: MemoryEntry[] = [
  {
    id: 'rule-identity',
    timestamp: new Date().toISOString(),
    type: 'rule',
    content: 'Creator is an Entrepreneur who shoots and edits videos. The external one-line reputation is: "Wedding content creator and entrepreneur".',
    tags: ['identity', 'positioning']
  },
  {
    id: 'rule-anti-hype',
    timestamp: new Date().toISOString(),
    type: 'blacklist',
    content: 'NEVER post cheap or fake promises. No quick-buck viral hacks, no hard sales pitches. Strictly educate, spread knowledge, and share fun.',
    tags: ['integrity', 'anti-hype']
  },
  {
    id: 'rule-pacing',
    timestamp: new Date().toISOString(),
    type: 'rule',
    content: 'Cinematography style is "One Long Hold". Zero frantic cuts. Steady camera, intentional pauses, natural room audio, and real breathing room.',
    tags: ['cinematography', 'pacing']
  },
  {
    id: 'rule-signature-beat',
    timestamp: new Date().toISOString(),
    type: 'rule',
    content: 'Must incorporate the signature [How I Wait] beat: showing quiet observation, waiting for raw unposed moments to naturally emerge.',
    tags: ['craft', 'signature']
  },
  {
    id: 'rule-schedule-middle-layer',
    timestamp: new Date().toISOString(),
    type: 'rule',
    content: 'Weekly production goal: 5 posts per week focused primarily on the Middle Layer (Trust & Authority) for wedding couples and business owners.',
    tags: ['schedule', 'funnel']
  }
];

export class MemoryStore {
  private memories: MemoryEntry[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
      }
      if (existsSync(MEMORY_FILE)) {
        const raw = readFileSync(MEMORY_FILE, 'utf-8');
        this.memories = JSON.parse(raw);
      } else {
        this.memories = [...DEFAULT_MEMORIES];
        this.save();
      }
    } catch (err) {
      console.error('Failed to load memory, using defaults:', err);
      this.memories = [...DEFAULT_MEMORIES];
    }
  }

  private save(): void {
    try {
      if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
      }
      writeFileSync(MEMORY_FILE, JSON.stringify(this.memories, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save memories to disk:', err);
    }
  }

  public getAll(): MemoryEntry[] {
    return [...this.memories];
  }

  public add(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): MemoryEntry {
    const item: MemoryEntry = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.memories.unshift(item);
    this.save();
    return item;
  }

  public getRules(): string[] {
    return this.memories
      .filter(m => m.type === 'rule' || m.type === 'blacklist')
      .map(m => m.content);
  }

  public getRecentIdeas(limit = 10): string[] {
    return this.memories
      .filter(m => m.type === 'idea')
      .slice(0, limit)
      .map(m => m.content);
  }

  public search(query: string): MemoryEntry[] {
    const q = query.toLowerCase();
    return this.memories.filter(m => 
      m.content.toLowerCase().includes(q) || 
      m.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  public getStats() {
    return {
      total: this.memories.length,
      rules: this.memories.filter(m => m.type === 'rule').length,
      blacklists: this.memories.filter(m => m.type === 'blacklist').length,
      ideas: this.memories.filter(m => m.type === 'idea').length,
      scripts: this.memories.filter(m => m.type === 'script').length
    };
  }
}

export const memoryStore = new MemoryStore();
