---
title: How to Read JSX as "Just Objects"
published: true
description: 
tags: React, JSX, VDom, Svelte
---

# How to See Through JSX in React

Most devs who know React, also learn of its relationship to JSX, and decide that the most idiomatic React is to render a list of items as shown:

```jsx
render() {
<ul>
  { languages.map(item => (
    <li>{item}</li>
  )) }
</ul>
}
```

If the syntax highlighting seems broken, that's exactly my point - there's a lot going on here! And whenever there's a lot going on, computers (but mostly humans) will get stuff wrong. In the 6 lines of our component, rendering 2 node types, we change syntaxes from JS to JSX, and back, 8 times! Count them - it's like `JS(JSX(JS(JSX(JS))))`! This is **not** the simplest code we can write. And simpler is usually better; in terms of ability to read and be maintained, simpler is less expensive in time and money over the code's lifetime. Let's see how we can write more simply - and if it's not idiomatic, let's consider changing the idiom to be simpler.

# Simplify!
But, let's first format this into proper component, so we can see just what we have going on, and understand how to get simpler:

```jsx
const List = ({ items }) => (
  <ul>
    {items.map(item => (
      <li>{item}</li>
    ))}
  </ul>
);
```

Instead of explaining line by line, I want to show what this returns as a text representation of the tree of objects this component returns.

```
ul
 ├── li (item)
 └── li (item)
```

Recall that the magic of JSX, React's 'language' for describing UI, is that it takes the component code you write and turns it into a chain of `createElement` calls. Let's abbreviate the function named `React.createElement` to simply `vdom` (because it returns Virtual-DOM objects).

```js
// <li>item</li> becomes =>

vdom('li', {}, item);
```

The first parameter represents the name of the element, the empty object represents any attributes, such as `title="item-one"` that may be on the item, and the final is the content, or an array of content. And these can nest! So we can write our component:

```js
const List = ({ items }) => {
  const listItems = items.map(item => vdom('li', {}, item));
  return vdom('ul', {}, listItems);
};
```

How does the above example look to you? The number of context-switches your brain must make is reduced to zero. Much simpler. But the shape of the code doesn't resemble the markup any more. What about this:

```js
const List = ({ items }) => 
  vdom(
    'ul',
    {},
    items.map(item => vdom('li', {}, item))
  );
};
```

Just as simple, and without the arbitrary variable name - a more functional style.

# How do you want it?

I'm very curious for your thoughts - which syntax is most intuitive for you? At the end of the day - React is all just objects, built-up in JavaScript. The fact that those objects get rendered to HTML with angle-bracket tags is truly an implementation detail. Its worth reminding yourself, especially as you learn, that React does not 'render HTML' or even know about HTML - it just returns objects. It's the React-DOM library's job to compare those objects to the real DOM and surgically alter it. This gives you the twin benefits of a declarative UI, and the speed advantages of selective DOM replacement that has made React so popular to begin with.

Ultimately, I think teams can choose a style and stick with it, and usually JSX will be that style. But I also think simpler solutions can be better, and when the idiom excludes them, perhaps we should consider broadening what we call Idiomatic React.
