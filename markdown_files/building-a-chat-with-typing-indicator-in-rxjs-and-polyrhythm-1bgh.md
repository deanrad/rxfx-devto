---
title: Building a Chat with Typing Indicator in React, RxJS and polyrhythm
published: true
description: Learn how to do elegant async using RxJS and 🎵polyrhythm🎶
tags: react, rxjs, redux, angular
cover_image: https://s3.amazonaws.com/www.deanius.com/ChatCliffhanger.png
---

In this post we'll see how we can use Event-Driven Development, and a library called [polyrhythm](https://github.com/deanius/polyrhythm) to solve problems which routinely come up doing async in JavaScript in React, Angular, Vanilla JS, and even Node. It can help decouple components, in particular when sharing data across a component tree, with a simpler API than React Context. It solves problems like:

In React:
- Prop-drilling and function-memoization
- Closing over stale state

And in RxJS:
- Improving the readability of RxJS code
- Avoiding RxJS operator soup

We'll also introduce a generalized event handler framework, that shows how useful it can be to return an RxJS Observable as the response from an Event Handler. This will lead us to a new, useful API for implementing and testing async behavior. 

So, now that we know what benefits we can expect to gain, let's see how Event-Driven Development with polyrhythm helps us build a async UI experience we're all familiar with - a Chat UI.

# Chat UI ... _(is typing)_ 

