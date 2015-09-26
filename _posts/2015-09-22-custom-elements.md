---
layout: post
title: Sane usage of Custom Elements
---

Web Components have been an controversial subject that surfaced in the Front end
world over the last years that I'm still pretty skeptical about its usage on
existing and greenfield projects due the lack of good examples on how they
can be rolled out to production, but I believe there is a way to get started with them
without buying in all the hype.

The whole [Web Components spec](https://github.com/w3c/webcomponents) holds four
different standards, but the [Custom Elements](http://w3c.github.io/webcomponents/spec/custom/)
has some interesting features that can be useful to a lot of common tasks
from regular projects.

## The life of a JavaScript plugin

I'm currently using `data-*` attributes to annotate DOM elements that should
receive event handlers through `delegate` binds or be accessed directly
to add the behavior our JavaScript wants when we can't simply
delegate the event handlers through the document element.

Let's say we want to toggle the `disabled` attribute of `button` elements based
on the validation status of inputs placed inside the same `form` as the `button`
element.

A trivial implementation could be as simple as the following:

```js
function bindDisabledButton() {
  $('[data-disabled-button]').each(function() {
    let button = $(this),
        form = button.parents('form'),
        input = form.find('input:not(:hidden), select');

    function updateButton() {
      button.prop('disabled', !inputs.get().every(input => input.checkValidity());
    }

    inputs.on('keyup change', updateButton);
    updateButton();
  });
}

$(bindDisabledButton);
```
_We could `delegate` a `change` event on all inputs with validation and traverse
the DOM to grab their parent `form`, sibling inputs and `button`, but let's assume
the given code as the first implementation of this for this post._

The code would Probably Work™, and could be refactored to use different abstractions,
be executed only when there are elements in the page that haven't been selected
before and whatnot, but the most annoying part about this kind of implementation
(which is similar to 67.45% of JavaScript libraries and jQuery plugins we find
in the interwebs) is the fact that we manually initialize these plugins and components
by ourselves, and we have been doing this for a long time without worrying too
much about this.

The manual initialization isn't an issue with plain HTML that is fetched and
rendered in the browser, but it can become a huge pain in the ass when we sprinkle
more and more JavaScript on it and do things like Turbolinks/Pjax transitions or
plain DOM updates through XHR requests or client side logic: since we are responsible
for initialize this element, we must remember this every time the DOM changes.

```js
$(document).on('ready page:load pjax:complete omg:wtf:bbq', bindDisabledButton);
```

This can easily escalate into more code to manually handle the life and death of
our enhanced elements - we need to care about when they need to be created in
our application and sometimes even when they need to be removed, as we might need to
cleanup event handlers or related elements that aren't properly isolated with the
node that will be removed from the page.

## If you want custom elements, then you should probably try writing Custom Elements.

The first thing that got my attention when going through the Custom Elements spec was
the [lifecycle callbacks](http://w3c.github.io/webcomponents/spec/custom/#types-of-callbacks)
that are available for developers to implement on their elements: we know when
the element is added or removed from the DOM and when its attributes are changed
by outside collaborators, and those callbacks can be extremely handy for pushing
all this lifecycle logic that can leak through our applications into self contained
elements.

For instance, this is how the same `[data-disabled-button]` plugin can be
re-implemented as a Custom Element:

```js
// app/assets/javascripts/elements/disabled-button.es6
const slice = Array.prototype.slice;

// Public: Custom `button` element that is enabled and disabled based on the
// validity state of the inputs inside the same 'form' element as the button.
//
// Example
//
//  <form>
//    <input name='name' required />
//    <button is='disabled-button'>Click me after you fill in the input</button>
//  </form>
const DisabledButton = {
  attachedCallback() {
    this._form = this._findForm(this);
    this._updateCallback = this._update.bind(this);
    this._form.addEventListener('keyup', this._updateCallback, false);
    this._form.addEventListener('change', this._updateCallback, false);
    this._updateCallback();
  },

  detachedCallback() {
    this._form.removeEventListener('keyup', this._updateCallback);
    this._form.removeEventListener('change', this._updateCallback);
  },

  _update() {
    let inputs = this._findInputs(this._form);

    if (inputs.every(input => input.checkValidity())) {
      this.removeAttribute('disabled');
    } else {
      this.setAttribute('disabled', true);
    }
  },

  _findInputs(form) {
    let inputs = slice.call(form.querySelectorAll('input, select'), 0);

    return inputs.filter(input => input.type !== 'hidden');
  },

  _findForm(element) {
    if (element.nodeName === 'FORM') {
      return element;
    } else {
      return this._findForm(element.parentElement);
    }
  }
};

const DisabledButtonPrototype = Object.create(HTMLButtonElement.prototype);
Object.keys(DisabledButton).forEach(prop => {
  DisabledButtonPrototype[prop] = DisabledButton[prop];
});

window.DisabledButtonElement = document.registerElement('disabled-button', {
  prototype: DisabledButtonPrototype,
  'extends': 'button'
});
```

Now, every time the browser adds a `disabled-button` element or a `button` with
`is='disabled-button'`, it will be responsible for adding
the necessary behavior to our button to be disabled when its parent form isn't
valid or not, regardless of how the element got there in the first place - a
from an page transition done through ajax or a script executed in the browser's
console that appended an element to the page.

In order to just enhance existing elements rather than go full JSF on my markup,
I'm sticking with [type extensions](http://w3c.github.io/webcomponents/spec/custom/#type-extension-example) -
the `is="disabled-button"` instead of having a `<disabled-button></disabled-button>` tag
in the markup - rather than implementing custom tags, avoiding `template` elements,
Shadow DOM and HTML imports in order to keep my markup as simple as it can be with
the benefits of better abstractions on the JavaScript code.

In the end, the required markup change is to replace any `data-*` attribute that
is used to hook the JavaScript code with a matching `is="component-name"` for
an equivalent Custom Element implementation.

## Similar use cases

Besides our exceptional `button` that its a bit more clever than other plain buttons,
there are several patterns that I can think of that can benefit from a Custom Element
implementation that I've encountered in projects in the past and might experiment
by implementing them as type extensions in the future:

* alert messages rendered using Rails `flash.notice` and `flash.alert` that should
be removed from the interface after a short delay: a `setTimeout` can be enqueued
right after the element is attached for it to be removed.
* Bootstrap [Tooltips](http://getbootstrap.com/javascript/#tooltips) or [Popovers](http://getbootstrap.com/javascript/#popovers),
plugins that need to initialized manually, and you can have a shortcut for that
by hooking it through a Custom Element. Same thing could be done to [Chosen](https://harvesthq.github.io/chosen/)
or any other `select` replacement plugin you might need to use.
* Elements that should change based on events or the state of other related elements,
like our `disabled-button` example.
* Probably any other widget you might have to use.

Some common use cases that already have been implemented, GitHub's [`time-elements`](https://github.com/github/time-elements)
and [`include-fragment-element`](https://github.com/github/include-fragment-element) are
the first ones that come to mind.
