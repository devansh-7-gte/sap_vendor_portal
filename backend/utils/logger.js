const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Helper function to sanitize sensitive properties from metadata
const sanitizeMetadata = (info) => {
  const sensitiveKeys = [
    'password', 'token', 'secret', 'clerk', 'authorization', 'cookie', 
    'mongo', 'key', 'mongoose', 'db', 'uri'
  ];
  
  const cleanObj = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const clean = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const lowerKey = key.toLowerCase();
        const matchesSensitive = sensitiveKeys.some(s => lowerKey.includes(s));
        if (matchesSensitive) {
          clean[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          clean[key] = cleanObj(obj[key]);
        } else {
          clean[key] = obj[key];
        }
      }
    }
    return clean;
  };

  const newInfo = { ...info };
  // Sanitize req body if logged
  if (newInfo.body && typeof newInfo.body === 'object') {
    newInfo.body = cleanObj(newInfo.body);
  }
  
  // General metadata sanitization
  for (const key in newInfo) {
    if (Object.prototype.hasOwnProperty.call(newInfo, key) && typeof newInfo[key] === 'object') {
      newInfo[key] = cleanObj(newInfo[key]);
    }
  }
  
  return newInfo;
};

// Formats
const sanitizeFormat = winston.format((info) => {
  return sanitizeMetadata(info);
});

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  sanitizeFormat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, requestId, method, url, ...meta }) => {
    const reqStr = requestId ? ` [${requestId}]` : '';
    const routeStr = method && url ? ` ${method} ${url}` : '';
    const metaStr = Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}:${reqStr}${routeStr} ${message}${metaStr}`;
  })
);

// Transports configuration
const logDir = path.join(__dirname, '../logs');

const transports = [
  // Combined log rotation
  new DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
  }),
  // Error log rotation
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
  })
];

// Add console in non-production/development
if (process.env.NODE_ENV !== 'production') {
  transports.push(new winston.transports.Console({
    format: consoleFormat
  }));
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports
});

module.exports = logger;
