---
title: "Building the 7GUIs with GitHub Copilot"
published: true
description: "Exploring the capabilities of GitHub Copilot in building UI applications"
tags: [Copilot, AI, Angular, React]
cover_image: "https://images.unsplash.com/photo-1684369175809-f9642140a1bd?q=80&w=2484&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
---

Unless you've been hiding under a rock, you know that 2023 has been quite a year for AI and programming. And Github Copilot is perhaps the biggest way programmers are using AI to supplement their work. But can AI replace the work of programming? 

I think we should put Github Copilot - end of 2023 version - up to some tasks relevant to the modern UI/UX developer. Someone like yourself who might be using React to code front-ends to web applications, and wondering - can AI do my job? Will it take my job? I have a plan to answer that question - at least in 2023 terms.

There are a set of UI programming benchmarks named the 7 GUIs [(link)](https://eugenkiss.github.io/7guis/). 7 apps whose specifications range from the simple — a counter — to the complex — a spreadsheet. 7 quests designed to test the mettle of any developer— or AI. If we ask Github Copilot to build each of these 7 GUIs of increasing complexity — how far will it get? Can it do it all for us, from the UI to the logic, or is it useful more for one part of the app than another?

In order to make these solutions understandable to the widest audience of developers, I'll specify that these must be built in React, with hooks, not classes. I'll avoid requiring TypeScript types, but evaulate whether the code was written with correct types, if any. I'll include the prompts that I use.

A few disclaimers, for context: I am an English-speaking senior developer with over 20 years experience. I have built all the 7 GUIs in React before. But, I have been working with automated code generators like GitHub Copilot for only about a month. And I want to try, at least at first, getting it all done with standard English prompts that presume nothing about the target solution. I will not try my Spanish out in this series of posts, but I may in a future series, recognizing the global impact of AI across the diverse developer community. And finally I care about maintainability of software. I'll have a robot build my car, but I want the human mechanic to be able to get at the parts to replace them. And I want a certain aesthetic beauty when I look under the hood :)

Lastly, as part of the evaluation, I come with reference solutions to which I will compare the AI solutions. These reference solutions use my libraries `@rxfx/bus` and `@rxfx/service` [on Github here](https://github.com/deanrad/rxfx). So this might become a commercial for those libraries, if the translation of natural language prompts to code goes smoother with RxFx than with Copilot. 

With that said, I think we're ready to begin! ❤️ or comment on this post if you are willing to partake in this experiment with me, or have any ideas for how I could tailor it to what you are interested in learning.

See you in the ring, AI!

— Dean Radcliffe

The 7 GUIs:

- [Counter](https://eugenkiss.github.io/7guis/tasks#counter)
- [Temperature Converter](https://eugenkiss.github.io/7guis/tasks#temp)
- [Flight Booker](https://eugenkiss.github.io/7guis/tasks#flight)
- [Timer](https://eugenkiss.github.io/7guis/tasks#timer)
- [CRUD](https://eugenkiss.github.io/7guis/tasks#crud)
- [Circle Drawer](https://eugenkiss.github.io/7guis/tasks#circle)
- [Cells](https://eugenkiss.github.io/7guis/tasks#cells)

