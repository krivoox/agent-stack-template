type LogFields = {
  request?: string;
  action?: string;
  workspace?: string;
  userId?: string;
  email?: string;
  [key: string]: string | undefined;
};

function line(level: string, message: string, fields?: LogFields): string {
  const extras = fields
    ? Object.entries(fields)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}=${v}`)
        .join(" ")
    : "";
  return extras ? `[${level}] ${message} ${extras}` : `[${level}] ${message}`;
}

/** Structured logs. Never pass tokens, cookies or raw URLs with secrets. */
export const log = {
  info(message: string, fields?: LogFields) {
    console.info(line("info", message, fields));
  },
  warn(message: string, fields?: LogFields) {
    console.warn(line("warn", message, fields));
  },
  error(message: string, fields?: LogFields) {
    console.error(line("error", message, fields));
  },
};
