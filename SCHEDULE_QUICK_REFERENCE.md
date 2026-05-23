# Schedule Quick Reference

## File Locations

```
project/
├── schedule.json                          # Main schedule data (40 lessons)
├── extract_schedule.py                    # Excel import utility
├── SCHEDULE_EXTRACTION.md                 # Full documentation
├── SCHEDULE_QUICK_REFERENCE.md           # This file
└── src/
    ├── lib/scheduleManager.ts            # Schedule utilities (queries, filtering)
    └── types/schedule.ts                 # TypeScript types
```

## JSON Format Example

```json
{
  "dayOfWeek": "Monday",
  "timeStart": "08:00",
  "timeEnd": "08:45",
  "subject": "Ingliz tili Maxsus",
  "teacher": "Farxod Karimov",
  "room": "101",
  "className": "10-V"
}
```

## Quick Stats

| Metric | Value |
|--------|-------|
| Total Lessons | 40 |
| Class | 10-V |
| Date | 11 May 2026 (4 chorak) |
| Days | Monday - Saturday |
| Time Range | 08:00 - 12:15 |
| Lesson Duration | 45 minutes (30 min for PE) |
| Unique Subjects | 13 |
| Unique Teachers | 13 |
| Classrooms/Rooms | 11 |

## Schedule by Day

| Day | Lessons | First | Last |
|-----|---------|-------|------|
| Monday | 6 | 08:00 | 12:15 |
| Tuesday | 7 | 08:00 | 12:15 |
| Wednesday | 6 | 08:00 | 12:15 |
| Thursday | 7 | 08:00 | 12:15 |
| Friday | 7 | 08:00 | 12:15 |
| Saturday | 7 | 08:00 | 12:15 |

## Common Manager Functions

```typescript
// Get current lesson
getCurrentLesson(): Lesson | null

// Get next lesson  
getNextLesson(): Lesson | null

// Get all lessons for a day
getLessonsByDay(day: DayOfWeek): Lesson[]

// Find by teacher
getLessonsByTeacher(name: string): Lesson[]

// Find by subject
getLessonsBySubject(subject: string): Lesson[]

// Find by room
getLessonsByRoom(room: string): Lesson[]

// Get time remaining in lesson
getTimeRemainingInLesson(lesson: Lesson): number | null

// Get formatted schedule by day
getFormattedSchedule(): Record<DayOfWeek, Lesson[]>
```

## Subjects List

1. Ingliz tili Maxsus (Advanced English)
2. Geometriya (Geometry)
3. CHQBT (Life Safety)
4. Algebra
5. Jismoniy tarbiya (Physical Education)
6. Rus tili (Russian Language)
7. Ona tili (Native Language)
8. Adabiyor (Literature)
9. Tarbiya (Civic Education)
10. O'zbekiston tarixi (History of Uzbekistan)
11. Informatika va AT (Computer Science)

## Rooms

- 101, 102, 103, 104, 105, 106, 107, 108
- Computer Lab
- Gym, Gym-2

## Teachers

- Aziza Khusnutdinova
- Alisher Normatov
- Farxod Karimov
- Firuza Qodirov
- Gulnora Mirkulova
- Irina Popova
- Kamila Tashkhodjaeva
- Laylo Abdullayeva
- Natalia Volkova
- Rustam Ismoilov
- Sarvar Yusupov
- Shaxzod Xusainov
- Shukrullo Mirzaev

## Integration Steps

1. Import types from `src/types/schedule.ts`
2. Use manager functions from `src/lib/scheduleManager.ts`
3. Access schedule data directly from `schedule.json`
4. Integrate with dashboard components for real-time updates

## Validation Status

✓ All 40 lessons validated
✓ Time format correct (HH:MM)
✓ Day values valid
✓ All required fields present
✓ UTF-8 encoding verified
✓ Class names consistent

## Usage Example

```typescript
import { getCurrentLesson, getTimeRemainingInLesson } from '@/lib/scheduleManager';

// In a React component
const current = getCurrentLesson();
const timeLeft = getTimeRemainingInLesson(current);

if (current) {
  console.log(`Current: ${current.subject} with ${current.teacher}`);
  console.log(`Time remaining: ${timeLeft} minutes`);
}
```

## Modifying the Schedule

To update lessons:

1. Edit `schedule.json` directly, OR
2. Update Excel file and run `python extract_schedule.py`
3. Ensure time format remains HH:MM
4. Keep all required fields populated
5. Maintain UTF-8 encoding for Uzbek text

## Performance Notes

- All 40 lessons load in memory instantly
- Manager functions use array filtering (optimal for this dataset size)
- No database required for basic usage
- Optional: Connect to Supabase for multi-class scenarios
