# Git, the eight things : edit sheet

REGENERATED FROM THE LIVE DECK. Every edit already applied is in here, and
every beat that has been restructured is shown as it now actually plays.

Some beats are built from several key presses. Those are broken out below as
"press 1 of 3" and so on: each press has its own voice-over line and its own
reveal, and each one is a separate → on the night.

Every beat, in order. Edit the text in place; leave the `[id]` markers alone.
Delete nothing you want kept. Add a line starting with `>>` anywhere for a note
back to the author (e.g. `>> swap this photo`, `>> cut this beat`, `>> hold longer`).

Beat numbers match the counter in the bottom-right corner of the screen.

21 beats · 32 presses · 31 nodes

---

## 01 / 21  ·  Prologue

VOICE OVER:
  [title]

ON CANVAS:
  [t.title]
    Git, the eight things
    ASIDE: everything else can wait

---

## 02 / 21  ·  Prologue

VOICE OVER:
  Skip everything you've heard about git being hard. There are eight moves. Once you have them, you can look everything else up when you need it.

ON CANVAS:
  [t.premise]
    You don't need to know git. You need to survive eight moves in it.
    ASIDE: status, add, commit, diff, push/pull, branch/switch, merge, stash. That's the whole list.

---

## 03 / 21  ·  I · Starting

VOICE OVER:
  Two ways to begin, and the choice is not really a choice.

ON CANVAS:
  [t.start]
    Every repo starts one of two ways.
    ASIDE: Something new, or something that already exists somewhere else.

---

## 04 / 21  ·  I · Starting

THIS BEAT IS 3 PRESSES. Each one is a separate → on the night.

  ── press 1 of 3 ──

  VOICE OVER:
    Starting from nothing.

  ON CANVAS:
    (camera move only)

  ── press 2 of 3 ──

  VOICE OVER:
    git init. An empty repo, right where you're standing.

  APPEARS NOW:
    [c.init]
      TITLE: starting from nothing
      | $git init
      |
      | # an empty repo, right here

  ── press 3 of 3 ──

  VOICE OVER:
    git clone. A full copy of one that already exists, history included — this is the one you'll use most, since you're usually joining a project, not starting one.

  APPEARS NOW:
    [c.clone]
      TITLE: starting from something
      | $git clone <url>
      |
      | # a full copy, history and all

---

## 05 / 21  ·  I · Starting

VOICE OVER:
  Clone if it exists somewhere. Init if it doesn't yet. That's the entire decision tree.

ON CANVAS:
  [t.startsub]
    clone if it exists somewhere. init if it doesn't yet.
    ASIDE: That's the entire decision.

---

## 06 / 21  ·  II · Where it lives

VOICE OVER:
  A file you're tracking is always in exactly one of three places, and the two commands here just tell you which, or move it to the next one.

ON CANVAS:
  [t.lives]
    A file is always sitting in one of three places.
    ASIDE: git status tells you which. git diff tells you what actually changed before you commit to it.

---

## 07 / 21  ·  II · Where it lives

THIS BEAT IS 3 PRESSES. Each one is a separate → on the night.

  ── press 1 of 3 ──

  VOICE OVER:
    You edit a file. It's sitting in the working tree — nothing has been told about it yet.

  ON CANVAS:
    [r.working]
      REGION: Working tree
      SUB: you just edited it
    [r.staged]
      REGION: Staged
      SUB: "git add" — marked ready
    [r.history]
      REGION: History
      SUB: "git commit" — safe now

  ── press 2 of 3 ──

  VOICE OVER:
    git add marks it staged. You're saying "this is going in the next save," nothing more.

  APPEARS NOW:
    [a.tostage]  (route line drawing on)
    [l.add]
      git add
      SUB: stage it

  ── press 3 of 3 ──

  VOICE OVER:
    git commit moves it into history. Permanent, safe, and — this matters — never actually erased from here again.

  APPEARS NOW:
    [a.tohist]  (route line drawing on)
    [l.commit]
      git commit
      SUB: save it, permanently

