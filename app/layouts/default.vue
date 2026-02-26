<script setup>
import mainData from '~/data/main.json'
</script>

<template>
  <div>
    <slot />
    <ClientOnly>
      <TopButton :aria-label="mainData.topButton?.ariaLabel" />
    </ClientOnly>
  </div>
</template>
