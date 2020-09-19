---
date: "2014-04-08"
summary: "A quick rundown over some Rails 4.1 features"
title: 3 features from Rails 4.1 that I'm excited about
---

Rails 4.1 was just released this week and I already had a great experience trying out the release candidates on my latest project, so I decided to write a bit about my favorites features on this release and some things I have learned by using them so far.

### 1) secrets.yml

Placing your configuration in a YAML file isn't exactly a revolutionary feature, but the usage of the `config/secrets.yml` file that comes with Rails 4.1 holds a more important idea: the promise of a default approach for environment aware custom configuration on Rails applications. Over the years the community created several ways to manage such configuration so every app out there deals with this differently, but now we can use the Rails default as a standard just like we do with the app folder or the routing patterns, taking the configuration madness outside the list of things to worry about when working with Rails. So instead of dealing with multiple YAML files or constants left out inside initializers, we can go with the `secrets.yml` as the default for our apps.

Remember that you can place any kind of configuration - not just secrets like tokens or passwords - that need to be handled differently through your application environments, like API Endpoints or S3 bucket names. And for any gem maintainers out there, you can make your gem read these settings from the `secrets.yml` automagically through an [initializer](https://github.com/plataformatec/devise/blob/6027787930224b7c5306a15a81c26e9a7c21fe89/lib/devise/rails.rb#L32-L45) block and maybe remove a configuration step from the gem setup. Adding this to Devise on [this pull request](https://github.com/plataformatec/devise/pull/2835) was easier than I expected and I suggest you to try it out on your gems as well.

If you want to try to organize your configuration through the `secrets.yml` without having to update to Rails 4.1 right now, Andrew White backported this feature on the [rails-secrets](https://github.com/pixeltrix/rails-secrets) gem for Rails 4.0 apps.

So, if you are dealing with some configuration mess or aren't using something like [dotenv](https://github.com/bkeepers/dotenv) for your application, I strongly suggest that you try to migrate your config to use the `secrets.yml` file and see how it goes for your application.

### 2) Action Pack Variants

Variants are proving to be a great solution to render device specific views when mixed with any device detection solution like the [useragent](https://github.com/josh/useragent) or [browser](https://github.com/fnando/browser) gems, which you integrate quickly with just a `before_action` block:

```ruby
class ApplicationController < ActionController::Base
  before_action :set_variant

  private

  def set_variant
    if browser.tablet?
      request.variant = :tablet
    elsif browser.mobile?
      request.variant = :mobile
    else
      request.variant = :desktop
    end
  end
end
```

Even though the main examples are dealing with User Agent sniffing, this feature can be used in any context where you want to have more control of which views are rendered by your application, like:

* A/B Testing different partials based on the user cookies.
* API versioning for your Jbuilder templates.
* Maintaining current and redesigned views for the same controller.
* Authorization aware views, like `users/index.html+admin.erb` or `products/show.html+guest.erb`.

In the end, Variants are just a way for you to have more control over how your views will be used by the app, helping you to remove boilerplate logic from your code and letting the framework handle it through a more elegant solution.

### 3) The improved cookies serializer

The changes on how Rails serializes cookies are a great improvement when it comes to security and stability of web apps. Before this, any object placed in the cookies Hash would be serialized (and deserialized) through `Marshal.dump` and `Marshal.load`, which could possibly lead to remote code execution if an attacker got hold on your application secret.

Now this serializer is configurable through the `config.action_dispatch.cookies_serializer` configuration option, and new apps will ship with a smarter default: a JSON serializer that won't recreate complex objects besides Strings, Integers and other JSON data types. And for a smooth upgrade, you can use the `:hybrid` serializer that will convert your existing marshalled cookies into JSON cookies, so this upgrade can be transparent for your application users.

This upgrade highlights a possible bad practice in our applications where we end up placing more complex objects in the session that can't be completely restored by the JSON serializer, when we should be using more simple structures for the data stored in cookies. Thanks to a related issue reported on the [Devise](https://github.com/plataformatec/devise) issue tracker we could simplify the gem code a bit, so instead of serializing `Time` objects we could [work with numbers](https://github.com/plataformatec/devise/pull/2954).

So, when updating your application to use the `:hybrid` serializer, don't forget to do a double check of whatever kind of data the app stores in your users cookies and look for possible backwards incompatibility. And if you want to take a closer look on how this was implemented, be sure to check the related issues and pull requests on the Rails repo: [#12881](https://github.com/rails/rails/issues/12881), [#13692](https://github.com/rails/rails/pull/13692) and [#13945](https://github.com/rails/rails/pull/13945).

### Keeping up to date with the latest Rails changes

Following the activity on the Rails repository over GitHub helped a lot to understand better these features and the rationale behind their implementations, but going through all the commits and discussions on Issues and Pull Requests would demand a lot of your time. If you want some of the inside scoop but don't have that much time to go through the Rails activity over the week, [Godfrey Chan](https://twitter.com/chancancode) has put up a weekly digest about Rails named [This Week in Rails](http://rails-weekly.goodbits.io/). I suggest that you subscribe to the list and even check some of the previous editions on the archive page.

### Try it yourself!

Take some time and upgrade one of your Rails 4 apps and try out some of the new features! I bet that some of them will help you improve your codebase or make your coworkers life a bit easier, and we are eager to hear from your experience with the 4.1 release.

> This post was originally published at
> http://blog.plataformatec.com.br/2014/04/3-features-from-rails-4-1-that-im-excited-about/
