<template>
  <main class="home">
    <section ref="hero" class="hero">
      <canvas ref="canvas" class="field" aria-hidden="true"></canvas>
      <h1 class="srOnly">Shafe</h1>
      <div class="intro">
        <p class="lede">
          I'm Shafe. I build study tools, train tiny language models and make
          small games.
        </p>
        <nav class="links" aria-label="Primary">
          <a class="link" href="#projects">Projects</a>
          <NuxtLink class="link" to="/blog">Blog</NuxtLink>
          <a class="link" href="https://github.com/real-shafe" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </div>
      <p class="hint" aria-hidden="true">Move over the cards, or tap to flip them</p>
    </section>

    <section id="projects" class="card" aria-labelledby="projects-title">
      <div class="cardInner">
        <h2 id="projects-title" class="cardTitle">Projects</h2>
        <ul class="projects">
          <li v-for="p in projects" :key="p.name" class="project">
            <a
              class="projectLink"
              :href="p.href"
              :target="p.internal ? undefined : '_blank'"
              :rel="p.internal ? undefined : 'noopener noreferrer'"
            >
              <span class="projectName">{{ p.name }}</span>
              <span class="projectKind">{{ p.kind }}</span>
            </a>
            <p class="projectText">{{ p.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <footer class="foot">
      <p>
        Latest writing:
        <NuxtLink class="footLink" to="/blog/yet-another-anki-appreciation-post">Yet another Anki appreciation post</NuxtLink>
      </p>
      <p>
        Code on <a class="footLink" href="https://github.com/real-shafe" target="_blank" rel="noopener noreferrer">GitHub</a>
      </p>
    </footer>
  </main>
</template>

<script setup lang="ts">
useHead({ title: 'Shafe' })
useSeoMeta({
  description: 'Shafe builds study tools, trains tiny language models and makes small games.',
  ogTitle: 'Shafe',
  ogDescription: 'Study tools, tiny language models and small games.',
})

const projects = [
  { name: 'Weasel Run', kind: 'Browser game', href: '/weasel-run', internal: true,
    text: 'An endless one-button platformer. A weasel in a red bandana runs through four biomes, bops beetles and grabs coins.' },
  { name: 'tiny_llm', kind: 'Python, PyTorch', href: 'https://github.com/real-shafe/tiny_llm',
    text: 'A small GPT trained from scratch on the TinyStories dataset, built up step by step from a bigram baseline.' },
  { name: 'wordle_llm', kind: 'Python, PyTorch', href: 'https://github.com/real-shafe/wordle_llm',
    text: 'A small model trained on a laptop to play Wordle.' },
  { name: 'anki_to_vec', kind: 'Python', href: 'https://github.com/real-shafe/anki_to_vec',
    text: 'Turns Anki cards into vector embeddings and clusters them into topics.' },
  { name: 'Spanish conjugation decks', kind: 'Python, Anki', href: 'https://github.com/real-shafe/spanish-conjugation-anki',
    text: 'Builds Spanish verb conjugation flashcards for Anki, with generated example sentences and audio.' },
  { name: 'Qode', kind: 'Anki add-on', href: 'https://github.com/real-shafe/Anki-Qode-Add-On',
    text: 'Marks up parts of a flashcard as code.' },
  { name: 'Obscurdle', kind: 'React Native', href: 'https://github.com/real-shafe/obscurdle',
    text: 'A vocabulary flashcard game. Tap to reveal a word’s definition, tap again for the next word.' },
  { name: 'Newton force law sim', kind: 'Python', href: 'https://github.com/real-shafe/newton-force-law-sim',
    text: 'A spring-mass physics simulation with swappable forces, integrators and collision rules.' },
]

const canvas = ref<HTMLCanvasElement | null>(null)
const hero = ref<HTMLElement | null>(null)
let field: { stop: () => void } | null = null

onMounted(async () => {
  if (!canvas.value || !hero.value) return
  try {
    // served as a static file, so keep the bundler from trying to resolve it
    const url = '/js/card-field.js'
    const mod = await import(/* @vite-ignore */ url)
    field = await mod.start(canvas.value, { word: 'shafe', eventTarget: hero.value })
  } catch (e) {
    console.warn('Card field could not start', e)
    hero.value.classList.add('noGl')
  }
})

onBeforeUnmount(() => field?.stop())
</script>

<style scoped>
.home {
  background: var(--ink);
  color: var(--paper);
}

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.hero {
  position: relative;
  height: 100vh;
  height: 100svh;
  min-height: 520px;
  overflow: hidden;
  touch-action: pan-y;
}

.field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.hero.noGl::before {
  content: 'shafe';
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-stretch: 75%;
  font-size: clamp(96px, 24vw, 340px);
  color: var(--paper);
}

.intro {
  position: absolute;
  left: clamp(20px, 5vw, 64px);
  right: clamp(20px, 5vw, 64px);
  bottom: clamp(28px, 7vh, 72px);
  max-width: 34rem;
}

.lede {
  margin: 0 0 18px;
  font-size: clamp(20px, 2.4vw, 28px);
  line-height: 1.3;
  font-weight: 500;
  text-wrap: balance;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.link {
  color: var(--paper);
  text-decoration: none;
  font-weight: 600;
  font-size: 17px;
  padding: 8px 16px;
  border: 2px solid var(--paper);
  border-radius: 999px;
  transition: background-color 0.15s, color 0.15s;
}

.link:hover,
.link:focus-visible {
  background: var(--paper);
  color: var(--ink);
}

.link:focus-visible,
.projectLink:focus-visible,
.footLink:focus-visible {
  outline: 3px solid var(--red);
  outline-offset: 3px;
}

.hint {
  position: absolute;
  top: clamp(20px, 4vh, 36px);
  right: clamp(20px, 5vw, 64px);
  margin: 0;
  font-size: 14px;
  color: var(--ink-muted);
}

/* the projects list is one big index card */
.card {
  position: relative;
  margin: 0 clamp(12px, 3vw, 40px);
  background: var(--paper);
  color: var(--text);
  border-radius: 6px;
  box-shadow: 0 30px 60px rgba(8, 12, 40, 0.45);
}

.cardInner {
  padding: 40px clamp(20px, 5vw, 64px) 56px;
}

.cardTitle {
  margin: 0 0 32px;
  padding-bottom: 14px;
  font-size: clamp(40px, 6vw, 64px);
  line-height: 1;
  font-weight: 800;
  font-stretch: 80%;
  border-bottom: 4px solid var(--red);
  margin-left: calc(-1 * clamp(20px, 5vw, 64px));
  margin-right: calc(-1 * clamp(20px, 5vw, 64px));
  padding-left: clamp(20px, 5vw, 64px);
}

.projects {
  max-width: 52rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.project {
  padding: 18px 0 20px;
  border-bottom: 2px solid var(--blue-rule);
}

.project:last-child {
  border-bottom: 0;
}

.projectLink {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  color: inherit;
  text-decoration: none;
}

.projectName {
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 700;
  line-height: 1.15;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-decoration-thickness: 3px;
  text-underline-offset: 5px;
  transition: text-decoration-color 0.15s;
}

.projectLink:hover .projectName {
  text-decoration-color: var(--red);
}

.projectKind {
  font-size: 15px;
  color: var(--muted);
}

.projectText {
  margin: 6px 0 0;
  max-width: 40rem;
  font-size: 18px;
  line-height: 1.5;
  color: var(--text);
}

.foot {
  padding: 48px clamp(20px, 5vw, 64px) 64px;
  font-size: 17px;
  color: var(--ink-muted);
}

.foot p {
  margin: 0 0 6px;
}

.footLink {
  color: var(--paper);
}

@media (max-width: 640px) {
  .hint {
    left: 20px;
    right: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .link,
  .projectName {
    transition: none;
  }
}
</style>
