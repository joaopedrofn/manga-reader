# @manga-reader/ui

A shared UI component library for the manga-reader application, built with shadcn/ui and Tailwind CSS.

This package is configured as an ESM (ES Module) package for modern JavaScript environments.

## Components

### Basic Components
- `Button` - Button component with variants (default, outline, ghost, etc.)
- `Card` - Card container with Header, Content, Footer components
- `Input` - Input field component
- `Skeleton` - Loading skeleton component

### Manga Components
- `MangaCard` - Display card for manga information

### Utilities
- `cn` - Utility function for merging Tailwind classes

## Installation

This package is part of the manga-reader monorepo and is installed as a workspace dependency.

```json
{
  "dependencies": {
    "@manga-reader/ui": "workspace:*"
  }
}
```

## Usage

```tsx
// Import components from the main package
import { Button, Card, CardContent, CardHeader, CardTitle, MangaCard } from "@manga-reader/ui";

// Or import individual components directly
import { Button } from "@manga-reader/ui/components/button";
import { cn } from "@manga-reader/ui/lib/utils";

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## Development

Run the TypeScript compiler in watch mode:

```bash
pnpm run dev
```

Build the package:

```bash
pnpm run build
```

Clean build artifacts:

```bash
pnpm run clean
```

The package compiles TypeScript to JavaScript and generates declaration files in the `dist/` directory.

## Dependencies

This package requires React 18+ and Tailwind CSS to be configured in the consuming application. 