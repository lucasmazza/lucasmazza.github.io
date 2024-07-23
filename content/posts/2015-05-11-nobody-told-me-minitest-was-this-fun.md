---
date: "2015-05-11"
description: Where the author kinda regrets getting too attached to RSpec
title: Nobody told me Minitest was this fun
---

Ever since I started working with Ruby I have been using RSpec to test my apps and gems without giving minitest much thought. Recently I started a new non-Rails project and decided to give Minitest a try just for the fun of it. Migrating from one tool to another was refreshingly fun due to the fact that that Minitest and RSpec aren't so different from each other - they both have the basic features that we need in a testing library to get things running, and if you are used to testing your code moving from one to the other might not be so scary as you might expect.

## Translating testing idioms

One of the first things that I looked into was how some of common RSpec idioms should be implemented when using Minitest.

The classic ones are fairly simple: the `before` and `after` lifecycle hooks should be equivalent as implementing the `setup` and `teardown` methods in your test class, and you have control over the inheritance chain by selecting when/where to call `super`. `let` and `subject` can be achieved with methods that use memoization to cache their values.

```ruby
# A classic RSpec subject/before usage.
require 'spec_helper'

describe Post do
  subject(:post) { Post.new }
  before { post.publish! }
end

# The equivalent with Minitest & Ruby.
require 'test_helper'

class PostTest < Minitest::Test
  def post
    @post ||= Post.new
  end

  def setup
    post.publish!
  end
end
```


RSpec shared examples, where you can reuse a set of examples across your test suite, can be replicated by simply writing your tests in modules and depend on accessor methods to inject any objects your tests might depend on

```ruby
# What used to be a shared_examples 'Serialization' can be a module...
module SerializationTests
  def serializer
    raise NotImplementedError
  end
end

# And your test cases can include that module to copy the tests
class JSONSerializationTest < Minitest::Test
  include SerializationTests

  def serializer
    JSON
  end
end

class MarshalSerializationTest < Minitest::Test
  include SerializationTests

  def serializer
    Marshal
  end
end
```

Mocks and stubs, which are incredibly flexible when using RSpec, are available in Minitest without any third party gem:

```ruby
class PostTest < Minitest::Test
  def test_notifies_on_publish
    notifier = Minitest::Mock.new
    notifier.expect :notify!, true

    post.publish!(notifier: notifier)
    notifier.verify
  end

  def test_does_not_notifies_on_republish
    notifier = Minitest::Mock.new

    post.stub :published?, true do
      post.publish!(notifier: notifier)
      notifier.verify
    end
  end
end
```

If you want a different or more fluent API, you can use something like [`mocha`](https://github.com/freerange/mocha) to improve your mocks, or even bring RSpec API into the mix - with some manual setup you can pick the [`rspec-mocks`](https://github.com/rspec/rspec-mocks) gem and define your mocks and stubs just like when using the complete RSpec tooling:

```ruby
require 'rspec/mocks'

class PostTest < Minitest::Test
  include ::RSpec::Mocks::ExampleMethods

  def before_setup
    ::RSpec::Mocks.setup
    super
  end

  def after_teardown
    super
    ::RSpec::Mocks.verify
  ensure
    ::RSpec::Mocks.teardown
  end

  def test_notifies_on_publish
    notifier = double('A notifier')
    expect(notifier).to receive(:notify!)

    post.publish!(notifier: notifier)
  end
end
```

## Know your assertions

One of my favorite parts of RSpec is how expressive the assertions can be - from the Ruby code that we have to write to the errors that the test runner will emit when something is broken. One might think that we can have something similar when working with Minitest, but that is not exactly true.

Let's say we want to test a method like `Post#active?`. Using a dynamic matcher from RSpec like `expect(post).to be_active` will produce a very straightforward message when that assertion fails: `expected #<Post: …>.active? to return false, got true`.

With Minitest, we might be tempted to write an assertion like `assert !post.active?`, but then the failure message wouldn't be much useful for us: `Failed assertion, no message given`. But fear not, because for something like this we have the `assert_predicate` and `refute_predicate` assertions, and they can produce very straightforward failure messages like `Expected #<Post:…> to not be active?.`, which clearly explains what went wrong with our tests.

Besides the predicate assertions, we have a few other assertion methods that can useful instead of playing with the plain `assert` method: `assert_includes`, `assert_same`, `assert_operator` and so on - and every one of those has a `refute_` counterpart for negative assertions.

It's always a matter of checking the documentation - The [`Minitest::Assertions` module](http://docs.seattlerb.org/minitest/Minitest/Assertions.html) explains all the default assertions that you use with Minitest.

And in the case where you want to write a new assertion, you can always mimic how the built-in assertions are written to write your own:

```ruby
module ActiveModelAssertions
  def assert_valid(model, msg = nil)
    msg = message(msg) { "Expected #{model} to be valid, but got errors: #{errors}." }
    valid = model.valid?
    errors = model.errors.full_messages.join(', ')
    assert valid, msg
  end
end

class PostTest < Minitest::Test
  include ActiveModelAssertions

  def test_post_validations
    post = Post.new(title: 'The Post')
    assert_valid post
  end
end
```

## Active Support goodies

If you want some extra sugar in your tests, you can bring some of extensions that Active Support has for Minitest that are available when working with Rails - a more declarative API, some extra assertions, time traveling and anything else that Rails might bring to the table.

```ruby
require 'active_support'
require 'active_support/test_case'
require 'minitest/autorun'

ActiveSupport.test_order = :random

class PostTest < ActiveSupport::TestCase
  # setup' and teardown' can be blocks,
  # like RSpec before' and after'.
  setup do
    @post = Post.new
  end

  # 'test' is a declarative way to define
  # test methods.
  test 'deactivating a post' do
    @post.deactivate!
    refute_predicate @post, :active?
  end
end
```

## Tweaking the toolchain

Minitest simplicity might not be so great when it comes to the default spec runner and reporter, which lack some of my favorite parts of RSpec - the verbose and colored output, the handful of command line flags or the report on failures that get the command to run a single failure test. But on the good side, even though Minitest does not ship with some of those features by default, there are a great number of gems that can help our test suite to be more verbose and friendly whenever we need to fix a failing test.

For instance, with the [minitest-reporters](https://rubygems.org/gems/minitest-reporters) gem you can bring some color to your tests output or make it compatible with RubyMine and TeamCity. You can use reporters that are compatible with JUnit or RubyMine if that's your thing. You can use [minitest-fail-fast](https://rubygems.org/gems/minitest-fail-fast) to bring the `--fail-fast` flag from RSpec and exit your test suite as soon as a test fails. Or you can track down object allocations in your tests using [minitest-gcstats](https://rubygems.org/gems/minitest-gcstats).

If any of those gems aren't exactly the setup you want it, you can always mix it up a bit and [roll your own gem](https://rubygems.org/gems/minitest-utils) with reporters, helpers and improvements that are suitable for the way you write your tests.

Thanks to this extensibility, Rails 5 will bring some improvements to how you run the tests in your app to improve the overall testing experience with Rails (be sure to check [this Pull Request](https://github.com/rails/rails/pull/19216) and the improvements from other Pull Requests).

> This post was originally published at
> http://blog.plataformatec.com.br/2015/05/nobody-told-me-minitest-was-this-fun/
