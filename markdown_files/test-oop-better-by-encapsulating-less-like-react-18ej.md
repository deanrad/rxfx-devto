---
title: Lower The Pain of Mocking in Tests, the React Way
published: true
tags: React, Storybook, Testing, OOP
---

Have you ever wondered, when you search for a domain name to possibly buy from a site like GoDaddy, if one of their admins is looking at a page of recent searches, to see if they want to buy a domain you searched for out from under you? Maybe I'm paranoid, but I totally picture them looking at page like this:

| Last Search | Domain Name    | # Searches | Still Available (Ajax) |
| ----------- | -------------- | ---------- | ---------------------- |
| 1/1/2019    | unicorn.com    | 1000       | 🚫                     |
| 1/1/2019    | unicornius.com | 2          | ✅                     |
| 1/2/2019    | unicorny.com   | 200        | ✅                     |

Our goal is going to be to examine a couple of different ways of building the component that represents a row in this table, and see how the solutions compare in terms of testability. As a result, we'll be able to choose the right style for the job, and possibly end up with better designs.

To make it interesting, let's

- Write in pure JavaScript (no frameworks)
- Make the population of the "Still Available" field available only via an async function named `lookup`
- Worry about updating a view later - simply focus on the state management of the object.

A reasonable OO practitioner might write code like this:

```js
class DomainSearchInfo {
  constructor(lastSearchDate, domain, searchCount) {
    this.lastSearchDate = lastSearchDate;
    this.domain = domain;
    this.searchCount = searchCount;
    this.stillAvailable = null; // unknown, initially

    this.checkAvailability();
  }
  checkAvailability() {
    this.lookup(this.domain).then(({ isAvailable }) => {
      this.stillAvailable = isAvailable;
    });
  }
  lookup(domain) {
    return axios.get('http://someurl.com?domain=' + domain);
  }
  // rendering omitted
}
```

But they'd run into trouble when trying to test.

## Are You Mocking Me?

They'd have questions like _How Do I mock "axios.get"_, and start spending time digging through mocking library documentation (time we've all spent, but does it ever feel productive?). When they finally finish their mock implementation, it turns out that there's a problem in the way they expected certain arguments, and they need to tweak the mock. Some advocates in the field like Eric Elliott say that [mocking is a smell](https://medium.com/javascript-scene/mocking-is-a-code-smell-944a70c90a6a). Is there something we can do to lower the pain of mocking?

Let's see how a React [functional component](https://www.robinwieruch.de/react-function-component/) might do the same thing, with lower mocking pain:

```js
const DomainSearchInfo = ({
  lastSearchDate,
  domain,
  searchCount,
  // default to this implementation of lookup
  lookup = domain => axios.get(...)
}) => {
  const [isAvailable, setAvailable] = useState(null);

  // useEffect hook omitted
  lookup(domain).then(({ isAvailable }) => {
    setAvailable(isAvailable);
  });

  // rendering omitted
};
```

The main difference is that in React, the component doesn't encapsulate completely around the `lookup` method. It provides a default implementation but allows its environment to override it. Like Michael Weststrate says in [UI As An Afterthought](https://medium.com/@mweststrate/ui-as-an-afterthought-26e5d2bb24d6), your code always runs in at least two environments - your production app, and your test suite. The React code is inherently testable without mocks because it allows you to inject whatever implementation of lookup you want. Like any of the following:

```js
const delayedAvailabilityCheck = (isAvailable, delay) =>
  new Promise(resolve => {
    setTimeout(() => resolve({ isAvailable }), delay);
  });

// Instant pass/fail
const immediateAvailabilityCheck = isAvailable => {
  return Promise.resolve({ isAvailable });
};

// Typical
const shortDelayCheck = isAvailable =>
  delayedAvailabilityCheck(isAvailable, 200);

// Slow connection
const longDelayCheck = isAvailable =>
  delayedAvailabilityCheck(isAvailable, 5000);
```

Did I say, inject a function? As in dependency injection? Yes, but the lightweight kind, not the Angular, or Spring kind. The easy, functional-programming concept that a component can receive both functions AND data as arguments. This is something you are free to do in OOP - it just bears repeating because it is not typical. But, if it's useful, you should do it.

Now, dependency injection is nothing new to React developers. What's new though is assessing its impact on testing, and in particular a kind of visual testing in a tool called Storybook.

## A Story of Storybook

One of the reasons I re-discovered this pattern of injecting function props, was to bring more life to the stories my team was writing in Storybook. Storybook (https://storybook.js.org) is for your visual designs what unit tests are for your logic. You use it to lay out, and make stylable all of the visual states of your application - no clicking around required - just jump right to the state:

And one thing that's often an after-thought when dealing with async code is that your loading states need to be designed every bit as much as every other state. We just tend not to see these states too often on our fast development computers with local network connections!

If we make our DomainNameInfo component in Storybook, how cool would it be if we were able to control the speed of resolution of the availability lookup, and have a story for each speed?

It would look like this:

![](https://cl.ly/54c86393ba69/Screen%252520Recording%2525202019-06-26%252520at%25252004.35%252520PM.gif)

I implemented this recently for my team, and we were able to pin down the exact UI look and feel, even with varied timing scenarios.

_Bonus:_ If you want to test a component that actually receives multiple events, or props over time, and are familiar with RxJS, I can show you a wrapper component that lets you control a Storybook story with an Observable of props! But that might have to wait till another blog post :)

# Summary: Pass In Functions ⇒ Resolve Your Testing Woes

In short, the common OOP practice of coding function implementations directly into components has a cost - the cost of needing to use mocking tools vs regular programming techniques to set up states for testing. In contrast, the practice of Dependency Injection, in its basic form of passing functions into components, keeps things testable, and visualizable in tools like Storybook. This allows you to code for, and verify all the possibilities your users **will** encounter. As a bonus, by having an easy way (compared to mocking) to set up different scenarios, you'll be more inclined to try different ones than if writing each one were painful. Hey, maybe you'll even write a case for when the Domain Name Lookup fails!

Maybe nobody is truly out there spying on your domain name lookups. But with time-saving tips like these, maybe you can roll your own, well-tested one, in even less time. I won't mock you if you try.
