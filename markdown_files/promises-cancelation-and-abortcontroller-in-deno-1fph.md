---
title: Promises, Cancelation and AbortController in Deno
published: true
description: Why Aren't Observables used in Deno?
cover_image: https://images.unsplash.com/photo-1552775838-b0c8d3b881fb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1837&q=80
tags: deno, oak, async, rxjs
---

As excited as I am about Deno (the new Node-like runtime), and that it has cancellation semantics, I don't like seeing that they bypassed an over 10 year old concept of Observables, in favor of a barely adopted standard for cancellation - the AbortController.

Should you want to shut down a server, using the oak framework (an anagram of koa, get it?), you have to do the following:

```js
import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

const controller = new AbortController();
const { signal } = controller;

const listenPromise = app.listen({ port: 8000, signal });

// In order to close the sever...
controller.abort();

// Listen will stop listening for requests and the promise will resolve...
await listenPromise;
```
(From: https://github.com/oakserver/oak#closing-the-server)

There are at least two things about this I don't like:

- If `listen` wasn't called with the `signal`, there is no way to shut down the server
- It's unclear to me whether an aborted server ought to be considered a resolved promise (a value, when awaited), or a rejected Promise. 

The problem of needing to know you're setting up a cancelable thing is unfortunate. If it's something you need to know in advance - it's easy to forget. And people won't fall into the 'pit of success' if you impose more upon them to do up front. By the time you know a thing needs to be cancelable, it's often already caused problems.

The problem of Promise cancellation is a deep one, and I'll just leave it at "Promises aren't a good fit for cancellation". That's why the proposal to add cancelation natively to Promises [died in committee](https://github.com/tc39/proposal-cancelable-promises/issues/70).

Here's what the code would look like if the server were an Observable.

```js
import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

const controller = new AbortController();
const { signal } = controller;

const listener = app.listen({ port: 8000, signal }).subscribe()

// In order to close the sever...
listener.unsubscribe();

// etc..

```
It clearly fixes those problems. It may introduce a new one IF the cancelation itself is an async operation, and I suspect it may have been because of this, but I don't know whether shutting down a server is a long thing, if you accept that it means canceling running activity.

---

In short, these days I'm often asking "Why not Observables?" and I would love to hear your answer. Observables are the best proxy I've seen for "A process you start up (possibly in the future), and may want to shut down." 

Observables are like having strings around for UNIX processes - they are not executing at the time they're defined, but they begin executing when you call `subscribe()`, and the object returned has an `unsubscribe()` method which sends them a `Ctrl-C`:

In a contrived example:

```typescript
import { Observable, Subscription } from 'rxjs'
interface findResults {
  (finder:string): Observable
}

const resultFinder:string = "ls -l magic*"
const results:Observable = findResults(resultFinder)
let process:Subscription

const findMagicBag = (item) => {
  if(item === "magic-bag.md") {
    console.log("Found my magic bag!");
    process.unsubscribe();
  }
}

// starts executing on this next line
process = results.subscribe(findMagicBag);
```

Again, we don't have to 'add' cancelation, it's just baked in. And it's a good thing, because once we've found the thing we're looking for, *why not* shut the process down? In servers, particularly, leaving handles open for longer than you need to is problematic.

So I'm excited about Deno, and Oak. And Promises are way better than callbacks. But let's not stop the improvements there, especially in this greenfield area. And with an [Observable Proposal in TC39](https://github.com/tc39/proposal-observable/issues/112) that couldn't possibly fare worse than Promise cancelation did, we should take a look and see if that fits the bill. :)

---
- [Observable Proposal in TC39](https://github.com/tc39/proposal-observable/issues/112)
- [RxJS](http://rxjs-dev.firebaseapp.com/)
- [Promise Cancellation in TC39](https://github.com/tc39/proposal-cancelable-promises/issues/70)
Photo by [Michael Dziedzic](https://unsplash.com/@lazycreekimages?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on Unsplash