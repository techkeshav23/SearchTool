<template>
  <article 
    class="search-result-item"
    :class="{ 'expanded': isExpanded }"
    @click="toggleExpand"
    @keydown.enter="toggleExpand"
    @keydown.space.prevent="toggleExpand"
    tabindex="0"
    role="button"
    :aria-expanded="isExpanded"
  >
    <!-- Main content row -->
    <div class="result-main">
      <!-- Category badge -->
      <span class="category-badge" :style="{ backgroundColor: categoryColor }">
        {{ item.category }}
      </span>
      
      <!-- Title with highlighted search terms -->
      <h3 class="result-title" v-html="highlightedTitle"></h3>
      
      <!-- Snippet preview -->
      <p class="result-snippet" v-html="highlightedSnippet"></p>
      
      <!-- Meta information -->
      <div class="result-meta">
        <span class="meta-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          {{ item.author }}
        </span>
        <span class="meta-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          {{ formattedDate }}
        </span>
        <span class="meta-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {{ item.readTime }}
        </span>
      </div>
      
      <!-- Expand indicator -->
      <div class="expand-indicator">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
          class="chevron-icon"
          :class="{ 'rotated': isExpanded }"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
    
    <!-- Expanded content with transition -->
    <Transition name="expand">
      <div v-if="isExpanded" class="result-expanded">
        <div class="expanded-content">
          <h4>Full Description</h4>
          <p>{{ item.description }}</p>
          
          <div class="expanded-actions">
            <button class="action-button primary" @click.stop="handleReadMore">
              Read Full Article
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button class="action-button secondary" @click.stop="handleSave">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              Save
            </button>
            <button class="action-button secondary" @click.stop="handleShare">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </article>
</template>

<script>
/**
 * SearchResultItem Component
 * Displays a single search result with expandable details
 * Supports highlighting of search terms and smooth animations
 */
export default {
  name: 'SearchResultItem',
  props: {
    // The search result item data
    item: {
      type: Object,
      required: true,
      validator: (value) => {
        return value.id && value.title && value.snippet;
      }
    },
    // The current search query for highlighting
    searchQuery: {
      type: String,
      default: ''
    },
    // Index of this item in the list (for staggered animations)
    index: {
      type: Number,
      default: 0
    }
  },
  emits: ['expand', 'read-more', 'save', 'share'],
  data() {
    return {
      isExpanded: false
    };
  },
  computed: {
    /**
     * Highlight search terms in the title
     */
    highlightedTitle() {
      return this.highlightText(this.item.title);
    },
    
    /**
     * Highlight search terms in the snippet
     */
    highlightedSnippet() {
      return this.highlightText(this.item.snippet);
    },
    
    /**
     * Format the date for display
     */
    formattedDate() {
      const date = new Date(this.item.date);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    },
    
    /**
     * Generate a consistent color for the category badge
     */
    categoryColor() {
      const colors = {
        'Framework': '#646cff',
        'Tutorial': '#42b883',
        'Advanced': '#ff6b6b',
        'UX Design': '#ffd93d',
        'Animation': '#6bcb77',
        'Vue 3': '#41b883',
        'CSS': '#264de4',
        'Backend': '#68a063',
        'Theming': '#9b59b6',
        'Performance': '#e74c3c',
        'Accessibility': '#3498db',
        'Testing': '#f39c12'
      };
      return colors[this.item.category] || '#888';
    }
  },
  methods: {
    /**
     * Toggle the expanded state
     */
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
      this.$emit('expand', { item: this.item, expanded: this.isExpanded });
    },
    
    /**
     * Highlight matching search terms in text
     */
    highlightText(text) {
      if (!this.searchQuery || this.searchQuery.trim() === '') {
        return text;
      }
      
      const query = this.searchQuery.trim();
      const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
      return text.replace(regex, '<mark class="highlight">$1</mark>');
    },
    
    /**
     * Escape special regex characters
     */
    escapeRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    
    /**
     * Handle read more action
     */
    handleReadMore() {
      this.$emit('read-more', this.item);
    },
    
    /**
     * Handle save action
     */
    handleSave() {
      this.$emit('save', this.item);
    },
    
    /**
     * Handle share action
     */
    handleShare() {
      this.$emit('share', this.item);
    }
  }
}
</script>

