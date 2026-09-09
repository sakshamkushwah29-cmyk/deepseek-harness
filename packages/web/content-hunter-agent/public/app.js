// Content Hunter Agent Client Controller
document.addEventListener('DOMContentLoaded', () => {
  let currentAudience = 'all';
  let currentIdeas = [];
  let currentScript = null;
  let activeFormatView = 'view-talking-head';

  // DOM Elements
  const tabs = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const ideasList = document.getElementById('ideasList');
  const huntInput = document.getElementById('huntTopicInput');
  const triggerHuntBtn = document.getElementById('triggerHuntBtn');
  const quickHuntBtn = document.getElementById('quickHuntBtn');
  const audienceChips = document.querySelectorAll('#audienceFilterGroup .btn-chip');

  // Script View Elements
  const scriptTitle = document.getElementById('scriptTitleDisplay');
  const scriptAudienceBadge = document.getElementById('scriptAudienceBadge');
  const scriptFormatBadge = document.getElementById('scriptFormatBadge');
  const scriptPacingDisplay = document.getElementById('scriptPacingDisplay');
  const hooksContainer = document.getElementById('hooksOptionsContainer');
  const fullScriptDisplay = document.getElementById('fullScriptDisplay');
  const shotListBody = document.getElementById('shotListBody');
  const carouselContainer = document.getElementById('carouselContainer');
  const povContainer = document.getElementById('povContainer');
  const captionEditor = document.getElementById('captionEditor');
  const hashtagCloud = document.getElementById('hashtagCloud');

  // Settings Modal Elements
  const settingsModal = document.getElementById('settingsModal');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const apiBaseUrlInput = document.getElementById('apiBaseUrlInput');
  const modelInput = document.getElementById('modelInput');
  const providerSelect = document.getElementById('providerSelect');
  const statusBadge = document.getElementById('connectionStatusBadge');
  const statusText = document.getElementById('connectionStatusText');

  // Toast
  const toast = document.getElementById('appToast');
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // TAB SWITCHING
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId)?.classList.add('active');

      if (targetId === 'tab-week') loadWeeklyPlan();
      if (targetId === 'tab-memory') loadMemories();
      if (targetId === 'tab-graph') loadSkillGraphTree();
    });
  });

  // AUDIENCE FILTER CHIPS
  audienceChips.forEach(chip => {
    chip.addEventListener('click', () => {
      audienceChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentAudience = chip.getAttribute('data-val') || 'all';
      huntIdeas();
    });
  });

  // FORMAT SUB-VIEW CHIPS (Talking Head vs Carousel vs POV)
  const viewChips = document.querySelectorAll('.format-view-selector .view-chip');
  const formatPanes = document.querySelectorAll('.format-view-pane');
  viewChips.forEach(chip => {
    chip.addEventListener('click', () => {
      viewChips.forEach(c => c.classList.remove('active'));
      formatPanes.forEach(p => p.classList.remove('active'));
      chip.classList.add('active');
      activeFormatView = chip.getAttribute('data-view');
      document.getElementById(activeFormatView)?.classList.add('active');
    });
  });

  // FETCH & RENDER IDEAS
  async function huntIdeas() {
    ideasList.innerHTML = '<div class="text-muted" style="grid-column: 1/-1; padding: 40px; text-align: center;">⚡ Hunting high-trust topic angles across wedding & business archives...</div>';
    try {
      const res = await fetch('/api/hunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audience: currentAudience,
          focusAngle: huntInput.value.trim()
        })
      });
      const data = await res.json();
      currentIdeas = data.ideas || [];
      renderIdeas(currentIdeas);
    } catch (err) {
      console.error(err);
      ideasList.innerHTML = '<div class="text-muted" style="grid-column: 1/-1; padding: 40px; text-align: center;">Error hunting ideas. Please try again.</div>';
    }
  }

  function renderIdeas(ideas) {
    if (!ideas || ideas.length === 0) {
      ideasList.innerHTML = '<div class="text-muted" style="grid-column: 1/-1; padding: 40px; text-align: center;">No ideas found for this query.</div>';
      return;
    }

    ideasList.innerHTML = ideas.map(idea => {
      const audienceBadgeClass = idea.audience === 'couples' ? 'pill-gold' : 'pill-purple';
      const audienceLabel = idea.audience === 'couples' ? '💍 Wedding Couples' : (idea.audience === 'business' ? '🏢 Business Owners' : '🌟 Hybrid');
      const formatIcon = idea.recommendedFormat === 'reel' ? '🎥 Reel' : (idea.recommendedFormat === 'carousel' ? '📑 Carousel' : '👁️ POV Overlay');

      return `
        <div class="idea-card">
          <div>
            <div class="idea-card-header">
              <span class="pill ${audienceBadgeClass}">${audienceLabel}</span>
              <span class="score-badge">🔥 ${idea.resonanceScore}% Trust Score</span>
            </div>
            <h3 class="idea-title">${idea.title}</h3>
            <div class="idea-angle">⚡ ${idea.angle}</div>
            <p class="idea-rationale">${idea.whyItBuildsTrust}</p>
            <div class="idea-tags">
              ${idea.tags.map(t => `<span class="tag-item">#${t}</span>`).join('')}
            </div>
          </div>
          <div class="idea-card-footer">
            <span class="pill pill-cyan">${formatIcon}</span>
            <button class="btn btn-primary btn-xs" onclick="window.selectAndGenerate('${idea.id}')">
              Draft Script & Visuals →
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // GLOBAL GENERATION HANDLER
  window.selectAndGenerate = async function(ideaId) {
    const idea = currentIdeas.find(i => i.id === ideaId);
    showToast('Drafting full production package...');
    
    // Switch to Production tab
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="tab-production"]')?.classList.add('active');
    document.getElementById('tab-production')?.classList.add('active');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: idea?.id,
          topic: idea?.title,
          format: idea?.recommendedFormat || 'reel',
          audience: idea?.audience || 'couples'
        })
      });
      const data = await res.json();
      if (data.script) {
        currentScript = data.script;
        renderScript(currentScript);
        showToast('Production script ready!');
      }
    } catch (err) {
      console.error(err);
      showToast('Error generating script');
    }
  };

  // RENDER SCRIPT IN PRODUCTION SUITE
  function renderScript(script) {
    if (!script) return;

    scriptTitle.textContent = script.title;
    scriptAudienceBadge.textContent = script.audience === 'couples' ? '💍 Wedding Couples' : '🏢 Business Owners';
    scriptFormatBadge.textContent = script.format.toUpperCase();
    scriptPacingDisplay.textContent = script.pacingNotes;

    // 5 Hooks List
    hooksContainer.innerHTML = script.hookOptions.map((hook, idx) => `
      <div class="hook-item ${idx === script.selectedHookIndex ? 'selected' : ''}" onclick="window.selectHook(${idx})">
        <div class="hook-radio"></div>
        <div class="hook-text">"${hook}"</div>
        <button class="btn-xs hook-copy-btn" onclick="event.stopPropagation(); window.copyText('${escapeQuotes(hook)}', 'Hook copied!')">Copy</button>
      </div>
    `).join('');

    // Teleprompter Full Script
    let formattedScript = script.fullScript
      .replace(/\[Visual: (.*?)\]/g, '<span class="cue-badge">🎬 $1</span>')
      .replace(/\[Camera: (.*?)\]/g, '<span class="cue-badge">🎥 $1</span>')
      .replace(/\[Signature Beat: How I Wait\]/g, '<span class="pause-badge">⏳ SIGNATURE BEAT: HOW I WAIT</span>')
      .replace(/\[Pause: (.*?)\]/g, '<span class="pause-badge">⏱️ PAUSE: $1</span>')
      .replace(/\[Takeaway\]/g, '<span class="cue-badge">💡 CORE TAKEAWAY</span>');

    fullScriptDisplay.innerHTML = formattedScript;

    // Shot List Table
    shotListBody.innerHTML = script.shotList.map(shot => `
      <tr>
        <td><strong>0${shot.shotNumber}</strong></td>
        <td><span class="text-cyan">${shot.framing}</span></td>
        <td>${shot.cameraMovement}</td>
        <td><span class="pill pill-gold">${shot.durationSeconds}s</span></td>
        <td>${shot.description}</td>
        <td><em class="text-muted">${shot.audioVisualCue}</em></td>
      </tr>
    `).join('');

    // Carousel Slides
    if (script.carouselSlides && script.carouselSlides.length > 0) {
      carouselContainer.innerHTML = script.carouselSlides.map(slide => `
        <div class="slide-card">
          <div>
            <div class="slide-number">Slide 0${slide.slideNumber} of 05</div>
            <div class="slide-headline">${slide.headline}</div>
            <div class="slide-body">${slide.bodyText}</div>
          </div>
          <div class="slide-visual-note">
            📸 <strong>Visual Cue:</strong> ${slide.visualCue}
          </div>
        </div>
      `).join('');
    }

    // POV Spec
    if (script.povSpec) {
      povContainer.innerHTML = `
        <div class="pov-overlay-visual">
          <div class="pill pill-cyan mb-2">7-Second Looping Video Preview</div>
          <div class="pov-text">"${script.povSpec.overlayText}"</div>
          <div class="text-muted small mt-2">Setting: ${script.povSpec.videoSetting}</div>
        </div>
        <div class="pov-details-grid">
          <div>
            <h4 class="text-cyan mb-1">Headline Hook:</h4>
            <p>${script.povSpec.captionHeadline}</p>
          </div>
          <div>
            <h4 class="text-gold mb-1">Call to Action:</h4>
            <p>${script.povSpec.callToAction}</p>
          </div>
        </div>
      `;
    }

    // Caption & Hashtags
    captionEditor.value = script.caption;
    hashtagCloud.innerHTML = script.hashtags.map(h => `<span class="hashtag-pill">${h}</span>`).join('');
  }

  window.selectHook = function(index) {
    if (!currentScript) return;
    currentScript.selectedHookIndex = index;
    renderScript(currentScript);
    showToast(`Selected Hook #0${index + 1}`);
  };

  // 5-DAY WEEKLY TRUST GRID
  async function loadWeeklyPlan() {
    const container = document.getElementById('weekGridContainer');
    container.innerHTML = '<div class="text-muted" style="grid-column: 1/-1; padding: 40px; text-align: center;">⚡ Assembling 5-day trust matrix via SwarmForge...</div>';

    try {
      const res = await fetch('/api/weekly-plan');
      const data = await res.json();
      const plan = data.plan || [];

      container.innerHTML = plan.map(item => {
        const audLabel = item.audience === 'couples' ? '💍 Couples' : '🏢 Business';
        const audPill = item.audience === 'couples' ? 'pill-gold' : 'pill-purple';
        const fmtLabel = item.format === 'reel' ? '🎥 Talking Head Reel' : (item.format === 'carousel' ? '📑 5-Slide Carousel' : '👁️ POV Overlay');

        return `
          <div class="week-day-card">
            <div>
              <div class="day-name">${item.day}</div>
              <div class="day-meta">
                <span class="pill ${audPill}">${audLabel}</span>
                <span class="pill pill-cyan">${fmtLabel}</span>
              </div>
              <div class="day-topic">${item.topic}</div>
            </div>
            <button class="btn btn-outline btn-xs mt-3 full-width" onclick='window.loadWeekItem(${JSON.stringify(item.script || {})})'>
              Open Production Package →
            </button>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div class="text-muted">Failed to load weekly schedule.</div>';
    }
  }

  window.loadWeekItem = function(script) {
    if (!script || !script.title) return;
    currentScript = script;
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="tab-production"]')?.classList.add('active');
    document.getElementById('tab-production')?.classList.add('active');
    renderScript(currentScript);
    showToast(`Loaded ${script.title}`);
  };

  // REGENERATE WEEK
  document.getElementById('regenerateWeekBtn')?.addEventListener('click', async () => {
    showToast('Regenerating 5-Day Trust Cadence...');
    await loadWeeklyPlan();
    showToast('New weekly matrix ready!');
  });

  // EXPORT WEEK TO MARKDOWN
  document.getElementById('exportWeekMdBtn')?.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/weekly-plan');
      const data = await res.json();
      const plan = data.plan || [];
      let md = `# Weekly 5-Post Instagram Production Plan (Middle Layer / Trust)\n\n`;
      plan.forEach(item => {
        md += `## ${item.day} | ${item.topic}\n`;
        md += `- **Audience**: ${item.audience}\n`;
        md += `- **Format**: ${item.format}\n`;
        md += `- **Layer**: Middle (Trust)\n\n`;
        if (item.script) {
          md += `### Hook\n> ${item.script.hookOptions[0]}\n\n`;
          md += `### Pacing\n${item.script.pacingNotes}\n\n`;
          md += `### Caption\n\`\`\`\n${item.script.caption}\n\`\`\`\n\n---\n\n`;
        }
      });
      navigator.clipboard.writeText(md);
      showToast('Weekly Plan copied as Markdown!');
    } catch (err) {
      console.error(err);
      showToast('Export failed');
    }
  });

  // MEMORY & SWARM
  async function loadMemories() {
    const container = document.getElementById('memoryTimeline');
    container.innerHTML = '<div class="text-muted">Loading agent memories...</div>';
    try {
      const res = await fetch('/api/memory');
      const data = await res.json();
      const memories = data.memories || [];
      document.getElementById('memoryCount').textContent = `${memories.length} Active`;

      container.innerHTML = memories.map(m => `
        <div class="memory-card">
          <div class="memory-header">
            <span class="pill ${m.type === 'blacklist' ? 'pill-purple' : 'pill-gold'}">${m.type.toUpperCase()}</span>
            <span class="text-dim small">${new Date(m.timestamp).toLocaleTimeString()}</span>
          </div>
          <p class="memory-content">${m.content}</p>
          <div class="idea-tags mt-2">
            ${m.tags.map(t => `<span class="tag-item">#${t}</span>`).join('')}
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.error(err);
    }
  }

  // SKILL GRAPH TREE EXPLORER
  async function loadSkillGraphTree() {
    const treeContainer = document.getElementById('graphTree');
    try {
      const res = await fetch('/api/skill-graph');
      const data = await res.json();
      const tree = data.tree || {};

      let html = `<div class="graph-section-title">Root</div>`;
      html += (tree.root || []).map(f => `<button class="graph-file-btn" onclick="window.viewDoc('root', '${f}')">📄 ${f}</button>`).join('');

      for (const section of ['platforms', 'voice', 'engine', 'audience']) {
        if (tree[section]) {
          html += `<div class="graph-section-title">${section}</div>`;
          html += tree[section].map(f => `<button class="graph-file-btn" onclick="window.viewDoc('${section}', '${f}')">📄 ${f}</button>`).join('');
        }
      }

      treeContainer.innerHTML = html;
      // Load initial index.md
      window.viewDoc('root', 'index.md');
    } catch (err) {
      console.error(err);
    }
  }

  window.viewDoc = async function(section, name) {
    document.querySelectorAll('.graph-file-btn').forEach(b => b.classList.remove('active'));
    event?.target?.classList?.add('active');

    document.getElementById('currentDocPath').textContent = `content-skill-graph/${section === 'root' ? '' : section + '/'}${name}`;
    try {
      const res = await fetch(`/api/skill-graph/${section}/${name}`);
      const data = await res.json();
      document.getElementById('markdownViewer').textContent = data.content || 'Document empty.';
    } catch (err) {
      console.error(err);
    }
  };

  // COPY HELPERS
  window.copyText = function(text, toastMsg = 'Copied!') {
    navigator.clipboard.writeText(text);
    showToast(toastMsg);
  };

  document.getElementById('copyScriptBtn')?.addEventListener('click', () => {
    if (currentScript) window.copyText(currentScript.fullScript, 'Script copied to clipboard!');
  });

  document.getElementById('copyShotListBtn')?.addEventListener('click', () => {
    if (!currentScript) return;
    const txt = currentScript.shotList.map(s => `Shot ${s.shotNumber}: ${s.framing} | ${s.cameraMovement} (${s.durationSeconds}s) - ${s.description}`).join('\n');
    window.copyText(txt, 'Shot list copied!');
  });

  document.getElementById('copyCaptionBtn')?.addEventListener('click', () => {
    window.copyText(captionEditor.value, 'Caption copied!');
  });

  // QUICK FORMAT SWITCHERS
  document.getElementById('switchReelBtn')?.addEventListener('click', () => {
    if (!currentScript) return;
    selectAndGenerateDirect(currentScript.title, 'reel', currentScript.audience);
  });
  document.getElementById('switchCarouselBtn')?.addEventListener('click', () => {
    if (!currentScript) return;
    selectAndGenerateDirect(currentScript.title, 'carousel', currentScript.audience);
  });
  document.getElementById('switchPovBtn')?.addEventListener('click', () => {
    if (!currentScript) return;
    selectAndGenerateDirect(currentScript.title, 'pov', currentScript.audience);
  });

  async function selectAndGenerateDirect(title, format, audience) {
    showToast(`Converting to ${format.toUpperCase()}...`);
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: title, format, audience })
    });
    const data = await res.json();
    if (data.script) {
      currentScript = data.script;
      renderScript(currentScript);
      showToast(`Ready as ${format.toUpperCase()}!`);
    }
  }

  // SETTINGS MODAL
  async function loadConfig() {
    try {
      const res = await fetch('/api/config');
      const cfg = await res.json();
      if (cfg.hasApiKey) {
        statusBadge.style.borderColor = 'rgba(0, 240, 255, 0.4)';
        statusBadge.style.background = 'rgba(0, 240, 255, 0.1)';
        statusBadge.style.color = '#00f0ff';
        statusText.textContent = `DeepSeek Live (${cfg.model})`;
      } else {
        statusText.textContent = 'Local Knowledge Engine';
      }
      if (cfg.apiBaseUrl) apiBaseUrlInput.value = cfg.apiBaseUrl;
      if (cfg.model) modelInput.value = cfg.model;
      if (cfg.activeProvider) providerSelect.value = cfg.activeProvider;
    } catch (err) {
      console.error(err);
    }
  }

  openSettingsBtn?.addEventListener('click', () => settingsModal.classList.add('open'));
  closeSettingsBtn?.addEventListener('click', () => settingsModal.classList.remove('open'));
  cancelSettingsBtn?.addEventListener('click', () => settingsModal.classList.remove('open'));

  saveSettingsBtn?.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const apiBaseUrl = apiBaseUrlInput.value.trim();
    const model = modelInput.value.trim();
    const activeProvider = providerSelect.value;

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, apiBaseUrl, model, activeProvider })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Settings saved!');
        settingsModal.classList.remove('open');
        loadConfig();
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving settings');
    }
  });

  // SEARCH / HUNT TRIGGER
  triggerHuntBtn?.addEventListener('click', huntIdeas);
  quickHuntBtn?.addEventListener('click', huntIdeas);
  huntInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') huntIdeas();
  });

  // HELPER: ESCAPE
  function escapeQuotes(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  // INITIAL BOOT
  loadConfig();
  huntIdeas();
  // Pre-load a default script for instant display
  window.selectAndGenerate('idea-w-1');
});
