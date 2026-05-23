<<<<<<< HEAD
# eDoska - AI-Powered Smart Classroom Platform

A cutting-edge smart classroom platform combining real-time QR authentication, premium dark-mode UI, AI lesson generation, and interactive teaching tools. Designed for modern 4K smart boards with a "Google Classroom + Apple Classroom + AI Smart Board OS" experience.

## Core Features

### 🔐 Lockscreen & Authentication
- Fullscreen kiosk-style interface with animated QR code
- Neon cyan/purple glow effects with futuristic gradients
- Real-time clock, date, and location display
- Secure session creation with unique session IDs
- Instant transition to dashboard on authentication

### 📊 Smart Dashboard (3-Column Layout)
- **Left Sidebar:** 
  - Dynamic class info updating from schedule
  - Teacher name and subject (auto-updated per lesson)
  - Lesson timing and room location
  - Progress tracker and today's schedule
  
- **Center Content Area:**
  - Presentation/PDF viewer with slide navigation
  - Real-time file information
  - Thumbnail preview for quick navigation
  
- **Right Panel:**
  - Educational video player with thumbnails
  - Circular countdown timer (auto-calculates lesson duration)
  - Downloadable resources (PDF, DOCX, links)

### 🎓 Automatic Schedule Integration
- Real-time lesson detection based on current time
- Dashboard auto-updates when lesson changes
- Shows current teacher and subject
- Displays room location and timing
- Supports 30+ subjects from real school schedule

### 🎯 Random Student Picker
- Spinning wheel animation for selecting students
- Prevents duplicate selections until reset
- Supports 31 students from class roster
- Fullscreen animated modal with exciting UI
- "Pick Again" and "Reset List" controls

### ✍️ Interactive Tools (Action Dock)

**Whiteboard Mode**
- Full-featured drawing canvas with pen & eraser
- Adjustable brush size (1-20px)
- 8 color palette (cyan, blue, purple, red, orange, yellow, green, white)
- Download drawings as PNG files
- Clear canvas option

**Browser Mode**
- Restricted to safe educational websites
- Allowed domains: YouTube, Wikipedia, Khan Academy, Google Docs
- Quick links to common educational resources
- URL whitelist prevents harmful content access

**AI Assistant Chat Panel**
- Context-aware chat for current subject
- Suggests quick prompts:
  - "Mavzu haqida tushuntirish"
  - "Test savollari yarating"
  - "Misollar ko'rsating"
  - "Qisqacha xulosa yozing"
- Mock AI responses with educational content

**AI Lesson Generator**
- Auto-generates 6-slide presentations
- Input: Subject + Topic
- Outputs: 
  - Structured slides with key concepts
  - Related YouTube videos (mock data)
  - Quiz questions with 4 options
  - Lesson summary
- Beautiful modal with tabs and slide previews

### 🎬 Presentation Tools
- Smooth animations and transitions with Framer Motion
- Real-time progress tracking
- Lesson countdown with circular progress indicator
- Slide navigation with thumbnail preview
- Responsive 4K smart board layout
- Premium glassmorphism UI with dark mode

### 🔄 Real-Time Flow
1. **Teacher scans QR code** via Telegram Mini App
2. **Dashboard unlocks automatically** (no refresh)
3. **Current lesson loads** with correct teacher/subject
4. **Schedule updates** when lessons change
5. **All tools available** for interactive teaching

## Tech Stack

### Frontend
- **React 18** - UI framework with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Advanced animations and transitions
- **Lucide React** - Professional icons
- **QRCode.React** - QR code generation (3.1.0)
- **Socket.IO Client** - Real-time bidirectional communication
- **Vite 5.4** - Lightning-fast build tool

### Data Management
- **JSON-based Schedule** - 30 lessons from real school
- **Student Roster** - 31 students with full names
- **Mock AI Models** - Educational content generation
- **localStorage** - Session persistence

### Optional Backend Integration
- Node.js + Express with Socket.IO
- YouTube API (for video discovery)
- Gemini/OpenAI API (for AI features)
- Supabase PostgreSQL (session history)

## Project Structure

