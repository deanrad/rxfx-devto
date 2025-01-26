---
title: Error Handling in RxJS — Building an RxJS PubSub
published: false
description: Is RxJS suitable for PubSub? And if not, can we make it so?
tags: rxjs, catchError, observable, promise
---

# Building a PubSub Implementation on RxJS

As I attempted to tighten up error-handling for the [Rx-Helper](https://github.com/deanius/rx-helper) library, I started digging deep into exactly how RxJS errors work.

I made this contrived example, which uses an Observable, and two subscribers, one of which misbehaves, to answer the following burning question:

> How are Publishers and Subscribers isolated from the errors of other Subscribers?

In other words, is RxJS suitable for PubSub? And if not, can we make it so?

## You Start Me Up

In our contrived example, a publish routine synchronously pushes two values, and one asynchronously via `setTimeout`.

```js
function publishSomeData() {
  try {
    [1, 2].forEach(i => {
      console.log(`publisher: Pushing ${i}`);
      publish(i);
    });

    setTimeout(() => {
      console.log("publisher: Pushing 3");
      publish(3);
      console.log(`publisher: Done async publishing`);
    }, 0);
  } catch (e) {
    console.log("publisher: Saw an exception:", e.message);
  } finally {
    console.log(`publisher: Done sync publishing`);
  }
}
```

The implementation of `publish` is simply to call `next` on a Subject

```js
const subject = new Subject();
function publish(item) {
  subject.next(item);
}
```

With two subscribers

```js
subject.subscribe(logObserver);
subject.subscribe(flakyObserver);
```

```js
const logObserver = v => console.log(`logObserver: Saw ${v}`);
const flakyObserver = {
  next(v) {
    console.log(`flakyObserver: Saw ${v}`);
    if (v > 0) {
      throw new Error("Im bad, will stop you from seeing more");
    }
  }
};
```

## It's Log, It's Log!

To understand, let's build up from simple cases first. For example, if `flakyObserver` does not throw, we will see:

```js
➽ Pushing 1
📜: Log 1
👀: Flaky 1
➽ Pushing 2
📜: Log 2
👀: Flaky 2
➽ Done sync publishing
➽ Pushing 3
📜: Log 3
👀: Flaky 3
➽ Done async publishing
```

Log Observer was subscribed first, and each observer is synchronous, so between each publish we see our observer's messages in order. This is an important part of the design of RxJS, and works fine - until one of the Observers throws in it's `next` callback.

```js
const flakyObserver = {
  next(v) {
    console.log(`👀: Flaky ${v} 💥`);
    if (v > 0) {
      throw new Error("Im bad, will stop you from seeing more");
    }
  }
};
```

We now see:

```js
➽ Pushing 1
📜: Log 1
👀: Flaky 1 💥
➽ Pushing 2
📜: Log 2
➽ Done sync publishing
Error: Im bad, will stop you from seeing more
```
Where is our 3rd, asynchronous, published event?? What if that was an event representing a user giving us their credit info to pay for their order, did we just see 💰 go out the window 💸?

According to Ben Lesh' [NGConf video on RxJS6 Errors](https://www.youtube.com/watch?v=JCXZhe6KsxQ&t=5m0s), this is exactly expected behavior, and it's due to the line of code below, that turns unhandled errors in this stack into unhandled errors in the next stack, but I think this is a little piece of evil.

```js
./node_modules/rxjs/internal/util/hostReportError.js:4
    setTimeout(() => { throw err; }, 0);
```

This seems to be with the goal of of decoupling one Observer's problems from another, and its effect is seen in the fact that 2 was pushed, and seen by Log Observer 📜. But event 3 was never even logged, due to Flaky Observer 👀. For that matter, even though the publisher tried to handle an exception, there was nothing it could do to catch. A bad subscriber irreparably broke the publisher. Assuming the published events have meaning (such as a user's checkout request, or billing info), failing to handle them could have very dire consequences. What can we do about this?

## PubSub

I think what we want instead, is a system that would have the following log output:

```js
➽ Pushing 1
📜: Log 1
👀: Flaky 1 💥
Error: Im bad, will try to stop you from seeing more
    at flakyObserver (rx-helper/demos/exceptions-agent.js:15:11)

➽ Pushing 2
📜: Log 2
➽ Done sync publishing
➽ Pushing 3
📜: Log 3
➽ Done async publishing
```

Once Flaky Observer 👀 fails, the system reports its error, and it is never heard from again. Sure, it's harsh, but it's the only way that's fair to other, well-behaved Observers. Given a choice, I don't want to build a system that is more coupled than this. Watch Ben talk about the production issue that led to RxJS6 Error handling, and you'll hear that isolation is key. I just don't think it goes far enough to save only the remaining synchronous notifications, while letting the asynchronous ones die.

# A New Order of PubSub - How does it feel?

