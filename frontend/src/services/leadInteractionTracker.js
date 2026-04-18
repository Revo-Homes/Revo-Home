/**
 * LeadInteractionTracker
 * Tracks all user interactions on REVO_HOMES website
 * Batches events and sends to backend for lead scoring
 */

import { v4 as uuidv4 } from 'uuid';
import api from './api';

class LeadInteractionTracker {
  constructor() {
    this.sessionId = null;
    this.eventQueue = [];
    this.flushInterval = null;
    this.isFlushing = false;
    this.userId = null;
    this.currentPage = null;
    this.pageStartTime = null;
    this.scrollDepth = 0;
    this.imagesViewed = new Set();
    this.sectionsViewed = new Set();
    
    // Configuration
    this.FLUSH_INTERVAL = 5000; // 5 seconds
    this.MAX_QUEUE_SIZE = 50;
    this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    
    this.init();
  }

  /**
   * Initialize the tracker
   */
  init() {
    // Get or create session ID
    this.sessionId = this.getOrCreateSessionId();
    
    // Get user ID if logged in
    this.userId = this.getUserId();
    
    // Start flush interval
    this.startFlushInterval();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Track initial page view
    this.trackPageView();
    
    console.log('[LeadInteractionTracker] Initialized with session:', this.sessionId);
  }

  /**
   * Get or create session ID from localStorage
   */
  getOrCreateSessionId() {
    const stored = localStorage.getItem('revo_session_id');
    const storedTime = localStorage.getItem('revo_session_time');
    
    if (stored && storedTime) {
      const timeDiff = Date.now() - parseInt(storedTime);
      if (timeDiff < this.SESSION_TIMEOUT) {
        return stored;
      }
    }
    
    // Create new session
    const newSessionId = `sess_${uuidv4()}`;
    localStorage.setItem('revo_session_id', newSessionId);
    localStorage.setItem('revo_session_time', Date.now().toString());
    localStorage.setItem('revo_session_start', new Date().toISOString());
    
    return newSessionId;
  }

