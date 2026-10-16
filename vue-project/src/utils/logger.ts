import log from 'loglevel';

// Set default log level based on environment
if (import.meta.env.MODE === 'production') {
  log.setLevel('warn');
} else {
  log.setLevel('debug');
}

export default log;
