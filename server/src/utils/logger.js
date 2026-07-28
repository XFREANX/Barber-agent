/**
 * Security Logger Utility
 * Standardized logging for security events and application auditing
 */

const logSecurityEvent = (eventType, details = {}) => {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    type: 'SECURITY_EVENT',
    eventType,
    ...details,
  };

  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(logData));
  } else {
    console.warn(`[SECURITY - ${eventType}]`, details);
  }
};

module.exports = { logSecurityEvent };
