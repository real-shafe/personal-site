<template>
  <NuxtPage />
</template>

<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'en' },
  titleTemplate: (t?: string) => (t && t !== 'Shafe' ? `${t} | Shafe` : 'Shafe'),
  meta: [{ name: 'theme-color', content: '#1E2A5A' }],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&display=swap',
    },
  ],
})
</script>

<style>
:root {
  --ink: #1E2A5A;
  --ink-muted: #AAB4DC;
  --paper: #FCFCF8;
  --red: #E0353B;
  --blue-rule: #C9D7EF;
  --text: #1A1D33;
  --muted: #5B6280;
  --font: 'Bricolage Grotesque', 'Avenir Next', 'Segoe UI', system-ui, sans-serif;
}

html,
body,
#__nuxt {
  min-height: 100%;
}

html {
  background: var(--ink);
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

body {
  margin: 0;
  background: var(--ink);
  color: var(--paper);
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}
</style>
