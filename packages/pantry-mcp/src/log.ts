// MCP servers speak JSON-RPC over stdout. Anything written to stdout that
// isn't a valid JSON-RPC frame corrupts the transport. All server-side logs
// MUST go to stderr — this module is the single chokepoint.

const LEVELS = ['debug', 'info', 'warn', 'error'] as const;
type Level = (typeof LEVELS)[number];

function levelEnabled(level: Level): boolean {
  const configured = (process.env.PECKISH_LOG_LEVEL ?? 'info').toLowerCase() as Level;
  const min = LEVELS.indexOf(configured);
  const here = LEVELS.indexOf(level);
  return min !== -1 && here >= min;
}

function emit(level: Level, message: string, fields?: Record<string, unknown>): void {
  if (!levelEnabled(level)) return;
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...fields,
  };
  console.error(JSON.stringify(entry));
}

export const log = {
  debug: (msg: string, fields?: Record<string, unknown>): void => {
    emit('debug', msg, fields);
  },
  info: (msg: string, fields?: Record<string, unknown>): void => {
    emit('info', msg, fields);
  },
  warn: (msg: string, fields?: Record<string, unknown>): void => {
    emit('warn', msg, fields);
  },
  error: (msg: string, fields?: Record<string, unknown>): void => {
    emit('error', msg, fields);
  },
};
