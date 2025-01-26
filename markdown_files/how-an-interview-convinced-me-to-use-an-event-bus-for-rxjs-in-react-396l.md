---
title: How an Interview Convinced Me to Use 𝗥𝘅𝑓𝑥 and RxJS for Effect Management in React
published: true
description:
tags: rxjs, rxfx, JavaScript, React
cover_image: https://images.unsplash.com/photo-1574720187210-421b34c9cf01?ixlib=rb-1.2.1&raw_url=true&q=80&fm=jpg&crop=entropy&cs=tinysrgb&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1064
---

Edit: Here is [part 2](https://dev.to/deanius/excellent-effect-management-in-react-with-and-rxjs-35cn) of this series.

Note: Some images refer to the library's old name "Omnibus-RxJS" and have not been updated to 𝗥𝘅𝑓𝑥.

## An Interview Like No Other

It was a front-end React UI developer interview which began like any other. But unlike others, by the end of it I'd learned enough to change my whole approach to data-fetching, or maybe to async programming in general.

I was the interviewer for a 60 minutes live-coding interview. The goal was to build a simple React GUI that could fetch a random GIF. We assumed any candidate who reached this round could do async data-fetching in React. But we wanted to learn how a candidate thought about front-end problems in general. We were looking for some insight that we didn't already have. And in this candidate— call them **Chris** - we found it :)

I handed Chris the paper with the requirements for their live-coding interview.

## Getting Acquainted

The requirements contained an image of what was to be built in the interview.

![empty template](https://s3.amazonaws.com/www.deanius.com/kitty-factory-intro.png)

![Implement a React UI that loads a random GIF upon the click of a button Respond to and display any errors that occur Implement a cancel button](https://s3.amazonaws.com/www.deanius.com/GIF-fetcher-challenge.jpg?n)

Chris asked a few questions:

_"Does it have to be cats, or will any GIF do?"_

"Ha!" I said. "You can choose any GIF you want, but we've provided a function to get cats."

```ts
const fetchRandomGif = () =>
  fetch("https://api.thecatapi.com/v1/images/search", {
    headers: { "x-api-key": "blah-blah" },
  })
    .then((res) => res.json())
    .then((data) => data[0].url);
```

_"Can I use any libraries?"_ was Chris's next question. I replied: "Do you think one is needed for this app?"

_"Well, we need a cancel button... And I find Observables make for cleaner, less error-prone code around cancelation."_

This took me by surprise. I only knew of one cancelation tool, AbortControllers, and Chris pinpointed my frustrations with them - that they're easy to forget, don't compose well, and obscure the logic of the happy path.

I said, "yes you can use a library, but you must be able to explain what it is doing, and justify its contribution to the bundle size."

Chris chimed up with, _"Sounds good— shall we get to work then?"_

---

## 𝗥𝘅𝑓𝑥—An Odd Choice of Library

Chris started by creating a new file, naming it `gifService.ts`. I gently inquired why they made a separate file instead of coding into the provided React component.

_"React is the view layer, this is- well, a service layer. Easier to test with no React dependencies. Can I proceed?"_

"Go for it," I said. Chris wrote the following as though from memory, and in TypeScript, but I'll post just the JS here.

```js
import { Bus } from "@rxfx/bus";
import { createService } from "@rxfx/service";
import { fetchRandomGif } from "./prebuilt-for-candidate";
const bus = new Bus();
bus.spy(console.log);

export const gifService = createService("gif", bus, () => fetchRandomGif);
```

I said - Ok, now what is this library doing?

_"Have you used Redux Saga, createAsyncThunk, or other async middleware? 𝗥𝘅𝑓𝑥 is a drop-in replacement, at less than half the bundle size. The bus receives events, which the service will put onto the bus as the effect starts, provides data, etc."_

I knew Redux Saga. I said "The `fetchRandomGif` function - it's not written as a generator function or a saga, it just returns a Promise. Is that going to be compatible with your bus?"

_"Yep, no problem. It can do Promises, Observables, iterables. It's just RxJS underneath._

_If you've ever been frustrated using React Context or prop-drilling to share data across an app, a `bus` is a framework-free way to do the same. It's so easy I don't know why it's not built into every app!"_

I did have prop-drilling and React Context issues, and I saw how events being visible to any part of the app by default would result in less code. That satisfied me of their choice, and I asked Chris to continue.

## The State Model and Reducer

_"Great— now let's start on our state model. It looks like there's only one field we need in state - the URL of the current image - is that right?"_

I said "Are you forgetting the loading and error states?"

_"One nice thing about an 𝗥𝘅𝑓𝑥 service is your state model doesn't need to include loading and error. You get into trouble when you mix transient fields like `loading` and `error` into state fields that you may want to persist for longer - like across sessions. Separate things that change at different rates, right?"_

I had just dealt with a bug where a `loading` state loaded from local storage with a value of `true` - the spinner spun but nothing was happening. It occurred to me it was not really DRY to have a state field that isn't a direct reflection of whether a process is actually running, so I was ready to see it in action.

_"We still need to see loading and error in the UI, but let's go ahead with a loading-free reducer."_

The reducer looked like this:

```js
const initialState = {
  url: "",
};

export const gifReducer = (state = initialState, e = {}) => {
  switch (e.type) {
    case "gif/next":
      return { ...state, url: e.payload };
    default:
      return state;
  }
};
```

I noticed the strings in the `case` statements, and I said "These look like Redux Toolkit conventions, but with different names - where do they come from?"

_"Fair question. A service has a standard set of actions, based on Observable life-cycle events. The `next` event delivers data, `error` an error, and `started` indicates a search began. There are typesafe versions of these too, do you want me to use them?"_

I said, "Let's skip that for now and get our data in the UI."

_"Cool. Then let's add the reducer to our service."_

Chris changed the line to create the service ever-so-slightly, by adding the reducer.

```diff
- createService('gif', bus, () => fetchRandomGif);
+ createService('gif', bus, () => fetchRandomGif, () => gifReducer);
```

_"And now let's bring state into our UI"_.

## UI Updates

Chris typed the following in a flurry of keystrokes..

```js
import { gifService } from "./services/gifService";
import { useService } from "@rxfx/react";

function CatFetcher() {
  const { state, request } = useService(gifService);
  const { url } = state;

  <img src={url} alt="Animal GIF" />
  <button onClick={() => request()}/>
```

I said "Let me get caught up. Through the `useService` hook, we have a reference to the state produced by the reducer. And we have a function with which to request the effect, which changes the state?

_"Yeah, precisely!"_

![template with cat](https://s3.amazonaws.com/www.deanius.com/cat-load-no-loading.gif)

It worked great— on the happy path. Now what about errors, I asked.

## Errors

Chris hacked a thrown error into the fetch endpoint. Then captured a `currentError` field from the hook. Then used it in React to show the message.

```diff
-  const { state, request } = useService(gifService);
+  const { state, request, currentError } = useService(gifService);
```

```tsx
<div className="error">{currentError}</div>
```

I tested that when an error was shown in the GIF fetcher, the error display _just worked_. And it was cleared automatically on the next click. I guess that's why the field is named "currentError"—once a new one begins there _is no current error_. A nice convenience.

![template with error](https://s3.amazonaws.com/www.deanius.com/cat-error.png)

After it had shown an error, it resumed future fetches just fine. I said to Chris "You pulled that off nicely. But since you left `loading` out of your state, how will we display that?"

## Loading State

While the GIF is loading, let's change the text "Fetch Cat" to "Fetching.."

Chris captured the `isActive` field from the `useService` hook return value.

```diff
-  const { ... currentError } = useService(gifService);
+  const { ... currentError, isActive } = useService(gifService);
```

```tsx
<button onClick={() => gifService()}>
  {isLoading ? "Fetching." : "Fetch Cat"}
  {/* Fetch Cat */}
  <HourglassSpinner show={isLoading} />
</button>
```

That `isActive` variable - the hook just knows that a fetch is active?

_"Sure does. The service knows when it's doing work. It keeps a count of `gif/started` and `gif/complete` events and emits `true` when the count is `> 0` and `false` otherwise."_

I pretty much decided Chris had passed the interview, but to throw a challenge I asked about cancelation.

## Cancelation and The Finished Product

I'd shipped many apps without cancelation before, especially before Abort Controllers. But I knew that to do top-notch UX, one had to be able to cancel effects to free up resources.

I asked how we could cancel a load while in progress. Chris added a Cancel button to the form, and I stepped out of the room for a second.

```html
<button onClick={() => gifService.cancelCurrent()}>Cancel</button>
```

When I returned, I opened up DevTools, and clicked Fetch Cat. I clicked Cancel, and BOOM, a canceled XHR on `/search`!

![cat loading fixed](https://s3.amazonaws.com/www.deanius.com/cat-cancel-api.jpg)

Chris showed the new fetchRandomGif function - which looked like the Promise-based version. 

```ts
import { ajax } from "rxjs/ajax";

const fetchRandomGif = () => ajax.getJSON({
    url: "https://api.thecatapi.com/v1/images/search",
  }).pipe(
    map((r) => r.response[0].url)
);
```

Seeing this, I asked, "So the service can just cancel this AJAX, even without an AbortController?"

_"Cancelation is automatic- as long as the endpoint returns an Observable. It's crazy - every Observable since 2012 is cancelable, and yet today we have just Promises. It's nice that in 𝗥𝘅𝑓𝑥 you can return a `Promise` to start, and an Observable when you implement cancelation."_

This was great. I made a mental note: Suggest the whole team learn about Observables and this API around them. Promises being run-to-complete by default started to look like a very bad idea, especially when it was easy as this to swap a non-cancelable AJAX with a cancelable one.

## A Mysterious Departure

Chris had exceeded expectations on the first 3 mandatory points of the challenge. I wanted to hire, so I moved on to Chris's questions. We talked pleasantly, then when we were standing up to say goodbye, curiosity got the best of me, and I asked one more technical question:

"Just curious- but how would you handle a click while a GIF was already loading? Something like XState?"

Chris lifted their backpack to their shoulder and smiled.

_"Oh, the 𝗥𝘅𝑓𝑥 service has that covered too. Just change the call to `createService` to `createQueueingService` and you're covered. I'll send you a CodeSandbox of it later today so you can try it out."_

And with that, Chris was gone. And my learning into RxJS and 𝗥𝘅𝑓𝑥 had just begun.

---

## Author's Note

Here's the [CodeSandbox](https://codesandbox.io/s/rxfx-service-example-data-fetcher-nweq0h) of the Cat Fetcher.

As you may have guessed, this was a fictitious story, written by me, Dean, the author of 𝗥𝘅𝑓𝑥 packages. I must stress that 𝗥𝘅𝑓𝑥 was not designed to handle interview problems, but real world ones! And it has been deployed to production in various forms for 4 years, solving problems like dynamic forms, 60FPS animation, Web Sockets and many more. I hope you will give it a look, and let me know what you think!

And soon there will be Part 2 where we address timeouts, maintaining the loading state until the bytes of the image have arrived, and other subtleties of data fetching.

-- Dean

Update: Here is [part 2!](https://dev.to/deanius/excellent-effect-management-in-react-with-and-rxjs-35cn)
