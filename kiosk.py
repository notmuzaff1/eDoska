"""
eDoska Kiosk — Locks Windows to edoska.vercel.app
Acts as companion to the web-based KioskLock component.

Usage:
  python kiosk.py              # Start kiosk (or wait for scheduled lesson)
  python kiosk.py --unlock     # Restore system manually

Requires: Google Chrome or Chromium installed.
"""

import subprocess
import os
import sys
import time
import threading
import platform
import json
import shutil

SITE = "https://edoska.vercel.app"

# ── SCHEDULE ──────────────────────────────────
# Edit these times for your school day
LESSONS = [
    {"start": "8:00",  "end": "8:45"},
    {"start": "8:55",  "end": "9:40"},
    {"start": "9:50",  "end": "10:35"},
    {"start": "10:55", "end": "11:40"},
    {"start": "11:50", "end": "12:35"},
    {"start": "13:00", "end": "13:45"},
    {"start": "13:55", "end": "14:40"},
]
# ──────────────────────────────────────────────

OS = platform.system()
DESKTOP = (
    os.environ.get("XDG_CURRENT_DESKTOP", "") +
    os.environ.get("DESKTOP_SESSION", "")
).upper()

chrome_process = None
kiosk_running = False
UNLOCK_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".kiosk_unlock")

# ================================
# FIND BROWSER
# ================================
def find_chrome():
    if OS == "Windows":
        paths = [
            os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
            os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
            os.path.expandvars(r"%LocalAppData%\Microsoft\Edge\Application\msedge.exe"),
        ]
    elif OS == "Darwin":
        paths = [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Chromium.app/Contents/MacOS/Chromium",
            "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
        ]
    else:
        paths = [
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser",
            "/usr/lib/chromium/chromium",
            "/snap/bin/chromium",
            "/usr/bin/brave-browser",
            "/usr/bin/microsoft-edge",
        ]
        for cmd in ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]:
            result = shutil.which(cmd)
            if result:
                paths.insert(0, result)

    for path in paths:
        if os.path.exists(path):
            print(f"[✓] Browser: {path}")
            return path

    print("[✗] No browser found! Install Chrome or Chromium.")
    sys.exit(1)

CHROME = find_chrome()

# ================================
# KILL BROWSER
# ================================
def kill_browser():
    if OS == "Windows":
        for exe in ["chrome.exe", "msedge.exe", "brave.exe"]:
            os.system(f"taskkill /f /im {exe} 2>nul")
    elif OS == "Darwin":
        os.system("pkill -f 'Google Chrome' 2>/dev/null")
        os.system("pkill -f Chromium 2>/dev/null")
        os.system("pkill -f 'Brave Browser' 2>/dev/null")
    else:
        for proc in ["chrome", "chromium", "brave", "firefox", "msedge"]:
            os.system(f"pkill -f {proc} 2>/dev/null")
    time.sleep(1)

# ================================
# LAUNCH KIOSK
# ================================
def launch_kiosk():
    global chrome_process, kiosk_running

    print(f"[+] Opening kiosk — {time.strftime('%H:%M:%S')}")
    kill_browser()

    flags = [
        CHROME,
        "--kiosk",
        "--no-first-run",
        "--disable-infobars",
        "--disable-extensions",
        "--disable-session-crashed-bubble",
        "--no-default-browser-check",
        "--disable-popup-blocking",
        "--disable-translate",
        "--disable-features=TranslateUI",
        "--noerrdialogs",
        "--disable-pinch",
        "--disable-restore-session-state",
        SITE
    ]

    chrome_process = subprocess.Popen(flags)
    kiosk_running = True
    time.sleep(3)

# ================================
# CLOSE KIOSK
# ================================
def close_kiosk():
    global chrome_process, kiosk_running
    print(f"[x] Closing kiosk — {time.strftime('%H:%M:%S')}")
    kiosk_running = False

    if chrome_process:
        try:
            chrome_process.terminate()
        except:
            pass

    kill_browser()
    restore_system()
    print("[✓] System restored.")

# ================================
# LOCK SYSTEM (Windows)
# ================================
def disable_system():
    print("[🔒] Locking system...")

    if OS == "Windows":
        cmds = [
            r'reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" /v DisableTaskMgr /t REG_DWORD /d 1 /f',
            r'reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoDesktop /t REG_DWORD /d 1 /f',
            r'reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoDriveTypeAutoRun /t REG_DWORD /d 255 /f',
            "taskkill /f /im explorer.exe 2>nul",
        ]
        for cmd in cmds:
            os.system(cmd)
        print("[🔒] Windows locked — Task Manager & Desktop disabled")

    elif OS == "Darwin":
        os.system("defaults write com.apple.dock mcx-expose-disabled -bool TRUE")
        os.system("killall Dock 2>/dev/null")
        os.system("killall SystemUIServer 2>/dev/null")

    elif "GNOME" in DESKTOP:
        for gs in [
            "org.gnome.desktop.wm.keybindings panel-main-menu '[]'",
            "org.gnome.desktop.wm.keybindings show-desktop '[]'",
            "org.gnome.shell.keybindings toggle-overview '[]'",
            "org.gnome.desktop.wm.keybindings switch-windows '[]'",
            "org.gnome.desktop.wm.keybindings close '[]'",
        ]:
            os.system(f"gsettings set {gs}")

    elif "KDE" in DESKTOP or "PLASMA" in DESKTOP:
        os.system("kwriteconfig5 --file kglobalshortcutsrc --group plasmashell --key 'Show Dashboard' none,none,none")
        os.system("kwriteconfig5 --file kglobalshortcutsrc --group kwin --key 'Show Desktop' none,none,none")
        os.system("kwriteconfig5 --file kglobalshortcutsrc --group kwin --key 'Window Close' none,none,none")
        os.system("qdbus org.kde.KWin /KWin reconfigure 2>/dev/null")

    elif "I3" in DESKTOP:
        os.system("i3-msg 'bindsym alt+F4 exec echo blocked'")
        os.system("i3-msg 'bindsym super+d exec echo blocked'")
        os.system("i3-msg 'bindsym ctrl+alt+t exec echo blocked'")

