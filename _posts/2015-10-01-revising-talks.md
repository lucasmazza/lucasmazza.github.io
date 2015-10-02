---
layout: post
title: Revising talks on code and craft
---

Over the last couple weeks I decided to get back to watching videos from
conference talks, old and new, to deal with matters of the heart and help
with some of the ongoing discussions in the current project I'm working on.

I've always been a fan of non technical presentations that talked about we can
improve the ways we make software and deal with code rather than just dumping
new technologies and going through README sections. Talks regarding our craft
can remain relevant through many years and help several developers to fight
the chaotic mess that a software project can be.

### Maintaining Balance while Reducing Duplication: Part II

David's talk on duplication helped me a lot to understand better how to deal with
duplicated code instead of blindingly following the premise of *Don't Repeat Yourself*
that we often take it to literally.

I remember watching this talk back in RubyConf Brazil 2010, but it took me a few
years to understand the things it mentions and how extracting all kinds of duplication
can increase coupling, introduce points of indirection and make the codebase
harder to work - due the higher cognitive load required to understand it - instead
of making it easier as we all expect.

<div class='embed-responsive embed-responsive-16by9'>
  <iframe class='embed-responsive-item' src='https://www.youtube.com/embed/UvlyJv0eIf8'
    allowfullscreen></iframe>
</div>

### All the Little Things

One of my biggest regrets from 2014 was that I missed Sandi's talk on RailsConf
Chicago for no apparent reason. She walks us through a process of refactoring
that can teach more than the refactoring itself, showing interesting steps on
how to tackle duplication and turn it into good abstractions and the importance
of having a good process to deal with complexity.

<div class='embed-responsive embed-responsive-16by9'>
  <iframe class='embed-responsive-item' src='https://www.youtube.com/embed/8bZh5LMaSmE'
  allowfullscreen></iframe>
</div>

### I Estimate this Talk is 20 Minutes Long, Give or Take 10 Minutes

Estimates aren't the favorite part of our jobs but it is a very important aspect
of how we communicate with clients and managers about our work. Even if you don't
work as a consultant or have to deal with external clients or stakeholders this
talk can help you whenever you need to estimate something, manage expectations
of interested parties or help less experienced developers to deal with this.

<div class='embed-responsive embed-responsive-16by9'>
  <iframe class='embed-responsive-item' src='https://www.youtube.com/embed/FWr7L4YFzCA' allowfullscreen></iframe>
</div>

### Communicating Code

WindyCityRails always amazes me on how a small conference can provide such high
level talks that are so easy to understand and relate to with our day jobs -
and not just because Ray Hightower was crazy enough to let me speak there in
2014. This talk from Kyle Crum touches the important (and subjective) area of
how the way we organize our code, name or abstractions and document our actions
(through comments or commit messages) affects the way other developers will read
and approach our code as a codebase grows and changes through time.

A must watch talk if you ever got frustrated with legacy projects and codebases
that you couldn't figure out what the hell was going on with the code. And the
reply  for [one of the lightning talks](https://vimeo.com/140388283) in the
first minutes was amazing.

<div class='embed-responsive embed-responsive-16by9'>
  <iframe src='https://player.vimeo.com/video/140388278?color=b12129&byline=0&portrait=0' class='embed-responsive-item' allowfullscreen></iframe>
</div>

### How to Performance

A more technical talk to have a break from the non technical ones and see some
code in action, where Eileen from Basecamp does a great job explaining some of
the improvements that Rails' integration tests have received over the last months,
and you can use the lessons and tools mentioned in this talk to profile your
application or other gems that might use a performance bump.

<div class='embed-responsive embed-responsive-16by9'>
  <iframe src='https://player.vimeo.com/video/140388293?color=b12129&byline=0&portrait=0' class='embed-responsive-item' allowfullscreen></iframe>
</div>
