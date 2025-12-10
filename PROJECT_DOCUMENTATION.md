# Project Documentation: Combined Projects Portal

## Overview
This is a comprehensive web application featuring a main menu that provides access to three interconnected projects: **Minesweeper Game**, **Unit Converter** (with currency conversion), and **Chat Room**. The application uses HTML, CSS, and JavaScript for the frontend, with a Node.js WebSocket server for real-time chat functionality.

**Version**: 1.0.0  
**Created**: November 2025  
**Technology Stack**: HTML5, CSS3, JavaScript (ES6+), Node.js, WebSocket (ws), JSON

---

## Project Structure

```
internet_final/
├── main_index.html          # Main menu landing page
├── main_index.css           # Main menu styling
├── main_index.js            # Main menu animations
├── server.js                # Node.js server for WebSocket chat
├── chat-data.json           # Persistent chat data storage
├── package.json             # Project dependencies
│
├── minesweeper/
│   ├── index.html           # Minesweeper game interface
│   ├── style.css            # Minesweeper styling
│   └── script.js            # Minesweeper game logic
│
├── unit_converter/
│   ├── index.html           # Unit converter interface
│   ├── style.css            # Unit converter styling
│   └── script.js            # Unit converter logic (includes currency API)
│
└── chat/
    ├── index.html           # Chat room interface
    ├── style.css            # Chat room styling
    └── functions.js         # Chat client logic (WebSocket)
```

---

## 1. Main Menu (Landing Page)

### Files
- `main_index.html`
- `main_index.css`
- `main_index.js`

### Features
- **Responsive Grid Layout**: Projects displayed in a responsive grid that adapts to mobile and desktop
- **Gradient Background**: Purple gradient (`#667eea` to `#764ba2`)
- **Project Cards**: Three cards with icons, descriptions, and navigation buttons
  - 💣 Minesweeper
  - 🔄 Unit Converter
  - 💬 Chat Room
- **Smooth Animations**: Cards fade in and slide up on page load
- **Mobile Responsive**: Stacks to single column on screens ≤768px

### Design Theme
All projects follow a unified design theme:
- **Color Scheme**: Purple gradient background
- **Typography**: 'Segoe UI' font family
- **Card Style**: White cards with rounded corners and subtle shadows
- **Buttons**: Gradient buttons matching the theme
- **Transitions**: Smooth 0.3s ease transitions for interactive elements

---

## 2. Minesweeper Game

### Files
- `minesweeper/index.html`
- `minesweeper/style.css`
- `minesweeper/script.js`

### Features
- **Three Difficulty Levels**:
  - Easy: 8×8 board with 10 mines
  - Medium: 12×12 board with 25 mines
  - Hard: 16×16 board with 50 mines

- **Gameplay**:
  - Left-click to reveal cells
  - Right-click to place/remove flags
  - Auto-reveal adjacent cells if clicked cell has 0 adjacent mines
  - First click is guaranteed safe (mines placed after first click)
  - Timer tracking game duration
  - Mine counter and flag counter display

- **Game Logic**:
  - Cells display numbers (1-8) indicating adjacent mines
  - Colors correspond to mine counts (blue, green, red, etc.)
  - Win condition: Reveal all non-mine cells
  - Lose condition: Click on a mine
  - Modal displays game results (win/lose with time)

- **User Interface**:
  - Difficulty selector buttons
  - Game info display (mines, timer, flags)
  - "New Game" button for quick reset
  - Back button to return to main menu
  - Responsive cell sizing

### Technical Implementation
- **Class-based OOP**: `Minesweeper` class manages all game state
- **Event Delegation**: Single event listener on board for performance
- **Data Structures**: 2D arrays for board state, revealed status, and flagged cells
- **Timer**: Uses `setInterval` for countdown
- **State Management**: `gameOver`, `gameWon`, `firstClick` flags control flow

---

## 3. Unit Converter

### Files
- `unit_converter/index.html`
- `unit_converter/style.css`
- `unit_converter/script.js`

