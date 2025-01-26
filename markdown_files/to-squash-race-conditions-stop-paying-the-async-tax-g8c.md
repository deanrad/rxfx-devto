---
title: To Squash Race Conditions, Stop Paying The Async Tax
published: true
description: What race conditions are, how they occur, and whether there is a general purpose fix for them
tags: async, JavaScript, RxJS, Angular
cover_image: https://images.unsplash.com/photo-1505166065723-bae088a12fc4?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2547&q=80
---

"Race conditions" in programming are a common cause of user-reported bugs. Just as costly to organizations and development teams, their fixes are a common cause of complexity and unmaintainable code that produces more edge cases and bugs. What race conditions are, how they occur, and whether there is a general purpose fix for them is what we will explore, defining the term Async Tax to capture the price we pay when changing code from sync to async. Then we'll point toward a better future where we don't pay such a tax.

## What is Asynchronous Code?
The climate in which race conditions appear is any time a system allows for concurrent operations. In JavaScript this means wherever you have code that executes asynchronous operations - AJAX, callback, setTimeout, permission granting, etc..

An asynchronous operation is defined as code whose start time and end time are separated; they are not the same, not _synchronous_. Generally speaking the precise duration of async code is not knowable in advance. The general thought is that this nondeterminism is to blame for race conditions. It goes deeper than that though, so let's dive in.

## What are Race Conditions?
A Race Condition is a situation where one asynchronous operation occurs sooner or later than expected, leading code to encounter an environment it didn't expect - a connection had already closed, a piece of state was not there, the component was unmounted, etc..

## Why are Race Conditions So Hard To Prevent?

Two asynchronous operations can be visualized as two lines along an axis of time. Here are two async operations 'x' and 'y', and the possible ways they could overlap in time.

```
   ---> 𝓉𝒾𝓂𝑒  
   x------x       x-------x      x----x      x--x    
     y------y       y---y     y-----y     y-------y  
```

While the program may have expected, and coded, for the first possible overlap, and one of the other overlaps may be explicitly forbidden, or tested for, either of the others could occur at runtime unexpectedly and cause an error, which would be called a race condition.

The number of possibile overlaps are exponential in the number of operations - 2 overlaps have 4 possibilities, 3 have 8, 10 have 1,024... a weighty burden on the programmer to have to cover each one with tests.

Async operations take something that was a point on a timeline, and stretch it into a line, overlapping with other lines in inconcievable ways. Imagine a drawing tool that can manipulate circular shapes, and test for their overlap. How many ways can 3 circles overlap?

![](https://i.ytimg.com/vi/bRIL9kMJJSc/maxresdefault.jpg)

If you're like me you were surprised at the number of combinations. And if you're like me, building this tool, you probably would have explicitly tested about 3 or 4 at most. Yet there are 14. And that's just with 3 shapes. Exponentials grow very very fast. We need ways of taming them.

### The Async Tax

These days, it's painful and damaging to an application when you implement a feature in a way that requires something that was was once sync to become async. I call this damage 'paying the Async Tax'.

Imagine a function `t` that once returned a translated string `(key) => i18n.t(key)`. Now it  needs to use a  translation layer that may or may not have been loaded, so it'll depend on a Promise, and now return a `Promise<string>` instead of a `string`. `(key) => i18n.then(lang => lang.t(key))`. Sure async/await can help you change the function's internals minimally, but how much will the function's immediate caller need to change? How much rewriting of tests? 


```js
// How would you change this to use `i18n.t1` `i18n.t2` ?
const label = `<label>${i18n.t('title')}</label>`

const i18n = {
  t: (key) => syncTranslate(key),
  // t1 and t2 are two equivalent async forms
  t1: async (key) => (await asyncLib()).syncTranslate(key),
  t2: (key) => asyncLib().then(lib => lib.syncTranslate(key))
}
```

Async/await doesn't pay down the async tax, it makes it easier to forget you're paying it. What's needed is a better abstraction - one that sits high enough that changing from sync to async (or vice versa!) is just a one line change.

In concretion, one such solution is called Observables, and is implemented by the RxJS library. Another is called Sagas, and is implemented by Redux Saga. Both of these allow for changes to code that don't incur the Async Tax. Yes, you read that right - there are coding techniques available today that you could be using to not pay the Async Tax!

# What To Do ?

I want to write a follow up to this, including a true story of a one-line change from a sync to an async operation—with zero impact to tests. But I need some pointers to what would interest you. 

Please like, or discuss your thoughts below to show me what you're interested in, and how to target it. At work, we're still honing our ability to eliminate the sources of the Async Tax that remain. But generally, I believe a discussion about this is to the wider benefit of the community. I've written JavaScript since its beginning in 1996, and I've never been more excited about the **UI-framework agnostic** ways to write tight async code without race conditions. So I'll spill the beans, you just gotta ask!

> Disclaimer: So much so that I've written a library [`polyrhythm`](https://github.com/deanius/polyrhythm) to deliver Observable's capabilities in as maintainer-friendly a manner as possible, free from cryptic operators, deeply-nested Observables, and cumbersome management of Subscription objects.