```
src/
├── components/
│   ├── Lockscreen.tsx       # Kiosk lockscreen with QR code
│   ├── Dashboard.tsx        # Main 3-column layout
│   ├── Sidebar.tsx          # Left navigation panel
│   ├── ContentArea.tsx      # Center presentation viewer
│   ├── RightPanel.tsx       # Right resources panel
│   └── AdminPanel.tsx       # Dev testing controls
├── lib/
│   ├── sessionManager.ts    # Session lifecycle management
│   └── socketManager.ts     # WebSocket management
├── types/
│   └── index.ts             # TypeScript interfaces
├── App.tsx                  # Main app with auth flow
└── index.css                # Global styles
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Usage Flow

1. **Open Website** → Displays lockscreen with animated QR code
2. **Teacher Scans QR** → Uses Telegram Mini App to scan session ID
3. **Backend Authenticates** → Session marked as authenticated
4. **Automatic Transition** → Dashboard displays without page refresh
5. **Interactive Lesson** → Teacher controls presentation, timer, resources

## Testing Authentication (Development)

An admin panel appears in the bottom-right corner during development:
- Shows current session ID
- "Simulate Auth" button triggers authentication
- Dashboard appears after authentication

## Design Features

- **Color Palette:**
  - Deep navy/slate backgrounds (`#0f172a`, `#1e293b`)
  - Neon cyan/blue accents (`#06b6d4`, `#2563eb`)
  - Glassmorphism with backdrop blur
  - Smooth gradients and shadows

- **Typography:**
  - Bold headings for hierarchy
  - Clean sans-serif with max 3 font weights
  - Excellent contrast ratios (WCAG AA+)

- **Animations:**
  - Staggered entrance animations
  - Hover states on interactive elements
  - Smooth transitions between screens
  - Pulse and rotation effects on key elements

## Session Management

Sessions are managed in-memory using `localStorage`:
- Unique session ID generated on page load
- QR code encodes session ID for scanning
- Authentication status tracked locally
- Optional Supabase integration for persistence

## Database Schema (Optional)

```sql
classroom_sessions
├── id (uuid, primary key)
├── session_id (text, unique)
├── class_name (text)
├── subject (text)
├── topic (text)
├── teacher_name (text)
├── is_authenticated (boolean)
├── authenticated_at (timestamptz)
└── created_at (timestamptz)
```

## Responsive Design

- Optimized for 4K smart board displays (3840x2160)
- Responsive breakpoints for tablets and mobile
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements

## Performance

- Optimized bundle size: ~352KB (gzip: ~110KB)
- Smooth 60fps animations
- Lazy loading of components
- Efficient re-rendering with React optimization

## Project Structure

```
src/
├── components/
│   ├── Lockscreen.tsx              # QR code kiosk display
│   ├── Dashboard.tsx               # Main 3-column layout
│   ├── Sidebar.tsx                 # Left navigation panel
│   ├── ContentArea.tsx             # Center presentation viewer
│   ├── RightPanel.tsx              # Right resources panel
│   ├── ActionDock.tsx              # Bottom quick action bar
│   ├── StudentPicker.tsx           # Random student wheel
│   ├── Whiteboard.tsx              # Drawing canvas
│   ├── BrowserMode.tsx             # Restricted browser
│   ├── AIAssistant.tsx             # Chat panel
│   ├── AILessonGenerator.tsx       # Presentation generator
│   └── AdminPanel.tsx              # Dev testing controls
├── lib/
│   ├── scheduleManager.ts          # Lesson scheduling & detection
│   ├── sessionManager.ts           # Session lifecycle
│   ├── socketManager.ts            # WebSocket management
│   └── aiLessonGenerator.ts        # AI content generation
├── data/
│   ├── schedule.json               # 30 lessons (real school schedule)
│   └── students.json               # 31 students (full roster)
├── types/
│   └── index.ts                    # TypeScript interfaces
└── App.tsx                         # Entry point with auth flow
```

## Real-Time Lesson Detection

The `scheduleManager` automatically detects:
- **Current lesson** based on time of day
- **Next lesson** with countdown
- **Teacher name** for current/upcoming lessons
- **Subject** and room location
- **Lesson duration** for timer calculation
- **Day-specific schedule** for week view

## Data Format

### Schedule Structure
```json
{
  "dayOfWeek": "Monday",
  "timeStart": "08:00",
  "timeEnd": "08:45",
  "subject": "Ingliz tili Maxsus",
  "teacher": "Xakimov S.D.",
  "room": "105",
  "className": "10-V"
}
```

### Student Data
```json
[
  "Ahmedova Rayhona Shavkatovna",
  "Anvarova Muhlisa Ulug'bekqizi",
  ...31 students total
]
```

## Future Enhancements

- Real Socket.IO backend for multi-device sync
- Student response features (poll, quiz submissions)
- Multi-camera support for classroom recording
- Screen recording and playback
- Real YouTube API integration
- Gemini/OpenAI API for advanced AI features
- Attendance tracking
- Homework distribution and collection
- Parent notification system
- Analytics dashboard

## License

Proprietary - eDoska Platform

## Support

For issues or questions, contact the development team.
=======
# eDoska
>>>>>>> 41d59caf838e3bef82cb979fab4f8b1035c9a505
