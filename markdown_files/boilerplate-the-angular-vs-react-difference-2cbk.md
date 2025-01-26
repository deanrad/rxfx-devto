---
title: Boilerplate - the Angular vs React difference
published: true
description: 
tags: React, Angular, FP
//cover_image: https://direct_url_to_image.jpg
---

In React - a component is a function that returns a DOM tree (possibly by calling other component-functions). To test the function, you call it with different arguments, and assert different results.

In Angular, a component is a class, with a decorator and a corresponding module, which must be registered by some other component's module, and whose dependencies are injected via a constructor (whew - say that twice!) It's a class, but you never call new yourself on the component in prod code or tests. To test an Angular component involves setting up mock providers, repeating some of the registration of imports/declarations etc so that the test environment (or Storybook) satisfies all the same things the prod code has.

The difference is the amount of boilerplate.

Boilerplate/configuration is not code you step through, or write 'from the head' or test-drive - it's stuff you trial-and-error your way through, with manuals and examples. A part of every coders job, yes, but hopefully a decreasing amount over time. Boilerplate gives you a low BizCode-to-FrameworkCode ratio, and leaves BizCode coupled tightly to the framework. I wrote some Angular tests where I manually new-ed up a component. They didn't get me very far.

I think this difference is why React is eating the world - the mental model is simple enough yet composes arbitrarily, and you can do amazing things with it. There are fewer concepts to wire together in tests and code to simply get the return value of a function merged into the DOM. I'm not crapping on Angular or those who like it - it's powerful and opinionated. But newer frameworks (React, Vue, Svelte) area generally simpler, and that's a trend that won't likely reverse, imho. So let's hop the next bus out of boilerplate-town - we won't miss it.