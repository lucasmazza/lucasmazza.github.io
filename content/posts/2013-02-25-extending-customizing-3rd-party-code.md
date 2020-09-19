---
date: "2013-02-25"
summary: "Thoughts on dealing with code dependencies"
title: Extending and customizing 3rd party code
---

We have a gem available for every kind of feature or scenario we might face in our applications and that may help us focus our development time on things that are more important to our applications. But, every now and then, these packaged solutions aren't exactly what we need, and some sort of customization needs to be done on top of that - a different authentication strategy, new ways to query for data and several different things that our business rules might require.

So, we jump on top of the existing code to bend it to our needs but sometimes things can go south and we end up in a mess of hacks, unstable code and bad experiences. After some time, we started to develop a few guidelines of our own to avoid the mistakes of the past and look forward to write better applications. These are some of the ideas that I follow to avoid complications when dealing with 3rd party code:

## Don't fear the source

The source code and its documentation are your best friends on this. Having a local clone of a dependency repository lets you `ack`/`grep` it inside out to see how the code is structured to identify the good and bad parts to mess with. You can test your changes against its test suite to see if you might break something or not and that's already one step closer to contribute back to the project.

## Respect method visibility

Method visibility is an important tool to ensure that you aren't messing with the wrong pieces of code from a gem. Public and protected methods are meant to be overriden when necessary, but private ones aren't. They are usually doing the work that you don't want the trouble to do it yourself, and maybe that's why you are using the dependency after all.

For example, `ActiveRecord` adds a lot of private methods to handle the persistence of your models that you shouldn't mess with, but the public API is stable enough for you to use it for whatever you need.

## Monkey patch at your own peril

Ruby lets you monkey patch everything but that doesn't mean you should. While this might make a lot of sense for libraries that extend the Ruby stdlib (like `ActiveSupport`), monkey patching someone else constant might bite you back later. Overusing monkey patches might be a serious block when updating your application to newer versions of a big dependency of your project (for example, Rails).

When you monkey patch, you are usually messing with a very internal piece of a component that might be far from it's public API. So, you can't predict how that class or module will behave when a new version is released or what other parts of the code are using that internal API. Classes get renamed and refactored everyday, and it's hard to ensure your patches will keep up with those changes.

## Composition (and inheritance) as extension mechanisms

A lot of gems provide a series of configuration options that you can drop in an initializer and get the behavior you need, or maybe a specific configuration might be missing. You might feel the urge to send a pull request adding a new configuration to the project, but hold that idea for a second. Can't you do it by overriding a method or using a custom component of your own?

Inheritance and composition can be a better choice for a lot of customizations since they are easier to test and to isolate the effects on your application. While a configuration setting is global and affects your entire application, an isolated change will have a much smaller impact on your code.

Take for instance the `to_param` and `to_partial_path` methods from `ActiveModel`. You can override them in your models to change how your views will interact with them, and that goes in a per model basis, since you usually won't do that for your entire application. Imagine if you need to change a configuration instead overriding a method: You would have to do something weird like this:

```ruby
# A regular configuration inside an initializer
config.action_view.parameterize_method = :slug

# But what if I need a per model configuration? Well, use a Hash!
config.action_view.parameterize_methods = { post: :slug, user: :id }
```

While just overriding the `to_param` method in your `Post` model is a lot easier than this.

Another example of composition I came across recently was the `tokenizer` option on the `LengthValidator`. Given that you have a description column in your database that accepts HTML tags like `strong` and `em`, and you want to validate the length of the text, but not the HTML, you can provide an object that responds to `call` and strips away the HTML from the string, so the validation will be executed against the raw text instead of the whole HTML of it.

```ruby
class MyOwnTokenizer
  def call(text)
    # do whatever you need with `text`.
  end
end

# on your model…
validates :description, :length { tokenizer: MyOwnTokenizer.new }
```

## Your code, your problem

Remember to test your changes. Once you change a default behavior or tweak some specific configuration that might have side effects on other parts of your application, your test coverage will help ensure that this behavior won't break once you update a dependency on your project.

You usually shouldn't worry about testing library defaults (like testing the validations on your models that you configured with `ActiveModel` validation methods), but once you customize something, that piece of code is your responsibility.

So, if you added your own `tokenizer` use along with a `LengthValidator` on your application, be sure to write at least an unit test for it to ensure that it works as expected.

## Contribute back

Sometimes you might notice (or need) an improvement to a library that won't change anything on its public API but will make your life easier when extending it. You can't expect that the maintainers will discover every spot that can or might be overriden, so it's important to bring your experience on using it to the table and help others. You can extract a specific behavior to an isolated component, or improve some internal logic so it might be easier to extend it in the future. There's nothing but love for such kind of contribution.

A while ago [this pull request](https://github.com/rails/rails/pull/3636) changed how Rails added the associations proxies to a model that is using `belongs_to` and friends. While it didn't changes a single bit about the public API for the associations, it changed how you can extend them to add your specific behavior.

## Wrapping Up

These steps might not fit everyone’s workflow, but we need to keep in mind that dealing with external dependencies requires a thoughtful approach to avoid the results being harmful to your projects.

And what about you, my fellow developer: how do you approach the need for something more than a gem's default behavior? Jump on our comments thread to discuss more about it.

> This post was originally published at
> http://blog.plataformatec.com.br/2013/02/extending-customizing-3rd-party-code/
