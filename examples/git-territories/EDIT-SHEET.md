# Git, as a place : edit sheet

REGENERATED FROM THE LIVE DECK. Every edit already applied is in here, and
every beat that has been restructured is shown as it now actually plays.

Some beats are built from several key presses. Those are broken out below as
"press 1 of 3" and so on: each press has its own voice-over line and its own
reveal, and each one is a separate → on the night.

Every beat, in order. Edit the text in place; leave the `[id]` markers alone.
Delete nothing you want kept. Add a line starting with `>>` anywhere for a note
back to the author (e.g. `>> swap this photo`, `>> cut this beat`, `>> hold longer`).

Beat numbers match the counter in the bottom-right corner of the screen.

39 beats · 56 presses · 58 nodes

---

## 01 / 39  ·  Prologue

VOICE OVER:
  [title] Git, as a place.

ON CANVAS:
  [t.title]
    Git, as a place
    ASIDE: The half the tutorials do not draw

---

## 02 / 39  ·  Prologue

VOICE OVER:
  Quick show of hands: who has done Learn Git Branching? Good. It is the best git teaching thing that exists, and I am going to send you back to it at the end of this. But I want to point at something it does not do, which is that it draws the commit graph and it never draws your files.

ON CANVAS:
  [t.lgb]
    Some of you have done Learn Git Branching. It is the best thing
    there is, and I am going to send you back to it at the end.
    ASIDE: It animates the commit graph. It does not draw your files.

---

## 03 / 39  ·  Prologue

VOICE OVER:
  And that matters, because in my experience the graph is not what confuses people. What confuses people is which of four places my work is in right now. So that is what this twenty minutes is.

ON CANVAS:
  [t.claim]
    Which is a problem, because the part that confuses people is not the graph.
    It is which of four places my work is in right now.

---

## 04 / 39  ·  I · The picture

VOICE OVER:
  Thirty seconds of shared vocabulary first, so we are all holding the same picture. If you have done the tutorial this is revision, and I will go fast.

ON CANVAS:
  [t.g0]
    Thirty seconds of shared vocabulary.
    ASIDE: If you have done the tutorial, this is revision.

---

## 05 / 39  ·  I · The picture

THIS BEAT IS 2 PRESSES. Each one is a separate → on the night.

  ── press 1 of 2 ──

  VOICE OVER:
    A commit is a full snapshot of your files, plus a pointer to its parent. Not a diff. The arrows point backwards, from newest to oldest.

  ON CANVAS:
    [g.commit]
      a1c
      9f2
      4de
      main
      HEAD
      CAPTION: a commit is a snapshot plus a pointer to its parentcommit: a new snapshot, and the branch moves with you

  ── press 2 of 2 ──

  VOICE OVER:
    And when you commit, the branch comes with you. Watch the label move. That is the whole mechanic.

  APPEARS NOW:
    [g.commit__to]  (the diagram [g.commit] animates to its second state)
      NOW READS: commit: a new snapshot, and the branch moves with you

---

## 06 / 39  ·  I · The picture

THIS BEAT IS 3 PRESSES. Each one is a separate → on the night.

  ── press 1 of 3 ──

  VOICE OVER:
    So what is a branch? A branch is a file with a hash in it. I want to be clear that this is not me simplifying.

  ON CANVAS:
    [t.branch]
      A branch is a file with a hash in it.
      ASIDE: Not a simplification for the talk. The implementation.

  ── press 2 of 3 ──

  VOICE OVER:
    Forty-one bytes. Forty hex characters and a newline. That is your entire main branch.

  APPEARS NOW:
    [c.41]
      TITLE: your entire main branch
      | $wc -c .git/refs/heads/main
      | 41
      |
      | # forty hex characters and a newline

  ── press 3 of 3 ──

  VOICE OVER:
    Which is why branching is instant in a repository of any size, and why the branches-are-expensive instinct people bring from older version control is wrong by about six orders of magnitude.

  APPEARS NOW:
    [t.brcost]
      Which is why branching is instant in a repository of any size.
      You wrote 41 bytes.

---

## 07 / 39  ·  I · The picture

