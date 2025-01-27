---
title: ToggleMap, I've Missed You
published: true
description:
tags: rxjs, rxfx, javascript, async
---

I have a question for you about a simple device I'm sure you think you already understand - the TV (or Hulu) remote control:

> What should a remote control do when you press Channel Down _*while*_ it's changing?

Most people believe one of these outcomes should happen:

- _Change down 2 channels_ - Because: You clicked Channel Down twice, two channels should be advanced; the effect is cumulative.
- _Change down 1 channel_ - Because: There can only be one 'Channel Down' in progress at once, and you should arrive at the first channel before additional 'Channel Down' events should be recognized.
- _Cancel the channel change_ - Because: It was taking too long, so stop the spinner and let me watch what I was watching.

The question is - would you know exactly what code to write to implement your preferred choice of mode? And if you were required to switch modes - how big a change would that be to your code? And how would you explain

## A Problem of Shared Vocabulary

It turns out there are a total of 5 possible modes that can govern this behavior, and currently no library accommodates, or names them all.

- '2 channel' mode is **queueing**; the reason being that each channel-change is processed one after the other.
- '1 channel' mode is **blocking** - the new channel change is blocked, because one was already in progress.
- 'Cancel the channel change' mode is **toggling** - there is no other button to cancel, so the same button is used to cancel.

I looked at the RxJS library to find if there were other modes. RxJS has functions called operators, which in fact deal exactly with how to combine effects when they would overlap. And **queueing** and **blocking** correspond to two operators called `concatMap` and `exhaustMap` in RxJS. In fact RxJS has two more operators, `mergeMap`, and `switchMap`, which we can call **immediate** and **replacing**.

## Finding the Lost Operator

I discovered the **toggling** mode when I sat looking at my son's favorite Halloween toy, asking it if these 4 operators covered the way it behaved.

![Childrens toy in toggle mode](http://www.deanius.com/spooky-guy.png)

It's a goofy little noise making thing with a single button. You press the button, and it makes a spooky noise and its eyes glow.

That's when I wondered - what happens if I hit that button _while_ it's playing the spooky music!

Want to see for yourself? Check it out [on YouTube](https://www.youtube.com/watch?v=MW1-o8x0vGI)

In short, the current channel change could be canceled if the remote operated in "toggling" mode. My car's auto-closing trunk behaves in this way.

## toggleMap

If you cancel an already-executing effect but don't start another unless no effect was running, you are **toggling**. You can implement this by passing `toggleMap` from `@rxfx/operators` into an RxJS pipe, or by using a bus or service from the [RxFx](https://github.com/deanrad/rxfx)

## Examples!

With RxFx, it is easy to declaratively choose a mode. One of them will surely fit your use case.

## Tell Me What You Think!

This post is just meant to give you the concepts - the CodeSandbox has the goods you'll need to actually put it to work.

## Bring Clarity to Async

While we seem to take it as fact that _Async Is Hard_, perhaps the problem is that we haven't sufficiently built tools to handle the most common cases with ease. Most async cases I've seen in the wild are handleable via the 3 parameters, and 5 modes listed above.

Immediate, queueing, replacing, blocking, and toggling. Start using these terms and you'll find you'll find your toolbox for async has never felt fuller.

> Dean
