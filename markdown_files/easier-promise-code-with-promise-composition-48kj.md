---
title: Easier Promise Code with Promise Composition
published: true
cover_image: https://images.unsplash.com/photo-1543839482-a95d35fc5a77?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=975&q=80
description: Compose within Promises, and don't create additional sources of truth, whenever possible.
tags: async, Promises, callbacks, JavaScript
---
_TL;DR Compose within Promises, and don't create additional sources of truth, whenever possible._

As a solution to Callback Hell, Promises were my new hotness for a while. I gave talks on them - while juggling, even, because— concurrency 🤣 ([Youtube](https://www.youtube.com/watch?v=dyz3tAI6GaI&t=37)).

I had a situation recently where I had two Promises. As we know with async, any order of completion that is possible will happen eventually - and so I had to write code that ran only if they completed in a certain order. Speficially, if `hasClosed` fulfilled before `hasEnded`.

```js
const hasClosed = new Promise(resolve => req.on('close', event => resolve('closed')));
const hasEnded = new Promise(resolve => req.on('end', event => resolve('ended')));
```

Assuming the event object had a `type` property of "close" or "end", to run code only in a close-before-end circumstance is:

```js
Promise.race([ hasClosed, hasEnded ]).then(firstToResolve => {
  if (firstToResolve === 'closed') {
    // handle early shutdown
  }
})
```

But, since Promises are relatively new to many developers still, their existing experience with and preference for local variables may have them 'storing' the result of a Promise in a local variable outside the Promise chain. One thought might be to handle the closed-before-end case like the following:

```js
let clientEnded = false;
​
  req.on("end", () => {
    clientEnded = true;
  });
​
  const clientClosed = new Promise((resolve) =>
    req.on("close", () => {
      if (!clientEnded) {
        resolve();
      }
    })
  );
  
  clientClosed.then(/* handle early shutdown */);
```

There's a clear increase in code. And more concerning to comprehensibility- the depth of the code nesting got way deeper. But if it's so much harder to read, and write, why is this the way many good developers would write this code today?

I think it's because the basic constructs of JavaScript, those things we depend on like `if` statements - _don't work with Promises_! And they don't have to - JavaScript was made in 1995, and didn't get Promises until 2015. So you have to play by post-2015 JavaScript rules to use Promises effectively.

_"And why is the code bloat a problem - tests are showing its passing, and it's not inefficient at runtime, maybe even a tick or two faster."_

It's a problem of maintainability. Two Promises, to be raced using the local variable way, exploded the code from 4 to 12 lines (counting non-white-space only). Imagine when you have to combine a 3rd variable - what's going to cause the most pain: the time it takes you to add it, its impact on future changability, or the challenging of hunting down edge cases when the events can occur in `3! = 3*2*1 = 6` ways now, and your local variables get updated when you dont expect.

Compose within Promises, and don't create additional sources of truth, whenever possible.

## Conclusion

Promises are still valuable tools, still a huge improvement over callbacks, but composing directly with them, or with [Observables, a Superset of Promises](https://dev.to/deanius/observably-better-than-promises-4pmf) will lead to cleaner code that is grows beautifully, and has fewer corners for edge cases to hide.
