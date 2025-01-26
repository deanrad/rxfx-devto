---
title: Redux Observable vs Polyrhythm
published: true
description: If you like Redux/Observable, you might like polyrhythm
tags: redux, rxjs, javascript, angular
cover_image: https://images.unsplash.com/photo-1577727979487-ed2750b2d2d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2767&q=80
---

Redux took the front-end world by storm, elegantly solving the problem of synchronous state changes. Yet it left developers mostly on their own when it came to async.

Today I'll discuss two libraries: a Redux middleware called Redux Observable, and a non-Redux library called polyrhythm, and compare and explain how they both fill that gap, and why you might choose one or the other.

In the spirit of transparency, I am the author of polyrhythm, but I freely cite Redux Observable as an influence and wouldn't discourage you from choosing it- but I would welcome you to give polyrhythm, and its many examples a look!

---

# The Need For Asynchrony

Consider how we work with money in the real world. There are events (_transactions_) that result in instantaneous settlement, and then there are those that take time. On the one hand, if you pay with a $20 bill for a latte that costs $3.60, you get your $16.40 change instantanteously. _Synchronously_. On the other hand, when you initiate a wire transfer, it will settle, but some time later that business day or another day. _Asynchronously, like a Promise_.

The core of the async problem is that JavaScript, like most current languages, is based entirely on synchronous data. You can't use `if-else` with an asynchronous value- even the language's control structures don't work on async data. The `Promise` is only officially 5 years old, and the language had 15 years of evolution and use before. So basically, asynchrony is still an afterthought, resulting in a hodgepodge of solutions.

