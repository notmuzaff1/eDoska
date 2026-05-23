# eDoska Deployment & Usage Guide

## Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Runs on `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

Output: `dist/` folder (416 KB total, 119.66 KB gzipped)

## User Flow

### 1. Lockscreen Mode (Initial Display)
- Teacher opens the URL on smart board
- QR code appears with animated glow effects
- Real-time clock and lesson info displayed
- Cannot interact with screen

### 2. Teacher Authentication
- Teacher scans QR with Telegram Mini App
- Backend receives session ID
- Dashboard automatically unlocks (smooth transition)
- **Dev Testing:** Click "Simulate Auth" button in bottom-right

### 3. Dashboard Activation
- 3-column layout displays instantly
- Left sidebar shows current lesson info
- Center shows presentation viewer
- Right panel shows timer and resources
- Bottom action dock becomes active

## Interactive Tools

### 🎯 Random Student Picker
1. Click "O'quvchi Tanlash" in action dock
2. Enter modal appears with spinning wheel
3. Click "Tanlash" to spin
4. Student name displays on wheel
5. Can't pick same student twice (shows remaining count)
6. "Qayta o'rnatish" resets the list

### ✍️ Whiteboard Mode
1. Click "Whiteboard" in action dock
2. Canvas opens with toolbar
3. **Pen:** Click pen icon, choose color from palette
4. **Eraser:** Click eraser icon
5. **Brush Size:** Slider 1-20px
6. **Download:** Saves as PNG file
7. **Clear:** Clears entire canvas

### 🌐 Browser Mode
1. Click "Browser" in action dock
2. Safe browser opens with quick links
3. Only allowed domains: YouTube, Wikipedia, Khan Academy, Google Docs
4. Type URL and press Enter
5. Blocked URLs show warning message

### 💬 AI Assistant
1. Click "AI Yordamchi" in action dock
2. Chat panel slides in from right
3. Pre-written suggestions show on first load
4. Type questions or click suggestions
5. Mock AI responds with educational content
6. Auto-dismisses context from current subject

### 🤖 AI Lesson Generator
1. Click "AI Dars" in action dock
2. Enter lesson topic (e.g., "Kvadrat tenglamalar")
3. Click "Dars Yaratish"
4. AI generates:
   - 6-slide presentation (2 seconds)
   - 3 related YouTube videos
   - 5 quiz questions
   - Lesson summary
5. Browse with tabs: Slaydlar, Videolar, Test, Xulosa
6. Click "Qabul qilish" to close

## Automatic Features

### Real-Time Schedule Detection
- System automatically detects current lesson
- Updates teacher name, subject, room location
- Timer calculates exact time remaining
- Changes instantly when lesson ends

### Example Schedule
```
Monday:
08:00-08:45 → Ingliz tili → Xakimov S.D. → Room 105
08:50-09:35 → Geometriya → Saparov M.O. → Room 205
09:40-10:25 → CHQBT → Toshbo'lov X.T. → Room 301
... (7 more lessons per day)
```

### Supported Subjects
- Algebra
- Geometriya (Geometry)
- CHQBT (Biology/Environment)
- Fizika (Physics)
- Ona tili (Native Language)
- Adabiyor (Literature)
- Ingliz tili (English)
- Rus tili (Russian)
- Informatika va AT (Computer Science)
- O'zbekiston tarixi (History)
- Jismoniy tarbiya (PE)

## Admin/Dev Testing

### Development-Only Panel
Bottom-right corner shows (dev only):
- Current session ID
- "Simulate Auth" button for testing
- Enables rapid UI testing without Telegram

### Disable for Production
Panel auto-hides when `isAuthenticated=true`

## Advanced Features

### Schedule Manager API
```typescript
scheduleManager.getCurrentLesson()        // Current lesson
scheduleManager.getNextLesson()           // Upcoming lesson
scheduleManager.getTodaySchedule()        // All today's lessons
scheduleManager.getLessonsByTeacher(name) // Teacher's lessons
scheduleManager.getLessonsBySubject(sub)  // Subject lessons
scheduleManager.getTimeRemainingInLesson(lesson) // Countdown
```

### AI Content Generation
```typescript
aiLessonGenerator.generateLesson(subject, topic)
aiLessonGenerator.generateQuiz(subject, topic)
aiLessonGenerator.generateSummary(subject, topic)
aiLessonGenerator.getRelatedVideos(subject)
```

## Deployment Checklist

- [ ] Replace mock YouTube videos with real API
- [ ] Integrate Gemini/OpenAI API for AI features
- [ ] Set up backend Socket.IO server
- [ ] Connect Telegram Mini App authentication
- [ ] Configure Supabase for session history
- [ ] Enable HTTPS/SSL certificate
- [ ] Optimize for 4K displays (3840×2160)
- [ ] Test on actual smart board hardware
- [ ] Add student roster management UI
- [ ] Implement admin dashboard

## Performance Metrics

- **Bundle Size:** 392.60 KB (119.66 KB gzipped)
- **Modules:** 1,874 transformed
- **Build Time:** ~10 seconds
- **Component Count:** 12 main components
- **Data Points:** 30 lessons, 31 students

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires WebGL for canvas drawing
- Modern JS (ES2020+)

## Troubleshooting

### Schedule Not Updating
- Check browser time matches system time
- Verify schedule.json is loaded
- Check console for parsing errors

### AI Features Not Working
- Verify aiLessonGenerator.ts is imported
- Check mock data exists
- Ensure no build errors

### Whiteboard Lag
- Reduce brush size
- Clear canvas regularly
- Check browser performance

### Student Picker Stuck
- Refresh page with F5
- Check console for errors
- Verify students.json has 31+ entries

## Support & Maintenance

- Regular schedule updates via schedule.json
- Add students by editing students.json
- Customize colors in Tailwind config
- Update mock videos in aiLessonGenerator.ts
- Monitor browser console for errors

## License

Proprietary - eDoska Platform © 2026
