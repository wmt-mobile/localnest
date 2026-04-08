/**
 * Shared CLI flag parser for all localnest subcommands.
 * Supports --key value, --key=value, -k value, --boolean, and positional args.
 */
export function parseFlags(args, schema) {
  const flags = {};
  const positionals = [];
  const aliasMap = {};

  for (const [key, def] of Object.entries(schema)) {
    if (def.alias) aliasMap[def.alias] = key;
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--') {
      positionals.push(...args.slice(i + 1));
      break;
    }

    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      let key, value;
      if (eqIdx !== -1) {
        key = arg.slice(2, eqIdx);
        value = arg.slice(eqIdx + 1);
      } else {
        key = arg.slice(2);
      }

      const def = schema[key];
      if (!def) {
        positionals.push(arg);
        continue;
      }

      if (def.type === 'boolean') {
        flags[key] = value !== undefined ? value !== 'false' : true;
      } else if (value !== undefined) {
        flags[key] = def.type === 'number' ? Number(value) : value;
      } else {
        i++;
        const next = args[i];
        flags[key] = def.type === 'number' ? Number(next) : next;
      }
      continue;
    }

    if (arg.startsWith('-') && arg.length === 2) {
      const alias = arg.slice(1);
      const mappedKey = aliasMap[alias];
      if (mappedKey) {
        const def = schema[mappedKey];
        if (def.type === 'boolean') {
          flags[mappedKey] = true;
        } else {
          i++;
          const next = args[i];
          flags[mappedKey] = def.type === 'number' ? Number(next) : next;
        }
        continue;
      }
    }

    positionals.push(arg);
  }

  return { flags, positionals };
}
