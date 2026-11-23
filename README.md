# Compiler Phases - Live 3D Visualization

Ek 3D compiler visualizer. Aap koi bhi simple C-jaisa code likhein, to 8 phases
(Source, Lexical, Syntax, Semantic, Intermediate Code, Optimization, Code Generation,
Target) us code ke liye apna real output dikhate hain.

## Folder structure
index.html        -> main page
css/style.css     -> poora design
js/compiler.js    -> mini compiler (lexer, parser, semantic, TAC, optimizer, codegen, execute)
js/phases.js      -> 8 phases ka data + shared variables
js/ui.js          -> side panel, stepper, input/output
js/tree.js         -> parse tree ki SVG drawing
js/extras.js       -> Watch (animation), Share link + Report download, Roman Urdu text
js/voice.js       -> voice narration (har phase ke baare mein bolta hai) + credit animation
js/study.js       -> Study mode: har phase ke detailed notes, examples aur uska real code
js/scene.js       -> 3D scene (Three.js): cards, tubes, rotate, zoom, click

## Zaruri
Update karte waqt PURA folder replace karein (sirf 1-2 files nahi), warna purani aur nayi files mix hoke page khali dikhta hai.

## Run kaise karein
Option 1 (sabse asaan): index.html par double-click karein. Browser mein khul jayega.
Option 2 (local server): folder mein terminal kholein aur chalayein:
    python -m http.server 8000
phir browser mein http://localhost:8000 kholein.

Phase par click karne se camera us phase par zoom hota hai aur data pulse Source se us phase tak chalta hai. Mute button se ambient music on/off hota hai.
Koi install ya backend ki zarurat nahi. Sirf internet chahiye (Three.js aur fonts CDN se aate hain).

## Supported C topics (23)
Data types (int, float, double, char), variables & constants (const, #define), printf/scanf, arithmetic,
relational, logical aur assignment operators, if / if-else / nested if-else, switch, for / while / do-while,
break & continue, arrays (1D, 2D), strings (char arrays + strlen/strcpy/strcat/strcmp), functions, recursion,
pointers (basic: &, *, ->, pointer arithmetic, swap, malloc/free), structures (basic: struct, typedef, arrays of
struct, pointer to struct), comments, type casting, sizeof, ternary ?:.
scanf ke liye Target Code phase mein "Program input" box mein values likhein.
Errors line number aur caret (^) ke saath dikhte hain; semantic phase ek saath kai errors batata hai.

## Study mode
Upar "Study" button ya panel ke "Study this phase" / "View its code" se kholein. Har phase ke liye:
Learn (theory, steps, key terms, exam tip), Try with your code (apna code edit karke us phase ka input/output),
Source code (us phase ka asli compiler code, copy button ke saath). Left list se koi bhi phase chun sakte hain.

## Voice aur music
Upar "Voice: EN" button se phase ki awaaz band/chalu hoti hai (EN -> اردو agar browser mein Urdu voice ho -> Off).
Mute button se music on/off. Voice bolte waqt music khud halka ho jata hai.

## Naye features
- Watch it animate: panel mein "Watch it animate" (ya Study mein "Watch") dabayein. Lexer mein tokens ek ek karke bante hain,
  parser mein tree node by node ugta hai, optimizer mein "2 * 3 -> 6" jaise steps dikhte hain. Play/pause, step, speed.
- Share: upar "Share" button. Link mein aapka program hota hai (hosted version par). "Download report" aapka naam, CMS ID, code
  aur 8 phases ka output ek page mein deta hai (Ctrl+P se PDF).
- Roman Urdu: Study mein "Roman Urdu" button, aur Voice button mein Roman Urdu option.
