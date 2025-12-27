/**
 * API Service Module
 * Handles all API calls for the search functionality
 * Uses dummy data to simulate real API responses
 */

// Dummy data that simulates search results
const dummyResults = [
  {
    id: 1,
    title: "Introduction to Vue.js",
    snippet: "Vue.js is a progressive JavaScript framework for building user interfaces.",
    description: "Vue.js is a progressive framework for building user interfaces. Unlike other monolithic frameworks, Vue is designed from the ground up to be incrementally adoptable. The core library is focused on the view layer only, and is easy to pick up and integrate with other libraries or existing projects.",
    author: "Evan You",
    date: "2024-01-15",
    category: "Framework",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Understanding Vue Components",
    snippet: "Learn how to create reusable components in Vue.js applications.",
    description: "Components are one of the most powerful features of Vue.js. They help you extend basic HTML elements to encapsulate reusable code. At a high level, components are custom elements that Vue.js' compiler attaches behavior to.",
    author: "Sarah Chen",
    date: "2024-02-20",
    category: "Tutorial",
    readTime: "8 min read"
  },
  {
    id: 3,
    title: "Vue.js Reactive System",
    snippet: "Deep dive into Vue's reactivity system and how it tracks changes.",
    description: "Vue's reactivity system is one of its most distinctive features. Models are plain JavaScript objects. When you modify them, the view updates. It makes state management simple and intuitive. Understanding how it works will help you avoid common gotchas.",
    author: "Mike Johnson",
    date: "2024-03-10",
    category: "Advanced",
    readTime: "12 min read"
  },
  {
    id: 4,
    title: "Building Search Interfaces",
    snippet: "Best practices for creating efficient and user-friendly search UIs.",
    description: "A well-designed search interface is crucial for user experience. This guide covers debouncing, loading states, error handling, and result presentation. Learn how to create search experiences that feel fast and responsive.",
    author: "Emma Wilson",
    date: "2024-04-05",
    category: "UX Design",
    readTime: "10 min read"
  },
  {
    id: 5,
    title: "CSS Transitions in Vue",
    snippet: "Add smooth animations and transitions to your Vue applications.",
    description: "Vue provides several ways to apply transition effects when items are inserted, updated, or removed from the DOM. This includes tools to automatically apply CSS transitions and animations, as well as integrate third-party CSS animation libraries.",
    author: "Alex Brown",
    date: "2024-05-12",
    category: "Animation",
    readTime: "7 min read"
  },
  {
    id: 6,
    title: "State Management with Composition API",
    snippet: "Managing complex state in Vue 3 using the Composition API.",
    description: "The Composition API is a set of additive, function-based APIs that allow flexible composition of component logic. It provides a more flexible way to organize component logic and enables better TypeScript support.",
    author: "David Kim",
    date: "2024-06-18",
    category: "Vue 3",
    readTime: "15 min read"
  },
  {
    id: 7,
    title: "Responsive Design Patterns",
    snippet: "Create responsive layouts that work on all device sizes.",
    description: "Responsive web design is about creating web pages that look good on all devices. This article covers media queries, flexible grids, responsive images, and modern CSS techniques like Flexbox and Grid.",
    author: "Lisa Park",
    date: "2024-07-22",
    category: "CSS",
    readTime: "9 min read"
  },
  {
    id: 8,
    title: "API Integration Best Practices",
    snippet: "Learn how to efficiently integrate external APIs in your Vue apps.",
    description: "Integrating APIs is a fundamental skill for modern web development. This guide covers fetching data, error handling, caching strategies, and how to structure your API calls for maintainability.",
    author: "James Taylor",
    date: "2024-08-30",
    category: "Backend",
    readTime: "11 min read"
  },
  {
    id: 9,
    title: "Dark Mode Implementation",
    snippet: "Add dark mode support to your web application with CSS variables.",
    description: "Dark mode has become an essential feature for modern applications. Learn how to implement a robust dark mode using CSS custom properties, JavaScript, and local storage for persistence.",
    author: "Nina Rodriguez",
    date: "2024-09-14",
    category: "Theming",
    readTime: "6 min read"
  },
  {
    id: 10,
    title: "Performance Optimization in Vue",
    snippet: "Techniques to make your Vue.js applications faster and more efficient.",
    description: "Performance is crucial for user experience. This comprehensive guide covers lazy loading, code splitting, virtual scrolling, memoization, and other techniques to optimize your Vue applications.",
    author: "Tom Anderson",
    date: "2024-10-08",
    category: "Performance",
    readTime: "14 min read"
  },
  {
    id: 11,
    title: "Accessibility in Web Applications",
    snippet: "Building inclusive applications that everyone can use.",
    description: "Web accessibility ensures that websites and applications are usable by people with disabilities. Learn about ARIA attributes, keyboard navigation, screen reader support, and accessible design patterns.",
    author: "Rachel Green",
    date: "2024-11-02",
    category: "Accessibility",
    readTime: "10 min read"
  },
  {
    id: 12,
    title: "Testing Vue Components",
    snippet: "Write reliable tests for your Vue.js components using Vitest.",
    description: "Testing is essential for maintaining code quality. This guide covers unit testing, component testing, mocking, and best practices for testing Vue applications with Vitest and Vue Test Utils.",
    author: "Chris Martin",
    date: "2024-12-01",
    category: "Testing",
    readTime: "13 min read"
  }
];

/**
 * Simulates API latency
 * @param {number} ms - Milliseconds to delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Search function that filters results based on query
 * Simulates real API behavior with artificial delay
 * 
 * @param {string} query - Search query string
 * @param {number} page - Page number for pagination (1-indexed)
 * @param {number} pageSize - Number of results per page
 * @returns {Promise<Object>} Search results with metadata
 */
export async function searchAPI(query, page = 1, pageSize = 5) {
  // Simulate network latency (300-800ms)
  const latency = Math.random() * 500 + 300;
  await delay(latency);
  
  // Filter results based on query
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    return {
      results: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 0,
      query: ''
    };
  }
  
  // Search in title, snippet, description, category, and author
  const filteredResults = dummyResults.filter(item => 
    item.title.toLowerCase().includes(normalizedQuery) ||
    item.snippet.toLowerCase().includes(normalizedQuery) ||
    item.description.toLowerCase().includes(normalizedQuery) ||
    item.category.toLowerCase().includes(normalizedQuery) ||
    item.author.toLowerCase().includes(normalizedQuery)
  );
  
  // Calculate pagination
  const total = filteredResults.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);
  
  return {
    results: paginatedResults,
    total,
    page,
    pageSize,
    totalPages,
    query: normalizedQuery,
    hasMore: page < totalPages
  };
}

/**
 * Alternative: Using Postman Echo API
 * This function demonstrates how to use a real API endpoint
 */
export async function searchWithPostmanEcho(query) {
  try {
    const response = await fetch('https://postman-echo.com/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        results: dummyResults.filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.snippet.toLowerCase().includes(query.toLowerCase())
        )
      })
    });
    
    const data = await response.json();
    return data.data.results;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