---

## 08 / 21  ·  III · The stack

VOICE OVER:
  And "history" is really just a pile. Commits stack on top of each other, and main is a label on whichever one is currently on top.

ON CANVAS:
  [t.stack]
    Commits stack. That's the whole model.
    ASIDE: Newest on top. main is just whichever card is currently there.

---

## 09 / 21  ·  III · The stack

THIS BEAT IS 2 PRESSES. Each one is a separate → on the night.

  ── press 1 of 2 ──

  VOICE OVER:
    One commit. main sits on it.

  ON CANVAS:
    [g.t0]
      t1
      t2
      t3
      main
      CAPTION: one commit, main on top of itcommit twice more — the pile grows, main rides along

  ── press 2 of 2 ──

  VOICE OVER:
    Commit twice more and watch main. It doesn't stay put — it rides up to whatever's newest.

  APPEARS NOW:
    [g.t0__to]  (the diagram [g.t0] animates to its second state)
      NOW READS: commit twice more — the pile grows, main rides along

---

## 10 / 21  ·  III · The stack

THIS BEAT IS 2 PRESSES. Each one is a separate → on the night.

  ── press 1 of 2 ──

  VOICE OVER:
    Three deep.

  ON CANVAS:
    [g.t1]
      t1
      t2
      t3
      b1
      b2
      main
      feature
      CAPTION: three commits, one columnbranch: a second, shorter pile, tied to the card it grew out of

  ── press 2 of 2 ──

  VOICE OVER:
    Branch: a second, shorter pile, one column over, still tied back to exactly the card it grew out of.

  APPEARS NOW:
    [g.t1__to]  (the diagram [g.t1] animates to its second state)
      NOW READS: branch: a second, shorter pile, tied to the card it grew out of

---

## 11 / 21  ·  III · The stack

THIS BEAT IS 2 PRESSES. Each one is a separate → on the night.

  ── press 1 of 2 ──

  VOICE OVER:
    Two piles, both growing.

  ON CANVAS:
    [g.t2]
      t1
      t2
      t3
      b1
      b2
      mg
      main
      feature
      CAPTION: two piles, side by sidemerge: one commit, two parents, folded back into main

  ── press 2 of 2 ──

  VOICE OVER:
    Merge: one commit, two parents instead of one, folding the side pile back into main.

  APPEARS NOW:
    [g.t2__to]  (the diagram [g.t2] animates to its second state)
      NOW READS: merge: one commit, two parents, folded back into main

---

## 12 / 21  ·  III · The stack

THIS BEAT IS 2 PRESSES. Each one is a separate → on the night.

  ── press 1 of 2 ──

  VOICE OVER:
    feature, still labelled.

  ON CANVAS:
    [g.t3]
      t1
      t2
      t3
      b1
      b2
      mg
      main
      feature
      CAPTION: feature is still labelleddelete the branch — the label goes, the commits do not

  ── press 2 of 2 ──

  VOICE OVER:
    Delete the branch and watch what actually goes: the label. Not the cards. That's the whole reason branches feel disposable and history doesn't.

  APPEARS NOW:
    [g.t3__to]  (the diagram [g.t3] animates to its second state)
      NOW READS: delete the branch — the label goes, the commits do not

---

## 13 / 21  ·  IV · A remote

VOICE OVER:
  Everything so far has been on your machine. origin is the same idea, living somewhere else.

ON CANVAS:
  [t.remote]
    origin is just somebody else's copy of the same pile.
    ASIDE: Usually GitHub's. Push sends your new cards up. Pull brings theirs down.

---

## 14 / 21  ·  IV · A remote

