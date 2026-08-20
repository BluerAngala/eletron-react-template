<template>
  <button
    v-if="showSidebarBtn"
    class="docs-toggle docs-toggle-sidebar"
    :class="{ collapsed: sidebarCollapsed }"
    :title="sidebarCollapsed ? '展开目录' : '折叠目录'"
    aria-label="折叠或展开左侧目录"
    @click="toggleSidebar"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg>
  </button>

  <button
    v-if="showAsideBtn"
    class="docs-toggle docs-toggle-aside"
    :class="{ collapsed: asideCollapsed }"
    :title="asideCollapsed ? '展开大纲' : '折叠大纲'"
    aria-label="折叠或展开右侧大纲"
    @click="toggleAside"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/></svg>
  </button>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()

const sidebarCollapsed = ref(false)
const asideCollapsed = ref(false)
const isDesktop = ref(false)
const isWide = ref(false)
const hasAside = ref(false)

const showSidebarBtn = computed(() => isDesktop.value)
const showAsideBtn = computed(() => isWide.value && hasAside.value)

function onResize() {
  isDesktop.value = window.innerWidth >= 960
  isWide.value = window.innerWidth >= 1280
}

function apply() {
  const html = document.documentElement
  html.classList.toggle('docs-sidebar-collapsed', sidebarCollapsed.value)
  html.classList.toggle('docs-aside-collapsed', asideCollapsed.value)
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('docs.sidebarCollapsed', sidebarCollapsed.value ? '1' : '0')
  apply()
}

function toggleAside() {
  asideCollapsed.value = !asideCollapsed.value
  localStorage.setItem('docs.asideCollapsed', asideCollapsed.value ? '1' : '0')
  apply()
}

watch(
  () => route.path,
  () => {
    // 路由切换后检测当前页是否有右侧大纲
    requestAnimationFrame(() => {
      hasAside.value = !!document.querySelector('.VPDocAside')
    })
  },
  { immediate: true }
)

onMounted(() => {
  sidebarCollapsed.value = localStorage.getItem('docs.sidebarCollapsed') === '1'
  asideCollapsed.value = localStorage.getItem('docs.asideCollapsed') === '1'
  isDesktop.value = window.innerWidth >= 960
  isWide.value = window.innerWidth >= 1280
  apply()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>
