---
title: The 5 Possible Concurrency Modes of JavaScript
published: true
description: Simplifying async JavaScript with Combinatorics
tags: rxjs async
---

Async is hard, they say. But that's only true if you don't have a complete set of tools for dealing with it. The 5 concurrency strategies: `parallel`, `serial`, `cutoff`, `mute` and `toggle` are all of the 5 fundamental ways you can do concurrency in JS, and they can all be easily understood if you personify them. Let's learn the theory, and in another post I'll go over how to apply it.

---

We all know somebody who's insanely productive. If you want it done - you ask them. People like this always have multiple things going on at once. But any time a new thing comes in, there are basically 5 ways they can respond. What do you think the most productive people do - start everything the moment it comes in? Like everything- it depends. But let's understand the relative strengths of each strategy in isolation, so we can make better choices.

# The Characters and their Styles 

Bruce Banner - Bruce Banner (aka the Hulk) is a person whose focus is extremely fragile. If he's doing something, and you interrupt him to ask him to do another thing, you're likely to have thrown him off for the rest of the day. And maybe he's thrown you off (a roof) as well. To work well with Bruce, you'd better know better than to interrupt him.

Superman - Superman might be in the middle of rescuing a bus of kids going over a waterfall, and notice an old lady about to slip on the ice - he'll carry the bus over to the old lady and save her too! He's not about to let anything slip, nor interrupt a rescue to start another one. If we all could be like Superman - but alas, we're not.

Thor - If Thor is busy doing something, and you ask him to do another thing, it's not that he's ignoring you - he just doesn't hear you! His mind doesn't work that way - it's pretty inherently Single Track.

Wonder Woman - Wonder Woman was once fighting off an invasion from another planet, when her cellphone (from her cover life as a museum curator) got a text that a new artifact was available for her to pick up and catalog. No sweat- she just continued to drive the aliens away, and vowed to get to the catalog-ing work once she'd finished and changed back into her civilian clothes.

Iron Man - Tony Stark is driven by novelty. He's so into chasing the next big thing that if he was working on a rocket for Mars, and you mentioned how long it took for you to get between two cities, he'd start working on as HyperLoop right away.


# The Character's Styles Decoded

Now, as fun as those descriptions are, they correspond to the 5 primary concurrency strategies you can implement in JavaScript.

Superman is the `parallel` mode - Work starts ASAP, continues in parallel with other jobs, and assumes (and requires) a pretty unbounded set of system resources.  (RxJS' mergeMap)

Wonder Woman is the `serial` mode - Work will get done just as soon as the current work is done. A queue is needed to hold the next tasks, and only 1 job is in progress at any given time. (RxJS' concatMap)

Iron Man/Stark is the `cutoff` mode - Work that is interesting replaces existing work. Still, only 1 job is in progress at any given time. (RxJS' switchMap)

Thor is the `mute` mode - The sound of incoming work is `mute`d to him while he's busy. Of course, only 1 job is in progress at any given time. (RxJS' exhaustMap)

Hulk is the `toggle` mode - New requests toggle other requests off. At most 1 job is in progress at any given time. (RxHelper's toggleMap)

# Choosing a Mode in Code

Here are some typical web development Patterns where one or the other of these modes works best:

* An Autocompleter like Google Search - Here you want a `cutoff` strategy when it comes to fetching results. New searches should cut off previous searches to keep the system working on the most latest search. 

* Like Buttons- These probably should be processed in `parallel`, as long as the system can handle multiple connections, or pipeline them under the covers.

* A Downloader - It makes sense to download files one after the other in queued `serial` mode, like adding songs to a Jukebox's playlist.

* A Form Submit - It may make sense to prevent a double form submission with a `mute` strategy for clicks after the first.

* A Light Switch - A light switch, rather than keeping track of its own state in a field outside its button-event stream, can just apply the `turnOn` function in `toggle` mode. 

# Enabling Flexibility

Returning objects in code which represent cancelable, unstarted processes is the key to enabling this. This is why a system that allows for plugging in these strategies must be based on Observables. Only Observables, not Promises, are cancelable (for `cutoff` and `toggle`), and unstarted (for `serial`).


# Play with it

There are several [Code Sandboxes for the Rx-Helper library](https://codesandbox.io/search?query=&page=1&configure%5BhitsPerPage%5D=12&refinementList%5Bnpm_dependencies.dependency%5D%5B0%5D=rx-helper) which illustrate these and other patterns that are possible with it.

Let me know if this helps clear things up! In a future post- the proof that these 5 modes are a complete set of tools for solving problems up the first 3 orders of difficulty, and that more complicated solutions are simply recombinations of these basic elements.