THIS BEAT IS 2 PRESSES. Each one is a separate → on the night.

  ── press 1 of 2 ──

  VOICE OVER:
    Your pile, two commits deep. origin's copy, one behind — it doesn't know about your second commit yet.

  ON CANVAS:
    [g.local]
      l1
      l2
      main
    [g.origin]
      l1
      l2
      origin/main
      CAPTION: origin has l1, not yet l2git push — origin catches up

  ── press 2 of 2 ──

  VOICE OVER:
    git push sends it up. origin catches up to you. Nothing fancier is happening than that.

  APPEARS NOW:
    [a.push]  (route line drawing on)
    [g.origin__to]  (the diagram [g.origin] animates to its second state)
      NOW READS: git push — origin catches up

---

## 15 / 21  ·  IV · A remote

VOICE OVER:
  Pull is the same move in reverse — bring down whatever origin has that you don't, usually a teammate's work.

ON CANVAS:
  [c.pushpull]
    | $git push # send yours up
    | $git pull # bring theirs down

---

## 16 / 21  ·  V · Undoing

VOICE OVER:
  Last one, and it's the one that actually removes the fear: almost nothing you do here is permanent until you say so.

ON CANVAS:
  [t.undo]
    Nothing here is a real emergency.
    ASIDE: Not committed yet? Tuck it away and get it back later.

---

## 17 / 21  ·  V · Undoing

THIS BEAT IS 2 PRESSES. Each one is a separate → on the night.

  ── press 1 of 2 ──

  VOICE OVER:
    History, plus something you're mid-edit on — not staged, not committed, just sitting on your desk.

  ON CANVAS:
    [g.u0]
      h1
      h2
      wip
      stash
      main
      CAPTION: wip: not staged, not committed, just sitting theregit stash — tucked aside, dimmed, not lost

  ── press 2 of 2 ──

  VOICE OVER:
    git stash tucks it aside. Dimmed, out of the way, not gone.

  APPEARS NOW:
    [g.u0__to]  (the diagram [g.u0] animates to its second state)
      NOW READS: git stash — tucked aside, dimmed, not lost

---

## 18 / 21  ·  V · Undoing

THIS BEAT IS 2 PRESSES. Each one is a separate → on the night.

  ── press 1 of 2 ──

  VOICE OVER:
    Parked.

  ON CANVAS:
    [g.u1]
      h1
      h2
      stash
      wip
      main
      CAPTION: stashed, out of the waygit stash pop — right back where you left it

  ── press 2 of 2 ──

  VOICE OVER:
    git stash pop, and it's back exactly where you left it.

  APPEARS NOW:
    [g.u1__to]  (the diagram [g.u1] animates to its second state)
      NOW READS: git stash pop — right back where you left it

---

## 19 / 21  ·  V · Undoing

VOICE OVER:
  And if the mistake already made it into history — same rule as always. Nothing gets deleted, something new gets added on top that cancels it out.

ON CANVAS:
  [t.revert]
    Already committed the mistake? git revert doesn't erase it.
    ASIDE: It adds a new commit that undoes it. Same append-only rule as everything else.

---

## 20 / 21  ·  Close

VOICE OVER:
  Eight commands. Everything else — rebase, force-pushing, worktrees — can wait until you actually hit a wall that needs it.

ON CANVAS:
  [c.cheat1]
    TITLE: see it, stage it, save it
    | $git status
    | $git add .
    | $git commit -m "…"
    | $git diff
  [c.cheat2]
    TITLE: share it, split it, undo it
    | $git push / pull
    | $git branch / switch
    | $git merge
    | $git stash

---

## 21 / 21  ·  Close

VOICE OVER:
  stop here — this is the beat to take questions on

ON CANVAS:
  [c.cheat1]
    TITLE: see it, stage it, save it
    | $git status
    | $git add .
    | $git commit -m "…"
    | $git diff
  [c.cheat2]
    TITLE: share it, split it, undo it
    | $git push / pull
    | $git branch / switch
    | $git merge
    | $git stash
  [t.close]
    Eight moves. That's enough to stop being afraid of it.

---
