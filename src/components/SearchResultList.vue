<template>
  <div class="search-result-list">
    <!-- Results count header -->
    <Transition name="fade">
      <div v-if="results.length > 0 && !isLoading" class="results-header">
        <span class="results-count">
          {{ totalResults }} result{{ totalResults !== 1 ? 's' : '' }} found
          <span v-if="searchQuery">for "{{ searchQuery }}"</span>
        </span>
      </div>
    </Transition>
    
    <!-- Loading state -->
    <Transition name="fade" mode="out-in">
      <div v-if="isLoading" class="loading-state">
        <Loader message="Searching..." />
      </div>
      
      <!-- Empty state - no query -->
      <div v-else-if="!searchQuery" class="empty-state initial">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
        </div>
        <h3>Start your search</h3>
        <p>Type something in the search bar above to find articles, tutorials, and more.</p>
      </div>
      
      <!-- Empty state - no results -->
      <div v-else-if="results.length === 0" class="empty-state no-results">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="15" x2="16" y2="15"></line>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </div>
        <h3>No results found</h3>
        <p>We couldn't find anything matching "{{ searchQuery }}". Try different keywords.</p>
      </div>
      
      <!-- Results list -->
      <div v-else class="results-container">
        <TransitionGroup name="list" tag="div" class="results-list">
          <SearchResultItem
            v-for="(item, index) in results"
            :key="item.id"
            :item="item"
            :search-query="searchQuery"
            :index="index"
            :style="{ '--index': index }"
            @expand="handleExpand"
            @read-more="handleReadMore"
            @save="handleSave"
            @share="handleShare"
          />
        </TransitionGroup>
        
        <!-- Load more / Pagination -->
        <div v-if="hasMore" class="load-more-container">
          <button 
            class="load-more-button"
            :disabled="isLoadingMore"
            @click="loadMore"
          >
            <Loader v-if="isLoadingMore" :size="16" :inline="true" />
            <span v-else>Load More Results</span>
          </button>
        </div>
        
        <!-- Scroll to top -->
        <Transition name="fade">
          <button 
            v-if="showScrollTop"
            class="scroll-top-button"
            @click="scrollToTop"
            aria-label="Scroll to top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script>
import SearchResultItem from './SearchResultItem.vue';
import Loader from './Loader.vue';

/**
 * SearchResultList Component
 * Container for search results with loading states, pagination, and empty states
 */
export default {
  name: 'SearchResultList',
  components: {
    SearchResultItem,
    Loader
  },
  props: {
    // Array of search results
    results: {
      type: Array,
      default: () => []
    },
    // Current search query
    searchQuery: {
      type: String,
      default: ''
    },
    // Total number of results (for pagination info)
    totalResults: {
      type: Number,
      default: 0
    },
    // Loading state
    isLoading: {
      type: Boolean,
      default: false
    },
    // Loading more results
    isLoadingMore: {
      type: Boolean,
      default: false
    },
    // Whether more results are available
    hasMore: {
      type: Boolean,
      default: false
    }
  },
  emits: ['load-more', 'item-expand', 'item-action'],
  data() {
    return {
      showScrollTop: false
    };
  },
  methods: {
    /**
     * Emit event to load more results
     */
    loadMore() {
      this.$emit('load-more');
    },
    
    /**
     * Handle item expansion
     */
    handleExpand(data) {
      this.$emit('item-expand', data);
    },
    
    /**
     * Handle read more action
     */
    handleReadMore(item) {
      this.$emit('item-action', { action: 'read-more', item });
    },
    
    /**
     * Handle save action
     */
    handleSave(item) {
      this.$emit('item-action', { action: 'save', item });
    },
    
    /**
     * Handle share action
     */
    handleShare(item) {
      this.$emit('item-action', { action: 'share', item });
    },
    
    /**
     * Scroll to top of the page
     */
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    
    /**
     * Handle scroll to show/hide scroll-to-top button
     */
    handleScroll() {
      this.showScrollTop = window.scrollY > 300;
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}
</script>

<style scoped>
.search-result-list {
  width: 100%;
  min-height: 300px;
  max-width: 100%;
}

.results-header {
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed var(--divider-color, rgba(0, 0, 0, 0.08));
}

.results-count {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary, #64748b);
}

.results-count span {
  font-weight: 700;
  color: var(--primary-color, #6366f1);
}

/* Loading state */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

/* Empty states */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-icon {
  width: 100px;
  height: 100px;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--empty-icon-bg, linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%));
  border-radius: 50%;
  position: relative;
}

.empty-icon::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px dashed var(--divider-color, rgba(0, 0, 0, 0.1));
  animation: spin 20s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-icon svg {
  width: 100%;
  height: 100%;
  color: var(--text-tertiary, #94a3b8);
}

.empty-state h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
  letter-spacing: -0.02em;
}

.empty-state p {
  margin: 0;
  max-width: 320px;
  font-size: 0.95rem;
  color: var(--text-secondary, #64748b);
  line-height: 1.6;
}

.empty-state.no-results .empty-icon {
  background: var(--warning-bg, linear-gradient(135deg, #fef3c7 0%, #fde68a 100%));
}

.empty-state.no-results .empty-icon svg {
  color: var(--warning-color, #d97706);
}

/* Results list */
.results-container {
  position: relative;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

/* Load more */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
}

.load-more-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  min-width: 200px;
  padding: 0.875rem 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary-color, #2d3748);
  background: transparent;
  border: 2px solid var(--primary-color, #2d3748);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-button:hover:not(:disabled) {
  color: white;
  background: var(--primary-color, #2d3748);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.load-more-button:active:not(:disabled) {
  transform: translateY(-1px);
}

.load-more-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Scroll to top button */
.scroll-top-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color, #2d3748);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
}

.scroll-top-button:hover {
  transform: translateY(-4px);
  background: var(--primary-hover, #1a202c);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.scroll-top-button:active {
  transform: translateY(-2px) scale(1);
}

.scroll-top-button svg {
  width: 24px;
  height: 24px;
}

/* List transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.list-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Fade transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
  .empty-state {
    padding: 3rem 1.5rem;
  }
  
  .empty-icon {
    width: 80px;
    height: 80px;
  }
  
  .empty-state h3 {
    font-size: 1.25rem;
  }
  
  .scroll-top-button {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 46px;
    height: 46px;
    border-radius: 14px;
  }
}

@media (max-width: 480px) {
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .empty-icon {
    width: 70px;
    height: 70px;
  }
  
  .scroll-top-button {
    bottom: 1rem;
    right: 1rem;
    width: 42px;
    height: 42px;
    border-radius: 12px;
  }
  
  .scroll-top-button svg {
    width: 20px;
    height: 20px;
  }
  
  .load-more-button {
    min-width: 100%;
    padding: 0.75rem 1.5rem;
  }
}
</style>
