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

export function useColor(): boolean {
  if (process.env.NO_COLOR !== undefined) return false;
  if (process.env.FORCE_COLOR !== undefined) return true;
  return process.stdout.isTTY === true;
}

/* ------------------------------------------------------------------ */
/*  ANSI escape codes                                                  */
/* ------------------------------------------------------------------ */

export const ESC: string = '\x1b[';
export const RESET: string = `${ESC}0m`;
export const BOLD: string = `${ESC}1m`;
export const DIM: string = `${ESC}2m`;
export const ITALIC: string = `${ESC}3m`;
export const CYAN: string = `${ESC}36m`;
export const GREEN: string = `${ESC}32m`;
export const YELLOW: string = `${ESC}33m`;
export const MAGENTA: string = `${ESC}35m`;
export const BLUE: string = `${ESC}34m`;
export const RED: string = `${ESC}31m`;
export const GRAY: string = `${ESC}90m`;
export const INVERSE: string = `${ESC}7m`;
export const WHITE: string = `${ESC}37m`;
export const BG_BLUE: string = `${ESC}44m`;

/* ------------------------------------------------------------------ */
/*  Color functions                                                    */
/* ------------------------------------------------------------------ */

export function c(code: string, text: string): string {
  return useColor() ? `${code}${text}${RESET}` : text;
}

export function bold(t: string): string { return c(BOLD, t); }
export function dim(t: string): string { return c(DIM, t); }
export function italic(t: string): string { return c(ITALIC, t); }
export function cyan(t: string): string { return c(CYAN, t); }
export function green(t: string): string { return c(GREEN, t); }
export function yellow(t: string): string { return c(YELLOW, t); }
export function magenta(t: string): string { return c(MAGENTA, t); }
export function blue(t: string): string { return c(BLUE, t); }
export function red(t: string): string { return c(RED, t); }
export function gray(t: string): string { return c(GRAY, t); }
export function inverse(t: string): string { return c(INVERSE, t); }
export function badge(t: string): string { return c(`${BG_BLUE}${WHITE}${BOLD}`, ` ${t} `); }

/* ------------------------------------------------------------------ */
/*  Box drawing constants                                              */
/* ------------------------------------------------------------------ */

export const B: Record<string, string> = {
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
export function visLen(s: string): number { return s.replace(/\x1b\[[0-9;]*m/g, '').length; }

export function padRight(s: string, w: number): string {
  const d = w - visLen(s);
  return d > 0 ? s + ' '.repeat(d) : s;
}

export function stripAnsi(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}

/* ------------------------------------------------------------------ */
/*  Panel / box helpers                                                */
/* ------------------------------------------------------------------ */

export function panel(
  title: string,
  rows: string[],
  width: number,
  titleColor: (s: string) => string = cyan,
): string[] {
  const inner = width - 4;
  const titleStr = ` ${titleColor(title)} `;
  const titleVis = visLen(titleStr);
  const top = B.stl + B.h + titleStr + B.h.repeat(Math.max(0, width - 3 - titleVis)) + B.str;
  const lines: string[] = [`  ${gray(top)}`];
  for (const row of rows) lines.push(`  ${gray(B.v)} ${padRight(row, inner)} ${gray(B.v)}`);
  lines.push(`  ${gray(B.sbl + B.h.repeat(width - 2) + B.sbr)}`);
  return lines;
}

export function progressBar(ratio: number, barWidth: number = 20): string {
  const filled = Math.round(ratio * barWidth);
  return green(B.full.repeat(filled)) + gray(B.light.repeat(barWidth - filled));
}

export function truncate(s: string, max: number): string {
  return !s ? '' : s.length > max ? s.slice(0, max - 3) + '...' : s;
}

/* ------------------------------------------------------------------ */
/*  Box-drawing convenience (used by selftest, onboard, help)          */
/* ------------------------------------------------------------------ */

export function boxTop(width: number = 60): string {
  return `  ${gray(B.tl + B.h.repeat(width - 2) + B.tr)}`;
}

export function boxBottom(width: number = 60): string {
  return `  ${gray(B.bl + B.h.repeat(width - 2) + B.br)}`;
}

export function boxLine(content: string, width: number = 60): string {
  const visible = visLen(content);
  const pad = Math.max(0, width - visible - 4);
  return `  ${gray(B.v)} ${content}${' '.repeat(pad)} ${gray(B.v)}`;
}

export function boxEmpty(width: number = 60): string {
  return boxLine('', width);
}

export function separator(width: number = 60): string {
  return `  ${gray(B.h.repeat(width))}`;
}