### Features
- **Six Conversion Categories**:
  1. **Length**: Meter, Kilometer, Centimeter, Millimeter, Mile, Yard, Foot, Inch
  2. **Weight**: Kilogram, Gram, Milligram, Metric Ton, Pound, Ounce
  3. **Temperature**: Celsius, Fahrenheit, Kelvin
  4. **Volume**: Liter, Milliliter, Cubic Meter, Gallon, Quart, Pint, Cup, Fluid Ounce
  5. **Time**: Second, Minute, Hour, Day, Week, Month, Year
  6. **Currency**: Live exchange rates via external API

- **User Interface**:
  - Category selector buttons (tabs)
  - "From" input with unit dropdown
  - "To" input with unit dropdown (read-only)
  - Swap button (⇄) to reverse conversion direction
  - Formula display showing the calculation
  - Quick reference guide for each category

- **Currency Converter Specifics**:
  - **API**: `https://open.er-api.com/v6/latest/USD` (free, no authentication)
  - **Base Currency**: USD
  - **Auto-Update**: Fetches rates on page load and category selection
  - **Supported**: 160+ currencies worldwide
  - **Display**: Shows last update time and data source

- **Real-time Conversion**:
  - Updates result as user types
  - Handles decimal precision (6 decimal places)
  - Special handling for temperature conversions

### Technical Implementation
- **Class-based OOP**: `UnitConverter` class manages conversions
- **Factor-based System**: Conversion uses factor multiplication/division
- **API Integration**: Fetch API for currency rates with error handling
- **Dynamic Unit Loading**: Categories populate dropdowns dynamically
- **Temperature Handling**: Special formulas for Celsius ↔ Fahrenheit ↔ Kelvin

---

## 4. Chat Room

### Files
- `chat/index.html`
- `chat/style.css`
- `chat/functions.js`
- `server.js` (backend)
- `chat-data.json` (data storage)

### Features
- **User Management**:
  - Username selection on join
  - Username character limit (15 characters)
  - Active user list per room

- **Room Management**:
  - View available rooms
  - Create new rooms dynamically
  - Join existing rooms
  - Leave room functionality
  - Persistent room list

- **Chat Features**:
  - Real-time messaging via WebSocket
  - Message history per room (persisted to JSON)
  - Room-specific message streams
  - User presence indication
  - Keyboard shortcuts (Enter to send/create)

- **UI Layout**:
  - Header with room name and leave button
  - Sidebar with active users list
  - Main chat area with message feed
  - Input area at bottom for message composition
  - Modal for username selection
  - Room selection view

### WebSocket Communication Protocol

#### Message Types (Client → Server)
- **new-user**: `{ type: "new-user", username: string }`
- **create-room**: `{ type: "create-room", room: string }`
- **join-room**: `{ type: "join-room", room: string }`
- **leave-room**: `{ type: "leave-room" }`
- **message**: `{ type: "message", room: string, username: string, text: string, timestamp: number }`

#### Message Types (Server → Client)
- **new-room**: `{ type: "new-room", room: string }`
- **user-list**: `{ type: "user-list", users: string[] }`
- **message**: `{ type: "message", data: messageObject }`
- **history**: `{ type: "history", data: messageObject[] }`

### Backend Architecture (Node.js)

#### Server Configuration
- **Port**: 8081
- **HTTP Server**: Serves static files (HTML, CSS, JS)
- **WebSocket Server**: Handles real-time connections

#### Data Persistence
- **Format**: JSON (chat-data.json)
- **Stored Data**:
  - `rooms`: Array of room names
  - `chatHistory`: Object with room names as keys, message arrays as values
- **Save Strategy**: Data written to disk on room creation and message send
- **Load Strategy**: Data loaded on server startup

#### Key Functions
- `loadData()`: Reads from chat-data.json on startup
- `saveData()`: Writes rooms and chatHistory to JSON file asynchronously
- `createRoom()`: Adds room to list, saves, and broadcasts to all clients
- `storeAndBroadcastMessage()`: Stores message, saves, and sends to room users
- `broadcastUserList()`: Updates active user list per room

