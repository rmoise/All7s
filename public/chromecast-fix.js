// Disable Chrome Cast functionality
window.__onGCastApiAvailable = null;
window.chrome = window.chrome || {};
window.chrome.cast = {
  isAvailable: false,
  initialize: function() {},
  requestSession: function() {},
  ApiConfig: function() {},
  SessionRequest: function() {},
  Error: function() {},
  ReceiverAvailability: {},
  ReceiverType: {},
  SessionStatus: {},
  VERSION: [],
  isInitialized: false
}; 