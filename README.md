# Search Tool - Vue.js Application

A modern, responsive search tool UI built with Vue.js. This application demonstrates Vue.js best practices including component-based architecture, reactivity system, transitions, and responsive design.

## 🚀 Features

### Core Features
- **Dynamic Search**: Real-time search results as you type with debouncing
- **Modular Components**: Reusable components (SearchBar, SearchResultItem, SearchResultList, Loader)
- **Expandable Results**: Click on results to reveal detailed information
- **Smooth Animations**: Fade, slide, and expand transitions using Vue's transition system
- **Dark Mode**: Toggle between light and dark themes with persistence
- **Pagination**: Load more results with "Load More" button
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### UX Enhancements
- Loading spinner during API calls
- Toast notifications for user actions
- Scroll-to-top button
- Search term highlighting in results
- Empty state illustrations

## 📁 Project Structure

```
search-tool/
├── src/
│   ├── components/
│   │   ├── SearchBar.vue        # Search input with debouncing
│   │   ├── SearchResultItem.vue # Individual result with expand functionality
│   │   ├── SearchResultList.vue # Results container with pagination
│   │   └── Loader.vue           # Loading spinner component
│   ├── services/
│   │   └── api.js               # Dummy API service with simulated latency
│   ├── App.vue                  # Main application component
│   └── main.js                  # Application entry point
├── index.html
├── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🎯 Technical Implementation

### Vue.js Best Practices Used

1. **Component-Based Architecture**: Each component has a single responsibility
2. **Props & Events**: Parent-child communication using props down, events up
3. **Computed Properties**: Efficient reactive data transformations
4. **Vue Transitions**: Built-in transition components for animations
5. **Lifecycle Hooks**: Proper setup and cleanup in mounted/beforeUnmount
6. **v-model**: Two-way binding for form inputs

### Performance Optimizations

1. **Debouncing**: Search input is debounced (300ms) to reduce API calls
2. **Lazy Loading**: Results loaded in batches via pagination
3. **CSS Variables**: Theming via CSS custom properties for efficient dark mode
4. **Scoped Styles**: Component styles don't leak to other components

### Accessibility Features

1. **ARIA Labels**: Proper labeling for screen readers
2. **Keyboard Navigation**: Tab navigation and keyboard shortcuts
3. **Focus Management**: Clear focus indicators
4. **Semantic HTML**: Proper use of article, header, main, footer

## 📈 Scaling Considerations

For a detailed description of how to scale this solution for larger applications and improve its performance, see **[SCALING.md](./SCALING.md)**.

### Quick Overview

**For Larger Applications:**
- State Management with Vuex/Pinia
- API layer improvements (caching, request cancellation, service workers)
- Virtual scrolling for large result sets
- Code splitting and lazy loading
- Comprehensive testing strategy

**Performance Improvements:**
- Fuzzy search with Fuse.js
- In-memory and IndexedDB caching
- Bundle optimization and tree shaking
- Rendering optimizations (v-once, v-memo, computed properties)

## 🔧 API Integration

### Current Implementation (Dummy API)
The app uses a local dummy API that simulates:
- Network latency (300-800ms random delay)
- Pagination
- Search filtering across title, snippet, description, category, and author

### Integrating Real API

To integrate a real API (e.g., OpenAI, Unsplash):

```javascript
// In src/services/api.js
export async function searchAPI(query, page = 1, pageSize = 10) {
  const response = await fetch(`https://api.example.com/search?q=${query}&page=${page}&limit=${pageSize}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Search failed');
  }
  
  return response.json();
}
```

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px - Full layout
- **Tablet**: 600px - 1024px - Adjusted spacing
- **Mobile**: < 600px - Stacked layout, hidden keyboard hints

## 🎨 Theming

The app uses CSS custom properties for theming. Dark mode is automatically detected from system preferences and can be toggled manually. Preference is persisted in localStorage.

## 📝 Design Decisions

1. **No External CSS Framework**: Custom CSS for full control and smaller bundle size
2. **Options API over Composition API**: Better readability for this scale of application
3. **Local State over Vuex**: Simpler state management for single-page search
4. **SVG Icons Inline**: No icon library dependency, better performance

## 👨‍💻 Author

Built for Saras Finance Vue.js Frontend Developer Assignment

## 📄 License

MIT License