Chat UIs are pretty ubiquitous on the web now, and can do pretty amazing things whether a person or AI is behind them.
![Chat UI](https://s3.amazonaws.com/www.deanius.com/ChatUI.gif)

For our purposes, we'll focus on a two-party version of chat, not a full Slack clone. And for some spicy async behavior, we'll include the typing indicator that shows 3 animated dots when the other user (but not you) is composing a message.

# Plan of Attack

For completeness, we'll include these acceptance criteria, though I suspect you already know what a Chat UI does :)

```
Chat UI
  Messages
    Typing
      - Builds a pending message
    Submitting
      - Clears the pending message
      - Adds the pending message to the message log
      - Puts the pending message on the network
    Receiving
      - Adds received messages to the message log
```

This will take a little while, but will be extremely satisfying - let's begin!

# Part 1 - Messages

## Step 1 — Compose Messages

Let's start by assigning the role of creating and submitting a message to a `MessageComposer` component. 

Remember how React is very sensitive to over-rendering, and how over-rendering can ruin our performance? In our `MessageComposer`, we will not require a callback function be passed in `props` in order for us to deliver messages.  Instead of a `prop` callback, we will use an imported function named `trigger`. Trigger neither needs to be passed to other components, nor memoized, since its identity is always the same. So performance won't inadvertently degrade, and that's a win.

The API of`trigger`, is just like Redux' `dispatch`, except it can take the `type` and `payload` as separate arguments, reducing boilerplate, for another win:

```js
trigger('foo', { bar: 1 })
// is shorter than...
dispatch({ type: 'foo', payload: {bar: 1} })
```

Now, to add `pendingMessage` management and `trigger`-ing our component is blissfully straightforward: 

```js
import { trigger } from "polyrhythm";

const MessageComposer = () => {
  const [pendingMessage, setPendingMessage] = useState("");

  const handleChange = (e) => {
    setPendingMessage(e.target.value);
  };

  const handleSend = () => {
    setPendingMessage(""); // async - doesn't change pendingMessage
    trigger("message/create", { text: pendingMessage }); // <---- HERE!!
  };

  return (
    <div>
      <input value={pendingMessage} onchange={handleChange} />
      <button onclick={handleSend}>Send</button>
    </div>
  );
};
```

Trigger puts a **message/create** message on the default channel - an instance of an event bus. And trigger-ing is all our `MessageComposer` will ever need to do! It never needs to know about what happens to the messages it creates. Decoupling is the next win.

This clever use of Pub-Sub lets us finish components in any order. What's more, we know that once they are done they will generally not need to change. In over a year working on a large React app with many cooperating components, never once did one `trigger`-ing component need to be changed in order to handle changes to the consumers of that data. 

So, finally, we start our component tree off with an instance of our `MessageComposer` like this:

```js
const App = () => {
    <>
      <MessageComposer />
    </>
  );
};
```

## Step 2.1 — Connect the WebSocket and Receive Messages

Let's create a job for a component called `WebsocketService`. It will open a WebSocket client to be able to see message from the other user. When those socket events happen, it will put them onto our event bus with type **message/from/UID**, where UID identifies the other user.

Lets assume the Websocket receives all triggered events from the server with the entire Redux-Style event we'll as its payload. 

![Embedding an event in a WebSocket frame](https://s3.amazonaws.com/www.deanius.com/socket-on-event.png)

Now, if it's an event we want, we'll trigger it onto the event bus. Here's that code:

```js
import { trigger, useEffectAtMount } from "polyrhythm";
import io from "socketio.client";

export const WebSocketService = ({ myID, url = "" }) => {
  useEffectAtMount(() => {
    const socket = io(url);

    socket.on("event", ({ type, payload }) => {
      if (type.startsWith("message/from/")) {
        trigger(type, payload); // <<------ Announce "you've got a chat"!
      }
    });

    return () => {
      socket.close();
    };
  });
};
```
At mount and unmount time we create and close the socket. `useEffectAtMount` is use a shorthand for `useEffect(fn, [])`. And like `useEffect`, it returns a cancellation function, similar to the Observable constructor from RxJS. It's just a win not to have to figure out what empty brackets means.

Then, upon those socket events we call `trigger` with that payload, and we're done. With those events on the event bus, there's no cost when nothing is listening for them, and we'll listen for them shortly. 

Now, in order to pass our local messages on to the socket - we must first `listen` for the **message/create** events in the `WebsocketService`.

## Step 2.2 - Tell them of our messages

`WebsocketService` is where our socket lives - so it should also be able to put our **message/create** events on the wire as **message/from/UID** where UID is populated from a local value we'll call `myId`.

Polyrhythm believes you shouldn't be coupled to a Framework for control over essential things. And listening to the event bus is one of those essential things. You can create a listener—a function which runs in response to matching events, and with a specified concurrency— outside of React, or even in Node— by using the `listen` function.

When you call `listen`, the object returned is an RxJS Subscription; it can be shut down just like any Subscribable via the `unsubscribe` method. The way this is implemented is that any event handlers which are in-flight at the time that the listener is shut down - should also be shut down. That's explored more soon, but for now, we'll create and properly shut down our message forwarder, and just call `socket.emit` for matching events.


```diff
- import { trigger, useEffectAtMount } from "polyrhythm";
+ import { trigger, useEffectAtMount, listen } from "polyrhythm";
import io from "socketio.client";

const WebSocketService = ({ myID }) => {
  useEffectAtMount(() => {
    const socket = new io(url);
	...
+    const forwarder = listen("message/create", ({ type, payload }) => {
+      socket.emit("event", { type: `message/from/${myID}`, payload });
+    });

    return () => {
+     forwarder.unsubscribe();
      socket.close();
    };
  });
};
```

## Step 3 — Display Messages

Now that we have components that are originators of **message/(from|create)** events, we'll create a new `ChatLog` component to be in charge of pulling those events' payloads into the `messages` field of state.

Let's use this as an excuse to use the React hook version of `listen`—`useListener`. Remember that when listeners are unsubscribed, any handlings that are in progress will be canceled? When you use `useListener` to perform side-effects, and wrap those side-effects in RxJS Observables, then when your component is unmounted, everything is cleaned up for you right down to the currently executing events! That makes for less leaking of resources - in fact it can be quite bulletproof - I've noticed my mocha watch modes are far more stable than ever while writing the test suite for polyrhythm.

So basically we have:

```js
import { useListener } from "polyrhythm";

export const ChatLog = () => {
  const [messages, setMessages] = useState([]);

  useListener(/message\/(from|create)/, (event) => {
    const message = event.payload;
    setMessages((all) => [...all, message]);
  });

  return (
    <div className="chat-log">
      {messages.map((message, i) => {
        return <ChatMessage key={i} {...message} />;
      })}
    </div>
  );
};
// const ChatMessage = () => <div>...</div>
```

We use `useListener` to maintain an array of `messages`.  You might wonder, would our listener hook be vulnerable to the React stale state problem, if it closed over the variable `messages`? It is not, and here's how it avoids that: It uses the functional form of `setMessages`, which each time passes us the accumulated messages in the variable `all`. That way `messages` is always up-to-date, and `setMessages` is a stable function reference. 

Having to worry about function-reference and variable-reference stability has been the least fun part of working in React for me. I've developed the patterns I'm advocating here in order to help others steer clear of the issues I've experienced that I believe to be inherited by the React framework, and not inherent to the task at hand.

Here is [a working version](https://codesandbox.io/s/poly-chat-imw2z) up to this part. In another post I'll describe what tests we'll have that actually verify what we've got is working, even though everything is as decoupled as it is. But moving on, we'll get into polyrhythm's real strength - timing control.

# Part 2 - The Typing Indicator ...


Code always gets more cluttered when you add new requirements, particularly ones that are async and whose behavior overlaps existing requirements.

When we add in typing functionality, our Event Grammar grows a bit. The new events are:

- **message/edit/me** When I edit a message, this event is created. A behavior causes it to go out over the wire as **message/edit/UID** where UID is my identifier. It should be sent initially right away, but no more often than once per second.
- **message/edit/UID** When I get this event from someone else, my typing indicator should get activated (it should auto-clear at 5 seconds, unless extended)

And this event has a new consequence:

- **message/from/UID** When I get a message from someone else, the typing indicator should be cleared. (Remember, this is only a 2-party conversation in this demo.)

Now, when adding functionality like the typing indicator, how great would it be if you could make this change, and future changes, with zero-to-minimal effects on other components? The magic of Event Driven Development is that, due to the Pub-Sub architecture, isolation and decoupling is built-in. Let's code it up: 

## Step 1 - Announce our Editing
The one change to an existing component we must make is to get our `MessageComposer`
to emit **message/edit/me**:

```diff
const MessageComposer = ({ pendingMessage }) => {

  const handleChange = (e) => {
    setPendingMessage(e.target.value);
+    trigger("message/edit/me")
  };

};
```

This component does no debouncing/throttling, nor should it. A `MessageComposer` should not need to know who wants to know that we have edited. This is the separation of concerns a Pub-Sub or Actor model can afford us, and it leads to highly flexible components that don't get more complicated as the number of listeners grows. 

## Step 2.1 — Forward our Editing (throttled)

Now in the `WebSocketService` we decide not to put every **message/edit/me** event on the wire, by throttling to 1000 msec, while remapping the message type to **message/edit/UID** which is the format other clients will expect.

But before you go reaching for your favorite `throttle` implementation, let me ask - are you sure of whether it's throttle or debounce? Or leading-edge/trailing-edge?

I could never remember those very well, so I broke things down into their basics. What we mean in this case is that for a second after sending a typing notification we should not send another. This can be broken down into two parts.

_Q: What is the task to be done in response to an event?_ 
A: Call `socket.emit` , then wait 1000msec

_Q: Does the task run again even if it is running already?_
A: Nope. The new task is ignored/not started if an existing task is running.

The first part is defined by what we return from the listener function. The `concat` operator from RxJS can combine any Observables, so we pass it a couple of Observables made by polyrhythm's `after` function. The first is the synchronous call to `socket.emit`, wrapped in an Observable with no delay. The next is the 1000 msec wait, which doesn't need a return value.

```js
import { after } from "polyrhythm";

const WebSocketService = ({ myID }) => {
  const typingForwarder = listen(
    "message/edit/me",
    () => concat(
      after(0, () => socket.emit("event", { type: `message/edit/${myID}` })),
      after(1000)
    ),
    { mode: "ignore" }
  );
  ...
  return () => {
	  typingForwarder.unsubscribe()
  }
};
```

The part about how the listener invocations are combined, is specified in the 3rd argument to `listen`. Any listener execution can be combined with any existing execution according to 1 of 5 modes. We choose the **ignore** mode, so if its' the second time within 1000 msec we see **message/edit/me**, we ignore sending the **message/edit/UID** event over the wire. See how easy it is to map this code onto the language of the requirements given to us:

> Upon editing, send the **message/edit** event right away, but don't send again for the 1000 msec following.

## Step 2.2 — Listen for Other's Edits

The other half of the typing messages will be that others will put their messages on the wire in a similarly throttled fashion, and we should have those events `trigger`-ed for us to respond to as well.

```diff
const WebSocketService = ({ myID }) => {
...
-    if (type.startsWith("message/from/") {
+    if (type.startsWith("message/from/") ||
+        type.startsWith("message/edit/")) {
        trigger(type, payload); 
      }
    });
```

## Step 3 — Show the Typing Indicator, With Auto-Hide

Lets add a component to `App` called `TypingIndicator` which will listen to these events, and show or hide the typing indicator under the chat log.

```diff
const App = () => {
    ...
    return <>
    <ChatLog messages={messages} />
+    <TypingIndicator/>
    <MessageComposer/>
    <WebsocketService />
    </>
}
```

You may think the TypingIndicator just has to listen for these **message/edit** events, but there are a lot of details. We need to turn off the typing indicator after some time if we haven't heard another **message/edit**. If we receive a **message/from** event then we should turn off the typing indicator.

In summary:

```
Typing Indicator
  Showing
    - Shows when other has typed
  Hiding
    - Hides when other hasn't typed in 5 seconds
    - Hides when other's message is received
```

For auto-hiding, we'll use a similar pattern of returning an Observable of what should happen. But the concurrency mode called **replace** (like the beloved RxJS `switchMap` ) will be the one we'll use.

We ask the same event-listener questions as before:

_Q: What is the task to be done in response to an event?_ 
A: Show the typing indicator, then hide it after 5000msec.

_Q: Does the task run again even if it is running already?_
A: Yep. The existing autoTimeout is canceled, and a new one is begun, effectively replacing the old timeout.

```js
import { concat, after, useListener } from 'polyrhythm'

const TypingIndicator = ({ timeout = 5000 }) => {
  const [ isTyping, setTyping ] = useState(false);

  const autoTimeoutTyper = () => concat(
    after(0, () => setTyping(true)),
    after(timeout, () => setTyping(false))
  )

  useListener(/message\/edit\/(?!me)/, autoTimeoutTyper, { mode: 'replace' });
  useListener(/message\/from/, () => setTyping(false)  )

  return isTyping && <div className="chat-message__typing"/>;
}
```

We return an Observable that is the `concat`-enation (aka sequencing) of an immediate Observable and a deferred one. Like before these are both created, using the `after` utility function which creates a synchronous or asynchronous Observable ([docs](https://github.com/deanius/polyrhythm/blob/main/src/utils.ts#L22)), depending on its first argument.

Each new triggering of the autoTimeout sequence due to an event matching **message/edit/UID** aborts the previous one, due to the line `{ mode: 'replace' }`. With this option, the listener behaves similarly to the RxJS `switchMap` operator, but in declarative form. 

With that, we have implemented all of our requirements and have a fully functioning chat app! [CodeSandbox here](https://codesandbox.io/s/poly-chat-imw2z).

## Event Graph

The thing that makes Event Driven Development different is its focus on cause-and-effect mappings. _"When this, do that"_ It's useful even before you know what your state will look like, because its closely aligned to your requirements and acceptance criteria, not the implementation of it.

See how the event graph - which we can produce even before writing a line of code — tells a lot about the architecture of the system, and can be used to vet requirements and acceptance criteria against.

![Event Grammar](https://s3.amazonaws.com/www.deanius.com/ChatUIEventGraph.png)

_BTW I highly recommend you check out the fine MermaidJS Live Editor, which allows you to produce event graphs like this with a very straightforward language ([view source](https://bit.ly/2DqSig0))_

# next() steps

Now you've seen how to build a really cool Chat UI that handled growing new async requirements without destabilizing existing components. It lowered boilerplate, used a concise API, and has very low coupling, while being immune to memoization and prop-drilling complexities.

I hope you've enjoyed learning about the event bus/polyrhythm coding style. If you've got any questions, ask me on twitter at [@deaniusdev](https://twitter.com/deaniusdev) 

Enjoy polyrhythm-ing your async 🎵🎶 !

Dean

PS If you'd like to use Redux Observable, Redux Saga, Mobx or another library that does similar things to this, then go right ahead. They inspired this library and I continue to learn a great deal from what they do. 



