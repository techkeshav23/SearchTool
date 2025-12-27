<template>
  <div class="search-bar-container">
    <div class="search-input-wrapper" :class="{ 'focused': isFocused, 'has-value': modelValue }">
      <!-- Search Icon -->
      <svg 
        class="search-icon" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="M21 21l-4.35-4.35"></path>
      </svg>
      
      <!-- Search Input -->
      <input
        ref="searchInput"
        type="text"
        class="search-input"
        :value="modelValue"
        :placeholder="placeholder"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.escape="handleClear"
        aria-label="Search"
        role="searchbox"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      />
      
      <!-- Loading Indicator -->
      <Transition name="fade">
        <Loader 
          v-if="isLoading" 
          :inline="true" 
          :size="20" 
          class="search-loader"
        />
      </Transition>
      
      <!-- Clear Button -->
      <Transition name="fade">
        <button 
          v-if="modelValue && !isLoading" 
          class="clear-button"
          @click="handleClear"
          aria-label="Clear search"
          type="button"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </Transition>
    </div>
    
    <!-- Keyboard hint -->
    <div class="keyboard-hint" v-if="showHint && !isFocused">
      <kbd>Ctrl</kbd> + <kbd>K</kbd> to search
    </div>
  </div>
</template>

<script>
import Loader from './Loader.vue';

/**
 * SearchBar Component
 * A reusable search input with debouncing, loading state, and keyboard shortcuts
 */
export default {
  name: 'SearchBar',
  components: {
    Loader
  },
  props: {
    // v-model binding for the search query
    modelValue: {
      type: String,
      default: ''
    },
    // Placeholder text
    placeholder: {
      type: String,
      default: 'Search for articles, tutorials, and more...'
    },
    // Loading state from parent
    isLoading: {
      type: Boolean,
      default: false
    },
    // Show keyboard shortcut hint
    showHint: {
      type: Boolean,
      default: true
    },
    // Debounce delay in milliseconds
    debounceDelay: {
      type: Number,
      default: 300
    }
  },
  emits: ['update:modelValue', 'search', 'clear'],
  data() {
    return {
      isFocused: false,
      debounceTimer: null
    };
  },
  methods: {
    /**
     * Handle input changes with debouncing
     * Debouncing optimizes API calls by waiting for user to stop typing
     */
    handleInput(event) {
      const value = event.target.value;
      this.$emit('update:modelValue', value);
      
      // Clear existing timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      
      // Set new debounce timer
      this.debounceTimer = setTimeout(() => {
        this.$emit('search', value);
      }, this.debounceDelay);
    },
    
    /**
     * Handle focus state for styling
     */
    handleFocus() {
      this.isFocused = true;
    },
    
    /**
     * Handle blur state for styling
     */
    handleBlur() {
      this.isFocused = false;
    },
    
    /**
     * Clear the search input
     */
    handleClear() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.$emit('update:modelValue', '');
      this.$emit('clear');
      this.$refs.searchInput.focus();
    },
    
    /**
     * Focus the search input programmatically
     * Used for keyboard shortcut
     */
    focus() {
      this.$refs.searchInput.focus();
    }
  },
  mounted() {
    // Global keyboard shortcut: Ctrl+K to focus search
    const handleKeydown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        this.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    
    // Cleanup on unmount
    this.$options.cleanup = () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  },
  beforeUnmount() {
    if (this.$options.cleanup) {
      this.$options.cleanup();
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}
</script>

<style scoped>
.search-bar-container {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--glass-bg, rgba(255, 255, 255, 0.8));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 2px solid var(--input-border, rgba(0, 0, 0, 0.08));
  border-radius: 16px;
  padding: 1rem 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  gap: 0.875rem;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.search-input-wrapper:hover {
  border-color: var(--input-border-hover, rgba(0, 0, 0, 0.15));
  transform: translateY(-1px);
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.08),
    0 4px 6px -2px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.search-input-wrapper.focused {
  border-color: var(--primary-color, #6366f1);
  background: var(--input-bg-focus, #fff);
  transform: translateY(-2px);
  box-shadow: 
    0 0 0 4px var(--primary-glow, rgba(99, 102, 241, 0.2)),
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.search-icon {
  width: 22px;
  height: 22px;
  color: var(--text-tertiary, #94a3b8);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.search-input-wrapper.focused .search-icon {
  color: var(--primary-color, #6366f1);
  transform: scale(1.1);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--text-primary, #1e293b);
  outline: none;
  min-width: 0;
  letter-spacing: -0.01em;
}

.search-input::placeholder {
  color: var(--text-placeholder, #cbd5e1);
  font-weight: 400;
}

.search-loader {
  flex-shrink: 0;
}

.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: var(--button-bg, #f1f5f9);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.clear-button:hover {
  background: var(--primary-color, #6366f1);
  transform: scale(1.1) rotate(90deg);
}

.clear-button:hover svg {
  color: white;
}

.clear-button:active {
  transform: scale(0.9) rotate(90deg);
}

.clear-button svg {
  width: 14px;
  height: 14px;
  color: var(--text-secondary, #64748b);
  transition: color 0.2s ease;
}

.keyboard-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--text-tertiary, #94a3b8);
  animation: fadeIn 0.5s ease 0.2s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.keyboard-hint kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  min-width: 24px;
  font-size: 0.7rem;
  font-weight: 600;
  font-family: inherit;
  background: var(--kbd-bg, #f1f5f9);
  border: 1px solid var(--kbd-border, #e2e8f0);
  border-radius: 6px;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.05),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.keyboard-hint:hover kbd {
  background: var(--primary-color, #6366f1);
  color: white;
  border-color: var(--primary-color, #6366f1);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .search-input-wrapper {
    padding: 0.875rem 1rem;
    border-radius: 14px;
  }
  
  .search-input {
    font-size: 1rem;
  }
  
  .search-icon {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .search-input-wrapper {
    padding: 0.75rem 0.875rem;
    border-radius: 12px;
  }
  
  .keyboard-hint {
    display: none;
  }
}
</style>
