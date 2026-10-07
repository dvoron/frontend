import log from 'loglevel';

// Set default log level based on environment
if (import.meta.env.MODE === 'production') {
  log.setLevel('warn');
} else {
  log.setLevel('debug');
}

// Custom plugin to send logs to backend if configured
const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);

  return function (...args) {
    // Call the original method (logs to console)
    rawMethod(...args);

    // If configured to send to backend, do it here
    // Example: if (import.meta.env.VITE_SEND_LOGS_TO_BACKEND === 'true') { ... }
    // For now, we'll just log to console as per standard loglevel behavior,
    // but this is the hook point for remote logging.
  };
};

log.rebuild(); // Apply the custom method factory

export default log;
