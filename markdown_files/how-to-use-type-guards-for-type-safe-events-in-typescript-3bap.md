---
title: How to Use Type Guards for Type-Safe Events in TypeScript
published: true
description: Learn how type guards/predicates work in TypeScript in general, then apply it to the Omnibus event bus library
tags: events, typescript, redux, FSA
cover_image: https://images.unsplash.com/photo-1523286853180-6cc0906b101d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80
---

Filtering a large set down to an interesting subset is one of the most common things we do in computing - it saves users time! In TodoMVC, for example, the set of active todos is a subset of all TODOs.

However, In TypeScript, when the subset is of a more specific type, it's not automatic that the subset is of the narrowed type. A particular example we will show in this post: when an event bus is known to have Flux Standard Actions, and we have listeners registered for certain actions, we want type-safety within those listeners! Let's see how type guards/predicates work in TypeScript in general, then apply it to the Omnibus event bus library.

## TypeScript Docs Zoo Example
Let's take an example from the TypeScript docs to get started.
In this example, to get an array of `Fish` out of an array of multiple animals, we have a filter function `isFish` that can create the subset.

```ts
const zoo: (Fish | Bird)[] = [...];
const fishes: Fish[] = zoo.filter(isFish) as Fish[];
```

See that `as Fish[]` at the end? That's what we had to add to get type safety on the filtered array of fish. This explicit cast of type is necessary if the implementation of the `isFish` function returns only a boolean. But there's a way to tell TypeScript that we'll only return true from `isFish` for objects which are of type `Fish`.  The way we do that is with a "type predicate", or "user-defined typeguard" ([docs](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)). Here's how it looks with a type guard:

```ts
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
const fishes: Fish[] = zoo.filter(isFish)
```
When the return type of `isFish` is `pet is Fish`, we get type-safety on the array of fish - and anywhere else we'd use this predicate! This type of implicit typing is better for reading and maintaining the code, and many functions exported by libraries will do this for you..

---
## An Event Bus of Flux Standard Actions
Now how does this apply to an Event Bus? An event bus is similar to an Array, over time. Our particular event bus [Omnibus]() is a wrapper around an RxJS Subject, with a slightly different API. You `trigger` and `listen` rather than `next` and `subscribe`. One excellent use of an Event Bus is to replace Redux middleware, like Redux Saga or Redux-Observable. A bus may carry any type, but for now let's assume it's duck-typing Redux, carrying only Flux Standard Actions. 

Our scenario will use the bus for a typeahead search - like for querying an AJAX endpoint. Our bus will have a listener for `Action<SearchRequest>`, and the listener will trigger actions of type `Action<SearchResult>` back onto the bus. Our search may return many values  - one `SearchRequest` potentially triggering many `SearchResult` actions.  With explicit typing:

```ts
interface SearchRequest { query: string }
interface SearchResult { result: string }

const bus = new Omnibus<Action<any>>();

bus.listen<Action<SearchRequest>, Action<SearchResult>>(
   (action) => (action.type === 'search/request'),
   ({ payload }) => { /* TODO use payload.query */
```
In the predicate function we know only that we have an `Action<any>` - so that it can test any bus item. The listener is explicitly typed so it knows it has a `SearchRequest`

To continue started we'll need an endpoint. To work with Omnibus, it will return an Observable of `SearchResult` from a query `string`.

```ts
import { from } from 'rxjs';
const searchEndpoint : Observable<SearchResult> = (query: string) => from([
  {result: 'abba'},
  {result: 'apple'}
]);
```

We'll also be packaging results into Flux Standard Actions with the `typescript-fsa` library, so let's use action creators for those types:

```ts
const searchAction = actionCreatorFactory('search');
const searchRequestCreator = searchAction<SearchRequest>('request');
const resultCreator = searchAction<SearchResult>('result');
```

These give us ways to create, and detect actions with a specified type. So let's wire them up.

## Event Bus Types - Part 2
Now, can we use implicit typing like the Fish/Zoo example above? We want the listener to know what type its action is, so that TypeScript can know that a `query` property will be its event's payload. In other words, we'd like the type of the handler's argument to be narrowed by the predicate. What must the signature of `listen` be to allow this? 

We could try an explicit SubType type parameter:

```ts
public listen<SubType extends TBusItem>(
  predicate: (item: TBusItem) => boolean,
  handler: (item: SubType) => { ... }
```

But that would make us specify the SubType explicitly—it would not take advantage of type guards. Can it be more like our `isFish` function? One little change, and the answer is yes. Here's the type-guarded version:

```ts
public listen<TMatchType extends TBusItem = TBusItem>(
  predicate: (i: TBusItem) => i is TMatchType,
  handler: (i: TMatchType) => { /* ... */ }
```
It allows for implicit typing by defaulting the `TMatchType` to the supertype of all bus items. Yet, if a predicate narrows the type, our handler will act as if its argument of that narrowed type.

How do we put it all together? Thankfully, the `.match` function on  `searchRequestCreator` provides a type predicate, not just a boolean return value! So when we plug it in, all the stars align:

```ts
bus.listen(
  searchRequestCreator.match,
  (({ payload: { query } }) =>   // we have .query!
     searchEndpoint(query).pipe(
       tap(result => {
         bus.trigger(resultCreator(result))
       )
     )
)
```

We have a type-safe action in our listener now! I don't believe we need to type the return value of the listener - the bus will accept anything that is an `Action<any>`, so we could even return action of many types. But if we wanted to we could specify `listen<SearchResult>` just to ensure we don't introduce an action we weren't expecting..

---

## Wrap Up

Applications like Event Buses and Array filtering often cause you to lose some or all of type-safety. But with type predicates / type guards, it doesn't have to be this way. Enjoy stronger and more implicit typing by using them. And remember, explicit types are more expensive to write and maintain, so you can use the lint rule `no-inferrable-types` ([link](https://palantir.github.io/tslint/rules/no-inferrable-types/)), and further take extra syntax/noise out of your way!

---
References
https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates