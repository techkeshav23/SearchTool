<template>
  <div class="app" :class="{ 'dark-mode': isDarkMode }">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="app-title">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="logo-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
            <span class="title-text">SearchTool</span>
          </h1>
        </div>
        
        <div class="header-right">
          <!-- Dark mode toggle -->
          <button 
            class="theme-toggle"
            @click="toggleDarkMode"
            :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
            :title="isDarkMode ? 'Light mode' : 'Dark mode'"
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
  --primary-color: #2d3748;
  --primary-hover: #1a202c;
  --primary-glow: rgba(45, 55, 72, 0.1);
  --secondary-color: #4a5568;
  --accent-color: #718096;
  
  --bg-primary: #ffffff;
  --bg-secondary: #f7f7f7;
  --bg-tertiary: #edf2f7;
  
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
  --text-tertiary: #718096;
  --text-placeholder: #a0aec0;
  
  --input-bg: #ffffff;
  --input-bg-focus: #ffffff;
  --input-border: #e2e8f0;
  --input-border-hover: #cbd5e0;
  
  --card-bg: #ffffff;
  --card-border: #e2e8f0;
  --card-border-hover: #cbd5e0;
  --card-shadow: rgba(0, 0, 0, 0.05);
  --card-shadow-hover: rgba(0, 0, 0, 0.1);
  
  --button-bg: #edf2f7;
  --button-bg-hover: #e2e8f0;
  
  /* Primary button in light mode */
  --primary-button-bg: #2d3748;
  --primary-button-text: #ffffff;
  --primary-button-hover: #1a202c;
  
  --kbd-bg: #edf2f7;
  --kbd-border: #e2e8f0;
  
  --divider-color: #e2e8f0;
  --empty-icon-bg: #edf2f7;
  
  --highlight-bg: #fef3c7;
  --highlight-text: #92400e;
  
  --warning-bg: #fef3c7;
  --warning-color: #d97706;
  
  --success-color: #10b981;
  --error-color: #ef4444;
  
  --glass-bg: #ffffff;
  --glass-border: #e2e8f0;
  
  /* Header styles for light mode */
  --header-bg: #ffffff;
  --header-border: #e2e8f0;
  --header-shadow: rgba(0, 0, 0, 0.05);
  --header-title: #1a202c;
  --header-title-gradient: #1a202c;
  --header-logo: #2d3748;
  --header-logo-glow: transparent;
  --header-toggle-bg: #edf2f7;
  --header-toggle-border: #e2e8f0;
  --header-toggle-hover: #e2e8f0;
  --header-toggle-icon: #4a5568;
}

/* Dark mode variables */
.dark-mode {
  --primary-color: #f7fafc;
  --primary-hover: #ffffff;
  --primary-glow: rgba(247, 250, 252, 0.15);
  --secondary-color: #e2e8f0;
  --accent-color: #cbd5e0;
  
  --bg-primary: #1a202c;
  --bg-secondary: #171923;
  --bg-tertiary: #2d3748;
  
  --text-primary: #f7fafc;
  --text-secondary: #a0aec0;
  --text-tertiary: #718096;
  --text-placeholder: #4a5568;
  
  --input-bg: #2d3748;
  --input-bg-focus: #2d3748;
  --input-border: #4a5568;
  --input-border-hover: #718096;
  
  --card-bg: #2d3748;
  --card-border: #4a5568;
  --card-border-hover: #718096;
  --card-shadow: rgba(0, 0, 0, 0.3);
  --card-shadow-hover: rgba(0, 0, 0, 0.4);
  
  --button-bg: #4a5568;
  --button-bg-hover: #718096;
  
  /* Primary button in dark mode - use contrasting colors */
  --primary-button-bg: #f7fafc;
  --primary-button-text: #1a202c;
  --primary-button-hover: #e2e8f0;
  
  --kbd-bg: #4a5568;
  --kbd-border: #718096;
  
  --divider-color: #4a5568;
  --empty-icon-bg: #2d3748;
  
  --highlight-bg: rgba(251, 191, 36, 0.2);
  --highlight-text: #fbbf24;
  
  --warning-bg: rgba(251, 191, 36, 0.2);
  --warning-color: #fbbf24;
  
  --glass-bg: #2d3748;
  --glass-border: #4a5568;
  
  /* Header styles for dark mode */
  --header-bg: #1a202c;
  --header-border: #4a5568;
  --header-shadow: rgba(0, 0, 0, 0.3);
  --header-title: #f7fafc;
  --header-title-gradient: #f7fafc;
  --header-logo: #f7fafc;
  --header-logo-glow: transparent;
  --header-toggle-bg: #4a5568;
  --header-toggle-border: #718096;
  --header-toggle-hover: #718096;
  --header-toggle-icon: #f7fafc;
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
  transition: background 0.3s ease;
  position: relative;
  overflow-x: hidden;
}

/* Header */
.app-header {
  background: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 20px var(--header-shadow);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.header-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.875rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--header-title);
  margin: 0;
  letter-spacing: -0.01em;
}

.title-text {
  background: var(--header-title-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-icon {
  width: 28px;
  height: 28px;
  color: var(--header-logo);
  transition: color 0.3s ease;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: var(--header-toggle-bg);
  border: 1px solid var(--header-toggle-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: var(--header-toggle-hover);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-toggle svg {
  width: 20px;
  height: 20px;
  color: var(--header-toggle-icon);
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
}

/* Main content */
.app-main {
  flex: 1;
  padding: 3rem 2rem;
  padding-top: calc(70px + 2rem); /* Account for fixed header height */
  position: relative;
  z-index: 1;
  width: 100%;
}

.container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

.search-section {
  margin-bottom: 2.5rem;
  width: 100%;
}

.results-section {
  width: 100%;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 2.5rem;
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
  background: #10b981;
  color: white;
}

.toast.error {
  background: #ef4444;
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
    padding: 0.75rem 1rem;
  }
  
  .app-title {
    font-size: 1.125rem;
  }
  
  .logo-icon {
    width: 24px;
    height: 24px;
  }
  
  .theme-toggle {
    width: 36px;
    height: 36px;
  }
  
  .theme-toggle svg {
    width: 18px;
    height: 18px;
  }
  
  .app-main {
    padding: 1.5rem 1rem;
    padding-top: calc(56px + 1.5rem);
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
