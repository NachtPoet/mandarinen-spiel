/**
 * analytics.js
 * Placeholder for analytics functionality
 * Currently just stubs that don't send any actual data
 */

// Configuration
const ANALYTICS_ENABLED = false;

// Simple analytics class
class Analytics {
  constructor() {
    this.events = [];
    this.initialized = false;
    this.sessionId = this.generateSessionId();
    console.log('Analytics initialized (stub mode - no data sent)');
  }

  // Generate a pseudorandom session ID
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substring(2, 15);
  }

  // Initialize analytics (stub)
  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('Analytics initialized with session ID:', this.sessionId);
  }

  // Track an event (stub)
  trackEvent(category, action, label = null, value = null) {
    if (!ANALYTICS_ENABLED) return;
    
    const event = {
      category,
      action,
      label,
      value,
      timestamp: new Date().toISOString()
    };
    
    this.events.push(event);
    console.log('Analytics event tracked (stub):', event);
  }

  // Track a page view (stub)
  trackPageView(page) {
    if (!ANALYTICS_ENABLED) return;
    
    console.log('Analytics page view tracked (stub):', page);
  }

  // Track level completion (stub)
  trackLevelComplete(level, timeSpent, hintsUsed) {
    if (!ANALYTICS_ENABLED) return;
    
    console.log('Analytics level completion tracked (stub):', {
      level,
      timeSpent,
      hintsUsed
    });
  }

  // Track level start (stub)
  trackLevelStart(level, difficulty) {
    if (!ANALYTICS_ENABLED) return;
    
    console.log('Analytics level start tracked (stub):', {
      level,
      difficulty
    });
  }

  // Track game completion (stub)
  trackGameComplete(totalTime, totalHints, difficulty) {
    if (!ANALYTICS_ENABLED) return;
    
    console.log('Analytics game completion tracked (stub):', {
      totalTime,
      totalHints,
      difficulty
    });
  }
}

// Create and export the analytics instance
window.analytics = new Analytics(); 