THIS BEAT IS 2 PRESSES. Each one is a separate → on the night.

  ── press 1 of 2 ──

  VOICE OVER:
    HEAD is a pointer to a pointer. It usually holds the name of a branch, and that indirection is exactly why committing moved the branch a moment ago. You were never attached to the commit.

  ON CANVAS:
    [t.head]
      HEAD is a pointer to a pointer.
      ASIDE: It holds the name of a branch, which is why committing takes the branch with you.
    [g.head]
      a1c
      9f2
      4de
      main
      HEAD
      CAPTION: normally: HEAD names a branch, the branch names a commitdetached HEAD: HEAD skips the branch. That is the whole thing.

  ── press 2 of 2 ──

  VOICE OVER:
    And detached HEAD is just this. HEAD skipping the branch and pointing straight at a commit. That is the entire scary state.

  APPEARS NOW:
    [g.head__to]  (the diagram [g.head] animates to its second state)
      NOW READS: detached HEAD: HEAD skips the branch. That is the whole thing.

---

## 08 / 39  ·  I · The picture

VOICE OVER:
  You are not lost. You are standing somewhere that does not have a name. The only real risk is that you commit here, then walk away, and nothing points at what you did.

ON CANVAS:
  [t.detach]
    You are not lost. You are standing somewhere that has no name.
    ASIDE: Commit here, walk away, and nothing points at your work. That is the only real risk.

---

## 09 / 39  ·  I · The picture

VOICE OVER:
  And hold on to this one, because everything in the last two acts depends on it. Nothing in a repository is ever modified. Things get added, and then they are pointed at, or they are not. Deleting a commit only ever means removing the pointer. breathe

ON CANVAS:
  [t.append]
    And the property everything else rests on: nothing in a repository is ever
    modified. Things are added, then pointed at or not.
    ASIDE: "Deleting" a commit only removes the pointer.

---

## 10 / 39  ·  II · Four territories

VOICE OVER:
  Right. That was the half you can already get elsewhere. This is the half you cannot. Four territories, left to right, roughly in order of how permanent they are.

ON CANVAS:
  [r.wt]
    REGION: Working tree
    SUB: the only one Finder can see
  [r.ix]
    REGION: Index
    SUB: a.k.a. the staging area
  [r.lr]
    REGION: Local repository
    SUB: everything in the last act lives here
  [r.rm]
    REGION: Remote
    SUB: someone else’s local repository

---

## 11 / 39  ·  II · Four territories

VOICE OVER:
  The working tree. Your actual files. The only territory you can open in Finder, and the only one that is not version controlled. Git does not watch it. Git reads it when you ask it to.

ON CANVAS:
  [r.wt]
    REGION: Working tree
    SUB: the only one Finder can see
  [n.wt]
    Ordinary files on disk. The only territory that is not
    version controlled.
    ASIDE: Git does not watch this. It reads it when you ask.

---

## 12 / 39  ·  II · Four territories

THIS BEAT IS 3 PRESSES. Each one is a separate → on the night.

  ── press 1 of 3 ──

  VOICE OVER:
    The index. Staging area. The one everybody uses daily and almost nobody has a picture of.

  ON CANVAS:
    [r.ix]
      REGION: Index
      SUB: a.k.a. the staging area

  ── press 2 of 3 ──

  VOICE OVER:
    It is one file, and it holds a complete proposed snapshot of your next commit. Not a to-do list of files you ticked. A whole tree.

  APPEARS NOW:
    [n.ix]
      One file, .git/index, holding a complete proposed
      snapshot of your next commit.
      ASIDE: Not a list of files you flagged. A whole tree.

  ── press 3 of 3 ──

  VOICE OVER:
    Which means git add is doing more than marking. It reads the file off disk and writes the content into the object database there and then. Your content is saved before you ever commit.

  APPEARS NOW:
    [c.add]
      TITLE: what add actually does
      | $git add app.js
      |
      | reads app.js off disk
      | writes the content into .git/objects
      | records it in the index

---

## 13 / 39  ·  II · Four territories

VOICE OVER:
  And that explains the oldest surprise in git. Add a file, keep editing it, commit. You get the version you added, because that is the version that went into the index. Everyone in this room has hit this, and now you know exactly why. pause

ON CANVAS:
  [r.wt]
    REGION: Working tree
    SUB: the only one Finder can see
  [c.gotcha]
    TITLE: the classic surprise
    | $git add app.js
    | $vim app.js # more edits
    | $git commit -m ok
    |
    | you committed the first version

---

## 14 / 39  ·  II · Four territories

VOICE OVER:
  The local repository. Which is just the commit graph from the last act, sitting in the .git folder, plus the refs pointing into it. Append only.

ON CANVAS:
  [r.lr]
    REGION: Local repository
    SUB: everything in the last act lives here
  [n.lr]
    The commit graph you just saw, plus the refs pointing into it.
    Append only.
    ASIDE: Everything you have ever committed is still in here.

---

## 15 / 39  ·  II · Four territories

