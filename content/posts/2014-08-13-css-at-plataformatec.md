---
date: "2014-08-13"
summary: A quick walkthrough on how we wrote CSS back in 2014
title: CSS at Plataformatec
---

Last month some amazing developers gave a sneak peek on how they write CSS in their companies - Mark Otto has written about [CSS at GitHub](http://markdotto.com/2014/07/23/githubs-css), followed by Ian Feather's post about [Lonely Planet's CSS](http://ianfeather.co.uk/css-at-lonely-planet/) and Chris Coyier write up about [CodePen's code](http://codepen.io/chriscoyier/blog/codepens-css) - so I thought about sharing a bit of how we have been doing CSS in our projects here at Plataformatec over the last years.

After working on different projects with different styles of CSS, we wrote some [Guidelines](http://guidelines.plataformatec.com.br/css.html) of what kind of code we would like to work with. These guidelines and some other practices have proven to be successful so far, and I want to tell you a bit about how we are doing this here.

### Quick Facts

* We use SCSS.
* We usually just have [Normalize.css](https://github.com/necolas/normalize.css/) (and sometimes [Bootstrap](http://getbootstrap.com)) as third party dependencies.
* Every developer in our team can jump through the codebase and work on our front end code.

### Preprocessors and the Pipeline

We have always used Sass (with the SCSS syntax), using most of the Sass features wherever seemed fit and without making the code too complex to grasp so developers outside the project - or without a long experience with preprocessors - could get things done right after jumping in the code.

We do our best to use the most of the [Rails Asset Pipeline](http://guides.rubyonrails.org/asset_pipeline.html). I know that it isn't the most beloved Rails feature out there, but we are pretty happy with it. The Sprockets + Rails integration in Rails 4 is way better than it was before (you can read a bit about what was done on [this post](http://yetimedia.tumblr.com/post/33320732456/moving-forward-with-the-rails-asset-pipeline)), thanks to the work of [Guillermo](https://github.com/guilleiguaran), [Rafael](https://github.com/rafaelfranca) and [Richard](https://github.com/schneems) (the Sprocket heroes) and everybody else who contributed to [sprockets-rails](https://github.com/rails/sprockets-rails/graphs/contributors), and things will only get better on future releases. If you had a hard time with a Rails 3 app, I recommend that you try it out the latest releases and see what have improved.

### Architecture

We don't have strict guidelines about how we should organize and architect our CSS code, but we have some general rules and conventions. We organize most of our code into isolated partial stylesheets under something like `modules` or `components`. And we also break functions, mixins and generic placeholders into specific files and `@import` everything on the application `application.css.scss` file.

We do our best to keep our selectors small and using only classes, somewhat based on [Wealthfront post on Functional CSS](http://eng.wealthfront.com/2013/08/functional-css-fcss.html) and OOCSS-ish. With this setup we can avoid complex nested blocks and keep things quite readable for everybody.

### Linting

We don't have a specific guideline on linting, but I have been experimenting with [SCSS Lint](https://github.com/causes/scss-lint) on the project that I’m current working on, and I want to evolve this into a default configuration for future projects.

### Frameworks

We have some different setup across our projects, but we usually just have [Normalize.css](https://github.com/necolas/normalize.css/) as our "reset" stylesheet and everything else is custom made - buttons, grids, typography rules, etc. And of all the existing CSS frameworks out there, we had some encounters with [Bootstrap](http://getbootstrap.com) and [Foundation](http://foundation.zurb.com) once.

### Documentation

We love documentation - not obvious code comments, but real documentation that makes easier to understand how to use a specific piece of code.

We started writing docs for our CSS to make more sense out of a SCSS partial, so through a single file we can understand how the application can use those styles. We have adopted some loose form of the [KSS](http://warpspire.com/kss/) syntax, because we currently don't care about generating pretty styleguides with live examples of the styles in use. But the KSS format is human-readable enough and does the job of explaining the purpose of a set of classes to someone.

### Sprites

Last year I created a gem called [Spriteful](http://github.com/lucasmazza/spriteful) to help us manage the image sprites in some projects without having to bring [Compass](http://compass-style.org) and [compass-rails](https://github.com/Compass/compass-rails) as dependencies to our pipeline. Spriteful has proven useful to me and my coworkers, and now we can generate sprites and SCSS partials out of icons and SVG images with just a single command.

Some close friends from outside the company have used it on their projects and it's awesome that someone else has found our little tool handy for this task.

### Who's in charge?

One important aspect of how we work is that every developer in the team is capable to work with the front end code of the application and build new things or fix existing bugs, not just turn some static markup into ERB blocks. This provides a higher sense of collective ownership of the code, instead of enlisting one or two programmers who are in charge of half of the application while everybody else works elsewhere without caring about that layer.

> This post was originally published at
> http://blog.plataformatec.com.br/2014/08/css-at-plataformatec/
