// Virtual Pet App - Tamagotchi-style pet

const STORAGE_KEY = 'dsh-virtual-pet';

// Default pet state
const defaultState = {
  name: '',
  hunger: 100,
  energy: 100,
  happiness: 100,
  cleanliness: 100,
  coins: 50,
  level: 1,
  xp: 0,
  xpToNext: 100,
  lastUpdate: Date.now(),
  isSleeping: false,
  sleepStartTime: 0,
};

// Pet sprites by mood
const sprites = {
  happy: '😸',
  normal: '🐱',
  hungry: '😺',
  tired: '😴',
  sad: '😿',
  dirty: '😾',
  eating: '😋',
  playing: '🤸',
  sleeping: '💤',
  clean: '✨',
};

const messages = {
  feed: [
    'Yum! 🍎', 'Delicious! 😋', 'Nom nom nom! 🍽️', 'Thanks for the snack! 🥰',
    'So tasty! 🤤', 'My favorite! 🍯', 'Mmm, yummy! 🍓'
  ],
  play: [
    'Wheee! 🎉', 'So fun! 🤸', 'Let\'s play more! 🎮', 'Haha! 😄',
    'Best game ever! 🏆', 'I\'m winning! 🥇', 'Play again! 🔄'
  ],
  sleep: [
    'Zzz... 💤', 'Good night... 🌙', 'Sweet dreams... ✨', 'So cozy... 🛌',
    'Zzz zzz... 😴', 'Sleeping... 💤', 'Night night... 🌟'
  ],
  wake: [
    'Good morning! ☀️', 'I\'m rested! ⚡', 'Ready to play! 🎯', 'Feeling great! ✨',
    'What\'s for breakfast? 🍳', 'New day! 🌈', 'Hi there! 👋'
  ],
  clean: [
    'So fresh! ✨', 'Sparkling clean! 🫧', 'Ahh, much better! 🛁', 'Clean as a whistle! 🎵',
    'No more dirt! 🚫', 'Shiny! ✨', 'Thanks! 🧼'
  ],
  treat: [
    'WOW! Special treat! 🍰', 'So sweet! 🍭', 'Best day ever! 🎂', 'Sugar rush! 🍬',
    'Thank you thank you! 🥹', 'My absolute favorite! 🍫', 'Incredible! 🌟'
  ],
  hungry: [
    'Hungry... 🍽️', 'Tummy rumbling... 😋', 'Feed me please! 🙏', 'So hungry... 😭',
    'Is it food time? 🕐', 'Need snacks! 🍪', 'Starving! 😫'
  ],
  tired: [
    'So sleepy... 😴', 'Need a nap... 🛌', 'Yawn... 🥱', 'Can\'t keep eyes open... 😪',
    'Bedtime? 🌙', 'Exhausted... 💤', 'Zzz... 😴'
  ],
  sad: [
    'Lonely... 😿', 'Need attention... 🥺', 'Feeling down... 💔', 'Play with me? 🎮',
    'So bored... 😔', 'Miss you... 💧', 'Cheer me up? 🌈'
  ],
  dirty: [
    'Ew, dirty... 😾', 'Need a bath! 🛁', 'Feeling grimy... 🤢', 'Clean me please! 🧼',
    'Yucky... 🤧', 'So messy... 😵', 'Shower time! 🚿'
  ],
  levelUp: [
    'LEVEL UP! 🎉✨', 'I grew stronger! 💪', 'New level achieved! 🏆', 'Amazing! ⭐',
    'Look at me go! 🚀', 'Level up! 🎊', 'So powerful now! ⚡'
  ]
};

