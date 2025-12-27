<template>
  <div class="loader-container" :class="{ 'inline': inline }">
    <div class="spinner" :style="{ width: size + 'px', height: size + 'px' }">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    <p v-if="message" class="loader-message">{{ message }}</p>
  </div>
</template>

<script>
/**
 * Loader Component
 * Displays a loading spinner with optional message
 * Used while data is being fetched from the API
 */
export default {
  name: 'Loader',
  props: {
    // Loading message to display
    message: {
      type: String,
      default: ''
    },
    // Size of the spinner in pixels
    size: {
      type: Number,
      default: 40
    },
    // Whether to display inline (for search bar)
    inline: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  gap: 1.25rem;
}

.loader-container.inline {
  padding: 0;
  flex-direction: row;
  gap: 0;
}

.spinner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 8px var(--primary-glow, rgba(99, 102, 241, 0.3)));
}

.spinner-ring {
  position: absolute;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--primary-color, #6366f1);
  animation: spin 1s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
}

.spinner-ring:nth-child(1) {
  width: 100%;
  height: 100%;
  animation-delay: -0.4s;
  border-top-color: var(--primary-color, #6366f1);
}

.spinner-ring:nth-child(2) {
  width: 75%;
  height: 75%;
  animation-delay: -0.25s;
  animation-direction: reverse;
  border-top-color: var(--secondary-color, #8b5cf6);
}

.spinner-ring:nth-child(3) {
  width: 50%;
  height: 50%;
  animation-delay: -0.1s;
  border-top-color: var(--accent-color, #a78bfa);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loader-message {
  color: var(--text-secondary, #64748b);
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
  animation: pulse 2s ease-in-out infinite;
  letter-spacing: 0.5px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}

/* Inline loader styles */
.inline .spinner {
  width: 18px !important;
  height: 18px !important;
  filter: none;
}

.inline .spinner-ring {
  border-width: 2px;
}
</style>