# ================================
# RESTORE SYSTEM (Windows)
# ================================
def restore_system():
    if OS == "Windows":
        cmds = [
            r'reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" /v DisableTaskMgr /t REG_DWORD /d 0 /f',
            r'reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoDesktop /t REG_DWORD /d 0 /f',
            r'reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoDriveTypeAutoRun /t REG_DWORD /d 0 /f',
            "start explorer.exe",
        ]
        for cmd in cmds:
            os.system(cmd)
    elif OS == "Darwin":
        os.system("defaults write com.apple.dock mcx-expose-disabled -bool FALSE")
        os.system("killall Dock 2>/dev/null")
        os.system("killall SystemUIServer 2>/dev/null")
    else:
        os.system("gsettings reset-recursively org.gnome.desktop.wm.keybindings 2>/dev/null")
        os.system("gsettings reset-recursively org.gnome.shell.keybindings 2>/dev/null")

# ================================
# KEEP BROWSER ALIVE
# ================================
def keep_browser_alive():
    while kiosk_running:
        try:
            if OS == "Windows":
                alive = "chrome.exe" in os.popen("tasklist 2>nul").read() or \
                        "msedge.exe" in os.popen("tasklist 2>nul").read()
            else:
                output = os.popen("ps aux 2>/dev/null").read()
                alive = "chrome" in output or "chromium" in output

            if not alive and kiosk_running:
                print("[!] Browser closed! Reopening...")
                launch_kiosk()
        except:
            pass
        time.sleep(3)

# ================================
# KILL UNWANTED PROCESSES
# ================================
def kill_unwanted():
    while kiosk_running:
        if OS == "Windows":
            for proc in ["taskmgr.exe", "explorer.exe"]:
                os.system(f"taskkill /f /im {proc} 2>nul")
        elif OS == "Darwin":
            os.system("pkill -f Finder 2>/dev/null")
        else:
            for proc in ["nautilus", "thunar", "dolphin", "nemo"]:
                os.system(f"pkill -f {proc} 2>/dev/null")
        time.sleep(5)

# ================================
# WATCH FOR UNLOCK SIGNAL
# ================================
def watch_unlock():
    """Delete or create .kiosk_unlock file to signal unlock."""
    while kiosk_running:
        if os.path.exists(UNLOCK_FILE):
            try:
                with open(UNLOCK_FILE, "r") as f:
                    data = f.read().strip()
                if data == "unlock":
                    print("[!] Unlock signal received!")
                    close_kiosk()
                    os.remove(UNLOCK_FILE)
                    return
            except:
                pass
        time.sleep(1)

def signal_unlock():
    with open(UNLOCK_FILE, "w") as f:
        f.write("unlock")
    print("[✓] Unlock signal sent. Kiosk will close shortly.")

# ================================
# TIMER — SCHEDULED LESSONS
# ================================
def wait_and_run(target_time, action):
    triggered = False
    while True:
        now = time.strftime("%H:%M")
        if now == target_time and not triggered:
            triggered = True
            action()
        elif now != target_time:
            triggered = False
        time.sleep(15)

# ================================
# CHECK MISSED LESSONS
# ================================
def check_missed_lessons():
    now = time.strftime("%H:%M")
    print(f"[⏰] Current time: {now}")

    for lesson in LESSONS:
        start, end = lesson["start"], lesson["end"]
        if start <= now <= end:
            print(f"[!] PC started late — lesson {start}→{end} already running. Starting now...")
            start_kiosk()
            return
        elif now > end:
            print(f"[-] Lesson {start}→{end} already finished.")
        elif now < start:
            print(f"[~] Lesson {start}→{end} not started yet.")

# ================================
# START / STOP
# ================================
def start_kiosk():
    print(f"\n[📚] Lesson starting — {time.strftime('%H:%M')}")
    disable_system()
    launch_kiosk()
    threading.Thread(target=keep_browser_alive, daemon=True).start()
    threading.Thread(target=kill_unwanted, daemon=True).start()
    threading.Thread(target=watch_unlock, daemon=True).start()
    print("[🟢] Kiosk fully locked!")

if __name__ == "__main__":
    if "--unlock" in sys.argv:
        signal_unlock()
        sys.exit(0)

    print(f"🖥️  OS: {OS}")
    print(f"🔗 Site: {SITE}\n")

    # Schedule all lessons
    for lesson in LESSONS:
        threading.Thread(target=wait_and_run, args=(lesson["start"], start_kiosk), daemon=True).start()
        threading.Thread(target=wait_and_run, args=(lesson["end"], close_kiosk), daemon=True).start()
        print(f"[📅] {lesson['start']} → {lesson['end']}")

    check_missed_lessons()

    print("\n[⏰] Scheduler running. Press Ctrl+C to exit.")
    print("[🔑] To unlock remotely: python kiosk.py --unlock\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[x] Exiting...")
        if kiosk_running:
            close_kiosk()
