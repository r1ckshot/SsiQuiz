# 🟢 SsiQuiz — SSI Exam Prep App

**A browser-based quiz app for studying the Systems of Artificial Intelligence (SSI) exam.**

🔗 **Live:** [r1ckshot.github.io/SsiQuiz](https://r1ckshot.github.io/SsiQuiz)

<table>
  <td><img src="https://github.com/user-attachments/assets/74089daf-bba8-4450-aa62-ad547017e075" alt="SsiQuiz — Main Screen"/></td>
</table>

## ✨ Features

### 📚 Learn Mode
- Flashcard-style questions across 8 thematic sections
- Self-assessment buckets: *I know it / Partially / Don't know*
- Focus mode — study only weak questions (*Partially* or *Don't know*)

### 📝 Exam Mode
- 30 randomized questions with a time limit
- Automatic scoring and persistent exam history

### 📊 Progress Tracking
- Visual progress bars per section
- SVG ring showing overall mastery percentage
- All progress saved in localStorage — survives page reloads

### 🗒️ Cheatsheets
- Global exam traps (absolute words, technical nonsense patterns)
- Per-section quick references for the most common mistakes

### 📱 Install on Your Phone
- Works as a PWA — tap **Share → Add to Home Screen** on iOS or **Install App** on Android
- Runs offline, no internet needed after the first load

## 🛠️ Technologies

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

Pure vanilla JS — no dependencies, no build step. Works locally via `file://` and on GitHub Pages.

## 🤖 AI-Assisted Development

This project was built using **Claude AI (claude-code)** as the primary coding assistant.

- **Me** — project direction, question content, UX decisions, testing on real devices
- **Claude** — implementing code based on my requirements and feedback

Every decision was mine. Claude accelerated execution; I owned the vision.

## 📚 What I Learned

- SPA architecture without a framework — pure JS state machine with DOM rendering
- CSS and SVG ring animations without libraries
- localStorage as a lightweight persistence layer
- PWA manifest + meta tags for "Add to Home Screen" on Android and iOS

## 👨‍💻 Author

**Mykhailo Kapustianyk**
- GitHub: [@r1ckshot](https://github.com/r1ckshot)
- Year: 2026
