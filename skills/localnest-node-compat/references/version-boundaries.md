## LocalNest Version Boundaries

- `node:sqlite` is a Node 22+ capability in practice for this project.
- sqlite extension loading requires more than just module presence; verify the actual API path used by LocalNest.
- Native parser and database packages can fail at install time even when runtime code handles missing modules.
- Compatibility work must validate both source-tree behavior and installed-package behavior.
