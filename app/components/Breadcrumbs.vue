<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol class="list">
      <li v-for="(crumb, index) in crumbs" :key="crumb.path" class="item">
        <NuxtLink v-if="index < crumbs.length - 1" :to="crumb.path" class="link">
          {{ crumb.label }}
        </NuxtLink>
        <span v-else class="current" aria-current="page">{{ crumb.label }}</span>
        <span v-if="index < crumbs.length - 1" class="separator" aria-hidden="true">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface Crumb {
  label: string
  path: string
}

defineProps<{
  crumbs: Crumb[]
}>()
</script>

<style scoped>
.breadcrumbs {
  font-family: var(--font);
  font-weight: 500;
  font-size: 18px;
}

.list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.link {
  color: inherit;
  text-decoration: none;
  opacity: 0.7;
}

.link:hover {
  opacity: 1;
  text-decoration: underline;
}

.current {
  opacity: 1;
}

.separator {
  opacity: 0.5;
}
</style>
