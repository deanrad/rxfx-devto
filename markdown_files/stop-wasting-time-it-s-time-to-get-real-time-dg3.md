---
title: Stop Wasting Time, It's Time to Get Real-Time
published: true
description: How to use Real-Time Web Technology to Decrease Digital Distance
tags: rxjs, socketio, react, javascript
---


## Awaiting A Service
Sunday March 15 2020, the first Sunday after the Coronavirus Pandemic really exploded in the US, my church hosted its first online service. The instructions for us were to "Join our livestream on our Facebook Page". Sounds like clear instructions, right? Then - why do you think the livestream, which displays a count of watchers, didn't reach its full count of 180+ until a few minutes after the service began? I estimate over 100 minutes of participation were lost due to a technical choice that is all too easy to make. (For the fix to this, read about [Youtube Livestreams](https://support.google.com/youtube/answer/2853700?hl=en)).

But before I get into solutions, I want to say that the subject I'm talking about, while technical, is of **uber-importance** for everyone to pay attention to, but especially developers. Developers, the skillset you've been taught is **not** the one you'll need to solve the problem that caused these digital delays. We can't seem to stop introducing digital latencies, as long as the current canon of Web Developer skills leads invariably to wasted user time. And wasted time, in a time of crisis - can cost lives. We need to build platforms that are fully reactive - fully realtime, and not stuck in the document-oriented mindset the web was created with.

## Transferring Docs or Serving Apps?

It's helpful to have some historical background as to why the web is such a latency-burdened platform. HTTP, the computer protocol which we are using when we surf the web, was made originally just to deliver documents. A document is just a page, or data, which you have to re-request every time. A Realtime Service (not a traditional REST service) is one which brings content to the user without them needing to ask, providing them, well, a service! "Your Uber has arrived" is not a message you want to receive minutes late, and you don't want the ride to leave because you forgot to click refresh. Uber is built as a service. I don't have to sell you on the success of that business model, which real-time critically enabled. 

Sometimes we're so trapped in this document mindset that we don't see that we're making a poorer choice - as my church did. They gave a link to their facebook page, which exists to give real-time updates on itself, but not to show any livestreams it contained! Had they sent out instead a link directly to the livestream, it'd have opened automatically for everyone. A church-service-service you could say! Then there'd be nobody doing what i did - being glued to my screen so I could click that link ASAP, or being left behind a minute or two because they were getting a cup of coffee, and missed critical news on the Coronavirus.

## Video Conferencing
Use of live-streaming URLs is one way you can Stop Wasting Time. Another trick exists if you create online meetings, and want attendees to be able to converse even if you're late and haven't started it. Choose the wrong option and your guests will see this screen, and not be able to talk to each other.
 
![](https://assets.zoom.us/images/en-us/desktop/generic/wait-for-host-to-start-meeting.png)

The feature to use is called Join Before Host, and it's not enabled by default, so you should turn it on in your settings and unlock many more minutes of collaboration-time instantly. Read more on it in [Zoom's knowledge base](https://support.zoom.us/hc/en-us/articles/202828525-Join-Before-Host)

## Developer Tools For Getting Real (time)

Specifically for web developers, below is an *incomplete* list (please let me what I'm missing and I'll add it) of technology that can be used to build real-time apps. 

- [ActionCable (Rails)](https://guides.rubyonrails.org/action_cable_overview.html)
- [Amazon SNS](https://aws.amazon.com/sns/?whats-new-cards.sort-by=item.additionalFields.postDateTime&whats-new-cards.sort-order=desc)
- [Feathers JS](https://feathersjs.com/)
- [GraphQL](https://github.com/apollographql/graphql-subscriptions)
- [MeteorJS](https://www.meteor.com/)
- [Phoenix (Elixir)](https://www.phoenixframework.org/)
- [RxJS]([https://rxjs.dev/](https://rxjs.dev/))
- [Socket.IO](https://rxjs.dev/)

If some of these are unfamiliar to you, I assure you they're not out of reach. The mindset that is most useful for working with these tools is one where events go in both directions. A more equal protocol where the server OR the client may have something to say at any time. A protocol of events, not a protocol of documents. If your server won't be able to stream results right away, you can simulate real-time with polling that notifies upon any changes.

You don't have to change everything you do overnight to get real-time - Github added SocketIO into their REST app after years of not having it. Try and make a habit of asking yourself and your team what you can do to bring down unnecessary digital distance. Think of all the tools you depend upon for notifications, and ask whether what you're building for customers is as usable as you require. In these days of increased physical distance, I'm thinking decreased digital distance might be just what the doctor ordered.

Dean [@deaniusol](twitter.com/deaniusol)