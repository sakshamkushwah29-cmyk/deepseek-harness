---
name: agent-memory
description: Long-term and episodic memory management for content agents inspired by TencentDB Agent Memory. Preserves creator preferences, past hooks, audience reactions, and tone guidelines across sessions.
---

# Agent Memory Architecture

Inspired by TencentDB Agent Memory, this skill enables content creation agents to maintain continuous context across sessions.

## Key Capabilities
1. **Episodic Memory**: Remembers past ideas generated, hooks used, and scripts produced so repetitions are avoided.
2. **Preference Memory**: Maintains creator constraints (e.g. "one long hold" pacing, "never post cheap promises", "no hard sells").
3. **Audience Persona Cache**: Stores evolving insights into what couples and business owners respond to.
4. **Negative Filtering**: Active blacklists of prohibited clichés and sales jargon.

## Memory Schema
- `id`: string
- `type`: 'idea' | 'script' | 'feedback' | 'rule'
- `audience`: 'couples' | 'business' | 'general'
- `content`: string
- `tags`: string[]
- `timestamp`: ISO date string