  /**
   * Get user ID from auth storage
   */
  getUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || null;
    } catch {
      return null;
    }
  }

  /**
   * Update user ID (called after login)
   */
  setUserId(userId) {
    const oldUserId = this.userId;
    this.userId = userId;
    
    // If we have a new user ID and had an anonymous session, merge it
    if (userId && !oldUserId) {
      this.mergeAnonymousSession();
    }
    
    // Track return visit with user
    this.trackEvent('return_visit', {
      daysSinceFirstVisit: this.getDaysSinceFirstVisit(),
      previousSessionCount: this.getPreviousSessionCount()
    });
  }

  /**
   * Set up global event listeners
   */
  setupEventListeners() {
    // Scroll tracking
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.updateScrollDepth();
      }, 250);
    }, { passive: true });

    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushQueue();
      }
    });

    // Before unload
    window.addEventListener('beforeunload', () => {
      this.trackTimeOnPage();
      this.flushQueue();
    });

    // Image view tracking (intersection observer)
    this.setupImageObserver();
  }

  /**
   * Set up intersection observer for image viewing
   */
  setupImageObserver() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const imgId = entry.target.dataset.propertyId || entry.target.src;
              if (imgId) {
                this.imagesViewed.add(imgId);
              }
            }
          });
        },
        { threshold: 0.5 }
      );

      // Observe all property images
      document.querySelectorAll('.property-image, [data-property-id]').forEach(img => {
        observer.observe(img);
      });
    }
  }

  /**
   * Update scroll depth tracking
   */
  updateScrollDepth() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);
    
    if (scrollPercent > this.scrollDepth) {
      this.scrollDepth = scrollPercent;
      
      // Track significant scroll milestones
      if (this.scrollDepth === 25 || this.scrollDepth === 50 || this.scrollDepth === 75 || this.scrollDepth === 90) {
        this.trackEvent('page_scroll', {
          scrollDepth: this.scrollDepth,
          page: this.currentPage
        });
      }
    }
  }

  /**
   * Start the flush interval
   */
  startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flushQueue();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Track page view
   */
  trackPageView() {
    this.currentPage = window.location.pathname;
    this.pageStartTime = Date.now();
    this.scrollDepth = 0;
    this.imagesViewed.clear();
    this.sectionsViewed.clear();
  }

  /**
   * Track time spent on page before leaving
   */
  trackTimeOnPage() {
    if (this.pageStartTime) {
      const timeOnPage = Date.now() - this.pageStartTime;
      
      // Only track if more than 5 seconds
      if (timeOnPage > 5000) {
        this.queueEvent({
          event_type: 'time_on_page',
          metadata: {
            timeOnPage,
            page: this.currentPage,
            scrollDepth: this.scrollDepth,
            imagesViewed: Array.from(this.imagesViewed)
          }
        });
      }
    }
  }

  /**
   * Track property click
   */
  trackPropertyClick(propertyId, metadata = {}) {
    this.trackEvent('property_click', {
      property_id: propertyId,
      ...metadata
    });
  }

  /**
   * Track property view (detail page)
   */
  trackPropertyView(propertyId, metadata = {}) {
    const timeOnPage = this.pageStartTime ? Date.now() - this.pageStartTime : 0;
    const isDeepView = timeOnPage > 30000; // 30 seconds
    
    this.trackEvent(isDeepView ? 'property_view_deep' : 'property_view', {
      property_id: propertyId,
      timeOnPage,
      scrollDepth: this.scrollDepth,
      imagesViewed: this.imagesViewed.size,
      sectionsViewed: this.sectionsViewed.size,
      ...metadata
    });
  }

  /**
   * Track favorite action
   */
  trackFavorite(propertyId, action, metadata = {}) {
    this.trackEvent(action === 'add' ? 'favorite_add' : 'favorite_remove', {
      property_id: propertyId,
      ...metadata
    });
  }

  /**
   * Track share action
   */
  trackShare(propertyId, platform, metadata = {}) {
    this.trackEvent('share', {
      property_id: propertyId,
      platform,
      ...metadata
    });
  }

  /**
   * Track contact request
   */
  trackContactRequest(propertyId, formData, metadata = {}) {
    this.trackEvent('contact_request', {
      property_id: propertyId,
      formData: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message?.substring(0, 100),
        contactMethod: formData.contactMethod,
        inquiryType: formData.inquiryType
      },
      ...metadata
    });
  }

  /**
   * Track viewing schedule request
   */
  trackViewingRequest(propertyId, dateTime, metadata = {}) {
    this.trackEvent('schedule_viewing', {
      property_id: propertyId,
      dateTime,
      ...metadata
    });
  }

  /**
   * Track search query
   */
  trackSearchQuery(searchData) {
    this.trackEvent('search_query', {
      searchData: {
        filters: searchData.filters,
        location: searchData.location,
        propertyType: searchData.propertyType,
        priceMin: searchData.priceMin,
        priceMax: searchData.priceMax,
        bedrooms: searchData.bedrooms,
        resultsCount: searchData.resultsCount
      }
    });
  }

  /**
   * Track profile update
   */
  trackProfileUpdate(profileData) {
    this.trackEvent('profile_update', {
      profileData: {
        fieldsUpdated: profileData.fieldsUpdated,
        completeness: profileData.completeness
      }
    });
  }

  /**
   * Generic event tracking
   */
  trackEvent(eventType, metadata = {}) {
    const event = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: this.userId,
      metadata: {
        ...metadata,
        pageUrl: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };

    this.queueEvent(event);

    // Immediate flush for high-priority events
    if (['contact_request', 'schedule_viewing', 'favorite_add'].includes(eventType)) {
      this.flushQueue();
    }
  }

  /**
   * Add event to queue
   */
  queueEvent(event) {
    this.eventQueue.push(event);

    // Flush if queue is getting large
    if (this.eventQueue.length >= this.MAX_QUEUE_SIZE) {
      this.flushQueue();
    }
  }

  /**
   * Flush event queue to backend
   */
  async flushQueue() {
    if (this.isFlushing || this.eventQueue.length === 0) {
      return;
    }

    this.isFlushing = true;
    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Try batch endpoint first
      const response = await api.post('/api/v1/website/batch-track', {
        session_id: this.sessionId,
        user_id: this.userId,
        events: eventsToSend
      });

      if (response.data.success) {
        console.log(`[LeadInteractionTracker] Flushed ${eventsToSend.length} events`);
        
        // Handle any lead updates from response
        if (response.data.lead_id) {
          this.handleLeadUpdate(response.data);
        }
      }
    } catch (error) {
      console.error('[LeadInteractionTracker] Failed to flush events:', error);
      
      // Re-queue events on failure (keep only last 100)
      this.eventQueue = [...eventsToSend, ...this.eventQueue].slice(-100);
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Handle lead update from backend
   */
  handleLeadUpdate(data) {
    // Store lead info in localStorage for quick access
    if (data.lead_id) {
      localStorage.setItem('revo_lead_id', data.lead_id);
    }

    // Emit event for UI updates
    window.dispatchEvent(new CustomEvent('leadScoreUpdate', {
      detail: {
        leadId: data.lead_id,
        isNew: data.is_new_lead,
        requiresAttention: data.requires_immediate_attention
      }
    }));
  }

  /**
   * Merge anonymous session with logged in user
   */
  async mergeAnonymousSession() {
    if (!this.userId) return;

    try {
      await api.post('/api/v1/website/session/merge', {
        session_id: this.sessionId,
        user_id: this.userId
      });

      console.log('[LeadInteractionTracker] Anonymous session merged');
    } catch (error) {
      console.error('[LeadInteractionTracker] Failed to merge session:', error);
    }
  }

  /**
   * Get days since first visit
   */
  getDaysSinceFirstVisit() {
    const firstVisit = localStorage.getItem('revo_session_start');
    if (!firstVisit) return 0;
    
    const firstDate = new Date(firstVisit);
    const now = new Date();
    return Math.floor((now - firstDate) / (1000 * 60 * 60 * 24));
  }

  /**
   * Get previous session count
   */
  getPreviousSessionCount() {
    const count = localStorage.getItem('revo_session_count');
    return parseInt(count || '0');
  }

  /**
   * Get current session info
   */
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      page: this.currentPage,
      scrollDepth: this.scrollDepth,
      queueSize: this.eventQueue.length
    };
  }

  /**
   * Destroy tracker
   */
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushQueue();
  }
}

// Create singleton instance
const leadInteractionTracker = new LeadInteractionTracker();

export default leadInteractionTracker;
