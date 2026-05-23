"""
eDoska Kiosk — locks classroom PC to edoska.vercel.app
Launches Chrome in --kiosk mode and locks the OS so students
cannot exit the browser or reach the desktop.

Usage:
  python kiosk.py              # Lock + launch browser
  python kiosk.py --unlock     # Restore system + close browser

Requires: Google Chrome or Chromium
"""

import subprocess, os, sys, time, threading, platform, shutil

SITE = "https://edoska.vercel.app"
OS_NAME = platform.system()
HERE = os.path.dirname(os.path.abspath(__file__))
UNLOCK_FILE = os.path.join(HERE, ".kiosk_unlock")
CHROME = None
kiosk_running = False


# ===== FIND BROWSER =====
def find_chrome():
    if OS_NAME == "Windows":
        candidates = [
            os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
            os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
            os.path.expandvars(r"%LocalAppData%\Microsoft\Edge\Application\msedge.exe"),
        ]
    elif OS_NAME == "Darwin":
        candidates = [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Chromium.app/Contents/MacOS/Chromium",
            "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
        ]
    else:
        candidates = [
            "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable",
            "/usr/bin/chromium", "/usr/bin/chromium-browser",
            "/snap/bin/chromium", "/usr/bin/brave-browser",
        ]
        for cmd in ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]:
            w = shutil.which(cmd)
            if w:
                candidates.insert(0, w)

    for p in candidates:
        if os.path.exists(p):
            print(f"[✓] Browser: {p}")
            return p
    print("[✗] No browser found. Install Chrome or Chromium.")
    sys.exit(1)


# ===== BROWSER CONTROL =====
def kill_browser():
    if OS_NAME == "Windows":
        for exe in ["chrome.exe", "msedge.exe", "brave.exe"]:
            os.system(f"taskkill /f /im {exe} 2>nul")
    elif OS_NAME == "Darwin":
        os.system("pkill -f 'Google Chrome' 2>/dev/null")
        os.system("pkill -f Chromium 2>/dev/null")
        os.system("pkill -f 'Brave Browser' 2>/dev/null")
    else:
        for p in ["chrome", "chromium", "brave", "firefox", "msedge"]:
            os.system(f"pkill -f {p} 2>/dev/null")
    time.sleep(1)


def launch_kiosk():
    global kiosk_running
    print(f"[+] Launching kiosk — {time.strftime('%H:%M:%S')}")
    kill_browser()

    cmd = [
        CHROME, "--kiosk", "--no-first-run", "--disable-infobars",
        "--disable-extensions", "--disable-session-crashed-bubble",
        "--no-default-browser-check", "--disable-popup-blocking",
        "--disable-translate", "--disable-features=TranslateUI",
        "--noerrdialogs", "--disable-pinch",
        "--disable-restore-session-state",
        SITE,
    ]
    subprocess.Popen(cmd)
    kiosk_running = True
    time.sleep(3)


# ===== OS LOCK (Windows) =====
def disable_system():
    print("[🔒] Locking system…")
    if OS_NAME == "Windows":
        cmds = [
            r'reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" /v DisableTaskMgr /t REG_DWORD /d 1 /f',
            r'reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoDesktop /t REG_DWORD /d 1 /f',
            r'reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoDriveTypeAutoRun /t REG_DWORD /d 255 /f',
            "taskkill /f /im explorer.exe 2>nul",
        ]
        for c in cmds:
            os.system(c)
        print("[🔒] Task Manager & desktop disabled")

    elif OS_NAME == "Darwin":
        os.system("defaults write com.apple.dock mcx-expose-disabled -bool TRUE")
        os.system("killall Dock 2>/dev/null")
        os.system("killall SystemUIServer 2>/dev/null")
    else:
        desktop = (os.environ.get("XDG_CURRENT_DESKTOP", "") + os.environ.get("DESKTOP_SESSION", "")).upper()
        if "GNOME" in desktop:
            for gs in [
                "org.gnome.desktop.wm.keybindings panel-main-menu '[]'",
                "org.gnome.desktop.wm.keybindings show-desktop '[]'",
                "org.gnome.shell.keybindings toggle-overview '[]'",
                "org.gnome.desktop.wm.keybindings close '[]'",
            ]:
                os.system(f"gsettings set {gs}")
        elif "KDE" in desktop or "PLASMA" in desktop:
            os.system("kwriteconfig5 --file kglobalshortcutsrc --group plasmashell --key 'Show Dashboard' none,none,none")
            os.system("kwriteconfig5 --file kglobalshortcutsrc --group kwin --key 'Show Desktop' none,none,none")
            os.system("kwriteconfig5 --file kglobalshortcutsrc --group kwin --key 'Window Close' none,none,none")
            os.system("qdbus org.kde.KWin /KWin reconfigure 2>/dev/null")


