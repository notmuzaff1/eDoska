#!/usr/bin/env python3
"""
Extract school schedule from Excel file and convert to JSON format.
Handles Uzbek text and proper time conversions.
"""

import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("Error: openpyxl is not installed. Install it with: pip install openpyxl")
    sys.exit(1)

# Day mapping from Uzbek to English
DAY_MAPPING = {
    "Dush": "Monday",
    "Sesh": "Tuesday",
    "Chor": "Wednesday",
    "Pay": "Thursday",
    "Jum": "Friday",
    "Shan": "Saturday"
}

def parse_time(time_str):
    """Convert time string to HH:MM format."""
    if not time_str:
        return None
    time_str = str(time_str).strip()
    try:
        # Handle various time formats
        time_obj = datetime.strptime(time_str, "%H:%M")
        return time_obj.strftime("%H:%M")
    except ValueError:
        try:
            time_obj = datetime.strptime(time_str, "%H.%M")
            return time_obj.strftime("%H:%M")
        except ValueError:
            return time_str

def calculate_end_time(start_time, duration=45):
    """Calculate end time based on start time and duration in minutes."""
    if not start_time:
        return None
    try:
        start = datetime.strptime(start_time, "%H:%M")
        end = start + timedelta(minutes=duration)
        return end.strftime("%H:%M")
    except ValueError:
        return None

def extract_schedule_from_excel(excel_file):
    """
    Extract schedule data from Excel file.
    Expected format: rows with day, time, subject, teacher, room
    """
    try:
        wb = openpyxl.load_workbook(excel_file)
        ws = wb.active
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return []

    lessons = []

    for row in ws.iter_rows(min_row=2, values_only=True):
        # Skip empty rows
        if not any(row):
            continue

        day_uzbek = row[0] if row[0] else None
        time_start = row[1] if len(row) > 1 else None
        subject = row[2] if len(row) > 2 else None
        teacher = row[3] if len(row) > 3 else None
        room = row[4] if len(row) > 4 else None

        if not day_uzbek or not time_start or not subject:
            continue

        day_english = DAY_MAPPING.get(str(day_uzbek).strip(), str(day_uzbek).strip())
        time_start_formatted = parse_time(time_start)
        time_end_formatted = calculate_end_time(time_start_formatted)

        if time_start_formatted:
            lesson = {
                "dayOfWeek": day_english,
                "timeStart": time_start_formatted,
                "timeEnd": time_end_formatted,
                "subject": str(subject).strip(),
                "teacher": str(teacher).strip() if teacher else "",
                "room": str(room).strip() if room else "",
                "className": "10-V"
            }
            lessons.append(lesson)

    return lessons

def main():
    excel_file = Path("schedule.xls")

    if not excel_file.exists():
        print(f"Error: {excel_file} not found")
        sys.exit(1)

    print(f"Reading schedule from {excel_file}...")
    lessons = extract_schedule_from_excel(excel_file)

    if not lessons:
        print("No lessons found in the Excel file")
        sys.exit(1)

    # Sort by day and time
    day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    lessons.sort(key=lambda x: (
        day_order.index(x["dayOfWeek"]) if x["dayOfWeek"] in day_order else 7,
        x["timeStart"]
    ))

    # Write to JSON file
    output_file = Path("schedule.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(lessons, f, ensure_ascii=False, indent=2)

    print(f"Successfully extracted {len(lessons)} lessons")
    print(f"Output saved to {output_file}")
    print("\nSample lessons:")
    for lesson in lessons[:3]:
        print(json.dumps(lesson, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
