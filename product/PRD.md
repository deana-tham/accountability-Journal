# Accountability Journal — Product Requirements Document

**Project Name:** TBD (GitHub: `accountability-journal`)
**Date:** March 20, 2026
**Version:** 1.0

---

## 1. Problem Statement

I usually have a hard time building habits and sticking to my goals. I came across a perspective one day which told me: try asking yourself what held you back from not doing what you said you would do. So I thought, maybe if I had to provide a reason why I didn't do what I said I would do, and just reflect more on what is actually holding me back — and have some way to track it all — maybe it would build habits that are actually important to me."

---

## 2. Solution Statement

> "A combined journal, habit tracker, and digital scrapbook — all in one place. The journaling and habit tracking work hand in hand, prompting genuine reflection on why certain habits aren't sticking and providing both a written   and visual record of that process over time. The scrapbooking element adds a personal, creative touch: photos, stickers, and decorated entries layered onto a calendar view, so the app becomes not just a tool for accountability, but a meaningful visual story of how time — and you — have passed

---

## 3. Goals & Success Criteria

| Goal | Success Metric |
|------|----------------|
| User can manage habits/goals | Add, edit, delete habits without friction |
| Daily accountability is enforced | Check-in prompts appear each day for every active habit |
| Reflection is captured | Journal entry written when a habit is missed |
| Visual delight is present | Photo stamp + stickers cleanly on a day's entry |
| Reports give a real picture | Weekly and monthly views summarize data accurately |

---

## 4. Target User

- individual managing personal growth
- Me

---

## 5. MVP Features

| # | Feature |
|---|---------|
| 1 | Habit/goal creation, editing, deletion |
| 2 | Daily check-in — mark each habit done or not done |
| 3 | Missed habit reflection — "What stopped you from doing [x] today?" free-form text |
| 4 | Photo upload |
| 5 | Weekly summary report |
| 6 | Monthly summary report |

---

## 6. Full Feature List — Version 1

| # | Feature | Priority |
|---|---------|----------|
| 1 | Habit/goal creation, editing, deletion | Must Have |
| 2 | Daily check-in (done / not done per habit) | Must Have |
| 3 | Missed habit reflection prompt | Must Have |
| 4 | Photo upload with single decorative border style | Nice to Have |
| 5 | Weekly summary report | Must Have |
| 6 | Monthly summary report | Must Have |
| 7 | Single-day habit override (skip without penalty) | Should Have |
| 8 | Habit streak counter | Should Have |
| 9 | Habit categories / tags | Should Have |
| 10 | Dark / light mode toggle | Nice to Have |

---

## 7. Future Updates (V2+)

- Deletion reflection prompt — "Why are you letting go of [x]?" before a habit is deleted
- Habit graveyard — a dedicated view of all deleted habits and their farewell reflections
- Supabase cloud sync (migrate from local storage)
- Multiple border styles for photo stamps
- More stickers for journal/calendar entries
- Push / local notifications for check-in reminders
- GitHub-style habit heatmap (year-at-a-glance)
- Export report as PDF
- Shareable summary card (image export for social)

---

## 9. Design Requirements

- All UI designed in Figma before implementation
- Desktop-first layout, responsive down to mobile
- Aesthetic: cute minimal with vintage touches
- Design system: color palette, typography, spacing scale, component library
- One photo border style (reference TBD — user to provide)
- Reflection prompt always reads: "What stopped you from doing [habit name] today?"

---

## 10. Screen Map
```
App
├── Dashboard (Today)
│     ├── Habit checklist
│     ├── Reflection prompt (triggers on missed habit)
│     ├── Mood rating
│     └── Photo upload + border stamp
├── Habits Manager
│     ├── Add / Edit / Delete habit
│     └── Single-day override
├── Journal View
│     └── Browse past days — photos + reflections
├── Reports
│     ├── Weekly summary
│     └── Monthly summary
└── Settings
      └── Theme toggle (dark/light)
```

---