class VirtualPet {
  constructor() {
    this.state = this.loadState();
    this.initElements();
    this.bindEvents();
    this.startGameLoop();
    this.updateUI();
    this.showMessage('Welcome back! 👋', 'info');
    if (this.state.name) {
      this.showMessage(`${this.state.name} says hi! 🐱`, 'info');
    }
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultState, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load pet state:', e);
    }
    return { ...defaultState };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save pet state:', e);
    }
  }

  initElements() {
    this.elements = {
      petName: document.getElementById('petName'),
      petSprite: document.getElementById('petSprite'),
      speechBubble: document.getElementById('speechBubble'),
      hungerFill: document.getElementById('hungerFill'),
      energyFill: document.getElementById('energyFill'),
      happinessFill: document.getElementById('happinessFill'),
      cleanFill: document.getElementById('cleanFill'),
      hungerValue: document.getElementById('hungerValue'),
      energyValue: document.getElementById('energyValue'),
      happinessValue: document.getElementById('happinessValue'),
      cleanValue: document.getElementById('cleanValue'),
      feedBtn: document.getElementById('feedBtn'),
      playBtn: document.getElementById('playBtn'),
      sleepBtn: document.getElementById('sleepBtn'),
      cleanBtn: document.getElementById('cleanBtn'),
      treatBtn: document.getElementById('treatBtn'),
      coins: document.getElementById('coins'),
      level: document.getElementById('level'),
      xp: document.getElementById('xp'),
      log: document.getElementById('log'),
    };
  }

  bindEvents() {
    this.elements.petName.addEventListener('click', () => this.renamePet());
    this.elements.feedBtn.addEventListener('click', () => this.feed());
    this.elements.playBtn.addEventListener('click', () => this.play());
    this.elements.sleepBtn.addEventListener('click', () => this.toggleSleep());
    this.elements.cleanBtn.addEventListener('click', () => this.clean());
    this.elements.treatBtn.addEventListener('click', () => this.treat());
  }

  renamePet() {
    const newName = prompt('What would you like to name your pet?', this.state.name);
    if (newName && newName.trim()) {
      this.state.name = newName.trim().slice(0, 16);
      this.saveState();
      this.updateUI();
      this.showMessage(`I'm ${this.state.name} now! 🎉`, 'success');
      this.animatePet('happy');
    }
  }

  updateUI() {
    const s = this.state;

    // Name
    this.elements.petName.textContent = s.name ? s.name : 'Name your pet!';

    // Stats
    this.elements.hungerFill.style.width = `${s.hunger}%`;
    this.elements.energyFill.style.width = `${s.energy}%`;
    this.elements.happinessFill.style.width = `${s.happiness}%`;
    this.elements.cleanFill.style.width = `${s.cleanliness}%`;

    this.elements.hungerValue.textContent = Math.round(s.hunger);
    this.elements.energyValue.textContent = Math.round(s.energy);
    this.elements.happinessValue.textContent = Math.round(s.happiness);
    this.elements.cleanValue.textContent = Math.round(s.cleanliness);

    // Currency & Level
    this.elements.coins.textContent = `🪙 ${s.coins}`;
    this.elements.level.textContent = `Level ${s.level}`;
    this.elements.xp.textContent = `XP: ${s.xp}/${s.xpToNext}`;

    // Buttons
    this.elements.feedBtn.disabled = s.coins < 5 || s.isSleeping;
    this.elements.playBtn.disabled = s.coins < 10 || s.isSleeping;
    this.elements.cleanBtn.disabled = s.coins < 3 || s.isSleeping;
    this.elements.treatBtn.disabled = s.coins < 15 || s.isSleeping;
    this.elements.sleepBtn.textContent = s.isSleeping ? '☀️ Wake Up' : '😴 Sleep';

    // Pet sprite based on state
    this.updatePetSprite();
  }

  updatePetSprite() {
    const s = this.state;
    const sprite = this.elements.petSprite;

    // Remove all animation classes
    sprite.classList.remove('eating', 'playing', 'sleeping', 'happy');

    if (s.isSleeping) {
      sprite.textContent = sprites.sleeping;
      sprite.classList.add('sleeping');
    } else if (s.hunger <= 20) {
      sprite.textContent = sprites.hungry;
    } else if (s.energy <= 20) {
      sprite.textContent = sprites.tired;
    } else if (s.cleanliness <= 20) {
      sprite.textContent = sprites.dirty;
    } else if (s.happiness <= 20) {
      sprite.textContent = sprites.sad;
    } else if (s.happiness >= 80 && s.hunger >= 60 && s.energy >= 60) {
      sprite.textContent = sprites.happy;
    } else {
      sprite.textContent = sprites.normal;
    }
  }

  animatePet(type) {
    const sprite = this.elements.petSprite;
    sprite.classList.remove('eating', 'playing', 'sleeping', 'happy');
    void sprite.offsetWidth; // Force reflow
    sprite.classList.add(type);
    setTimeout(() => sprite.classList.remove(type), 800);
  }

  showMessage(text, type = 'info') {
    const bubble = this.elements.speechBubble;
    bubble.textContent = text;
    bubble.style.animation = 'none';
    void bubble.offsetWidth;
    bubble.style.animation = 'bubblePop 2.5s ease-out forwards';
  }

  addLog(text, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    this.elements.log.insertBefore(entry, this.elements.log.firstChild);

    // Keep only last 50 entries
    while (this.elements.log.children.length > 50) {
      this.elements.log.removeChild(this.elements.log.lastChild);
    }
  }

  gainXP(amount) {
    this.state.xp += amount;
    this.addLog(`Gained ${amount} XP!`, 'success');

    while (this.state.xp >= this.state.xpToNext) {
      this.state.xp -= this.state.xpToNext;
      this.state.level++;
      this.state.xpToNext = Math.floor(this.state.xpToNext * 1.5);
      this.state.coins += this.state.level * 10;
      this.showMessage(randomChoice(messages.levelUp), 'success');
      this.addLog(`Level up! Now level ${this.state.level}!`, 'success');
      this.animatePet('happy');
    }
  }

  // Actions
  feed() {
    if (this.state.coins < 5 || this.state.isSleeping) return;
    this.state.coins -= 5;
    this.state.hunger = Math.min(100, this.state.hunger + 30);
    this.state.happiness = Math.min(100, this.state.happiness + 5);
    this.gainXP(5);
    this.saveState();
    this.updateUI();
    this.animatePet('eating');
    this.elements.petSprite.textContent = sprites.eating;
    this.showMessage(randomChoice(messages.feed), 'success');
    this.addLog('Fed the pet (+30 hunger, +5 happiness)', 'success');
  }

  play() {
    if (this.state.coins < 10 || this.state.isSleeping) return;
    this.state.coins -= 10;
    this.state.happiness = Math.min(100, this.state.happiness + 25);
    this.state.energy = Math.max(0, this.state.energy - 15);
    this.state.hunger = Math.max(0, this.state.hunger - 10);
    this.gainXP(10);
    this.saveState();
    this.updateUI();
    this.animatePet('playing');
    this.elements.petSprite.textContent = sprites.playing;
    this.showMessage(randomChoice(messages.play), 'success');
    this.addLog('Played with pet (+25 happiness, -15 energy, -10 hunger)', 'success');
  }

  toggleSleep() {
    if (this.state.isSleeping) {
      // Wake up
      this.state.isSleeping = false;
      const sleepDuration = (Date.now() - this.state.sleepStartTime) / 1000;
      const energyGained = Math.min(100, Math.floor(sleepDuration * 2));
      this.state.energy = Math.min(100, this.state.energy + energyGained);
      this.state.hunger = Math.max(0, this.state.hunger - Math.floor(sleepDuration * 0.5));
      this.saveState();
      this.updateUI();
      this.showMessage(randomChoice(messages.wake), 'success');
      this.addLog(`Woke up! Gained ${energyGained} energy`, 'success');
    } else {
      // Go to sleep
      if (this.state.energy >= 95) {
        this.showMessage('Not tired yet! 😊', 'info');
        return;
      }
      this.state.isSleeping = true;
      this.state.sleepStartTime = Date.now();
      this.saveState();
      this.updateUI();
      this.showMessage(randomChoice(messages.sleep), 'info');
      this.addLog('Went to sleep... 💤', 'info');
    }
  }

  clean() {
    if (this.state.coins < 3 || this.state.isSleeping) return;
    this.state.coins -= 3;
    this.state.cleanliness = 100;
    this.state.happiness = Math.min(100, this.state.happiness + 10);
    this.gainXP(3);
    this.saveState();
    this.updateUI();
    this.animatePet('happy');
    this.elements.petSprite.textContent = sprites.clean;
    this.showMessage(randomChoice(messages.clean), 'success');
    this.addLog('Cleaned the pet! (+100 cleanliness, +10 happiness)', 'success');
  }

  treat() {
    if (this.state.coins < 15 || this.state.isSleeping) return;
    this.state.coins -= 15;
    this.state.happiness = Math.min(100, this.state.happiness + 40);
    this.state.hunger = Math.min(100, this.state.hunger + 15);
    this.gainXP(20);
    this.saveState();
    this.updateUI();
    this.animatePet('happy');
    this.elements.petSprite.textContent = sprites.happy;
    this.showMessage(randomChoice(messages.treat), 'success');
    this.addLog('Gave a treat! (+40 happiness, +15 hunger, +20 XP)', 'success');
  }

  // Game loop - decay stats over time
  startGameLoop() {
    setInterval(() => this.tick(), 30000); // Every 30 seconds
  }

  tick() {
    if (this.state.isSleeping) return; // Stats don't decay while sleeping

    const now = Date.now();
    const hoursPassed = (now - this.state.lastUpdate) / (1000 * 60 * 60);

    if (hoursPassed < 0.01) return; // Less than ~36 seconds

    // Decay rates per hour
    this.state.hunger = Math.max(0, this.state.hunger - 8 * hoursPassed);
    this.state.energy = Math.max(0, this.state.energy - 5 * hoursPassed);
    this.state.happiness = Math.max(0, this.state.happiness - 3 * hoursPassed);
    this.state.cleanliness = Math.max(0, this.state.cleanliness - 4 * hoursPassed);

    this.state.lastUpdate = now;
    this.saveState();
    this.updateUI();
    this.checkMood();
  }

  checkMood() {
    const s = this.state;
    if (!s.isSleeping) {
      if (s.hunger <= 15) this.showMessage(randomChoice(messages.hungry), 'warning');
      else if (s.energy <= 15) this.showMessage(randomChoice(messages.tired), 'warning');
      else if (s.cleanliness <= 15) this.showMessage(randomChoice(messages.dirty), 'warning');
      else if (s.happiness <= 15) this.showMessage(randomChoice(messages.sad), 'warning');
    }
  }
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.pet = new VirtualPet();
});

// Export for potential Browserbase integration
export { VirtualPet };