VOICE OVER:
  And the remote, which is another repository on a machine you probably do not own. Structurally there is nothing special about it. Origin is a nickname, not a status.

ON CANVAS:
  [r.rm]
    REGION: Remote
    SUB: someone else’s local repository
  [n.rm]
    Another repository, usually on a machine you do not own.
    ASIDE: "origin" is a nickname, not a status. Your laptop could be someone's origin.

---

## 16 / 39  ·  II · Four territories

THIS BEAT IS 4 PRESSES. Each one is a separate → on the night.

  ── press 1 of 4 ──

  VOICE OVER:
    Now the roads. Every command you type all day is one of these.

  ON CANVAS:
    [r.wt]
      REGION: Working tree
      SUB: the only one Finder can see
    [r.ix]
      REGION: Index
      SUB: a.k.a. the staging area
    [r.lr]
      REGION: Local repository
      SUB: everything in the last act lives here
    [r.rm]
      REGION: Remote
      SUB: someone else’s local repository

  ── press 2 of 4 ──

  VOICE OVER:
    add: tree to index.

  APPEARS NOW:
    [a.add]  (route line drawing on)
    [l.add]
      git add
      SUB: tree -> index

  ── press 3 of 4 ──

  VOICE OVER:
    commit: index to repository. Notice it never looks at your working tree. It commits the index.

  APPEARS NOW:
    [a.commit]  (route line drawing on)
    [l.commit]
      git commit
      SUB: index -> repository

  ── press 4 of 4 ──

  VOICE OVER:
    push: repository to remote.

  APPEARS NOW:
    [a.push]  (route line drawing on)
    [l.push]
      git push
      SUB: repository -> remote

---

## 17 / 39  ·  II · Four territories

VOICE OVER:
  And the thing to notice is that there is no road from the working tree to the remote. You cannot skip a step. Which is why "I pushed but the change isn't there" is always, every single time, one of the two earlier roads not being taken.

ON CANVAS:
  [t.noskip]
    There is no road from your working tree to the remote.
    ASIDE: Which is why "I pushed but it isn't there" is always one of the two earlier roads not taken.

---

## 18 / 39  ·  III · A cache, not a remote

VOICE OVER:
  Act three, and this is the one that costs people real hours. origin/main is not the remote. It is a note you once wrote about the remote.

ON CANVAS:
  [t.c0]
    Now the one that costs people real hours.
    ASIDE: origin/main is not the remote. It is a note you wrote about the remote.

---

## 19 / 39  ·  III · A cache, not a remote

THIS BEAT IS 2 PRESSES. Each one is a separate → on the night.

  ── press 1 of 2 ──

  VOICE OVER:
    Here is your local repository again.

  ON CANVAS:
    [r.lr2]
      REGION: Local repository
      SUB: on your laptop

  ── press 2 of 2 ──

  VOICE OVER:
    And origin/main lives in here. On your laptop. It is a cached value, and the only thing that ever updates it is you running fetch. Nothing on the server can reach across and correct it.

  APPEARS NOW:
    [r.cache]
      REGION: origin/main
      SUB: a value you remembered, not a place

---

## 20 / 39  ·  III · A cache, not a remote

THIS BEAT IS 2 PRESSES. Each one is a separate → on the night.

  ── press 1 of 2 ──

  VOICE OVER:
    Right now you and the server agree. Your main and your origin/main both point at 4de.

  ON CANVAS:
    [t.cache]
      It lives inside your repository, not on the server. It is a
      remembered value, and it is only ever updated by fetch.
      ASIDE: Nothing on the server can reach across and correct it.
    [g.cache]
      a1c
      9f2
      4de
      d4f
      main
      origin/main
      CAPTION: you and the server agreea colleague pushed d4f. Your origin/main has not moved, because you have not fetched.

  ── press 2 of 2 ──

  VOICE OVER:
    Then a colleague pushes. That greyed-out commit is on the server, and your repository has never heard of it. Look at origin/main: it has not moved, and it will not move, until you fetch.

  APPEARS NOW:
    [g.cache__to]  (the diagram [g.cache] animates to its second state)
      NOW READS: a colleague pushed d4f. Your origin/main has not moved, because you have not fetched.

---

## 21 / 39  ·  III · A cache, not a remote

VOICE OVER:
  So this line, which all of us read every day, does not mean what it says. "Your branch is up to date with origin/main."

ON CANVAS:
  [c.status]
    TITLE: and so this is a lie
    | $git status
    | On branch main
    | Your branch is up to date with 'origin/main'.
    |
    | nothing to commit, working tree clean

---

## 22 / 39  ·  III · A cache, not a remote

