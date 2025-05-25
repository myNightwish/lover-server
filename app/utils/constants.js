const CHAT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const DEFAULT_MODEL = 'gpt-3.5-turbo';
const MAX_TOKENS = 2000;
const TEMPERATURE = 0.7;
const SIGN_UP_IN_POINTS = 5;

module.exports = {
  CHAT_STATUS,
  DEFAULT_MODEL,
  MAX_TOKENS,
  TEMPERATURE,
  SIGN_UP_IN_POINTS
};