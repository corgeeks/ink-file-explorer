
Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";

// import .css files directly and it works
import './index.css';

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.

## Documentation Maintenance

When adding or changing features, **ALWAYS** update documentation to keep it in sync with the code. Follow this checklist:

### When Adding/Changing Features

- [ ] **Update JSDoc comments** on all affected functions, components, and hooks
  - Add `@param` tags for all parameters
  - Add `@returns` tag describing return value
  - Include `@example` blocks showing usage
  - Update existing JSDoc if behavior changes

- [ ] **Update prop-types** definitions for all affected components
  - Add new props to `propTypes` object
  - Update `defaultProps` if defaults change
  - Ensure required props are marked `.isRequired`

- [ ] **Update TypeScript type definitions**
  - Export new types from `src/types/index.ts`
  - Export hook return types from `src/lib/hooks/index.ts`
  - Add JSDoc comments to type definitions

- [ ] **Update README.md**
  - Add new props to the Props table
  - Update API Reference if exports change
  - Add usage examples for significant features
  - Update keybindings if inputs change

- [ ] **Add or update examples** in `examples/` directory
  - Create new example if feature warrants it
  - Update existing examples if behavior changes
  - Ensure example READMEs are accurate

- [ ] **Update CHANGELOG.md** (when it exists)
  - Add entry describing the change
  - Follow conventional commit format
  - Link to relevant issues/PRs

### JSDoc Format Guidelines

Use consistent formatting for all JSDoc comments:

```tsx
/**
 * Brief one-line description of the function/component.
 *
 * More detailed explanation of what it does, how it works,
 * and any important behavior or gotchas.
 *
 * @example
 * ```tsx
 * // Show realistic usage
 * const result = myFunction(param1, param2);
 * ```
 *
 * @param paramName - Description of parameter
 * @param optionalParam - Description (optional)
 * @returns Description of return value
 */
```

### Example Documentation Guidelines

When creating examples:

1. **Each example should be self-contained**
   - Include its own `package.json`
   - Include a detailed `README.md`
   - Show one clear use case

2. **Example READMEs should include:**
   - What it demonstrates
   - How to run it
   - Code explanation
   - Use cases
   - Key learnings

3. **Keep examples simple**
   - Focus on one concept
   - Use clear variable names
   - Add comments explaining non-obvious parts

### Prop-Types Format

All components must have prop-types for runtime validation:

```tsx
ComponentName.propTypes = {
  requiredProp: PropTypes.string.isRequired,
  optionalProp: PropTypes.bool,
  arrayProp: PropTypes.arrayOf(PropTypes.string),
  // ... all props
};

ComponentName.defaultProps = {
  optionalProp: false,
  arrayProp: [],
  // ... all optional props with defaults
};
```

### Documentation Review Checklist

Before submitting a PR, verify:

- [ ] All new code has JSDoc comments
- [ ] README is up to date
- [ ] Examples work correctly
- [ ] Type definitions are exported
- [ ] Prop-types match TypeScript types
- [ ] No broken links in documentation
- [ ] Code examples are tested
