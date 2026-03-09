function warningType(args = []) {
  const first = args[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object' && typeof first.type === 'string') return first.type;
  return '';
}

export function shouldSuppressRuntimeWarning(warning, args = []) {
  const type = warningType(args);
  const message = String(warning?.message || warning || '');
  return type === 'ExperimentalWarning' && message.includes('SQLite is an experimental feature');
}

export function installRuntimeWarningFilter() {
  const original = process.emitWarning;
  if (original.__localnestWrapped) return;

  function wrappedEmitWarning(warning, ...args) {
    if (shouldSuppressRuntimeWarning(warning, args)) {
      return;
    }
    return original.call(process, warning, ...args);
  }

  wrappedEmitWarning.__localnestWrapped = true;
  wrappedEmitWarning.__localnestOriginal = original;
  process.emitWarning = wrappedEmitWarning;
}
