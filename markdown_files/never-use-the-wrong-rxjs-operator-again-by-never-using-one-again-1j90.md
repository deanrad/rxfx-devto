---
title: From Events, to Observables, and to Events Again!
published: true
tags: rxjs, react, angular
cover_image: https://images.unsplash.com/photo-1449247709967-d4461a6a6103?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1951&q=80
---

I was reading the fine post [About SwitchMap and Friends](https://dev.to/rxjs/about-switchmap-and-friends-2jmm) by Jan-Niklas Wortmann. And this quote about switchMap reminded me how hard it is to understand Observables for beginners:

> A higher-order operator is handling an Observable of Observables.

Perfectly clear right? At least its not as bad as this one from the `switchMap` documentation itself:

> [switchMap] projects each source value to an Observable which is merged in the output Observable, emitting values only from the most recently projected Observable.

While all the descriptions of these and other RxJS operators are accurate, they fail to evoke a real feeling for _when_ and _why_ to use them. It is this reason that I made RxJS on-board-ability a central theme of my talk at RxJSLive 2019, and why I created the library [`polyrhythm`](https://github.com/deanius/polyrhythm) to help get common Reactive/Observable tasks done _more simply_.

Let's understand `switchMap` and it's workings from the standpoint of events and handlers.


---

# RxJS - noise = events

![search gif](https://p61.f2.n0.cdn.getcloudapp.com/items/Qwu0P495/Screen%20Recording%202020-09-22%20at%2002.28.58%20PM.gif?source=viewer&v=98630333c05bb55e294c442dbd85d2ef)

Searching — a search box with suggestions — is one of the most common uses for `switchMap`. You do an AJAX lookup on changes to the search input. Let's ignore debouncing for now, and say in non-technical language that you want to shutdown the old search (and its xhr) when the new one begins.

Here is `polyrhtyhm` code that makes the form run:

```js
<input id="search-text" onchange="trigger('search/change')">

function ajaxToResult$({ payload: { text }})) => {
    return ajax$(`search?q=${text}`).pipe(tap(searchResult => {
        updateUI(searchResult);
    });
}

listen('search/change', ajaxToResult$, { mode: 'replace' });
```

In response to DOM change events, we create events of type `search/change`, putting them onto an event bus with `trigger`. The function `ajaxToResult$` returns an async Observable of 1) the xhr 2) a call to the `updateUI` function which does something with the result. This function is the same kind of function you'd pass to `switchMap`, except that it is expecting an event with `type` and `payload` fields.

This function `ajaxToResult$` runs upon every event. But what if it's already running you ask? The mode 'replace' instructs the Listener to do what `switchMap` does, cancel the existing and start a new `ajaxToResult` Observable. The timing, and ultimate behavior is still as shown below, where you can see the "replace" occurring as the green-diamond-producer is replaced with a yellow diamond producer.

![](https://res.cloudinary.com/practicaldev/image/fetch/s--zyDfK4i3--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://raw.githubusercontent.com/rxjs-blog/blog/master/blog-posts/about-switchmap-and-friends/assets/switchMap-marble-diagram.jpg)

# Observables - Same, Just Different

With an Observable-only implementation, the same pieces are there, but in a different combination.

First you have your search-change events as part of an Observable. Then you'll create the "outer" Observable, `switchMap`ing to ajaxResults. Then you call subscribe.

```js
const searchChange$ = fromEvent(searchText, "change");
const outer$ = searchChange$.pipe(switchMap(ajaxToResult$));
outer$.subscribe();
// TODO what's a better name for outer$ here?
```

This code works, but I don't like a few things about its readability.

The concurrency operator is buried within a chain of code. And I don't like having to create, and thus name, and subscribe to the outer observable. Search changes and searches themselves being merged in one object feels like unnecessary coupling.

The polyrhtyhm version will pass the same unit tests, and run just as fast. Why impose a high burden of readability if you don't have to?

## Triggerable

The great thing about listeners is they don't care from where their events come—this is a major form of decoupling.

Suppose I had my `searchChange$` in an Observable already - I could fire them off as named events:

```js
searchChange$.subscribe(({ target }) =>
  trigger("search/change", { text: target.value })
);
```

And my listener would run the same. The listener is not tied up with the triggerer (the event producer).
Named events of your own design are the glue that hold your app together, not brittle coupling of JS objects, or reliance on any particular framework.

# Decoupling, Separation of concerns

How many times have you changed an RxJS operator because you didn't choose the correct one on the first try? It happens to us all! Wouldn't it be nice if it were a) easier to change to the new one and b) more readable once you've changed it. No more sending your colleagues and yourself to the RxJS documentation when you can't remember if `switchMap` or `exhaustMap` is the one which replaces the old ajax. The word "replace" should be sufficient, hidden behind whatever constant you like, or chosen from the TypeScript enum.

Listeners are the logical unit to apply concurrency, and keep themselves decoupled from the Observable of triggering events. With polyrhythm you don't ever have an Observable of Observables, you have events and listeners. And it _just works_, and scales up to rather large apps with webs of dozens of events and listeners. It's in production, and tested, so use it if it makes sense for your team.

# Conclusion

Using RxJS with its operators directly is not wrong, but if you can have clearer code by shredding outer Observables into events, and putting Listeners in charge of result mapping, then you're on easy street! Yes, I made that sentence sound ridiculous on purpose - but now, you understand it - AND the sentences I first mentioned above ;)

Dean

---
If you're still reading, these supplemental diagrams will help explain:


### Async Is Just Math 🤓 (Combinatorics!)

I believe the concurrency modes offered by RxJS operators are a subset of a universal concept. Its as though inside of `switchMap` lives a reducer looking like this.

```js
(oldSubscription, newObservable$) => {
  oldSubscription.unsubscribe();
  return newObservable$.subscribe();
};
```

And each operator has a similar thing inside. Because there are 4 total combinations of whether you're "ending the old" or "starting the new", there are 4 RxJS operators, right? (_Quiz: can you name them?_)

Actually there are 5 possibilities shown below, and RxJS covers 4 of them.

![async matrix rxjs](https://p61.f2.n0.cdn.getcloudapp.com/items/bLuwyrDN/Image%202020-10-29%20at%209.23.18%20AM.png?source=viewer&v=4f83f473f14ee9dd31fe04b2f5996b48)

So of course I wrote and exported an operator from polyrhythm to fill this hole, called [`toggleMap`](https://github.com/deanius/polyrhythm/blob/main/src/toggleMap.ts). Not so much due to overwhelming demand, as for my own OCD for symmetry :)

![async matrix](https://p61.f2.n0.cdn.getcloudapp.com/items/rRuomvXB/Image%202020-10-29%20at%209.22.48%20AM.png?source=viewer&v=87acf238d876dceb018e3c2a8b84112c)

### Async is Musical

If Observables were audio, their overlap would look like this:

![Polyrhythm Concurrency Modes](https://s3.amazonaws.com/www.deanius.com/ConcurModes2.png)

When building UI, I find that 80% of user expectations can be fulfilled just by choosing the correct mode (another 10% with some debouncing thrown in there).

So Im happy to use Observables, and refer to these concurrency modes/operators by their Polyrhythm names, instead of their RxJS names. I'm happy for RxJS for having brought them to my attention, but I no longer thrill to see their names in my codebase.

