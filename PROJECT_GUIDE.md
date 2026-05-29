# Chess Opening Repertoire Trainer

A comprehensive browser-based chess opening training application designed to help players memorize, practice, and master their chess opening repertoires through interactive training sessions.

## Features

### Core Functionality

**Interactive Chessboard**
- Standard 8x8 chessboard with piece movement and animations
- Legal move validation using chess.js
- Smooth piece animations and visual feedback
- Board flip functionality for both perspectives
- Highlighted squares showing legal moves and move history

**Repertoire Recording Mode**
- Manually record opening lines by playing moves on the board
- Real-time move list display with algebraic notation
- Automatic opening name detection
- Undo and reset functionality
- Save recorded lines as custom repertoires

**Training/Repetition Mode**
- Replay recorded repertoires from the starting position
- Enforce exact move sequences with validation
- Immediate feedback on correct and incorrect moves
- Sound effects for move feedback
- Progress tracking with accuracy percentage
- Mistake counter and session statistics

**Folder Organization System**
- Create and organize repertoires into folders
- Rename and delete repertoires and folders
- Move repertoires between folders
- Hierarchical folder structure for complex opening systems

**PGN Import/Export**
- Import chess games from PGN files or pasted text
- Parse multiple games from single PGN
- Select specific games to convert into training repertoires
- Export all repertoires and folders as JSON backup
- Import previously exported backups

**Progress Dashboard**
- Visual statistics with charts and graphs
- Difficulty distribution (Easy/Medium/Hard)
- Top performing repertoires by accuracy
- Recent activity tracking
- Overall accuracy and attempt statistics

**Spaced Repetition System**
- Automatic difficulty adjustment based on performance
- Repertoires marked as Easy, Medium, or Hard
- Success rate tracking for each repertoire
- Last attempt timestamp for scheduling reviews

**Storage & Backup**
- All data saved locally in browser localStorage
- No backend required - fully offline capable
- Auto-save functionality
- JSON export/import for data backup and transfer

### User Interface

**Design Philosophy: Warm Elegance with Organic Curves**
- Cream background (#faf6f0) with warm brown accents (#8b6f47)
- Sage green for success states (#a8b89e)
- Warm coral for error states (#d97e6e)
- Organic rounded corners (1.2rem radius)
- Soft shadows for depth and dimension
- Playfair Display for elegant headings
- Lora for body text hierarchy
- Inter for readable content

**Theme Support**
- Light and dark mode toggle
- Persistent theme preference
- High contrast ratios for accessibility

**Responsive Design**
- Mobile-first approach
- Sidebar navigation with mobile menu toggle
- Adaptive layouts for all screen sizes
- Touch-friendly interface

**Sound Effects**
- Success sound (ascending tones) for correct moves
- Error sound (descending tones) for incorrect moves
- Move sound (short click) for board interactions
- Completion sound (triumphant tones) for session completion

## Getting Started

### Recording a New Repertoire

1. Click **"Record New Repertoire"** button
2. Play moves on the chessboard for both White and Black
3. Use **Undo** to correct mistakes
4. View the opening name detection in the sidebar
5. Click **"Save Repertoire"** when complete
6. Enter a name for your repertoire (e.g., "Sicilian Defense - Main Line")
7. Repertoire is automatically saved to browser storage

### Training on a Repertoire

1. Select a repertoire from the sidebar
2. Click **"Start Training"** button
3. Replay the exact moves from the recording
4. Correct moves are highlighted in green
5. Wrong moves are rejected with error feedback
6. Continue until all moves are completed
7. View session statistics (accuracy, mistakes, time)

### Importing PGN Games

1. Click **"Import PGN"** button
2. Either upload a .pgn file or paste PGN text
3. Click **"Parse PGN"** to extract games
4. Select the game(s) you want to import
5. Enter a custom name for the repertoire
6. Click **"Import"** to create the repertoire

### Organizing Repertoires

1. Click **"Folder"** button to create new folders
2. Click **"New"** to create repertoires in selected folder
3. Use rename icons to change names
4. Use delete icons to remove items
5. Drag repertoires between folders (planned feature)

### Viewing Progress

1. Click **"Progress"** button to open dashboard
2. View overall statistics and accuracy metrics
3. See difficulty distribution of your repertoires
4. Check top performing repertoires
5. Review recent training activity

### Exporting Data

1. Click **"Export"** button to download JSON backup
2. Save the file to your computer
3. Use **"Settings"** to import previously exported backups
4. All repertoires and folders are preserved

## Technical Architecture

### Frontend Stack
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **chess.js** - Chess logic and validation
- **Recharts** - Data visualization
- **Sonner** - Toast notifications
- **Lucide React** - Icons
- **Web Audio API** - Sound effects

### Storage
- **Browser localStorage** - Persistent data storage
- **JSON serialization** - Data format
- **Auto-save** - Automatic persistence

### Key Libraries
- **chess.js** - Move validation, FEN parsing, PGN support
- **Recharts** - Charts and graphs for progress dashboard
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives

## Data Structure

### Repertoire Object
```typescript
{
  id: string;
  name: string;
  folderId: string;
  moves: ChessMove[];
  pgn?: string;
  createdAt: number;
  updatedAt: number;
  stats: {
    attempts: number;
    successes: number;
    lastAttempt?: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}
```

### Folder Object
```typescript
{
  id: string;
  name: string;
  parentId?: string;
  createdAt: number;
}
```

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires localStorage support and modern JavaScript (ES2020+).

## Keyboard Shortcuts (Planned)

- `Ctrl+S` - Save current recording
- `Ctrl+Z` - Undo last move
- `Ctrl+R` - Reset board
- `Ctrl+E` - Export data
- `Ctrl+I` - Import data

## Limitations & Future Enhancements

### Current Limitations
- Single-user application (no cloud sync)
- No multiplayer support
- Limited opening database (can be expanded)
- No move analysis or engine evaluation

### Planned Features
- Cloud synchronization with user accounts
- Opening database expansion
- Chess engine integration for move analysis
- Spaced repetition scheduling algorithm refinement
- Mobile app version
- Multiplayer training sessions
- Video tutorials and opening explanations
- Variation branching within repertoires
- Performance analytics and heatmaps

## Privacy & Data

- All data stored locally in browser
- No data sent to external servers
- No tracking or analytics
- No cookies or third-party services
- Complete user privacy and control

## Performance

- Lightweight bundle (~1.1MB gzipped)
- Fast load times
- Smooth animations at 60fps
- Minimal memory footprint
- Efficient localStorage usage

## Accessibility

- WCAG 2.1 AA compliance target
- Keyboard navigation support
- High contrast color scheme
- Screen reader friendly
- Semantic HTML structure

## Support & Feedback

For issues, feature requests, or feedback, please use the application's built-in feedback mechanism or contact the development team.

## License

This application is provided as-is for personal chess training use.

---

**Happy Training! ♔**

Master your chess openings with consistent, focused practice using the Chess Opening Repertoire Trainer.