<style scoped>
.search-result-item {
  width: 100%;
  background: var(--card-bg, rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--card-border, rgba(0, 0, 0, 0.06));
  border-radius: 16px;
  padding: 1.75rem 2rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(var(--index, 0) * 0.08s);
  opacity: 0;
  position: relative;
  overflow: hidden;
}

.search-result-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-color, #2d3748);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-result-item:hover::before,
.search-result-item.expanded::before {
  transform: scaleX(1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.search-result-item:hover {
  border-color: var(--card-border-hover, rgba(99, 102, 241, 0.3));
  box-shadow: 
    0 10px 20px -5px var(--card-shadow-hover, rgba(99, 102, 241, 0.15)),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-4px) scale(1.01);
}

.search-result-item:focus {
  outline: none;
  border-color: var(--primary-color, #6366f1);
  box-shadow: 
    0 0 0 4px var(--primary-glow, rgba(99, 102, 241, 0.2)),
    0 10px 20px -5px var(--card-shadow-hover);
}

.search-result-item.expanded {
  border-color: var(--primary-color, #6366f1);
  background: var(--card-bg, rgba(255, 255, 255, 0.95));
  box-shadow: 
    0 0 0 1px var(--primary-color, #6366f1),
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.result-main {
  position: relative;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.75rem;
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  border-radius: 20px;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
  line-height: 1.4;
  padding-right: 2.5rem;
  letter-spacing: -0.02em;
  transition: color 0.2s ease;
}

.search-result-item:hover .result-title {
  color: var(--primary-color, #6366f1);
}

.result-snippet {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: var(--text-secondary, #64748b);
  line-height: 1.6;
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-tertiary, #94a3b8);
  transition: color 0.2s ease;
}

.meta-item svg {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

.search-result-item:hover .meta-item {
  color: var(--text-secondary, #64748b);
}

.expand-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--button-bg, #f1f5f9);
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-result-item:hover .expand-indicator {
  background: var(--primary-button-bg, #6366f1);
}

.chevron-icon {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary, #94a3b8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-result-item:hover .chevron-icon {
  color: var(--primary-button-text, white);
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

/* Expanded content */
.result-expanded {
  overflow: hidden;
}

.expanded-content {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px dashed var(--divider-color, rgba(0, 0, 0, 0.08));
}

.expanded-content h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--primary-color, #6366f1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.expanded-content p {
  margin: 0 0 1.25rem 0;
  font-size: 0.9rem;
  color: var(--text-secondary, #64748b);
  line-height: 1.7;
}

.expanded-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-button svg {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.action-button.primary {
  background: var(--primary-button-bg, #2d3748);
  color: var(--primary-button-text, white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.action-button.primary:hover {
  transform: translateY(-2px);
  background: var(--primary-button-hover, #1a202c);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-button.primary:hover svg {
  transform: translateX(4px);
}

.action-button.secondary {
  background: var(--button-bg, #f1f5f9);
  color: var(--text-primary, #1e293b);
  border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
}

.action-button.secondary:hover {
  background: var(--button-bg-hover, #e2e8f0);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Highlight styling */
:deep(.highlight) {
  background: var(--highlight-bg, #fef3c7);
  color: var(--highlight-text, #92400e);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-weight: 600;
}

/* Expand transition */
.expand-enter-active {
  animation: expandIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-leave-active {
  animation: expandIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) reverse;
}

@keyframes expandIn {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 400px;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .search-result-item {
    padding: 1.25rem;
    border-radius: 14px;
  }
  
  .result-title {
    font-size: 1.05rem;
    padding-right: 2rem;
  }
  
  .result-meta {
    gap: 1rem;
  }
  
  .expand-indicator {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .search-result-item {
    padding: 1rem;
    border-radius: 12px;
  }
  
  .result-title {
    font-size: 1rem;
  }
  
  .result-snippet {
    font-size: 0.85rem;
  }
  
  .meta-item {
    font-size: 0.75rem;
  }
  
  .result-meta {
    gap: 0.75rem;
  }
  
  .expanded-actions {
    flex-direction: column;
  }
  
  .action-button {
    justify-content: center;
  }
}
</style>