Some folks believe that Promises are enough if you only want a single value ([see this thread](https://twitter.com/BenLesh/status/1284504443795509249?s=20)). But I think a single value has never been enough for the Web. A value from a remote server is stale right away—unless it includes all future updates in the form of a stream. And if you want single-value delivery to have nice things like progress notifications, or `start/(end|error)` events, you've left the single-value paradigm.

The bottom line is that the fundamental data type of a stream, defined in the [TC39 Observable proposal](), and implemented primarily by RxJS, is a useful everyday value type in web development. 

Since Redux Observable and polyrhythm both agree with that premise, let's use an example to compare!

## Example: From a Job, A Stream of Payments

Our example, is a happy one, celebrating a recent event in my life. In it, you get a job (by dispatching a `job/start` action), and thus can happily consume a stream of `job/paycheck` actions in return!

```js
const jobAction = {
  type: 'job/start',
  payload: {
      employeeId: 271828,
	  employerId: 314159,
	  startDate: '2020-08-10'
  }
}
```
For an Observable of paychecks (let's use 30ms as a stand-in for 30 days), we define a stream called `payActions`.

```js
const payActions = interval(30).pipe(mapTo({
  type: 'job/paycheck',
  payload: {
     amount: 1000000,
     currency: 'dollars'
  }
}))
```

We can now look at how each of these frameworks would dispatch events from `payActions` in response to a `job/start` action. So let's start!

### Redux Observable

First we import some operators, and define an epic. From the R/O docs:

> An epic takes a stream of actions and returns a stream of actions.

```js
import { filter, mergeMap } from 'rxjs/operators';

const salaryEpic = (action$) => action$.pipe(
	 filter(action => (action.type === 'job/start')),
	 mergeMap(() => payActions)
  )
```

The salary epic takes as input _all_ of the actions that the store ever sees (`action$`), filters them down to those with type `job/start` using `ofType`, and then produces (and returns)  a stream that automatically dispatches `job/paycheck` events every 30 units `mergeMap`. This resulting stream is automatically sent back (dispatch-ed) through the store. (`mergeMap` would allow you to have multiple jobs at once, but we'll discuss that further when we talk about Concurrency.)

The setup involves modifying your Redux store to include the Redux Observable middleware, and bringing our epic into the middleware:

```js
// store.js
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { jobReducer, salaryEpic } from './employment';

const epicMiddleware = createEpicMiddleware();
const store = createStore(
  jobReducer,
  applyMiddleware(epicMiddleware)
);

epicMiddleware.run(combineEpics(salaryEpic));
```
And we're done!

Now that we've identified the parts of that solution, let's see how those parts correspond to those in polyrhythm.

### Polyrhythm - V.0

Polyrhythm looks a lot like event handlers from the JQuery days. It lets you do anything in handler functions, not just dispatch events. So first we set up the event bus to send every event through the store.

The imports we use are `listen` and `trigger`— `listen`  takes the event pattern to match as its 1st argument, and `trigger` takes the event to put back on the bus. The setup we need is to send every event (or some subset) into the Redux store, like this:

```js
import { listen, trigger } from 'polyrhythm'
import store from './localStore'

listen(true, event => store.dispatch(event))
```

At this point, we've subscribed the store to all actions/events, because the criteria `true` matches all events. Now, `trigger(event)`, or `trigger(type, payload)` will send an event through the Redux store. Thus all we need to do is call `trigger` for every payAction upon a `job/start` event.

```js
import { listen, trigger } from 'polyrhythm'

listen('job/start', () => {
  payActions.subscribe(trigger)
})
```

Now the shape of the code actually follows its intent, for those familiar with RxJS' `subscribe`:

> Listen for job/start events, on each one, trigger a paycheck for every pay action.
 
 But can we get that one call to `subscribe` out of the code so it's easier to read and explain? 

### Polyrhythm V.1 - No more `subscribe`

I'm always compelled to simplify code. My goal is that each constituent part intentionally serves a single purpose. 

Our listener function can return the Observable, and never need to call `subscribe` - its subscription will be managed by polyrhythm. Managing Subscription objects is a common RxJS pain point, and Redux Observable doesn't require you to do call `subscribe` so polyrhythm doesn't either:

```js
listen('job/start', () => {
  return payActions.pipe(tap(trigger))
})
```
But what if the Observable you're turning into actions isn't written for Redux?

### Polyrhythm V.2 - Use a non-Redux Observable

Consider how the `payActions` Observable is coupled to the names of the dispatched actions. Polyrhythm can decouple the payloads from the types by letting you return Observables of raw values, and assigning types separately.

First, let's suppose we have a Redux-unaware Observable `paycheckValues`, which incorporates only pay-related values-over-time like this:

```js
const paycheckValues = interval(30).pipe(mapTo({
   amount: 1000000,
   currency: 'dollars'
}))
```

We could use the 3rd argument to the `listen` function to both subscribe to these values, and trigger them as `job/paycheck` events!

```js
listen('job/start', () => paycheckValues, {
	trigger: {next: 'job/paycheck'}
})
```
How cool is that! We get to completely drop the `tap` operator, the pipe, and just rely on what's in `polyrhythm` and our value-only Observables. Our code now reads:

> When you get a job/start event, take the paycheckValues stream and trigger each as job/paycheck.

Now let's see how polyrhythm takes one of RxJS strength - timing control - and allows you to make it even more configurable.

## Con-Concurrency

One of the big questions of async is - when an async operation is ongoing, do you start a new one, enqueue it, or what? In our job example - can you work multiple jobs at once?

Recall, that with Redux Observable, we use standard RxJS operators in order to control how Observables are combined. A couple of issues with this are:

- It's hard and confusing to choose operators
- Changing them results in changing a chain of code

For example, the Redux Observable diff that takes this from a multi-job example to a single-job-at-a-time looks like this:

```diff
const salaryEpic = (action$) => action$.pipe(
	 ofType('job/start'),
-	 mergeMap(() => payActions)
+	 switchMap(() => payActions)
  )
```

If you know RxJS you know why this works - but how confusing is it to read?! Not only that, must the concurrency behavior be baked-in to the Observable or can it be decoupled from it for easier testability/changeability? 

Polyrhythm's 3rd argument has just a spot for controlling concurrency:

```diff
listen('job/start', () => paycheckValues, {
	trigger: {next: 'job/paycheck'},
-   mode: 'parallel'	
+   mode: 'replace'	
})
```
Now we are really close the business language:

> When you get a job/start event, trigger a paycheck with the specified values (as job/paycheck), and end the previous job's paycheck stream, replacing it with the new paycheck stream!

## A DSL for concurrency

In my experience, async concurrency matters a great deal to UX! Downloaders should be serial, autocompletes should replace old results, etc. But these behaviors are often not specified along with the requirements of a feature. To help you, the developer, tease out the desired behavior when you get a new feature request-  this graphic can help you prompt _"Which mode is this feature supposed to operate in?"_ (My PM/Designer Jase learned to tolerate, if not love getting questions like these from me :) )

![Polyrhythm Concurrency Modes](https://s3.amazonaws.com/www.deanius.com/ConcurModes2.png)

These are built upon the RxJS operators, but named according to what they do, and including a mode 'toggle' for completeness:

![enter image description here](http://www.deanius.com/async-strategy-matrix.png)

## Other Benefits

 -  A polyrhythm trigger criteria can be a string, an Array of strings like R/O, but also a Regex, a function returning a boolean, or a boolean like `true`.
 - The return value from a listener may be a
   Promise, a single value, an Observable of side effects, or a function which returns a Promise.
 - When you have a listener returned from `listen`, you can shut it down at runtime via `listener.unsubscribe()`
 - `trigger` can accept either an action, or type and payload separately as in `trigger('job/paycheck', '100 USD')`
 - You need not create actions for component-local state changes - `listen`-er functions aren't limited to living in the store, so your components can listen directly.

Basically, whenever I could remove boilerplate, decouple, or otherwise improve DX (Developer Experience), I tried to do so. 

## Respect to Prior Art

One brilliant aspect about Redux Observable is its insight that each new piece of functionality can be implemented in a function which creates a stream of new actions/events  in response to existing events, showing such a safe, and pure-functional way to grow an app. Polyrhythm, while essentially the same architecture, but outside of Redux, exists to get all those benefits, yet still have code that is as readable, and jargon-free as possible. 

I hope you'll enjoy giving polyrhythm a try. Check out [its repository](https://github.com/deanius/polyrhythm). It's more than a proof of concept - used in production and highly tested - but use whichever one helps.  

Thanks to the Redux Observable team (special mention to Jay Phelps) for inspiration and a hugely helpful Gitter channel.

— Dean
