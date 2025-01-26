---
title: Let's Give Events (`$.on`) a Closer Look!
published: true
description: A library called polyrhythm can help us gain the benefits of evented code with none of that legacy event-pain.
tags: jquery, react ,rxjs ,polyrhythm
---

# Why Events?

Remember the simplicity of `$.on('click', function(){ ... })`? You probably haven't written code like that in a while. And I posit that it's time to give that style another look. But, astute reader, you'll remind me that there were reasons why we left it behind. So let's look at those.

## Why Not Events Reason 1 - Concurrency

A problem everyone whose written an event handler has experienced is that the "events came in too fast".

Users double-submit. Start multiple downloads at once. Wonder whether their first button press worked, and smash a few more times for good measure.

```js
$("form").on("submit", () => {
  // something that mustn't run concurrently with itself!
});
```

User Problems result. Search boxes show old results. Sound or videos play simultaneously that should be queued. Animations don't play nice.

And Developer problems result. Code gets crazier, harder to read. Simple gets complex. Tests don't keep up. And concurrency-related code gets sprinkled on. And complexity leaks out.

```js
$("form").on("submit", () => {
  // something that mustn't run concurrently with itself!
});
```

```js
let isRunning;
$("form").on("submit", () => {
  if (isRunning) {
    return;
  }
  // something that mustn't run concurrently with itself!
});
```

## Why Not Events  Reason 2 - Direct Calling Preference

> "Event driven code is hard to read, it's hard to tell what caused what"

I've felt this pain for sure. Being able to Alt-Click to a function definition is more expedient than looking for the event handler. And the inversion of control that events bring makes you more reliant on the framework's internal timing elements.

But that 2nd problem goes away if you're using events to interface with your own actors/services/modules. And `grep` and `console.log` are still the most powerful debugging tools, so being able to attach a debugger to certain event name/type stirngs, or grep for them, can make up for that direct link in pretty significant ways. 

Also direct linking presumes certain things won't change - a synchronous function will always be synchronous - a generator function won't become async iterator, etc.. Direct linking can bind layers of your stack together in pretty challenging ways. So if there was something that wouldn't do that - wouldn't you want that?

## Ready to reconsider?

I too moved away from the JQuery `$.on` style with some of these above reservations. But with new tools, it's time to give event-oriented front-ends another look. It's already dominated much of the React landscape (see [Redux](https://redux.js.org)), as well as anything that uses a reducer. But my focus will be particularly on how to use a new library [polyrhythm](https://github.com/deanius/polyrhythm) to achieve these benefits, since it includes some timing tricks for Reason #1 that are not present in other event/command-object oriented frameworks. 

With these changes, you'll be able to deliver bang-up UX experiences via events, the natural language of front-ends, and *NOT* paint yourself into corners.

I've worked several years on the concepts in polyrhythm. I'm a drummer and musician, and juggling multiple streams of activity is a passion for me. I hope you'll give it a look, and please engage with me on Dev.to here, in twitter, or directly in the repo, if I can help you judge whether it's a fit for you.

Happy rhythm-ing!



---
- [polyrhythm](https://github.com/deanius/polyrhythm)
