# League of Legends Mod Manager

A skin mod manager for League of Legends with support for custom `.fantome` mod files and champion-based mod activation.

## Features

- Enable and disable skins per champion.
- Import `.fantome` mod files from local storage.
- Automatically extract mods and clean up temporary files.
- Save skin state across sessions.
- Displays modding output in a console or footer log.
- Live search filtering for champions.
- Beautiful UI with responsive layout using Tailwind + shadcn/ui.

---

## Setup

Champions are stored in a local SQLite database and fetched using Go backend logic.

.fantome skin files can be downloaded or imported locally and associated with one or more champions.

Mod Tools are used to overlay mods into the game directory during patching.

Output logs are captured and can be displayed either in a footer console or live viewer.

A. **Download the latest release**
Go to the releases page and download the newest release

B. **Clone the repository**

```bash
git clone https://github.com/Dcatna/LoLModManager.git
cd lolmodmanager

cd frontend
npm install
cd ..
wails dev
```

## Showcase
![lolmod1](https://github.com/user-attachments/assets/84b3f977-bb3e-4b62-992e-4f578cdb9dc9)
![lolmod2](https://github.com/user-attachments/assets/ec2705d2-33f4-4082-8008-dee23a7d0fd1)
![image](https://github.com/user-attachments/assets/95ab782c-fe30-4079-af53-b0bb63b0f842)
![lolmod3](https://github.com/user-attachments/assets/ac40c9ce-1bcf-464a-b96b-7ad71c7a8eb1)
![image](https://github.com/user-attachments/assets/f8170647-a6f1-4943-9cb0-2267e943124a)
![lolmod4](https://github.com/user-attachments/assets/69beba0d-c057-4348-8bcf-b39cda8e68b6)
