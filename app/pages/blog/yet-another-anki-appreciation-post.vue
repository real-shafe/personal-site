<template>
  <main class="post">
    <div class="content">
      <Breadcrumbs :crumbs="[
        { label: 'home', path: '/' },
        { label: 'blog', path: '/blog' },
        { label: 'Yet Another Anki Appreciation Post', path: '/blog/yet-another-anki-appreciation-post' }
      ]" />
    </div>
    <article>
      <h1>Yet Another Anki Appreciation Post</h1>

      <p>
        I have a particular approach to learning that I'm a bit of an evangelist for. The downside of this approach is that it requires a small daily commitment (5-15 minutes), the upside is that the info you learn you retain basically forever (it's also 100% free).
      </p>

      <p>
        This approach is built around a technique called <a href="https://en.wikipedia.org/wiki/Spaced_repetition" target="_blank">spaced repetition</a>, where the idea is basically that you use Q&amp;A flashcards that continually reappear to you over time — each time you answer correctly the reappearance interval lengthens.
      </p>

      <p>
        The "calculating the reappearance interval" part of spaced repetition is not something anyone wants to do manually — fortunately we have computers. There are various applications out there for spaced repetition. I use the (100% free) software <a href="https://apps.ankiweb.net/" target="_blank">Anki</a> for my flashcards.
      </p>

      <h2>What Makes a Good Flashcard</h2>

      <p>For this technique to work you need to have good flashcards. There are 2 basic qualities of a good flashcard:</p>

      <ol>
        <li><strong>Atomicity</strong> — a flashcard asks exactly one thing</li>
        <li><strong>Zero ambiguity</strong> — a flashcard has exactly one correct answer</li>
      </ol>

      <p>
        Spaced repetition has something of a community around it, and <a href="https://controlaltbackspace.org/precise/" target="_blank">much has been written</a> about how to make good flashcards.
      </p>

      <h2>Using LLMs to Vet Flashcards</h2>

      <p>
        The spaced repetition technique has been around for a while, but I think that LLMs offer a helpful advancement to the practice. I typically don't use LLMs to <em>make</em> flashcards: for one, they really suck at it; and two, creating the flashcards is a fundamental part of the learning process. However, LLMs can be good at <em>vetting</em> flashcards. I have a template prompt I give to Claude for most of my flashcard drafts:
      </p>

      <pre><code>Is this a good flashcard?

front: What is the typical purpose of port 8080?
back: Alternative to port 80 for HTTP

These are the qualities of a good flashcard:
- Correct: The question is coherent and the answer is correct.
- Atomic: Each card should test only one fact or idea.
- Unambiguous: The question should have exactly one possible interpretation and exactly one answer.
- Concise: The front and back should be as short as possible.
- Active Recall: The front should require you to actively retrieve knowledge, not just recognize it.
- Bad Note Types: The card should not be True/False or multi-choice.</code></pre>

      <h2>Building the Habit</h2>

      <p>
        It doesn't take long to get started with spaced repetition, but I think the big thing is the daily habit. If you miss a few days you can end up with a large backlog of flashcards. So it works best if you can find some daily "review time", maybe at the start of your day. I think about my Anki reviews like I think about going to the gym — this is my habit for keeping my brain fit.
      </p>
    </article>
  </main>
</template>

<style scoped>
.post {
  --bg: var(--ink);
  --fg: var(--paper);

  min-height: 100vh;
  background: var(--bg);
  color: var(--fg);
}

.content {
  padding: 70px 40px 0 40px;
}

article {
  max-width: 800px;
  padding: 40px;
  font-family: var(--font);
  font-weight: 400;
  font-size: 18px;
  line-height: 1.6;
}

article h1 {
  font-size: 48px;
  font-weight: 800;
  margin: 0 0 40px 0;
  line-height: 1.1;
}

article h2 {
  font-size: 32px;
  font-weight: 700;
  margin: 48px 0 24px 0;
}

article p {
  margin: 0 0 24px 0;
}

article a {
  color: inherit;
}

article ol,
article ul {
  margin: 0 0 24px 0;
  padding-left: 24px;
}

article li {
  margin-bottom: 8px;
}

article pre {
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  overflow-x: auto;
  border-radius: 4px;
  margin: 0 0 24px 0;
}

article code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 14px;
}

@media (max-width: 900px) {
  .content {
    padding: 24px 24px 0 24px;
  }

  article {
    padding: 24px;
  }

  article h1 {
    font-size: 36px;
  }

  article h2 {
    font-size: 24px;
  }
}
</style>