# ===== OS RESTORE (Windows) =====
def restore_system():
    print("[🔓] Restoring system…")
    if OS_NAME == "Windows":
        cmds = [
            r'reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" /v DisableTaskMgr /t REG_DWORD /d 0 /f',
            r'reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoDesktop /t REG_DWORD /d 0 /f',
            r'reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoDriveTypeAutoRun /t REG_DWORD /d 0 /f',
            "start explorer.exe",
        ]
        for c in cmds:
            os.system(c)
    elif OS_NAME == "Darwin":
        os.system("defaults write com.apple.dock mcx-expose-disabled -bool FALSE")
        os.system("killall Dock 2>/dev/null")
        os.system("killall SystemUIServer 2>/dev/null")
    else:
        os.system("gsettings reset-recursively org.gnome.desktop.wm.keybindings 2>/dev/null")
        os.system("gsettings reset-recursively org.gnome.shell.keybindings 2>/dev/null")


# ===== WATCHDOG =====
def keep_browser_alive():
    while kiosk_running:
        try:
            if OS_NAME == "Windows":
                out = os.popen("tasklist 2>nul").read()
                alive = "chrome.exe" in out or "msedge.exe" in out
            else:
                out = os.popen("ps aux 2>/dev/null").read()
                alive = "chrome" in out or "chromium" in out
            if not alive and kiosk_running:
                print("[!] Browser closed — reopening…")
                launch_kiosk()
        except:
            pass
        time.sleep(3)


def kill_unwanted():
    while kiosk_running:
        if OS_NAME == "Windows":
            for proc in ["taskmgr.exe", "explorer.exe"]:
                os.system(f"taskkill /f /im {proc} 2>nul")
        elif OS_NAME == "Darwin":
            os.system("pkill -f Finder 2>/dev/null")
        else:
            for proc in ["nautilus", "thunar", "dolphin", "nemo"]:
                os.system(f"pkill -f {proc} 2>/dev/null")
        time.sleep(5)


def watch_unlock():
    while kiosk_running:
        if os.path.exists(UNLOCK_FILE):
            try:
                with open(UNLOCK_FILE) as f:
                    if f.read().strip() == "unlock":
                        print("[!] Unlock signal received")
                        close_kiosk()
                        os.remove(UNLOCK_FILE)
                        return
            except:
                pass
        time.sleep(1)


def signal_unlock():
    with open(UNLOCK_FILE, "w") as f:
        f.write("unlock")
    print("[✓] Unlock signal sent")


def close_kiosk():
    global kiosk_running
    kiosk_running = False
    kill_browser()
    restore_system()
    print("[✓] Kiosk closed, system restored")


# ===== MAIN =====
if __name__ == "__main__":
    if "--unlock" in sys.argv:
        signal_unlock()
        sys.exit(0)

    CHROME = find_chrome()
    print(f"🖥️  {OS_NAME}  |  🔗 {SITE}\n")

    disable_system()
    launch_kiosk()

    threading.Thread(target=keep_browser_alive, daemon=True).start()
    threading.Thread(target=kill_unwanted, daemon=True).start()
    threading.Thread(target=watch_unlock, daemon=True).start()

    print("[🟢] Kiosk active")
    print("[🔑] python kiosk.py --unlock  to restore\n")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        close_kiosk()
