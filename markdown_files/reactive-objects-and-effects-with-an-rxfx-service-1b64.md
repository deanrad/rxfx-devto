---
title: Making Async, Animated Toasts with an RxFx Service
published: true
description: 
tags: RxFx, RxJS, Redux, Async
cover_image: https://images.unsplash.com/photo-1619095762086-66b82f914dcf?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9hc3R8ZW58MHx8MHx8fDA%3D
# published_at: 2023-11-15 21:13 +0000
---
 
## A use case: A list of notifications

One time, I needed to code up a list of Notifications, commonly known as "toasts". These pop up for a user's attention, populated by an API or some event, and can be dismissed by the user. They may look like this:

![notification list with fade](https://d2jksv3bi9fv68.cloudfront.net/rxfx/async-list-fade.gif)


I wanted to build this in pure JS, but use it in React. At first I had an OOP model of it in mind- like this:

```ts
class Notifications<T> {
  private items: T[] = []
  get items(): T[] { }

  push(item: T){ }
  remove(item: T){ }
}
```

I wondered - could I use an object like this, in React, in such a way that whenever an item is added, the UI always displays the current `items`? It seemed this object model wasn't enough to support a fully reactive list. I didn't want to build this out of React state - I wanted my items in pure JS, so any file that wanted a real-time view of them could simply import and use them. I did not want to worry about Context, or ReactTransitionGroup, or any other view-layer-specific issues, just code in pure JS!

I also wondered how to implement them with fade-in/fade-out, since it's definitely smoother and less confusing with a transition. 

I first tried to write an API like this, wrapping a hook around our object:

```ts
const notifications = new Notifications<string>;
notifications.push('Svelte')

function Notifications() {
  const items = useObject(notifications, 'items')
  const addNew = () => notifications.push('RxFx')

  return <ol onClick={addNew}> 
    { items.map(item => (<li>{ item }</li>)) }
  </ol>
}
```

I tried several times to implement this `useObject` hook, including polling `items`, but I was never happy with it. Particularly since it didn't address animation, and looked bad without it.

![notification list with no fade](https://d2jksv3bi9fv68.cloudfront.net/rxfx/async-list-no-fade.gif)

![notification list with fade](https://d2jksv3bi9fv68.cloudfront.net/rxfx/async-list-fade.gif)

Then I found an object called a Service, from the `@rxfx/service` package. With a Service, I could have what I wanted, even queued animations! I only had to change the API from the `useObject` hook by a little bit:

```ts
const notifications = new createAsyncListService<string>();
notifications.request({ method: 'push', item: 'Svelte'})

function Notifications() {
  const { state: { items }} = useService(notifications)
  const addNew = () => {
    notifications.request({ method: 'push', item: 'RxFx'})
  }

  return <ol onClick={addNew}> 
    { items.map(item => (<li>{ item }</li>)) }
  </ol>
}
```

Instead of directly calling methods, I send objects with the method name into the service via its `request()` method. I invoke `useService` with a service you'll see defined shortly. Then I extract the state from the return value of `useService`, and pluck of its `items` field.

To ensure it was reactive, I wrote the `addNew` click handler to add an object on the fly. And did it update reactively? It did! Now, I had the reactive, async, animating list of my dreams!

And so I thought I'd share how you can build this functionality in just a few lines of code with an RxFx service, ending up with framework free code you can use in any view layer from ReactNative to Angular to Svelte.

### Defining the Service

The first thing to understand about an async list vs. an immediate synchronous list, is that items can be in a state of entering or leaving, as well as fully present. So the state model can not simply be a list of `items` as in the OOP model.

There are at least two ways a service could represent this state.

Option 1 is that the state could contain a value ranging from 0 to 100, updated on every animation frame, representing how fully in the list the item was. So, for an appearing item in the list:

```js
items: [
  {
    value: "RxFx"
    percentComplete: 95
  },
]
```

`percentComplete` could be used to update DOM properties like `opacity`, or `height`. But this approach fails to make use of CSS' power to perform animations with just a class name. And it's also not clear whether the item is coming or going.

Option 2 might be to model our state with `items`, but also with `entering` and `leaving`. Imagine we already had `'Svelte'` in the list, and pushed `'RxFx'`. The state would resemble this, until 'RxFx' is done animating in.

```ts
{
  items: ['Svelte', 'RxFx'],
  entering: ['RxFx'],
  leaving: []
}
```

This is the state model RxFx' `createAsyncListService` supplies. Here's all we have to do to use it. We define the service like this:

```ts
import { createAsyncListService } from "@rxfx/service";

const PER_ITEM_DELAY = 250;
const notifications = createAsyncListService<string>(
  "list/notifications",
  PER_ITEM_DELAY
);
```

The (optional) arguments are a name for logging, which we'll see more of later. And a delay in milliseconds for each animation. 

Notice this service definition can and should live outside of any view component, it's just pure JavaScript! Let's see how to make our view layer react to it now.

### Using the Service

Thanks to a utility from the `@rxfx/react` library called `useService`, the state of the service can be easily brought into the React view. This gives us arrays `items`, and `entering`, and we only need to check if an item is in `entering`, to assign a CSS class to it to fade it in. The component using the service looks like this:

```ts
function List() {
  const {
    state: { items, entering },
  } = useService(notifications);

  const addNew = () => {
    notifications.request({ method: 'push', item: 'RxFx'})
  }

  return <ol onClick={addNew}> 
    { items.map((item) => {
        const isEntering = entering.includes(item);
        const className = isEntering ? "item-entering" : "";

        return <li className={className}>{item}</li>;
      });
    }
  </ol>
}
```

You are easily able to test that calling `addNew` adds an item to the service state, and React picks up on it right away. If you wanted to see every change of the service state, you could also send it to the console on every change with this:

```ts
notifications.state.subscribe(console.log)
```

And if you wanted to see every lifecycle event of the service - you can use the fact that it's a listener on an RxFx event bus, and simply log all event bus events to the console:

```ts
import { defaultBus } from '@rxfx/service'

defaultBus.spy(({ type, payload }) => console.log(type, payload))
```

This makes debugging a breeze. Now, to finish things up, we just need some CSS to enable the fade, and voila, we're animating!

```css
@keyframes fadeIn {
  0% { opacity: 0;  }
  100% { opacity: 1;  }
}

.item-entering {
  animation: fadeIn var(--per-item-delay);
}
```

A finishing touch is to send the same `DELAY` we used in JavaScript into CSS, so the CSS animation and the service' delay are the same:

```ts
document
  .querySelector("#root")
  .style.setProperty("--per-item-delay", (PER_ITEM_DELAY / 1000) + 's');
```

(Thanks to David Khourshid of Stately AI for introducing me to CSS variables)

Now, see the [CodeSandbox](https://codesandbox.io/p/sandbox/rxfx-asynclist-hdtsv5) for the working version.

### Use `@rxfx/service` for all the things!

It turns out, this `@rxfx/service` container is useful for any async effect, from animation to AJAX. And it has a standard API: `.request()`, `.state.value`, and `.cancelCurrent()`, so you learn it once, and use it for many use cases. Even better, this code is directly usable in Svelte, or Angular or Vue, since it is pure JS/TS code with no view-layer dependencies!

It's built on RxJS, and in other articles I'll show you how other async situations can be handled easily by wrapping an effect in an `@rxfx/service`.

Happy Notifying!

Please star [@rxfx/service on GitHub](https://github.com/deanrad/rxfx/tree/main/service)!

### Appendix: Integrating with Redux

Many times, the need for animation comes up after a basic non-animated solution is in place. This was the case for these notifications. The items were in a Redux store, a `dispatch` was used to put an item into the store, and a `useSelector` hook brought the items to the page. After we add the RxFx service to handle transitions - will we need to keep Redux?

In this app, in this particular case, we want to keep Redux informed of our list of notifications. We'll have the benefit of the Redux ecosystem, like Redux-Persist, to save and load the store to localStorage. 

So, we'll use the service for its animation ability, and Redux for persistence of state.

####  Inside a custom hook, make the service an intermediary

Initially the Notifications component looked like this:

```ts
function Notifications() {
  const { items, addNew, dismiss } = useNotifications();
  /* render items */
}
```

A custom hook `useNotifications` defined the API to notifications - you can retrieve `items`, or `addNew` or `dismiss`, and these were implemented by a selector, and sending dispatches.

 We can keep this API - but internally we want to make the service an intermediary.

- Instead of dispatching, we'll make `request()` calls to the service
- The `items` of our service are used to populate Redux
- `items` can still come from Redux
- We can get a class name for an item, based on the state of the service.

We'll add a `getClassName(item)` to the hook's return value, then get to work inside:

#### Changing the custom hook

Inside the hook, `push` and `remove` performed dispatches, and `items` populated by a selector.

Instead, now we'll change the dispatching functions to make `request()` of our service. This ensures our service is in charge of all changes to `items`. 

Next, we need to sync these items to Redux as they change. We'll use the power of RxJS to ensure that we have an Observable of only changes of `items`. This enables us to keep Redux free of any information like what is entering and leaving, and focus only on what should persist across sessions.

The finished useNotifications hook looks like this:

```ts
import { map, distinctUntilChanged } from 'rxjs'
import { store } from './store'
import { notifications } from './services/notifications'

// Sync to Redux
notifications.state.pipe(
  map(state => state.items),
  distinctUntilChanged()
).subscribe(items => store.dispatch(setItems(items)))

export const useNotifications() {
  const { state: { items, entering, leaving } } = useService(notifications);

  function getClassName(item) {
    /*  based on whether entering/leaving */
  }

  // Make changes first to our service
  function addNew(item) {
    notifications.request({ method: "push", item })
  }
  function dismiss(item) {
    notifications.request({ method: "remove", item })
  }

  return { items, addNew, dismiss, getClassName }
}
```

With that, we now have the service as our source of truth for the state of the UI, and Redux is a persistence layer, with all the benefits of its DevTools and persistence layer. 

![notification list with Redux](https://d2jksv3bi9fv68.cloudfront.net/rxfx/async-list-redux.gif)



So, that's how we integrate. We let Redux do persistence, and let dynamic effects and animations live in a service, which is not persisted. A service will help you keep state fields like `loading` out of your stores. That's right - you don't need to track `loading` if you have a service! If you want to know whether the animation is running, you can pluck off the `isActive` field from the `useService` return value.