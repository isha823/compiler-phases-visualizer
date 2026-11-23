# Compiler Phases — Live 3D Visualization

An interactive 3D compiler visualizer. Write any simple C-like code and watch all 8 compiler phases — **Source → Lexical → Syntax → Semantic → Intermediate Code → Optimization → Code Generation → Target** — produce their real output live.

---

## 📁 Folder Structure

| File | Description |
|------|-------------|
| `index.html` | Main page |
| `css/style.css` | Complete styling and design |
| `js/compiler.js` | Mini compiler (lexer, parser, semantic analysis, TAC, optimizer, code generation, execution) |
| `js/phases.js` | Data for all 8 phases + shared variables |
| `js/ui.js` | Side panel, stepper, input/output controls |
| `js/tree.js` | SVG drawing of the parse tree |
| `js/extras.js` | Watch animation, Share link, Report download |
| `js/voice.js` | Voice narration for each phase + credit animation |
| `js/study.js` | Study mode: detailed notes, examples, and real code per phase |
| `js/scene.js` | 3D scene using Three.js — cards, tubes, rotate, zoom, click |

---

## ⚠️ Important

When updating, **replace the entire folder** (not just 1–2 files). Mixing old and new files may cause the page to appear blank.

---

## 🚀 How to Run

**Option 1 (Easiest):** Double-click `index.html` — it will open directly in your browser.

**Option 2 (Local Server):** Open a terminal inside the project folder and run:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

> No installation or backend required. Only an internet connection is needed (Three.js and fonts are loaded via CDN).

---

## 💻 Supported C Topics (23)

- **Data types:** `int`, `float`, `double`, `char`
- **Variables & Constants:** `const`, `#define`
- **I/O:** `printf`, `scanf`
- **Operators:** arithmetic, relational, logical, assignment
- **Conditionals:** `if`, `if-else`, nested `if-else`, `switch`
- **Loops:** `for`, `while`, `do-while`, `break`, `continue`
- **Arrays:** 1D and 2D arrays
- **Strings:** char arrays, `strlen`, `strcpy`, `strcat`, `strcmp`
- **Functions & Recursion**
- **Pointers:** `&`, `*`, `->`, pointer arithmetic, swap, `malloc`/`free`
- **Structures:** `struct`, `typedef`, arrays of structs, pointer to struct
- **Miscellaneous:** comments, type casting, `sizeof`, ternary `?:`

> For `scanf`, enter input values in the **"Program input"** box in the Target Code phase.  
> Errors are shown with line numbers and a `^` caret; the semantic phase reports multiple errors at once.

---

## 📖 Study Mode

Open via the **"Study"** button at the top, or **"Study this phase"** / **"View its code"** in the side panel.

Each phase includes:
- **Learn** — theory, steps, key terms, and an exam tip
- **Try with your code** — edit and run your own code for that phase
- **Source code** — the actual compiler code for that phase, with a copy button

Switch between phases using the list on the left.

---

## 🔊 Voice & Music

- **Voice button (`Voice: EN`)** — toggles phase narration on/off.  
  Cycles: `EN` → `اردو` (if Urdu voice is available in your browser) → `Off`
- **Mute button** — toggles ambient background music on/off.  
  Music automatically lowers while voice is speaking.

---

## ✨ New Features

### 🎬 Watch it Animate
Click **"Watch it animate"** in the panel (or **"Watch"** in Study mode) to see step-by-step animations:
- **Lexer:** tokens are built one by one
- **Parser:** parse tree grows node by node
- **Optimizer:** simplifications like `2 * 3 → 6` are shown step by step  

Supports **Play/Pause**, **Step**, and **Speed** controls.

### 🔗 Share
Click the **"Share"** button at the top. The generated link includes your program (works on the hosted version).  
**"Download Report"** exports your name, CMS ID, code, and all 8 phase outputs as a single printable page (use `Ctrl+P` to save as PDF).

### 🌐 Roman Urdu
Available via the **"Roman Urdu"** button in Study mode, and as an option in the Voice button cycle.
