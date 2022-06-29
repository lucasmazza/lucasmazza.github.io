---
date: "2016-02-29"
description: Bringing design ideas from Elixir projects into Ruby
title: Experimenting with explicit contracts with Ruby
---

A few months back, José Valim [started a conversation](http://blog.plataformatec.com.br/2015/10/mocks-and-explicit-contracts/) on overusing mocks and coupling between components. That made me interested on revisiting how I design my code and it has changed my approach to testing a bit in one of our current Ruby projects.

## A Tale of Two Adapters

Back in November, I worked on integrating a payment gateway from scratch into one of our client projects, through a gem that abstracts the HTTP interface of this external service. On this payment flow we had to first authorize the payment data with the gateway, which would return the transaction data for us to capture the payment in the background and go on with the business logic that depended on a successful payment flow.

If you ever worked on something similar, you probably remember a few rough edges that we need to deal in cases like this: how to test the integration with the right credit card numbers for each possible outcome? Do we have a sandbox available for development and test environments? How can we control the performance and stability costs that this external dependency might bring to our application, and the coupling between the code that supports this core feature and this gem?

Our attempt to handle the coupling and maintenance cost of this dependency was to push all the integration code behind an abstraction layer responsible for dealing with this payment flow logic under a `Payments` namespace.

```ruby
require 'gateway-xyz-gem'

module Payments
  class GatewayXYZ
    def authorize(order, credit_card)
      # Uses the `Order` details and the user `CreditCard` data to authorize
      # a new transaction on the XYZ Payment Gateway through the
      # `gateway-xyz-gem` classes.
    end

    def capture(payment_id)
      # Capture the payment information for a transaction that was previously
      # authorized.
    end
  end
end
```

Somewhere down our `orders#create` action (but not directly in the controller method itself) we call `GatewayXYZ#authorize` with the `order` record and a `credit_card` value object and our integration with the external service is done.

We might have a nice set of well-defined methods on the `GatewayXYZ` class but our job on these abstractions is far from done. We might unit test it with something like [WebMock](https://github.com/bblimke/webmock) or [VCR](https://github.com/vcr/vcr) to handle the external service dependency, but every other piece of our system that interacts with this abstraction will also depend on the external API to work properly - the `OrdersController`, the background job that captures the payment and the `Order` model itself that might trigger the initial `authorize` call. Should we just sprinkle the existing stubs all over our test suite and call it a day?

We added a gateway implementation that mimics the expected behavior of the `GatewayXYZ` (with the same method signatures as the real gateway) and doesn’t depend on external resources. It also has a predefined behavior for specific inputs so we can test different code paths of their collaborators based on the test input.

```ruby
module Payments
  class Memory
    def authorize(order, credit_card)
      if BAD_CREDIT_CARD_NUMBERS.include?(credit_card.number)
        bad_response
      else
        ok_response
      end
    end
  end
end
```

## Dealing with environment specific setups

Now we need to make our `Payments::Memory` the go-to implementation for our test cases that depend on our payment abstractions. There are a few different ways we can do this on a Rails app.

### `Rails.application.config`

We can expose a configuration setting in app that says which implementation it should use, similar to how `Action Mailer` picks the delivery method for your emails or how `Active Job` might have different queue adapters for your background jobs.

```ruby
# config/application.rb
Rails.application.config.x.payment_gateway = Payments::GatewayXYZ

# config/environments/test.rb
Rails.application.config.x.payment_gateway = Payments::Memory

# app/models/order.rb
class Order
  def authorize(credit_card)
    gateway = build_gateway
    gateway.authorize(self, credit_card)
  end

  private

  def build_gateway
    klass = Rails.application.config.x.payment_gateway
    klass.new
  end
end
```

### `Module.mattr_accessor` macro

You can set a class level macro on the classes that depend on a configurable value and change as you want in your code. This approach can be useful if you want to keep the configuration closer to the implementation that relies on it, instead of jumping between app code and configuration code if you want to debug something or be able to change it during runtime.

```ruby
# app/models/order.rb
class Order
  cattr_accessor :payment_gateway do
    Payments::GatewayXYZ
  end

  def authorize(credit_card)
    gateway = payment_gateway.new
    gateway.authorize(self, credit_card)
  end
end

# test/test_helper.rb
Order.payment_gateway = Payments::Memory
```

## Factory method

This approach is useful when you want to hide away how to create an instance of a gateway implementation, so other classes that depend on it can have a way to just ask for a gateway object without worrying on how to create it.

```ruby
# app/models/payments.rb
module Payments
  matt_accessor :gateway do
    Payments::GatewayXYZ
  end

  def build_gateway
    gateway.new
  end

  module_function :build_gateway
end

# test/test_helper.rb
Payments.gateway = Payments::Memory
```

I don’t believe that there is a Single Way to Do It™ this kind of dependency injection, so you should feel free to pick a strategy that suits the interfaces you are building and the coding style of your team - I’m personally a fan of the factory method and the `cattr_accessor` approaches as they feel more detached from the configuration and closer to the application code, although the configuration way feels more aligned with global APIs from 3rd party gems.

## Skipping Hash driven development

Our `GatewayXYZ` and `Memory` implementations have the same methods with the same arguments but there is a second piece of making a uniform API that we need to think about: what those methods should return?

Our `authorize` needs to return more than a `truthy`/`falsy` value, as we need to gather more information about the payment transaction on our end, like the `payment_id` from the transaction, or a reason of why it might have failed (was the credit card denied? There is invalid data in the request), details for logging or instrumentation, etc. And if we think about implementing this API for multiple services (let's say we need a `Payments::PayPal` now, for instance), those services will return this data in different formats that we need to normalize so these differences don't leak to the rest of the system.

One might say that a `Hash` with all this junk would do it, but going that path opens too many doors for inconsistency and bugs as the hash is a weak abstraction that can be mutated anywhere and won't enforce any specific format or requirements on the return values.

For that, we can implement a `Payments::Result` struct/value object to represent the outcome of our `authorize` action, and return it from each gateway implementation in our system, enforcing the interface we want to have.

```ruby
module Payments
  class Result < Struct.new(:payment_id, :errors)
    def ok?
      errors.blank?
    end

    def failed?
      !ok?
    end
  end
end
```

Our `Result` class has the minimal information that our client code needs, and each gateway is responsible for constructing a `Result` from its own data. The `Memory` gateway can do something as straightforward as this:

```ruby
module Payments
  class Memory
    def authorize(order, credit_card)
      Result.new(
        payment_id: SecureRandom.hex,
        errors: SAMPLE_ERRORS[credit_card.number])
    end
  end
end
```

This approach is useful not just for enforcing the interface we want, but also to improve other areas of our code that could use more specific abstractions than a bare `Hash` instance.

## Going forward with contracts and macros

This homemade approach for better contracts between our app and this external service can go a long way, but if you want, you can build strict checks on top of your APIs to ensure that your objects are collaborating as you expect. We haven't tried yet, but the [contracts](https://github.com/egonSchiele/contracts.ruby) gem looks very interesting if you want that kind of type constraints that are lacking on Ruby.

You can even write your own checks by wrapping methods into type checking proxies, as [`refile`](https://github.com/refile/refile) does with its [`Refile::BackendMacros`](https://github.com/refile/refile/blob/v0.6.2/lib/refile/backend_macros.rb) module. When [extended by a backend implementation](https://github.com/refile/refile/blob/v0.6.2/lib/refile/backend/file_system.rb), it provides macros to validate the input for methods like `#upload(uploadable)` or `#delete(id)`, so custom implementations don't need to worry about validating these arguments on their own.

> This post originally published at
> http://blog.plataformatec.com.br/2016/02/experimenting-with-explicit-contracts-with-ruby/
