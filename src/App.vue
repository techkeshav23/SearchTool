<template>
  <div class="app" :class="{ 'dark-mode': isDarkMode }">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="logo-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          SearchTool
        </h1>
        
        <!-- Dark mode toggle -->
        <button 
          class="theme-toggle"
          @click="toggleDarkMode"
          :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <Transition name="rotate" mode="out-in">
            <svg v-if="isDarkMode" key="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg v-else key="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </Transition>
        </button>
      </div>
    </header>
    
    <!-- Main content -->
    <main class="app-main">
      <div class="container">
        <!-- Search section -->
        <section class="search-section">
          <SearchBar
            v-model="searchQuery"
            :is-loading="isLoading"
            @search="handleSearch"
            @clear="handleClear"
          />
        </section>
        
        <!-- Results section -->
        <section class="results-section">
          <SearchResultList
            :results="results"
            :search-query="searchQuery"
            :total-results="totalResults"
            :is-loading="isLoading"
            :is-loading-more="isLoadingMore"
            :has-more="hasMore"
            @load-more="handleLoadMore"
            @item-expand="handleItemExpand"
            @item-action="handleItemAction"
          />
        </section>
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="app-footer">
      <p>Built with Vue.js • Saras Finance Assignment</p>
    </footer>
    
    <!-- Toast notification -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script>
import { searchAPI } from './services/api';
import SearchBar from './components/SearchBar.vue';
import SearchResultList from './components/SearchResultList.vue';

/**
 * Main App Component
 * Orchestrates the search functionality with state management
 */
export default {
  name: 'App',
  components: {
    SearchBar,
    SearchResultList
  },
  data() {
    return {
      // Search state
      searchQuery: '',
      results: [],
      totalResults: 0,
      currentPage: 1,
      pageSize: 5,
      hasMore: false,
      
      // Loading states
      isLoading: false,
      isLoadingMore: false,
      
      // UI state
      isDarkMode: false,
      
      // Toast notification
      toast: {
        show: false,
        message: '',
        type: 'info'
      }
    };
  },
  methods: {
    /**
     * Handle search query changes
     * Called after debounce from SearchBar
     */
    async handleSearch(query) {
      if (!query || query.trim() === '') {
        this.results = [];
        this.totalResults = 0;
        this.hasMore = false;
        return;
      }
      
      this.isLoading = true;
      this.currentPage = 1;
      
      try {
        const response = await searchAPI(query, 1, this.pageSize);
        this.results = response.results;
        this.totalResults = response.total;
        this.hasMore = response.hasMore;
      } catch (error) {
        console.error('Search error:', error);
        this.showToast('Failed to fetch results. Please try again.', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Handle clear search
     */
    handleClear() {
      this.searchQuery = '';
      this.results = [];
      this.totalResults = 0;
      this.hasMore = false;
      this.currentPage = 1;
    },
    
    /**
     * Load more results (pagination)
     */
    async handleLoadMore() {
      if (this.isLoadingMore || !this.hasMore) return;
      
      this.isLoadingMore = true;
      
      try {
        const nextPage = this.currentPage + 1;
        const response = await searchAPI(this.searchQuery, nextPage, this.pageSize);
        
        // Append new results
        this.results = [...this.results, ...response.results];
        this.currentPage = nextPage;
        this.hasMore = response.hasMore;
      } catch (error) {
        console.error('Load more error:', error);
        this.showToast('Failed to load more results.', 'error');
      } finally {
        this.isLoadingMore = false;
      }
    },
    
    /**
     * Handle item expansion
     */
    handleItemExpand({ item, expanded }) {
      // Could track analytics or update state
      console.log(`Item ${item.id} ${expanded ? 'expanded' : 'collapsed'}`);
    },
    
    /**
     * Handle item actions (read more, save, share)
     */
    handleItemAction({ action, item }) {
      switch (action) {
        case 'read-more':
          this.showToast(`Opening "${item.title}"...`, 'info');
          break;
        case 'save':
          this.showToast(`Saved "${item.title}" to your library`, 'success');
          break;
        case 'share':
          this.handleShare(item);
          break;
      }
    },
    
    /**
     * Handle share functionality
     */
    async handleShare(item) {
      const shareData = {
        title: item.title,
        text: item.snippet,
        url: window.location.href
      };
      
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          if (error.name !== 'AbortError') {
            this.copyToClipboard(item);
          }
        }
      } else {
        this.copyToClipboard(item);
      }
    },
    
    /**
     * Copy item info to clipboard
     */
    copyToClipboard(item) {
      const text = `${item.title}\n${item.snippet}`;
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Link copied to clipboard!', 'success');
      }).catch(() => {
        this.showToast('Failed to copy link', 'error');
      });
    },
    
    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('darkMode', this.isDarkMode);
      document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    },
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
      this.toast = { show: true, message, type };
      
      setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    },
    
    /**
     * Initialize dark mode from localStorage or system preference
     */
    initDarkMode() {
      const savedPreference = localStorage.getItem('darkMode');
      
      if (savedPreference !== null) {
        this.isDarkMode = savedPreference === 'true';
      } else {
        // Check system preference
        this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    }
  },
  mounted() {
    this.initDarkMode();
  }
}
</script>

