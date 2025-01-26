---
title: RxJS - I Have A Bone To Pick With You
published: true
description: How the new library 𝗥𝘅𝑓𝑥 adds convenience to using RxJS
tags: rxjs, rxfx, angluar, observables
cover_image: https://images.unsplash.com/photo-1530210124550-912dc1381cb8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80
# Use a ratio of 100:42 for best results.
# published_at: 2022-10-31 14:18 +0000
---

RxJS, there are some things I really love about you, but I think I'm falling for someone new - [𝗥𝘅𝑓𝑥](https://github.com/deanrad/rxfx/tree/main/bus)

Your popularity— You have more downloads a month than React and Angular combined.

Your maturity— You're a ripe 13 years old. Forever in technology time, and 3 years older than Promises, even.

Your utility— For eliminating race conditions, all forms of timing control, and resource management— you have no equal.

But RxJS— with all this time you've been around, how come everybody doesn't know that you're the best already? How did you let React become the biggest framework, with useEffect and its quirks, and not even have them build upon you - the best choice available at the time? Now there are all these React developers out there who don't know the joy and power of working with you, RxJS. 

But I know you're thinking what React did can't be your fault right? I mean - your documentation is perfect right? No friction to onboarding at-all, right... 

So to help you out, I'm going to tell you about your DevRel issues (DevRel) and how to fix them. To start, you gotta do something about your...

## Confusing Concurrency Docs

Your documentation for your `*Map` operators is tragically hard to read. In the v6 docs you say `exhaustMap`:

> Projects each source value to an Observable which is merged in the output Observable only if the previous projected Observable has completed. 

So, a previously running ~~Observable~~ Subscription **blocks** others from starting, you mean.

You could have called it something resembling **Blocking**. 

Your concurrency operators (`mergeMap`, `concatMap`, `switchMap`, and `exhaustMap`) focus on the notifications themselves, instead of the concurrency strategy that produces them.

This mapping operator could be illustrated by a picture:

![Blocking Concurrency Mode](https://s3.amazonaws.com/www.deanius.com/rxfx/mode-blocking.png)

Or the family of all of them illustrated as cards with common names and use cases.

![RxFx cards](https://s3.amazonaws.com/www.deanius.com/cards-4-all.png)

That will straighten out your comprehensability issue around these operators.

## Observable vs Subscription Confusion

Developers who understand Promises often fail to realize that an Observable is doing nothing without a Subscription. This is what makes an Observable not something you can `await`.

But RxJS, you sometimes fail to differentiate sufficiently between an Observable and a Subscription in the docs! When the `exhaustMap` docs said: _"only if the previous projected Observable has completed"_ - that should have said _"the previously running Subscription has completed"_. Observables are templates for work. Only subscriptions can deliver values.

I don't think calling an Observable multicast helps either. An Observable, being like a command, can be executed several times - we dont say that the command is multicasting to its executions. 

I don't like calling an Observable a 'stream' of notifications either - it may not have any! I prefer to say that an Observable is a template for creating a process - containing a start function and a cleanup function.

So - terminology is confusing. But it's also unclear where to split up a big chain of Observables.

## App Partitioning / Where to Call Subscribe

Some schools of RxJS believe in constructing a giant chain of Observables, with some higher-order ones in the middle, and calling `.subscribe()` once at the end of it only. The [Swipe-To-Refresh example from LearnRxJS.io](https://www.learnrxjs.io/learn-rxjs/recipes/swipe-to-refresh) does this.

![swipe to refresh demo](https://drive.google.com/uc?export=view&id=1BLA2TcAhjwtodkcnsJ8e91ckrvurqkEv)

Check out its code on [StackBlitz](https://stackblitz.com/edit/rxjs-refresh?devtoolsheight=40&file=index.ts). I don't know what you thought separation of concerns was supposed to be - but I don't think that is it. 

What _are_ good practices, when combining Observables, especially higher-order ones? If operators are the individual words of your code paragraphs, what does a sentence-level structure look like? If we had that it might help us solve...

## Operator Soup
The [Swipe-To-Refresh example from LearnRxJS.io](https://www.learnrxjs.io/learn-rxjs/recipes/swipe-to-refresh) starts out with 19 imported operators and functions with raw RxJS. With 𝗥𝘅𝑓𝑥 you implement _the same functionality_ with 6. That's 66% less you have to fit into your mind at once, 13 fewer operators to understand.

Some of this comes from demo sites wanting to show all operators in use. But it's not uncommon to find a ton of operators in real RxJS production code. While each one is purposeful, their many combinations can be confusing.

If we could use fewer operators, we would have less code, and not suffer from as many...

## Errors 
This is already a well covered topic, RxJS. But you already know it's a source of pain and confusion. Recent changes have helped producers interfere with each other less, but the risk of `UnhandledRejectionError` bringing down a process is still large. 

Why can't we specify 'containers' that can individually terminate on error, without risk to the overall process?

You see, we need some help, RxjS.

## Solution - 𝗥𝘅𝑓𝑥

When a community and library are mature enough, some "contrib" library emerges that the community puts its best value-add goodies in. That is what 𝗥𝘅𝑓𝑥 aims to be. 

𝗥𝘅𝑓𝑥 is RxJS "The Good Parts". With infinite expansion possibilities via 'raw' RxJS.

Problems like Confusing Docs, Observable vs Subscription Confusion, App partitioning, and Operator Soup, and even Errors are reduced when 𝗥𝘅𝑓𝑥 is your interface to RxJS. 

Think of 𝗥𝘅𝑓𝑥 as sugar around an RxJS `Subject` that acts as an event bus. Each subscriber we call a "listener", and it is a concurrency-controlled, independent Subscription that is error-isolated from all others.

Basically, this means you can get more done with less skipping the several years you need to be fluent in RxJS.



## Case Study— RxJS [Swipe-To-Refresh Demo](https://stackblitz.com/edit/rxjs-refresh?devtoolsheight=40&file=index.ts) 

The [Swipe-To-Refresh Demo](https://stackblitz.com/edit/rxjs-refresh?devtoolsheight=40&file=index.ts) starts out with 19 imported operators and functions with raw RxJS. In 𝗥𝘅𝑓𝑥 - it needs only 6.

I'll dissect and rebuild it in my [next post](https://dev.to/deanius/-a-productivity-layer-around-rxjs-2igi) :)

## Links
- [𝗥𝘅𝑓𝑥 Bus Readme](https://github.com/deanrad/rxfx/tree/main/bus)
- [Swipe-To-Refresh commit-by-commit](https://github.com/deanrad/rxfx-example-swipe-to-refresh-blitz/pulls)
- [𝗥𝘅𝑓𝑥 Examples](https://codesandbox.io/search?query=rxfx&page=1&configure%5BhitsPerPage%5D=12&refinementList%5Bnpm_dependencies.dependency%5D%5B0%5D=%40rxfx%2Fbus&refinementList%5Bnpm_dependencies.dependency%5D%5B1%5D=%40rxfx%2Fservice)
- [𝗥𝘅𝑓𝑥 Minimal Repl on Repl.it](https://replit.com/@deanius/Hello-World-rxfxbus#index.js)

---

