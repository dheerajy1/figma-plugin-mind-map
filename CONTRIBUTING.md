# Contribution Workflow & Branch Rules

This project uses a protected branch workflow to ensure clean history, review quality,
and a stable `main` branch. All code changes must go through Pull Requests.

---

## 🔀 Branch Structure

feature/* → developer → main


### Branch Roles

| Branch      | Purpose |
|-------------|---------|
| `main`      | Production-ready, stable code. Protected. |
| `developer` | Integration branch where features are merged and tested. |
| `feature/*` | Individual feature or fix branches created by developers. |

---

## ✅ Allowed Actions

| Action | Allowed | How |
|--------|--------|-----|
| Work on new features | ✅ Yes | Create a branch: `feature/<name>` |
| Merge `feature/*` into `developer` | ✅ Yes | Open a PR → pass CI → reviewer approval |
| Merge `developer` into `main` | ✅ Yes | Open a PR → pass CI → reviewer approval |

---

## ❌ Not Allowed Actions

| Action | Allowed? | Reason |
|--------|---------|--------|
| Push directly to `main` | ❌ No | `main` is protected |
| Push directly to `developer` | ❌ No | PR review required |
| Open PR from `feature/*` directly to `main` | ❌ No | Enforced by workflow rules |
| Force-push any protected branch | ❌ No | Non-fast-forward updates are disabled |

---

## 🧩 Pull Request Rules

- Every PR must pass CI (build + lint)
- At least **1 approving review** is required
- Code Owner review is required if applicable
- All conversations must be resolved before merge

---

## 📝 Naming Your Branches

Use one of the following formats:

feature/<short-description>
bugfix/<short-description>
refactor/<short-description>
chore/<short-description>

Example:

feature/json

---

## 🧠 Commit Message Format (Required)

This project uses **Conventional Commits** to automate versioning.

Format:
<type>(optional scope): <description>

Examples:
feat: add JSON to mindmap conversion
fix: incorrect root node rendering alignment
chore: update CI workflow rules

Common <type> values:
- feat → new functionality
- fix → bug correction
- refactor → internal structural improvement
- chore → repo maintenance (docs, workflows, configs)
- docs → documentation changes only

---

## ✅ Summary

DO: feature → developer → main
DON'T: push or PR directly to main

This keeps `main` clean, stable, and always deployable.

