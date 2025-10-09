# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jarvis Pop Task Hunter is a minimalist task management system that reduces overwhelm by breaking tasks into 15-minute slices and presenting them one at a time through a stack/queue interface.

## Core Architecture (To Be Implemented)

The system will consist of these key components:

1. **Task Breakdown Engine** - Automatically slices tasks >15 minutes using 5 MVP category templates
2. **Priority Queue System** - Scores slices by importance + urgency - skip_count penalty
3. **Multi-Interface Frontend** - Apple Watch app, SMS bot, and minimal web dashboard
4. **Timer & State Management** - 15-minute timer with actions: Done, +15, Skip, Snooze

## Data Models

**Task**: id, title, category, importance(1-5), energy("medium"), context("any"), estimate_minutes(15), due_at, notes, link, created_at

**Slice**: id, task_id, title, sequence_index, planned_minutes(15), status("todo|doing|done"), skip_count(0), snoozed_until, done_at

## MVP Category Templates

1. **Quick Chores** (≤15m): Direct action
2. **Admin** (long chores): Setup → Sort → Do → Confirm
3. **Research** (Shopping/Travel): Setup → Gather → Compare → Decide → Confirm  
4. **Reading/Learning**: Setup → Skim → Deep Dive → Extract → Summarize
5. **Technical Execution**: Setup → Implement → Test → Polish → Commit

## Priority Scoring Algorithm

```
score = importance (1-5) + urgency (due soon = +1-3) - skip_count * penalty
```

## Development Status

This is a greenfield project currently in planning phase. Only the PRD exists - no code has been implemented yet.

## Implementation Notes

When building this system, the core user flow should be:
- Capture → Auto-breakdown → Queue → Pop & Execute → Complete/Extend/Skip

Key technical considerations:
- Frictionless task capture (title-only input with smart defaults)
- Effective task categorization and breakdown algorithms  
- Cross-platform sync between Watch and SMS interfaces
- Penalty system for skipped tasks to maintain queue integrity
- Manual slice editing capabilities via web dashboard

## Interface Specifications

### Apple Watch App
- Card view with task slice title, progress ring, big "Start 15:00" button
- Controls: Done / +15 / Skip / Snooze
- Quick capture via dictation

### SMS Bot  
- Text-based task capture with optional parsing (@desk, !high, 45m)
- Prompt: "Ready for 15?" → reply "yes" → next slice pops
- Controls: reply `done`, `skip`, `+15`, `snooze`, `add slice <text>`

### Web Dashboard (minimal)
- Now view: single card display (matches Watch/SMS)
- Inbox: captured tasks awaiting categorization  
- Review/Edit: manual slice editing, delete/merge capabilities

## Success Criteria
- Task capture in <5 seconds
- Auto-breakdown produces usable 15-minute slices
- Single slice visibility at all times
- Manual slice editing when needed

## MVP Non-Goals
- No calendar integration
- No recurring tasks  
- No project views beyond optional tags
- No analytics beyond slice counts