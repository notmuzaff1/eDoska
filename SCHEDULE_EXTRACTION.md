# School Schedule Extraction Guide

## Overview

This project includes a comprehensive school schedule for class 10-V with 40 lessons extracted in JSON format, supporting full integration with the eDoska classroom platform.

## Files

### Main Files

- **schedule.json** - Complete school schedule in JSON format with all lessons
- **extract_schedule.py** - Python script to extract schedule from Excel files
- **src/types/schedule.ts** - TypeScript type definitions for schedule data
- **src/lib/scheduleManager.ts** - Utility functions for schedule management and queries

## Schedule Structure

Each lesson in the schedule contains:

```typescript
{
  "dayOfWeek": "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday",
  "timeStart": "HH:MM",           // Lesson start time
  "timeEnd": "HH:MM",             // Lesson end time
  "subject": "Subject Name",      // Subject name (Uzbek text supported)
  "teacher": "Full Name",         // Teacher name
  "room": "Room Number",          // Room or location
  "className": "10-V"             // Class identifier
}
```

## Schedule Overview

- **Class:** 10-V
- **Date:** 11 May 2026 (4 chorak)
- **Total Lessons:** 40
- **Days:** Monday - Saturday
- **Time Range:** 08:00 - 12:15
- **Lesson Duration:** 45 minutes

### Lessons by Day

- Monday: 6 lessons
- Tuesday: 7 lessons
- Wednesday: 6 lessons
- Thursday: 7 lessons
- Friday: 7 lessons
- Saturday: 7 lessons

## Subjects in Schedule

- Ingliz tili Maxsus (Advanced English)
- Geometriya (Geometry)
- CHQBT (Life Safety)
- Algebra
- Jismoniy tarbiya (Physical Education)
  - O'g'illar (Boys)
  - Qizlar (Girls)
- Rus tili (Russian Language)
  - 1-guruh (Group 1)
  - 2-guruh (Group 2)
- Ona tili (Native Language)
- Adabiyor (Literature)
- Tarbiya (Civic Education)
- O'zbekiston tarixi (History of Uzbekistan)
- Informatika va AT (Computer Science)

## Teachers

- Farxod Karimov - Ingliz tili Maxsus
- Laylo Abdullayeva - Geometriya
- Sarvar Yusupov - CHQBT
- Kamila Tashkhodjaeva - Algebra
- Rustam Ismoilov - Jismoniy tarbiya (O'g'illar)
- Gulnora Mirkulova - Jismoniy tarbiya (Qizlar)
- Natalia Volkova - Rus tili (1-guruh)
- Irina Popova - Rus tili (2-guruh)
- Shukrullo Mirzaev - Ona tili
- Firuza Qodirov - Adabiyor
- Aziza Khusnutdinova - Tarbiya
- Alisher Normatov - O'zbekiston tarixi
- Shaxzod Xusainov - Informatika va AT

## Usage

### Using the Schedule Manager

Import and use the schedule manager functions:

```typescript
import {
  getAllLessons,
  getLessonsByDay,
  getCurrentLesson,
  getNextLesson,
  getLessonsByTeacher,
  getLessonsBySubject,
  getTimeRemainingInLesson,
} from "@/lib/scheduleManager";

// Get all lessons
const allLessons = getAllLessons();

// Get lessons for Monday
const mondayLessons = getLessonsByDay("Monday");

// Get current lesson
const currentLesson = getCurrentLesson();

// Get next lesson
const nextLesson = getNextLesson();

// Get time remaining in current lesson
const timeRemaining = getTimeRemainingInLesson(currentLesson);

// Find lessons by teacher
const farxodLessons = getLessonsByTeacher("Farxod Karimov");

// Find lessons by subject
const englishLessons = getLessonsBySubject("Ingliz tili Maxsus");
```

### Extracting from Excel Files

If you have an Excel file with schedule data:

```bash
# Install requirements
pip install openpyxl

# Run extraction script
python extract_schedule.py
```

The script expects an Excel file named `schedule.xls` with columns:
1. Day (Uzbek: Dush, Sesh, Chor, Pay, Jum, Shan)
2. Start Time (HH:MM format)
3. Subject
4. Teacher
5. Room

## Integration with eDoska Platform

The schedule data integrates with the eDoska classroom platform:

1. **Dashboard Integration** - Display current and upcoming lessons
2. **Sidebar Information** - Show lesson details and teacher information
3. **Timer Integration** - Countdown timer based on lesson duration
4. **Session Management** - Link sessions to specific lessons

## Data Validation

All lessons have been validated for:

- Correct time format (HH:MM)
- Proper end time calculation (45-minute duration)
- Valid day of week values
- Proper Uzbek text encoding (UTF-8)
- Class name consistency (10-V)

## Notes

- Lessons with time slot 11:45-12:15 (30 minutes) are shortened PE classes
- Group lessons (Rus tili 1/2 and Jismoniy tarbiya) may run simultaneously in different rooms
- All times are in 24-hour format
- UTF-8 encoding supports full Uzbek language characters