VOICE OVER:
  It means: up to date with what I saw last time you fetched. Which might have been Tuesday. It is not a claim about the server. It is a claim about your own memory of the server, and it is the single most confidently misread sentence in the whole tool.

ON CANVAS:
  [t.status]
    It means "up to date with what I saw last time I fetched", which might
    have been Tuesday.

---

## 23 / 39  ·  III · A cache, not a remote

THIS BEAT IS 2 PRESSES. Each one is a separate → on the night.

  ── press 1 of 2 ──

  VOICE OVER:
    Which makes fetch the command that makes the note true again. It downloads commits and updates the cache, and it does not touch your files at all. Fetch is always safe.

  ON CANVAS:
    [t.fetch]
      So fetch is the command that makes the note true again.
      ASIDE: It downloads commits and updates the cache. It does not touch your files.

  ── press 2 of 2 ──

  VOICE OVER:
    And pull is fetch plus merge, back to back. Which is exactly why a pull can hand you a conflict and a fetch never can. If you are ever nervous: fetch first, then look around.

  APPEARS NOW:
    [t.pull]
      And pull is fetch plus merge, run
      back to back.
      ASIDE: Which is why a pull can hand you a conflict and a fetch never can.

---

## 24 / 39  ·  IV · When it disagrees

VOICE OVER:
  Act four. Two people worked at once, which is the normal case, not the exception.

ON CANVAS:
  [t.d0]
    Two people worked at once. Now what?

---

## 25 / 39  ·  IV · When it disagrees

THIS BEAT IS 2 PRESSES. Each one is a separate → on the night.

  ── press 1 of 2 ──

  VOICE OVER:
    You branched off 9f2. Someone else moved main to 4de. Two routes out of one fork.

  ON CANVAS:
    [g.merge]
      a1c
      9f2
      4de
      c07
      e18
      77b
      main
      feature
      CAPTION: diverged: two routes out of one forkmerge: one new commit with two parents. Both routes survive.

  ── press 2 of 2 ──

  VOICE OVER:
    Merge makes one new commit with two parents. Both routes survive on the map, exactly as they happened.

  APPEARS NOW:
    [g.merge__to]  (the diagram [g.merge] animates to its second state)
      NOW READS: merge: one new commit with two parents. Both routes survive.

---

## 26 / 39  ·  IV · When it disagrees

THIS BEAT IS 2 PRESSES. Each one is a separate → on the night.

  ── press 1 of 2 ──

  VOICE OVER:
    Same fork. Now rebase.

  ON CANVAS:
    [g.rebase]
      a1c
      9f2
      4de
      c07
      e18
      b31
      d92
      main
      feature
      CAPTION: the same fork againrebase: replayed as NEW commits. c07 and e18 are still there, unpointed-at.

  ── press 2 of 2 ──

  VOICE OVER:
    Watch c07 and e18. They do not move. They fade, because nothing points at them any more, and two brand new commits appear on the trunk.

  APPEARS NOW:
    [g.rebase__to]  (the diagram [g.rebase] animates to its second state)
      NOW READS: rebase: replayed as NEW commits. c07 and e18 are still there, unpointed-at.

---

## 27 / 39  ·  IV · When it disagrees

VOICE OVER:
  Rebase did not move your work. It could not: a commit's id is a hash that covers its parent, so a commit with a new parent is a new commit. It built copies and pointed your branch at the copies. And that is the whole of "do not rebase a shared branch". If a colleague already has the originals, the two of you now hold histories that disagree.

ON CANVAS:
  [t.newid]
    Nothing moved. New commits were built, with new parents, so new ids.
    ASIDE: Which is the whole reason not to rewrite a branch someone else already has.

---

## 28 / 39  ·  IV · When it disagrees

VOICE OVER:
  And then sometimes git gets to the same fork and cannot decide.

ON CANVAS:
  [t.cf0]
    And sometimes it cannot decide.

---

## 29 / 39  ·  IV · When it disagrees

VOICE OVER:
  A conflict. Which everyone treats as an error, and it is not one.

ON CANVAS:
  [c.conflict]
    TITLE: a conflict, in your file
    | <<<<<<< HEAD
    | padding: 12px;
    | =======
    | padding: 16px;
    | >>>>>>> feature

---

## 30 / 39  ·  IV · When it disagrees

VOICE OVER:
  Look at where it landed. Those markers are sitting in your working tree. The leftmost territory, the one git does not manage. Git got as far as it could on its own, and then wrote the disagreement into your files and stopped, because the decision is genuinely yours.

