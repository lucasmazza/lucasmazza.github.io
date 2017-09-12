---
layout: post
title: Flushing content blocks with Rails 4
origin: http://blog.plataformatec.com.br/2012/07/flushing-content-blocks-with-rails-4/
---

Besides the big and shiny features that Rails 4 holds, there's a lot of small improvements on several other sections of the Rails framework - helpers, core extensions, app configurations and more - that might not even hit the Changelogs but will somehow make our lifes easier in the future. One of these hidden gems that I've found recently is an improvement on the `content_for` helper to flush and replace previous chunks of HTML with new ones.

### The `content_for` that we are used to

The `content_for` method is an old friend of every Rails developer, and it's a pretty simple and flexible helper. You can store a chunk of HTML from a String or a block, and grab it somewhere else in your views or `yield` it directly into your templates. It's a pretty handy trick to move data from your views into your layouts, like page titles, custom meta tags or specific `script` tags that your page needs to include.

```erb
# On your 'application.html.erb' layout, inside the '<head>' tag.
<%= yield :metatags %>

# Then, into a specific view
<% content_for :metatags do %>
  <meta property="og:image" content="http://example.com/image.jpg" />
<% end %>
```

Multiple calls of the `content_for` helper using the same identifier will concatenate them and output them together when you read it back on your views, as:

```erb
<% content_for :example, "This will be rendered" %>
<% content_for :example do %>
  <h1>This will be rendered too!</h1>
<% end %>
```

On some scenarios this behavior might not be desired, and with Rails 4 you can flush out the stored pieces of an identifier and replace it instead of adding more content to it: using the `flush: true` option. The [first implementation](https://github.com/rails/rails/pull/4226) used an extra `true` argument, but [we changed](https://github.com/rails/rails/pull/7150) to use a Hash instead, so the `flush` key can express better the behavior we're expecting.

```erb
<% content_for :example, "This will be rendered" %>
<% content_for :example, flush: true do %>
  <h1>But this will override everything on the ':example' block.</h1>
<% end %>
```

### The gallery situation

I've stumbled upon this on a recent project, where we had a somewhat classic scenario: a partial named `_gallery`, responsible for rendering the piece of HTML to display a gallery of images that also supplies a `content_for` block with a `script` tag to include the required libraries to put the gallery to work.

```erb
<section class="gallery">
  <!-- a truckload of HTML tags -->
</section>
<% content_for :scripts, javascript_include_tag('gallery') %>
```

It works like a charm. But with an updated requirement we had the case where multiple galleries could be present on the same page, rendering the `_gallery` partial several times. The required HTML would be present, but the `gallery.js` script would be included multiple times into the rendered page. Instead of working this out using instance variables to check that the partial was rendered at least once, we could let Rails do all the hard work for us, using the `flush` option when including the `gallery.js` script.

```erb
<section class="gallery">
  <!-- a truckload of HTML tags -->
</section>
<% # We can render this partial several times and this script will be included just once %>
<% content_for :scripts, javascript_include_tag('gallery'), flush: true %>
```

### Back to the present: Rails 3.2

Well, while this seems to be a perfect solution to my problem, this feature isn't available on Rails 3.2 or on the `3-2-stable` branch - it's only available on the `master` branch that will be released with Rails 4. But, backporting this feature into a 3.x application is pretty simple, using a helper of your own.

```ruby
def single_content_for(name, content = nil, &block)
  @view_flow.set(name, ActiveSupport::SafeBuffer.new)
  content_for(name, content, &block)
end
```

After some source diving into the ActionPack source code we're done - it just needs to replace any present content with a brand new `SafeBuffer` instance before storing the piece of HTML.

What do you think about this little addition to Rails 4? Can you think of a similar problem that could be solved with this instead of a custom hack?
