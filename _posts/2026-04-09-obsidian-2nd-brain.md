---
layout: post
title: "What If You Could Query Your Own Brain?"
date: 2026-04-09 18:11:00 +0200
tags: [Obsidian, Knowledge Management, Productivity, AI]
archive: false
permalink: /:title
---

Imagine having a second brain. One that stores everything you've ever learned, every problem you've ever solved, every decision you've ever made. And when you need something, you just ask it.

That's not science fiction. That's Obsidian with enough notes in it.

Obsidian is a note-taking app built around one idea: your notes are nodes, and links between them are edges. Over time, those nodes and edges form a graph that starts to look less like a folder of documents and more like a map of how you think.

I've been using it for a week. My goal is 10,000 files one day.

## The Second Brain Concept

Your brain is good at thinking. It's not good at remembering everything perfectly and retrieving it on demand. That's just biology — not a flaw, just a limitation worth working around.

A second brain is an external system that handles the storage and retrieval so your actual brain can focus on the thinking. Every problem you solve, every thing you learn, every decision you make, it goes in the vault. Structured. Linked. Findable.

Six months later when that same problem comes back, you don't start from scratch. You query the vault and the answer is already there because past you wrote it down.

That's the compounding effect. One week of notes is a convenience. One year is a reference library. Five years is infrastructure.

## Why Obsidian Specifically

Everything in Obsidian is a plain markdown file on your own machine. No cloud lock-in. No proprietary format. No subscription required to access your own thoughts.

You own the files. Full stop.

What makes it different from any other notes app is the linking. You connect notes using `[[double brackets]]` and Obsidian tracks every link bidirectionally. Note A links to Note B. Note B automatically knows it's referenced by Note A.

Open the graph view and you can see your own knowledge visualised. Dense clusters where you've thought deeply. Isolated nodes where you've only scratched the surface. Threads you can follow from a feature decision through a database design through a debugging session.

That graph gets more valuable the longer you use it. That's the whole bet.

## How to Structure It

There are a hundred ways to organise Obsidian. Most collapse after a few months because they're too complicated to maintain.

The one that works is PARA. Four folders:

```
vault/
├── 00-inbox/       # Dump everything here first. Sort later.
├── 01-projects/    # Active work with a finish line
├── 02-areas/       # Ongoing responsibilities with no end date
├── 03-resources/   # Reference material and distilled learning
└── 04-archive/     # Completed or dormant stuff
```

**Inbox** is the most important one. Zero friction at the moment of capture. Drop it in, sort it later.

**Projects** have a finish line. Feature you're building, bug you're investigating, book you're reading. When it's done, it moves to archive.

**Areas** are ongoing. A technology you work with regularly. Your finances. A habit you're maintaining. No finish line, just continuous upkeep.

**Resources** is your knowledge library. Notes on NestJS. Notes on Playwright patterns. Notes on Stoicism. Things you learned that are useful forever, not tied to any specific project.

Most notes start in inbox, get sorted into projects or areas, and eventually the best parts get distilled into resources. That flow is the system.

## Writing Notes That Are Useful Later

Structure alone isn't enough. How you write matters.

Most people write notes that are useful right now and noise six months later. Vague summaries. Half-finished thoughts. Context that made sense at the time but reads like nothing later.

Write for future you, not current you.

If you solved a bug, don't write "fixed the auth issue". Write what the bug was, what you tried, what didn't work, and exactly what fixed it. Future you needs the investigation, not just the answer.

A template I use for anything I've solved:

```markdown
# title-here

## Problem

Brief description of the issue, bug, or challenge encountered.

## Context

- **When:** Date or timeframe when the problem occurred
- **Where:** System, app, feature, or component affected
- **Environment:** Dev, staging, production, local, etc.
- **Impact:** Who/what was affected

## Symptoms

Describe what was observed:

- Error messages
- Unexpected behavior
- Performance issues
- Visual/UI problems

## Root Cause

What was actually causing the problem? Why did it happen?

## Solution

Step-by-step explanation of how the problem was fixed.

// Include relevant code snippets or commands

## What Didn't Work

Document approaches that were tried but failed (saves time in the future).

- Attempt 1: Why it didn't work
- Attempt 2: Why it didn't work

## Prevention

How to avoid this problem in the future:

- Code changes
- Process improvements
- Documentation updates
- Tests to add

## Related

- [[related-problem]]
- [[relevant-docs]]

## Tags

`#bug` `#performance` `#deployment` `#database` `#react-native` `#api`

## Changelog

- YYYY-MM-DD: Solved by NAME — brief note
```

That structure makes every note a future search result. Real signal, not noise.

## Linking Is the Superpower

Writing notes is useful. Linking them is where Obsidian becomes something else.

When you write a note about a NestJS bug you fixed, link it to your NestJS resource note. When you write a feature spec, link it to the database schema it depends on. When you read something that connects to a decision you made last month, link it.

Those links compound. You stop re-discovering connections by accident. You build them in deliberately. The graph starts to reflect how ideas actually relate, not just how folders are organised.

## Taking It Further

Once your vault has enough notes in it, you can start doing things with it that go beyond searching and reading.

I built a RAG system on top of my vault so I can query it semantically using an LLM. Ask it a question in plain English, get back the most relevant chunks from my own notes. My agent in a coding session can query the vault directly and pull context from something I documented months ago without me having to find it manually.

I wrote about how to build that system in detail if you want to go that route.

But that's the next step. The first step is just the vault.

## Start Today

You don't need a perfect system on day one. You need one habit.

Every time you solve something, write it down. Use the template. Drop it in inbox. Sort it later.

That's it. The structure reveals itself over time. The linking becomes natural as you notice connections. The graph grows by itself.

The only thing that doesn't happen automatically is starting.

Open Obsidian. Create a note. Write what you figured out today.

In five years that vault is going to know more about your work than you consciously remember. That's the point.
