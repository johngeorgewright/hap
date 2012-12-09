hap
===

Introduction
------------

An extension to the Node.js events.EventEmitter with an important factor, "bubbling".

hap's EventEmitter inherits all methods from Node.js's events.EventEmitter, but has a new method `#fire()`. It works the same as `#emit()` but sets off a chain of events that pass around a facade and bubble up to any `#parent` EventEmitters.

Let's jump in to an example:

```js
var EventEmitter = require('hap').EventEmitter,
    util         = require('util'),
    emitter;

function MyTestEmitter(){
  EventEmitter.apply(this, arguments);
}

util.inherits(MyTestEmitter, EventEmitter);

emitter = new MyTestEmitter();

emitter.on('test event', function(e){
  console.log(e);
});

emitter.fire('test event');
```

The above example is no different to any normal observer pattern... and the facade would be logged to the console. Now let's see the bubbling in action:

```js
var EventEmitter = require('hap').EventEmitter,
    util         = require('util'),
    emitter, parentEmitter;

function MyTestEmitter(){
  EventEmitter.apply(this, arguments);
}

util.inherits(MyTestEmitter, EventEmitter);

parentEmitter  = new MyTestEmitter();
emitter        = new MyTestEmitter();

emitter.setParent(parentEmitter);

emitter.on('test event', function(e){
  console.log('Parent');
});

emitter.on('test event', function(e){
  console.log('Child');
});

parentEmitter.fire('test event');
// => Child
// => Parent
```

In the above example the event seems to start at the child object, even though it was called in the parent. That's very similar to what happens in the DOM for example. First, there is a "capture" event that starts at the target element and then fires within each child. Once it hits the bottom, the event then bubbles up to the top.

Here's a quote from [quirksmode](http://www.quirksmode.org/js/events_order.html):

> ### Event capturing
> 
> When you use event capturing
> 
> ```
>                  | |
>   ---------------| |-----------------
>   | element1     | |                |
>   |   -----------| |-----------     |
>   |   |element2  \ /          |     |
>   |   -------------------------     |
>   |        Event CAPTURING          |
>   -----------------------------------
> ```
> 
> the event handler of element1 fires first, the event handler of element2 fires last.
> 
> ### Event bubbling
> 
> When you use event bubbling
> 
> ```
>                  / \
>   ---------------| |-----------------
>   | element1     | |                |
>   |   -----------| |-----------     |
>   |   |element2  | |          |     |
>   |   -------------------------     |
>   |        Event BUBBLING           |
>   -----------------------------------
> ```
> 
> the event handler of element2 fires first, the event handler of element1 fires last.
> 
> ### W3C model
> 
> W3C has very sensibly decided to take a middle position in this struggle. Any event taking place in the W3C event model is first captured until it reaches the target element and then bubbles up again.
> 
> ```
>                    | |  / \
>   -----------------| |--| |-----------------
>   | element1       | |  | |                |
>   |   -------------| |--| |-----------     |
>   |   |element2    \ /  | |          |     |
>   |   --------------------------------     |
>   |        W3C event model                 |
>   ------------------------------------------
> ```

hap uses the "W3C model". First there is a capturing phase of which you can attach to with the `#before()` method. There the bubbling takes place of which you can listen to with the `#on()` method. And finally, to add some extra power, the event will bubble from bottom to top one more time of which you can listen to with the `#after()` method.

An real life example
--------------------

Here's a an example using an Express.js like framework:

```js
// app.js

var express = require('express'),
    hap     = require('hap'),
    http    = require('http'),
    util    = require('util'),
    app     = express(),
    nav     = require('./nav');

util._extend(app, hap.EventEmitter.prototype);

app.use(nav());

app.on('nav', function(e){
  e.val().push({
    content : 'Item 1',
    id      : 'nav-item-1'
  });
});

app.get('/', function(req, res){
  res.send(emitter.fire('nav'));
  // => <nav><ul><li id="nav-item-1">Item 1</li></ul></nav>
});

http.createServer(app).listen(8080);
```

```js
// nav.js

var express = require('express'),
    hap     = require('hap'),
    Html    = require('tag').Html,
    util    = require('util');

module.exports = function(){
  var app = express();

  util._extend(app, hap.EventEmitter.prototype);

  app.before('nav', function(e){
    e.val([]);
  });

  app.after('nav', function(e){
    var ul  = Html.factory('ul'),
        nav = Html.factory('nav');

    e.val().forEach(function(item){
      var content = item.content,
          li;

      delete item.content;
      li = Html.factory('li', item, content);
      ul.appendChild(li);
    });
      
    nav.appendChild(ul);
    e.val(nav.toHTML());
  });
};
```

Installation
-----------

```sh
npm i hap
```

API
---

### EventEmitter

#### #addChild(emitter)

Adds an emitter as a child to this object.

##### Parameters

- emitter {hap.EventEmitter} The child emitter


#### #after(eventName, fn)

Adds a listener to the final bubling stage.

##### Parameters

- eventName {String} The event to attach to
- fn {Function} Callback function


#### #before(eventName, fn)

Adds a listener to the capturing stage.

##### Parameters

- eventName {String} The event to attach to
- fn {Function} Callback function


#### #bubble(eventName e)

A protected method used to trigger the bubbling sequence.

##### Parameters

- eventName {String} The event to bubble
- e {hap.EventFacade} The event facade


#### #capture(eventName e)

A protected method use to trigger the capturing sequence.

##### Parameters

- eventName {String} The event to start capturing
- e {hap.EventFacade} The event facade


#### #emit(eventName, attrs)

- see events.EventEmitter


#### #fire(eventName, attrs)

Similar to the `#emit()` method but dispatches the capturing/bubbling sequence passing a facade object
and return a modified value.

##### Parameters

- eventName {String} The event to emit
- attrs {Object | EventFacade} A hash of attributes or an event facade


#### #on(eventName, fn)

- see events.EventEmitter


#### #once(eventName, fn)

- see events.EventEmitter


#### #onceAfter(eventName, fn)

Similar to `#once()` but attaches the listener to the final bubbling sequence.

##### Parameters

- eventName {String} The event to emit
- fn {Function} The listener callback


#### #onceBefore(eventName, fn)

Similary to `#once()` but attached the capturing phase.

##### Parameters

- eventName {String} The event to emit
- fn {Function} The listener callback


#### #removeListener(eventName, fn)

- see events.EventEmitter


#### #setParent(emitter)

Adds an emitter as a parent to this object.

##### Parameters

- emitter {hap.EventEmitter} The parent emitter

### EventFacade

#### #val([value])

Sets or gets the current value. This value might be modified by any listener.

##### Parameters

- value {Mixed} A value to set.

