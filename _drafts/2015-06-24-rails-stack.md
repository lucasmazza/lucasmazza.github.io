---
layout: post
title: Trimming the Rails stack
---
A freshly generated Rails application has components to support the most common tasks that a web application should perform: deal with HTTP and HTML, read and write information from a relational database, send emails and do background processing.

But every now and then, a web application might not have to do all those things:
we might be building a JSON API that doesn't require a rendering layer, or a
way to send emails or do background processing. Our app might be reading data
from another application through HTTP instead of touching a PostgreSQL instance.

In such cases (which have been fairly common to me in the last 2 years), its nice
to know that we can remove all the APIs, configurations and abstractions that Rails
provides by default and work with a smaller subset of the Rails stack.

You can generate an app that doesn't depend on `activerecord` with the `--skip-active-record`
flag, but tere aren't flags available for all the default components. But that shouldn't
be much of a problem given how we can remove these dependencies by ourselves anytime
we need it to.

## Rails is so meta

Depending on the `rails` gem is just a shortcut to depend on all Rails default components: `actionmailer`, `actionpack`, `activerecord`, etc. So, having something like `gem 'rails', '4.2.1'` in our Gemfile is pretty much the same as the following:

```ruby
# Gemfile
source 'https://rubygems.org'

gem 'railties', '4.2.1'
gem 'activerecord', '4.2.1'
gem 'actionpack', '4.2.1'
gem 'actionview', '4.2.1'
gem 'actionmailer', '4.2.1'
gem 'activejob', '4.2.1'
gem 'sprockets-rails'
```

So, if our app won't be using the Asset Pipeline, for instance,
we can remove the `sprockets-rails` dependency and no longer make it a part of our
bundle, together with its dependencies.

The minimal setup we could have is depending on the `railties` gem directly, (that
depends on `actionpack` and `activesupport`) which is enough to spin a Rails app
and have a controller to respond to a HTML request - anything else is optional.

Removing unecessary dependencies will help with the overall bundle size and booting
speed and might even affect the application's memory usage: removing `actionmailer`
would also remove the dependency on `mail` and `mime-types`, which are known to have
a slighty bigger memory footprint than any average gem.

After removing unwanted dependency, the following step is to ensure that such
gems aren't being required by our app anymore.

## Requiring Railties

Rails has another integration point of the default stack where the application
requires all the `railtie` files from each of the gems of the default stack. You
can see in the first lines of your `config/application.rb` file the `require 'rails/all'`
line.

```ruby
# config/application.rb
require File.expand_path('../boot', __FILE__)

require 'rails/all'
# ...
```

Similar to the `rails` gem, [`rails/all.rb`](https://github.com/rails/rails/blob/v4.2.1/railties/lib/rails/all.rb)
is just a shortcut to require 7 other files that will do the default setup of
Active Record, Action Pack, Sprockets and friends.

So, when we don't want to load all those files by default, we can change the `rails/all`
require call with requires of our own:

```ruby
# config/application.rb
require File.expand_path('../boot', __FILE__)

require 'rails'
require 'active_record/railtie'
require 'action_controller/railtie'
# ...
```

With this, even the unused pieces that are still part of the application's `Gemfile`
won't be required and plugged into the Rails stack, even if they are required by
a third party gem by default.

## Initializers & environments

When removing a dependency like Active Record from a Rails app, after making it
no longer part of the application bundle and not required by the `config/application.rb`
file, we still need to remove a few lines from the default initializers that touch
configurations that aren't available anymore, like the following:

* `config.action_mailer.delivery_method = :test` should be removed the `test.rb` environment file
if your app don't depend on `actionmailer` anymore.
* The `assets.rb` initializer, that only works when `sprockets-rails` is part of the application,
together with the `config.assets` settings from the `production.rb` and `development.rb` files.
* The `db` directory and the `config/database.yml` can be safely removed if we aren't using
Active Record.

## Bringing pieces back
