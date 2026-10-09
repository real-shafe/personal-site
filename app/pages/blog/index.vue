<template>
  <main class="blog">
    <div class="content">
      <Breadcrumbs :crumbs="[
        { label: 'home', path: '/' },
        { label: 'blog', path: '/blog' }
      ]" />
      <h1 class="title">blog</h1>
      <ul class="list">
        <li><NuxtLink class="link" to="/blog/yet-another-anki-appreciation-post">Yet Another Anki Appreciation Post</NuxtLink></li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
.blog {
  --bg: var(--ink);
  --fg: var(--paper);

  min-height: 100vh;
  background: var(--bg);
  color: var(--fg);
}

.content {
  padding: 70px 40px;
}

.title {
  margin: 24px 0 40px 0;
  font-family: var(--font);
  font-weight: 800;
  font-size: 72px;
  line-height: 1;
}

.list {
  margin: 0;
  padding: 0;
  list-style: square;
}

.link {
  font-family: var(--font);
  font-weight: 600;
  font-size: 56px;
  line-height: 1.05;
  color: inherit;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
  text-decoration-thickness: 6px;
  text-underline-offset: 10px;
}

@media (max-width: 900px) {
  .content {
    padding: 24px;
  }

  .title {
    font-size: 56px;
  }

  .link {
    font-size: 44px;
  }
}
</style>
