---
layout: post
title: Git Field Guide
description: Values, practices and configurations on how I use git
excerpt: <p>Values, practices and configurations on how I use git</p>
---

Git has become an indispensable tool of software development, regardless of which
language or framework your team uses it. But in the other hand, it isn't a tool
that you can adopt, learn and be effective from day 1 - it takes time and guidance
to master it, both in the command line the integrations and practices most teams
have adopted.

I've put up together a guide on how I see and use git on my day to day work, that
can be used as a starting both for both newcomers who are trying to grok or more
experienced professionals who want to make a more effective use of it on they
work.

The guide describes [**values**](#values) to remember and strive for when using
git, day to day [**practices**](#practices) and [**configuration**](#configuration)
suggestions that I believe are a must have for your local setup.

## Values

1. Git is more of a tool to **document and communicate** changes rather than storing them.
As the number of people involved or time spent in a codebase grows, you will eventually
find yourself reading more about what (and why) have change rather than reverting
changes.
2. Git is **not trivial**. All its power and usefulness can come with more complexity
than your one might expect. Be humble enough to understand that you might not master
it as fully as you think, and trust it to be more powerful than you currently
expect it to be.
3. Failures are **usually recoverable**. Whenever some git operation does not goes
how you would expect (from commiting to a wrong branch to rebases with absurds conflicts)
do not panic as not all is broken or lost, and commands like `reflog`, `reset` or
`rebase` can be extremely useful to recover and fix whatever might have happened
to your git tree. [Oh shit, git!](http://ohshitgit.com) is a tiny but useful
resource on possible git screw ups and how to fix them.

## Practices

* **On commit messages**: care about writing good commit messages and read your git history often. Chris
Beams has probably the [best post on how to write commit messages](https://chris.beams.io/posts/git-commit/)
and I recommend reading it rather than trying to explain on this post.
* **When working with feature branches**, Always keep them up to date, with both `git pull` and `git fetch`
  every now and then, rebasing it early and often with its base branch (the `master`
  branch on your remote repository on most cases), and fixing conflicts as soon
  as they happen. Fixing conflicts on larger rebases will be harder and merges
  will add noisy commits to your branch's history.
  ```sh
  git checkout feature/add-new-stuff
  # work work work...
  # download the refs that are on your remote repository, and rebase your feature
  # branch on top of whatever's is on your remote's master branch, so it will be
  # up to date. Hopefully no conflicts will need to be fixed.
  git fetch origin && \
    git rebase origin/master

  # if you want to make your local `master` branch is up to date as well, do
  # the following: `git pull` will fetch and rebase the references from your
  # remote repository, and then rebase the feature branch against the local
  # master branch instead.
  git checkout master && \
    git pull --rebase && \
    git checkout - && \
    git rebase master
  ```
* **Use [git commit --fixup](https://robots.thoughtbot.com/autosquashing-git-commits)**
and [interactive rebases](https://robots.thoughtbot.com/git-interactive-rebase-squash-amend-rewriting-history)
to rewrite the history on your feature branches to keep its commits in order and
organized. Intermediate changes are useful when rolling changes and trying fixes, but
once the dust has settled you can rework the history to represent the final changes
you want to introduce.
  ```sh
  # So, you added a few files and some commits on your branch
  git commit -m 'Add README.md'
  # [master (root-commit) f1a4ab4] Add README.md
  #  1 file changed, 0 insertions(+), 0 deletions(-)
  #  create mode 100644 README.md
  $ git commit -m 'Add CONTRIBUTING.md'
  # [master e8644e4] Add CONTRIBUTING.md
  #  1 file changed, 0 insertions(+), 0 deletions(-)
  #  create mode 100644 CONTRIBUTING.md

  # Now you need to update `README.md` and want to "merge" the new commit with
  # these new changes to the original commit (f1a4ab4) using an interactive rebase
  git add README.md
  git commit --fixup f1a4ab4
  # [master 13168c2] fixup! Add README.md
  #  1 file changed, 0 insertions(+), 0 deletions(-)

  # `--autosquash` will prepare the interactive rebase to squash 13168c2 on f1a4ab4
  # for you.
  git rebase --interactive --autosquash HEAD~3
  ```
* Not all branches/Pull Requests need to be **squashed into a single commit** when
doing interactive rebases. Squashing too many commits can make bisecting or
navigating through the history harder than you might want to. You can practice
this by avoiding shortcuts like the GitHub ["squash merge"](https://github.com/blog/2141-squash-your-commits)
button and favoring rebases through your editor where you have more control over
the operation and review your commits to decide how they should be squashed.

## Configuration

* Configure git to always `rebase` branches when doing `git pull` with `git config --global pull.rebase true`
and never use fast forward when doing merges with `git config --global merge.ff false`. These changes
are vital to maintain sane tree histories when working with remote repositories.
* Configure your identity with `git config --global user.name` and `git config --global user.email`
on every workstation you use. This helps to identify who's the real author of a changes
and is important for tools like GitHub to associate a commit with a particular person.
I also configure my local repositories with different email given the context - commits
to company related work is made using a business email while open source is commited
using my personal email - I have an alias `git work` that sets the "work" identity
to the current repository while my global config remains personal.
* Set up aliases to abstract common git operations, like:
  * Undo the last commit (`git reset --soft HEAD^`) and keep it changes to be reviewed or
  split among different commits.
  * Add new changes to the latest commit while maintaining the same message (`git commit --amend --no-edit`).
  Useful when applying small fixes like typos or styleschanges without having to do
  a complete `rebase` operation - don't forget that you will need to push it using `--force`
  when working with remote repositories.
