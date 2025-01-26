---
title: How to use 𝗥𝘅𝑓𝑥 for a realistic user-typing simulation.
published: true
description: A little math can simulate user interaction more accurately, with @rxfx/perception.
tags: rxfx, RxJS, statistics
cover_image: https://images.unsplash.com/photo-1634834787429-54f833042098?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80
---

Here we will use a couple of components from the 𝗥𝘅𝑓𝑥 toolkit to write some text into a textarea, much as a user would fill out a form.

If we use a library like `@testing-library/user-event`, we can automate typing into a field with a configurable delay between characters. However, real users don't type this way, they type in spurts, like this:

![Realistic typing](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/93n2mv1kv2yzf0sdox5f.gif)

Filling out a form in a randomized way  will stress-test your form more realistically - some of the time (about 1/6 of the time) your user's consecutive key presses will be half the average duration. Particularly if you are using React controlled inputs, this can reveal stutter in the system that you would not have known about. Also, I find that lorem ipsum text is more pleasurable to see typed with randomized timing than at a uniform rate! But importantly, we don't want total randomness - we want it to hover *around* a certain given amount. 

So let's bring together a few 𝗥𝘅𝑓𝑥 tools together in order to pull this off, we will:

- Use a bus, typed for character events.
- Trigger character events from a source text.
- Create a listener that returns a time-deferred typing from a character event
- Allow the bus to execute and sequence those time-deferred typings
- Randomize the time amounts

In the final step, the code will change only by one line in order to switch to random from not random! Let's dive right in!

[See the CodeSandbox](https://codesandbox.io/s/rxfx-example-poisson-process-typing-hncrl0)

First, we can type the `defaultBus` from `@rxfx/bus`.

```ts
import { defaultBus, Bus } from "@rxfx/bus";
const bus = defaultBus as Bus<string>;
```

Next we'll use a good old-fashioned `for` loop to trigger an event for each character:

```ts
for (let i = 0; i < srcText?.length; i++) {
  bus.trigger(srcText?.charAt(i));
}
```

Building the listener will be tricky - first we know we can't have overlapping character typings - we want them serially. So we will create our listener with `bus.listenQueueing`. What will we return? We could have written any delayed Promise function and that would work, but the 𝗥𝘅𝑓𝑥 utility `after` is designed just for that.

```ts
import { after } from "@rxfx/after";

const typer = bus.listenQueueing(
  () => true, 
  (char) => {
    return after(AVERAGE_DELAY, () => {
      console.write(char);
    });
  }
);
```

This is our entire async behavior!  Those `after` values just queue up - they're lazy Observables. But let's not forget that final touch - the randomization.

In case you are thinking this will be very hard, never fear, 𝗥𝘅𝑓𝑥' `@rxfx/perception` exports a function that randomizes numbers given it, but in a way that the average is preserved. We just drop it in a place that used to have a constant, and we're good.

```diff
+ import { randomizePreservingAverage } from "@rxfx/perception";


const typer = bus.listenQueueing(
  () => true, 
  (char) => {
-    return after(AVERAGE_DELAY, () => {
+    return after(randomizePreservingAverage(AVERAGE_DELAY), () => {
      console.write(char);
    });
  }
);
```

There we go! A pseudo-human typist - something that will look good for chatbot responses, AI, Chat GPT - whatever!

Check out [the CodeSandbox](https://codesandbox.io/s/rxfx-example-poisson-process-typing-hncrl0) and then see how you can use, and enjoy using this.

—𝗥𝘅𝑓𝑥

PS How does `randomizePreserveAverage` work? One answer I could tell you is that it scales a number by the absolute value of a randomly chosen logarithm between 0 and 1. But a more intuitive way to say it is that it makes 1/3 of numbers larger, while 2/3 get smaller — given that a single doubling event requires two halving events to preserve the average.