RxJS can still be used to build an abstraction layer that can provide reliability guarantees that you don't get with raw RxJS. The first two parts of this abstraction are Publishers and Handlers.

Publishers and Handlers follow these rules..

A publisher of events:

- Recieves synchronous errors for illegal events only, not for failures to process them
- Is not interrupted synchronously or asynchronously by failures to process events

Handlers that receive a fail during processing and don't replace it with a proper event will:

- Not interfere with other handlers (or Publishers, see above)
- Be shutdown, and not given further events (restarting them is an option)

A special type of Handler, called a Filter, plays by different rules, and is useful for the case of detecting illegal events - malformed, wrong data types, etc..

Exceptions thrown from Filters:

- Become exceptions in Publishers
- Prevent any handler from running on that Event, but doesn't unsubscribe them

## Strike It Up!

Here's how we'd look if we pointed the publish method to the `agent` of the `rx-helper` library, after setting up Handlers with `agent.on`:

```js
import { agent } from "rx-helper";

agent.on(/.*/, logObserver);
agent.on(/.*/, flakyObserver);

function publish(item) {
  agent.trigger("an-event", item)
}
```

Unlike the unconditional subscription of RxJS, `agent.on` takes an event pattern to match (remember JQuery??). The function is only invoked when an event's type matches this pattern - here we use a wildcard Regex, but Strings, booleans, and function predicates are also valid matchers. We'll skip descriptions of the 3rd argument and return value of `on` for now.

We'll update the Observers just a tad, to work with Rx-Helper's arguments, and set them to listen:

```js
const logHandler = ({ payload: v }) => console.log(`📜: Log ${v}`)
const flakyHandler = ({ payload: v }) => {
  console.log(`👀: Flaky ${v} 💥`)
  if (v > 0) {
    throw new Error("Im bad, will stop you from seeing more")
  }
}
agent.on(/.*/, logHandler)
agent.on(/.*/, flakyHandler)

```

Now we DO get the error-isolated output we sought!

```js
➽ Pushing 1
📜: Log 1
👀: Flaky 1 💥
Error: Im bad, will try to stop you from seeing more
    at flakyHandler (rx-helper/demos/exceptions-agent.js:15:11)

➽ Pushing 2
📜: Log 2
➽ Done sync publishing
➽ Pushing 3
📜: Log 3
➽ Done async publishing
```

Even if we go to a 3rd and 4th event, and a filter is set to synchronously reject the 3rd event,
```js
const not3Filter = ({ payload: v }) => {(v === 3) && throw new Error("Not 3, I have Trypophobia!")}

agent.filter(true, not3Filter)
```

As long as the publisher catches and keeps going, we'll still log 4 - it'll just be like event 3 was filtered out of existence. Now that's a decent PubSub implementation.

```js
➽ Pushing 1
📜: Log 1
👀: Flaky 1 💥
Im bad, will stop you from seeing more Error: Im bad, will stop you from seeing more

➽ Pushing 2
📜: Log 2
➽ Done sync publishing
➽ Pushing 3
💥
➽ Pushing 4
📜: Log 4
➽ Done async publishing
```

## How Will I Know?

But actually our publish function should do one more thing other than call trigger, it should set up asynchronous error handling on the `completed` property of the result.

```js
agent.trigger("an-event", item).completed.catch(() => null);
```

For the benefit of the publisher, errors from handlers are turned into rejected Promises, and the `completed` property is a `Promise.all` of all of them. If a single handler fails, we have access to it, but it doesn't block or prevent later code from running. If we didn't have the catch, our logs would be the more verbose version below, but we'd still be safer than the RxJS6 default behavior.

```js
➽ Pushing 1
📜: Log 1
👀: Flaky 1 💥
Error: Im bad, will stop you from seeing more
    at flakyHandler (/Users/dradcliffe/src/deanius/rx-helper/demos/

➽ Pushing 2
📜: Log 2
➽ Done sync publishing
    (node:79649) UnhandledPromiseRejectionWarning: Error: Im bad, will stop you from seeing more
      at flakyHandler (/Users/dradcliffe/src/deanius/rx-helper/demos/exceptions-agent.js:15:11)
    (node:79649) UnhandledPromiseRejectionWarning: Unhandled promise rejection.
       (rejection id: 2)
    (node:79649) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated.
       In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
➽ Pushing 3
📜: Log 3
➽ Done async publishing
```

## Err Of Our Ways

So there we have it- RxJS error handling can be Hard to Handle, but with a little wrapper library like Rx-Helper over it we have a PubSub implementation that can be as robust as external job boxes. Well, up to the point of JavaScript being single-threaded. 

That's all for the theory of it, read other articles in the [Rx-Helper GitHub](https://github.com/deanius/rx-helper) for all the cool things you can build with it.

—Dean