#### Client-Server Flow
1. User sets username → sent to server (new-user)
2. Server responds with existing rooms (new-room messages)
3. User creates or joins room → sent to server
4. Server saves room if new, loads message history, broadcasts user list
5. User sends message → stored and broadcast to room
6. User leaves room → broadcasts updated user list

---

## 5. Styling & Theme

### Color Palette
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Background**: White for content cards
- **Text**: Dark gray (#333) for main text, medium gray (#666) for secondary
- **Accents**: Theme gradient for buttons and highlights
- **Borders**: Light gray (#ddd, #bbb)

### Typography
- **Font Family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Heading Sizes**: H1 (2.5-3rem), H2 (1.8rem), H3 (1.1-1.2rem)
- **Body Text**: 1rem (16px)

### Responsive Design
- **Breakpoint**: 768px
- **Desktop**: Full grid layouts, larger fonts
- **Mobile**: Single column, reduced padding, adjusted font sizes
- **Touch-friendly**: Buttons minimum 44px tall, adequate spacing

---

## 6. Installation & Running

### Prerequisites
- Node.js (v14+)
- npm

### Setup
```bash
# Install dependencies
npm install

# This installs the 'ws' package for WebSocket support
```

### Running the Server
```bash
npm start
# or
node server.js
```

The server will start on `http://localhost:8081`

### Accessing the Application
- Open your browser to `http://localhost:8081`
- You will see the main menu with three projects
- Each project is fully functional without additional setup

### File Serving
- Static files are served by the HTTP server created in `server.js`
- HTML, CSS, JS files are served with appropriate MIME types
- Chat data persists in `chat-data.json`

---

## 7. Browser Compatibility

- **Chrome/Chromium**: Full support (latest)
- **Firefox**: Full support (latest)
- **Safari**: Full support (latest)
- **Edge**: Full support (latest)
- **Mobile browsers**: Responsive design supported

### Requirements
- WebSocket support (for chat)
- ES6 JavaScript support
- Fetch API (for currency rates)

---

## 8. Known Limitations & Notes

### Chat Room
- Messages are stored in local JSON file (not encrypted)
- No user authentication (usernames are not validated)
- No message editing or deletion
- Room names are case-sensitive
- WebSocket connections may drop on network changes

### Currency Converter
- Exchange rates are fetched from free API (may have rate limits)
- Rates are updated when category is changed
- Base currency is fixed to USD
- Some currencies may not be available depending on API

### Minesweeper
- Board is generated after first click (prevents instant loss)
- No difficulty increase or progressive gameplay
- No leaderboard or scoring system

### General
- No user accounts or login system
- Chat history only persists in JSON (no database)
- No backup mechanism for chat data
- All data is in-memory + JSON backup

---

## 9. Future Enhancement Ideas

1. **Authentication**: Add user login system with passwords
2. **Database**: Replace JSON with MongoDB or PostgreSQL
3. **Private Messaging**: Allow direct messages between users
4. **Minesweeper Variations**: Custom board sizes, hint system
5. **Unit Converter**: Add more categories (pressure, energy, etc.)
6. **Chat Features**: Typing indicators, emoji support, message search
7. **Statistics**: Game scores, conversion history
8. **Accessibility**: ARIA labels, keyboard navigation improvements
9. **Localization**: Support for multiple languages
10. **PWA**: Make offline-compatible Progressive Web App

---

## 10. File Change Summary

### Initial Creation (November 2025)
- Created main menu with three project cards
- Implemented full Minesweeper game with 3 difficulty levels
- Built Unit Converter with 5 unit categories

### Updates & Modifications (December 2025)
- Added Chat Room project with WebSocket server
- Integrated currency converter with live API rates
- Implemented persistent chat data storage
- Reorganized chat files into dedicated folder
- Fixed file serving paths in server.js
- Added back-to-menu navigation across all projects
- Unified styling across all projects
- Updated main menu to include chat project

---

## 11. Contact & Support

For issues, suggestions, or improvements, please review the code files and consider:
- Console error messages for debugging
- Network tab in browser DevTools for API calls
- WebSocket frames in Network tab for chat debugging
- Browser cache clearing if styles don't update

---

**Last Updated**: December 10, 2025
