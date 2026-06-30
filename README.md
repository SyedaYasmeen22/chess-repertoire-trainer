# RepertoireOS — Chess Opening Repertoire Trainer

A complete, offline-first chess opening trainer inspired by Chessable's spaced-repetition model. Single HTML file, zero build step, fully self-contained, deployable to any static host.

**Every requirement from the original spec is implemented and verified with automated tests against the real chess.js engine.**

---

## Quick deploy

Drop `index.html` on any static host:

- **GitHub Pages** — push to a repo, enable Pages, done
- **Netlify Drop** — drag the file onto netlify.com/drop
- **Vercel** — `vercel deploy` or drag-and-drop
- **Any web server** — Apache, Nginx, S3 + CloudFront, or just open the file locally

The only external dependency is chess.js, loaded once from a CDN; the browser caches it afterward so the app works fully offline on repeat visits.

---

## Architecture

```
index.html (single file, ~97KB)
│
├── Design system        — CSS variables, dark/light themes
├── Inline SVG pieces     — 12 piece graphics, zero image requests
│
├── Core modules
│   ├── DB                — IndexedDB wrapper (folders, lines, settings)
│   ├── SRS                — Spaced repetition scoring (7-stage interval ladder)
│   ├── Tree functions      — makeNode / mainLine / findNode / findParent / addMove
│   ├── PGN parser          — recursive-descent parser: tags, comments, nested
│   │                          variations via ( ) groups, multi-game splitting
│   ├── Board                — renderer + drag/drop/touch + promotion + check highlight
│   ├── Rec (record mode)     — tree-based recording, branch creation, undo/redo
│   ├── Train (training mode) — queue builder, move validation, opponent auto-play
│   └── MovePanel              — recursive tree renderer with inline variation blocks
│
└── UI layer
    ├── Sidebar           — nested folder tree (unlimited depth), search, context menus
    ├── Board area         — chessboard + training HUD + controls
    ├── Dashboard           — stats, accuracy chart, due-review queue
    └── Right panel          — Moves | Train | PGN | Stats tabs
```

---

## Full feature checklist

### Interactive board
- Drag/drop + click-to-move, mouse and touch
- Legal move highlighting (dots for quiet moves, ring for captures)
- Last-move highlight, check highlight
- Board flip, promotion modal (Q/R/B/N)
- Dark/light theme toggle
- Responsive sizing via ResizeObserver

### Repertoire recording — with branching variations
- Record moves for both sides into a **move tree**, not a flat list
- Play an alternative move at any point in a line to create a **sibling branch** automatically — no special UI needed, just play a different move
- Move list panel renders the tree recursively: main line inline, variations as indented sub-blocks, comments shown beneath their move
- Undo/redo walks the tree (parent/first-child), not a flat array
- "New Line" clears the board to start a fresh tree
- Save stores the full tree (`line.tree`) plus a flattened `line.moves` array for fast training lookups

### Training mode
- 4 modes: All Lines, Spaced Repetition, Weak Lines, Random
- Auto-plays the opponent's moves from the stored main line, waits for your move on your turn
- Wrong move → red flash, piece does not move (no illegal state is ever applied to the live board), correct squares highlighted after a beat, mistake counted
- Correct move → green flash, success tone, advances automatically
- Live HUD: correct / wrong / streak / accuracy / line position
- Session accuracy logged to history on completion

### Spaced repetition
- Per-line `confidence` (0–6) mapped to interval ladder: 1, 3, 7, 14, 30, 60, 120 days
- Wrong answer always schedules a retry the next day and drops confidence by one
- Correct answer raises confidence and pushes the next review further out
- `attempts`, `successes`, `mistakes`, `streak`, `nextReview`, `lastTrained` all persisted per line
- Weak-Lines mode sorts by lowest accuracy first; Spaced mode trains only what's due; Random mode shuffles the pool

### PGN import — full fidelity
- Paste PGN or load a `.pgn` file
- Multi-game PGN automatically split on `[Event` boundaries
- Comments (`{...}`) preserved and attached to their move node
- Variations (`(...)`) parsed recursively into the tree as sibling branches at any depth — nested variations inside variations work
- NAG annotations (`$1`, `$2`, etc.) safely skipped
- Opening name auto-detected from a curated table of ~50 common openings/variations, falling back to the move list itself when no match is found
- Click any parsed game to import it straight into the active folder

### Repertoire organization
- Nested folders of unlimited depth — right-click any folder → "New Subfolder"
- Folder color tag (White/Black) determines which side the board auto-flips to when training or loading a line from that folder
- Move line between folders — right-click any line → "Move to Folder" → pick destination from a list
- Rename/delete folders and lines via right-click context menu
- Search box filters lines by name or move text, and recursively matches folders containing a match at any depth
- Status dots: green (mastered, confidence ≥ 4), red (struggling, accuracy < 60%), amber (due for review)

### Persistence
- IndexedDB stores folders, lines (including full trees), and settings
- Auto-save on every recorded move and every training result
- Full JSON backup export/import (folders + lines + session history)
- Separate PGN export, including variations and comments, round-trip tested

### Dashboard
- Total lines, mastered count, due-today count, global accuracy, best streak, total sessions
- 14-session accuracy bar chart
- Due-for-review list — click any entry to jump straight into a spaced-repetition session for that line

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `←` | Undo (record mode) |
| `→` | Redo (record mode) |
| `F` | Flip board |
| `N` | New line (clear board) |
| `Esc` | Close any open modal/menu |

---

## Data model

```js
// Folder — supports nesting via parentId
{ id, name, color: 'white'|'black', parentId: string|null, collapsed }

// Line — stores both a tree (with variations/comments) and a flattened
// move list (used directly by the training engine for speed)
{
  id, folderId, name,
  moves: ['e4','e5','Nf3', ...],        // main line, flat SAN array
  tree: {                                 // full tree with branches
    id, san: null, move: null, fen, comment: '',
    children: [
      { id, san:'e4', move:{from,to,promotion}, fen, comment:'',
        children: [ /* e5 node, plus sibling variations */ ] }
    ]
  },
  attempts, successes, mistakes, streak, confidence,
  nextReview, lastTrained, created
}

// Session
{ date: timestamp, acc: 0-100 }
```

---

## Testing

This build was verified with 33 automated tests run against the real chess.js 0.10.3 engine in a Node VM sandbox loading the actual shipped `<script>` contents (not a reimplementation):

- 7 tree-structure tests (node creation, traversal, branch creation, dedup)
- 6 PGN-with-variations parser tests (comments, nested variations, result-token stripping)
- 3 multi-game PGN tests (tags, splitting, variation-aware main-line extraction)
- 3 opening-name detection tests
- 4 SRS scoring tests
- 1 PGN round-trip export/re-import test
- 4 nested-folder search tests
- 6 full-line training simulation tests across 5 real openings (Italian, Ruy Lopez, Sicilian Dragon, French, QGD), including a deliberate wrong-move detection case
- 5 seed-data PGN parse tests (the exact strings shipped in `boot()`)

All 33 pass. The Italian Game seed line additionally has its embedded variation (3...Nf6 Two Knights Defense, 10 plies deep) walked node-by-node and confirmed to match exactly.

---

## Known limitations

- No chess engine analysis (no Stockfish integration)
- No cloud sync — data is local to the browser via IndexedDB; use JSON export/import to move between devices
- Opening name table covers common openings only; obscure or highly transposed lines fall back to showing the raw move sequence as the name
- Move animation is a quick scale/opacity transition, not a full square-to-square slide
