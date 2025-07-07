# Manga Reader - Page Preloading Demo

## How Page Preloading Works

The manga reader now includes intelligent page preloading that makes reading much more fluid by loading upcoming pages in the background.

### Key Features

1. **Progressive Loading**: When you start reading a chapter, it immediately starts loading the next 3 pages in the background
2. **Smart Indicators**: Visual feedback shows when pages are ready or still loading
3. **Instant Navigation**: Pre-loaded pages appear instantly when you navigate to them
4. **Memory Management**: Automatically cleans up old cached pages to prevent memory bloat

### Visual Indicators

- **Green dot**: Next page is ready and cached
- **Blue pulsing dot**: Next page is currently loading
- **Yellow pulsing dot**: Other pages are loading in the background
- **Cache stats**: Shows "X cached • Y loading" in the detailed view

### How to Test

1. Start reading any manga chapter
2. Notice the loading indicators in the top-right corner
3. Navigate to the next page - it should load instantly if preloaded
4. Open the details view (space bar or click center) to see cache statistics
5. Pages that are preloaded won't show a loading spinner when navigating

### Technical Implementation

- **Concurrent Loading**: Loads up to 2 pages simultaneously to avoid overwhelming the network
- **Forward Bias**: Prioritizes loading pages ahead since users typically read forward
- **Abort Support**: Can cancel loading if user navigates away
- **Cache Cleanup**: Removes pages that are 8+ pages away from current position
- **Memory Efficient**: Only keeps images in memory that are actively needed

### Configuration

The preloader can be configured with:
- `maxConcurrent`: Maximum simultaneous downloads (default: 2)
- `preloadDistance`: How many pages ahead to preload (default: 3)
- `cacheCleanupDistance`: When to remove old pages from cache (default: 8)

This makes the reading experience much smoother, especially on slower connections! 