/**
 * Shared ANSI color/output helpers for LocalNest CLI.
 *
 * Eliminates duplication across dashboard, selftest, onboard, help, and hooks.
 * Uses raw ANSI escape codes -- no chalk dependency.
 * Respects NO_COLOR and FORCE_COLOR environment variables.
 *
 * @module src/cli/ansi
 */

/* ------------------------------------------------------------------ */
/*  Color detection                                                    */
/* ------------------------------------------------------------------ */

export function useColor() {
  if (process.env.NO_COLOR !== undefined) return false;
  if (process.env.FORCE_COLOR !== undefined) return true;
  return process.stdout.isTTY === true;
}

/* ------------------------------------------------------------------ */
/*  ANSI escape codes                                                  */
/* ------------------------------------------------------------------ */

export const ESC = '\x1b[';
export const RESET = `${ESC}0m`;
export const BOLD = `${ESC}1m`;
export const DIM = `${ESC}2m`;
export const ITALIC = `${ESC}3m`;
export const CYAN = `${ESC}36m`;
export const GREEN = `${ESC}32m`;
export const YELLOW = `${ESC}33m`;
export const MAGENTA = `${ESC}35m`;
export const BLUE = `${ESC}34m`;
export const RED = `${ESC}31m`;
export const GRAY = `${ESC}90m`;
export const INVERSE = `${ESC}7m`;
export const WHITE = `${ESC}37m`;
export const BG_BLUE = `${ESC}44m`;

/* ------------------------------------------------------------------ */
/*  Color functions                                                    */
/* ------------------------------------------------------------------ */

export function c(code, text) {
  return useColor() ? `${code}${text}${RESET}` : text;
}

export function bold(t) { return c(BOLD, t); }
export function dim(t) { return c(DIM, t); }
export function italic(t) { return c(ITALIC, t); }
export function cyan(t) { return c(CYAN, t); }
export function green(t) { return c(GREEN, t); }
export function yellow(t) { return c(YELLOW, t); }
export function magenta(t) { return c(MAGENTA, t); }
export function blue(t) { return c(BLUE, t); }
export function red(t) { return c(RED, t); }
export function gray(t) { return c(GRAY, t); }
export function inverse(t) { return c(INVERSE, t); }
export function badge(t) { return c(`${BG_BLUE}${WHITE}${BOLD}`, ` ${t} `); }

/* ------------------------------------------------------------------ */
/*  Box drawing constants                                              */
/* ------------------------------------------------------------------ */

export const B = {
  tl: '\u256d', tr: '\u256e', bl: '\u2570', br: '\u256f',
  h: '\u2500', v: '\u2502',
  stl: '\u250c', str: '\u2510', sbl: '\u2514', sbr: '\u2518',
  full: '\u2588', light: '\u2591',
  dot: '\u25cf', arrow: '\u2192', check: '\u2713', circle: '\u25cb',
};

/* ------------------------------------------------------------------ */
/*  Visual length + padding                                            */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line no-control-regex
export function visLen(s) { return s.replace(/\x1b\[[0-9;]*m/g, '').length; }

export function padRight(s, w) {
  const d = w - visLen(s);
  return d > 0 ? s + ' '.repeat(d) : s;
}

export function stripAnsi(s) {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}

/* ------------------------------------------------------------------ */
/*  Panel / box helpers                                                */
/* ------------------------------------------------------------------ */

export function panel(title, rows, width, titleColor = cyan) {
  const inner = width - 4;
  const titleStr = ` ${titleColor(title)} `;
  const titleVis = visLen(titleStr);
  const top = B.stl + B.h + titleStr + B.h.repeat(Math.max(0, width - 3 - titleVis)) + B.str;
  const lines = [`  ${gray(top)}`];
  for (const row of rows) lines.push(`  ${gray(B.v)} ${padRight(row, inner)} ${gray(B.v)}`);
  lines.push(`  ${gray(B.sbl + B.h.repeat(width - 2) + B.sbr)}`);
  return lines;
}

export function progressBar(ratio, barWidth = 20) {
  const filled = Math.round(ratio * barWidth);
  return green(B.full.repeat(filled)) + gray(B.light.repeat(barWidth - filled));
}

export function truncate(s, max) {
  return !s ? '' : s.length > max ? s.slice(0, max - 3) + '...' : s;
}

/* ------------------------------------------------------------------ */
/*  Box-drawing convenience (used by selftest, onboard, help)          */
/* ------------------------------------------------------------------ */

export function boxTop(width = 60) {
  return `  ${gray(B.tl + B.h.repeat(width - 2) + B.tr)}`;
}

export function boxBottom(width = 60) {
  return `  ${gray(B.bl + B.h.repeat(width - 2) + B.br)}`;
}

export function boxLine(content, width = 60) {
  const visible = visLen(content);
  const pad = Math.max(0, width - visible - 4);
  return `  ${gray(B.v)} ${content}${' '.repeat(pad)} ${gray(B.v)}`;
}

export function boxEmpty(width = 60) {
  return boxLine('', width);
}

export function separator(width = 60) {
  return `  ${gray(B.h.repeat(width))}`;
}