<style>
/* CSS Variables for theming */
:root {
  --primary-color: #6366f1;
  --primary-hover: #4f46e5;
  --primary-glow: rgba(99, 102, 241, 0.2);
  --secondary-color: #8b5cf6;
  --accent-color: #a78bfa;
  
  --bg-primary: #ffffff;
  --bg-secondary: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  --bg-tertiary: #f0f0f0;
  
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-tertiary: #94a3b8;
  --text-placeholder: #cbd5e1;
  
  --input-bg: rgba(255, 255, 255, 0.8);
  --input-bg-focus: #ffffff;
  --input-border: rgba(0, 0, 0, 0.08);
  --input-border-hover: rgba(0, 0, 0, 0.15);
  
  --card-bg: rgba(255, 255, 255, 0.9);
  --card-border: rgba(0, 0, 0, 0.06);
  --card-border-hover: rgba(99, 102, 241, 0.3);
  --card-shadow: rgba(0, 0, 0, 0.04);
  --card-shadow-hover: rgba(99, 102, 241, 0.15);
  
  --button-bg: #f1f5f9;
  --button-bg-hover: #e2e8f0;
  
  --kbd-bg: #f1f5f9;
  --kbd-border: #e2e8f0;
  
  --divider-color: rgba(0, 0, 0, 0.06);
  --empty-icon-bg: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  
  --highlight-bg: #fef3c7;
  --highlight-text: #92400e;
  
  --warning-bg: #fef3c7;
  --warning-color: #d97706;
  
  --success-color: #10b981;
  --error-color: #ef4444;
  
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.5);
}

/* Dark mode variables */
.dark-mode {
  --bg-primary: #0f172a;
  --bg-secondary: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  --bg-tertiary: #1e293b;
  
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;
  --text-placeholder: #475569;
  
  --input-bg: rgba(30, 41, 59, 0.8);
  --input-bg-focus: #1e293b;
  --input-border: rgba(255, 255, 255, 0.08);
  --input-border-hover: rgba(255, 255, 255, 0.15);
  
  --card-bg: rgba(30, 41, 59, 0.8);
  --card-border: rgba(255, 255, 255, 0.06);
  --card-border-hover: rgba(139, 92, 246, 0.4);
  --card-shadow: rgba(0, 0, 0, 0.3);
  --card-shadow-hover: rgba(139, 92, 246, 0.2);
  
  --button-bg: #1e293b;
  --button-bg-hover: #334155;
  
  --kbd-bg: #1e293b;
  --kbd-border: #334155;
  
  --divider-color: rgba(255, 255, 255, 0.06);
  --empty-icon-bg: linear-gradient(135deg, #1e293b 0%, #312e81 100%);
  
  --highlight-bg: rgba(251, 191, 36, 0.2);
  --highlight-text: #fbbf24;
  
  --warning-bg: rgba(251, 191, 36, 0.2);
  --warning-color: #fbbf24;
  
  --glass-bg: rgba(15, 23, 42, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
}

/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: var(--bg-secondary);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 100vh;
  transition: background 0.4s ease, color 0.3s ease;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--text-tertiary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* Selection */
::selection {
  background: var(--primary-color);
  color: white;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  transition: background 0.4s ease;
  position: relative;
}

/* Decorative background elements */
.app::before {
  content: '';
  position: fixed;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.app::after {
  content: '';
  position: fixed;
  bottom: -50%;
  left: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

/* Header */
.app-header {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.header-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: var(--primary-color);
  filter: drop-shadow(0 2px 4px var(--primary-glow));
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  background: var(--button-bg);
  border: 1px solid var(--divider-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.theme-toggle::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.theme-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--card-shadow-hover);
}

.theme-toggle:hover::before {
  opacity: 0.1;
}

.theme-toggle:active {
  transform: translateY(0) scale(0.95);
}

.theme-toggle svg {
  width: 20px;
  height: 20px;
  color: var(--text-primary);
  position: relative;
  z-index: 1;
}

/* Main content */
.app-main {
  flex: 1;
  padding: 3rem 1.5rem;
  position: relative;
  z-index: 1;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.search-section {
  margin-bottom: 2.5rem;
}

.results-section {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 
    0 4px 6px -1px var(--card-shadow),
    0 10px 20px -5px var(--card-shadow),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

/* Footer */
.app-footer {
  padding: 2rem;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.85rem;
  border-top: 1px solid var(--divider-color);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.app-footer p {
  opacity: 0.8;
}

/* Toast notification */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 1.75rem;
  background: var(--text-primary);
  color: var(--bg-primary);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.2),
    0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toast::before {
  content: '✓';
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 0.7rem;
}

.toast.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.toast.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.toast.error::before {
  content: '✕';
}

.toast.info::before {
  content: 'ℹ';
}

/* Theme toggle transition */
.rotate-enter-active,
.rotate-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.rotate-enter-from {
  opacity: 0;
  transform: rotate(-180deg) scale(0);
}

.rotate-leave-to {
  opacity: 0;
  transform: rotate(180deg) scale(0);
}

/* Toast transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, 100px) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px) scale(0.9);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    padding: 0.875rem 1.25rem;
  }
  
  .app-title {
    font-size: 1.25rem;
  }
  
  .logo-icon {
    width: 26px;
    height: 26px;
  }
  
  .theme-toggle {
    width: 40px;
    height: 40px;
  }
  
  .app-main {
    padding: 1.5rem 1rem;
  }
  
  .results-section {
    padding: 1.25rem;
    border-radius: 16px;
  }
  
  .app::before,
  .app::after {
    display: none;
  }
}

@media (max-width: 480px) {
  .search-section {
    margin-bottom: 1.5rem;
  }
  
  .results-section {
    padding: 1rem;
    border-radius: 12px;
  }
}
</style>
