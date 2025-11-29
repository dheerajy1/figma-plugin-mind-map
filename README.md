# Figma Plugin — JSON to Mind Map

This plugin converts a JSON structure into a visual **mind map** inside Figma.  
It automatically creates nodes and connectors based on hierarchy, making it easy to visualize structured ideas, outlines, research notes, and planning trees.

---

## 🌳 Example Input

```json
{
  "title": "Project Plan",
  "children": [
    { "title": "Research" },
    { "title": "Design" },
    { 
      "title": "Development",
      "children": [
        { "title": "Frontend" },
        { "title": "Backend" }
      ]
    }
  ]
}
```

### Result (generated inside Figma):
- Project Plan  
  ├─ Research  
  ├─ Design  
  └─ Development  
      ├─ Frontend  
      └─ Backend  

---

## 🧭 How to Use the Plugin

1. Open your Figma file.
2. Run the plugin: **Plugins → JSON Mind Map**
3. Paste your JSON structure into the input panel.
4. Click **Generate**.
5. The mind map will appear on the canvas.

> Tip: Validate JSON here if needed: https://jsonlint.com

---

## ✨ Features

| Feature | Status |
|--------|--------|
| Convert JSON → Mind Map | ✅ |
| Auto-create nodes & connectors | ✅ |
| Supports unlimited nested children | ✅ |
| Clean layout spacing | ✅ |
| Drag and rearrange nodes freely after generation | ✅ |

---

## 🛠 Development Setup (Figma Official Guidelines)

Original docs:  
https://www.figma.com/plugin-docs/plugin-quickstart-guide/

This plugin uses:
- **TypeScript**
- **NPM**
- **@figma/plugin-typings**

### Requirements

Download Node.js:  
https://nodejs.org/en/download/

Install TypeScript:
```
npm install -g typescript
```

Install Figma type definitions:
```
npm install --save-dev @figma/plugin-typings
```

### Building / Watching Source

Using Visual Studio Code:

1. Open this folder in VS Code
2. Run:
   ```
   Terminal → Run Build Task → npm: watch
   ```
3. Code will recompile each time you save `.ts` files

---

## 🤝 Contributing

This repository uses a structured branching workflow:

```
feature/* → developer → staging → main
```

```
feature/* 
   ↓ PR (squash feature work)
developer
   ↓ PR (Merge, promote to staging)
staging
   ↓ PR (merge release, in this pr use /prepare-release as comment to create  patch branch with change log and bump version and merger that pr into staging and later)
main
```

## configuration

| Transition          | Method     | Reason                                                        |
| ------------------- | ---------- | ------------------------------------------------------------- |
| feature → developer | **Squash** | Keeps developer clean; features become single logical commits |
| developer → staging | **Merge**  | Groups multiple features cleanly; avoids double-squashing     |
| staging → main      | **Merge**  | Correct changelog & semantic-release behavior                 |


## 

Please read:  
**[CONTRIBUTING.md](CONTRIBUTING.md)**

---

## ⭐️ Support

If this plugin helps you, consider giving the repo a **star** ⭐  
It helps visibility and supports ongoing improvements.