ON CANVAS:
  [t.cf1]
    Notice where that landed: in your working tree. The leftmost
    territory. The one git does not manage.
    ASIDE: That is not a failure. It is git handing you the decision it cannot make.

---

## 31 / 39  ·  IV · When it disagrees

VOICE OVER:
  Which also tells you the way out without memorising anything. Edit the file until it is right. Then git add it, which in this context means "this is the answer". Then continue. You are just walking the same roads again.

ON CANVAS:
  [t.cf2]
    Which also tells you the way out. Edit the file, git add it to
    say "this is the answer", and continue.
    ASIDE: You are just walking the roads again.

---

## 32 / 39  ·  V · Nothing is lost

VOICE OVER:
  Last act, and this is where the map pays for itself. The three flavours of reset are not three strengths. They are one question: how far left across the territories does it reach?

ON CANVAS:
  [t.r0]
    Last one. The three resets are one question:
    how far left across the territories does it reach?

---

## 33 / 39  ·  V · Nothing is lost

THIS BEAT IS 4 PRESSES. Each one is a separate → on the night.

  ── press 1 of 4 ──

  VOICE OVER:
    The same territories, minus the remote.

  ON CANVAS:
    [r.rwt]
      REGION: Working tree
    [r.rix]
      REGION: Index
    [r.rlr]
      REGION: Local repository

  ── press 2 of 4 ──

  VOICE OVER:
    --soft reaches the repository and stops. It moves the branch pointer, and leaves your index and your files alone. That is the one for redoing a message or squashing the last three commits.

  APPEARS NOW:
    [l.soft]
      --soft
      SUB: moves the branch pointer. Nothing else.

  ── press 3 of 4 ──

  VOICE OVER:
    --mixed, the default, reaches one territory further and rewrites the index too. Your files are still fine.

  APPEARS NOW:
    [l.mixed]
      --mixed
      SUB: and rewrites the index. The default.

  ── press 4 of 4 ──

  VOICE OVER:
    --hard goes all the way, and overwrites your working tree.

  APPEARS NOW:
    [l.hard]
      --hard
      SUB: and overwrites your files.

---

## 34 / 39  ·  V · Nothing is lost

VOICE OVER:
  And that is the one genuinely dangerous command on this whole map, for one specific reason: the working tree is the territory git never recorded. Everything else you are about to see is recoverable. This is not.

ON CANVAS:
  [t.hard]
    --hard is the only command on this whole map that can destroy
    something git never recorded.
    ASIDE: Everything else is recoverable. This is not.

---

## 35 / 39  ·  V · Nothing is lost

VOICE OVER:
  Because of the reflog. Every value HEAD has ever had, in order, with the reason it changed. Bad reset, bad rebase, deleted branch: still addressable.

ON CANVAS:
  [c.reflog]
    TITLE: every value HEAD has ever had
    | $git reflog
    | 4de9c1b HEAD@{0}: reset: moving to HEAD~2
    | 77b0a3f HEAD@{1}: merge feature
    | e18cc21 HEAD@{2}: commit: fix the thing
    |
    | $git reset --hard HEAD@{2}

---

## 36 / 39  ·  V · Nothing is lost

VOICE OVER:
  It is local, so it will not save a colleague, and it expires at around ninety days. But inside that window, "I destroyed my branch" is almost never actually true. And if the history is already shared, use revert instead, which goes forward: a new commit that undoes an old one, honestly.

ON CANVAS:
  [t.reflog]
    Local, and it keeps about ninety days. Inside that window,
    "I destroyed my branch" is almost never true.
    ASIDE: And revert is the forward version: a new commit that undoes an old one.

---

## 37 / 39  ·  VI · Go and practise

VOICE OVER:
  So if you take one thing away: the only way to truly lose work in git is to never have added it. Everything after git add is somewhere on this map.

ON CANVAS:
  [t.close]
    The only way to truly lose work in git is to never have added it.
    ASIDE: Everything after git add is somewhere on this map.

---

## 38 / 39  ·  VI · Go and practise

VOICE OVER:
  And now go and do Learn Git Branching, properly, all the way through. It will drill the graph half far better than I just did, because you get to type and it answers. The only difference is that you now know what it is not showing you, and that is the half that was costing you afternoons.

ON CANVAS:
  [t.handoff]
    Now go and do learngitbranching.js.org. It will drill the graph
    half far better than I just did.
    ASIDE: The difference is that you now know what it is not showing you.

---

## 39 / 39  ·  VI · Go and practise

VOICE OVER:
  [pull all the way back: the whole canvas] Questions.

ON CANVAS:
  (camera move only)

---
