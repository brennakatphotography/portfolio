import { partial } from 'fun-util';

const logger = (level, ...messages) => {
  console[level](...messages);
};

export default {
  debug: partial(logger, 'debug'),
  error: partial(logger, 'error'),
  info: partial(logger, 'info'),
  log: partial(logger, 'log'),
  warn: partial(logger, 'warn')
};
