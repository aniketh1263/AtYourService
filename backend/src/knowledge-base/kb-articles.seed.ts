import type { KbArticle } from './kb-article.entity';

// Starter knowledge base (8 articles, as required by the assignment).
// Written generically so the demo works for any company; edit freely.
export const KB_SEED: Omit<KbArticle, 'id'>[] = [
  {
    title: 'Outlook crashes, freezes or will not open',
    category: 'Software',
    content: `1. Close Outlook completely (check Task Manager for OUTLOOK.EXE) and reopen it.
2. Start in safe mode: press Win+R, type "outlook.exe /safe" and press Enter. If it opens, a faulty add-in is the cause: File > Options > Add-ins > Manage COM Add-ins > Go, then untick all add-ins and re-enable them one at a time.
3. Repair Office: Settings > Apps > Microsoft 365 > Modify > Quick Repair (use Online Repair if Quick Repair fails).
4. Create a new mail profile: Control Panel > Mail > Show Profiles > Add, then set it as default.
5. Check the OST file is not corrupt or full: rename it in %localappdata%\\Microsoft\\Outlook and let Outlook rebuild it.
If none of this works, raise a ticket and include the exact error message.`,
  },
  {
    title: 'VPN will not connect',
    category: 'Network',
    content: `1. Check your normal internet works first (open any website).
2. Fully quit the VPN client and start it again. Make sure you use the latest company-approved client version.
3. Check your date and time are correct and set to automatic; VPN certificates fail with a wrong clock.
4. If you see "authentication failed", reset your password and make sure MFA approval is being accepted.
5. Switch networks: try a mobile hotspot. If it works there, your home router or public Wi-Fi is blocking VPN traffic.
6. Restart the laptop and try again.
If the error persists, raise a ticket with a screenshot of the error and the time it happened.`,
  },
  {
    title: 'Wi-Fi connected but no internet, or very slow connection',
    category: 'Network',
    content: `1. Turn Wi-Fi off and on again, or toggle Airplane mode.
2. Forget the Wi-Fi network and reconnect with the password.
3. Restart your router/modem (unplug for 30 seconds) if you are at home.
4. Run the Windows network troubleshooter: Settings > Network & Internet > Status > Network troubleshooter.
5. Flush DNS: open Command Prompt as admin and run "ipconfig /flushdns", then "ipconfig /renew".
6. Move closer to the access point and check whether other devices are slow too.
If only the office network is affected, report the floor and location in a ticket.`,
  },
  {
    title: 'Forgot password or account locked',
    category: 'Access',
    content: `1. Use the self-service password reset page (https://passwordreset.atyourservice.example) and follow the identity checks.
2. Passwords must be at least 12 characters and cannot reuse your last 5 passwords.
3. Accounts lock automatically after 5 wrong attempts and unlock by themselves after 30 minutes.
4. After resetting, sign out of all devices and sign in again, and update the saved password on your phone's mail app, otherwise it keeps retrying the old password and locks your account again.
If self-service does not work, raise a ticket; IT can unlock the account after verifying your identity.`,
  },
  {
    title: 'Laptop running slow or freezing',
    category: 'Hardware',
    content: `1. Restart the laptop (a full restart, not sleep) - many slowdowns clear after a restart; do this at least weekly.
2. Open Task Manager (Ctrl+Shift+Esc) and look at which app uses high CPU, memory or disk; close or restart it.
3. Make sure at least 15 percent of the disk is free: run Disk Cleanup and uninstall unused programs.
4. Disable unnecessary start-up apps in Task Manager > Startup.
5. Install pending Windows and company software updates.
6. Check the laptop is not overheating: keep vents clear and use it on a hard surface.
If it is still slow or the device is older than 4 years, raise a ticket; a hardware replacement may be needed.`,
  },
  {
    title: 'Printer not printing or showing offline',
    category: 'Hardware',
    content: `1. Check the printer is powered on, has paper and toner, and shows no error light.
2. Clear the print queue: Settings > Bluetooth & devices > Printers & scanners > your printer > Open print queue, cancel all documents.
3. Make sure the printer is not set to "Use Printer Offline" (Printer menu in the queue window).
4. Restart the Print Spooler service: Win+R, type "services.msc", find Print Spooler, right-click and Restart.
5. Remove and re-add the printer from the company print server.
6. Confirm you are on the office network or VPN; office printers are not reachable from home.
If the printer itself shows a hardware error, raise a ticket with the printer name or the label on it.`,
  },
  {
    title: 'Microsoft Teams audio, camera or screen sharing problems',
    category: 'Software',
    content: `1. In Teams: Settings > Devices, choose the correct microphone, speaker and camera, and use "Make a test call".
2. Check Windows privacy settings allow Teams to use the microphone and camera (Settings > Privacy & security).
3. Close other apps that may be using the camera or microphone (Zoom, browsers).
4. Fully quit Teams (right-click the tray icon > Quit) and reopen it.
5. Clear the Teams cache: quit Teams, delete the contents of %appdata%\\Microsoft\\Teams (new Teams: %localappdata%\\Packages\\MSTeams_8wekyb3d8bbwe\\LocalCache), and restart.
6. For echo or choppy audio, use a headset and a wired or strong Wi-Fi connection.
If problems continue, raise a ticket and note whether it happens in every meeting.`,
  },
  {
    title: 'MFA / authenticator app codes not working or new phone',
    category: 'Access',
    content: `1. Check your phone's date and time are set to automatic; codes only work when the clock is accurate.
2. In the authenticator app, make sure you are using the code for the correct account (company account, not personal).
3. If approval notifications do not arrive, open the app manually, check notifications are allowed for it, and turn off battery saving for the app.
4. If you got a new phone, do NOT delete the old authenticator entry before setting up the new one. Use the "Security info" page to add the new device while the old one still works.
5. If you lost your phone or cannot sign in at all, MFA has to be reset by IT.
Raise a ticket for an MFA reset; IT will verify your identity first.`,
  },
];
