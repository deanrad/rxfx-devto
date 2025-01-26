---
title: What I've Learned Contributing to Open Source Software (OSS)
published: true
description: If you're trying to get an idea of what contributing to Open Source might be like for you..
tags: oss, first pr, pull request, github
---

![](https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2100&q=80)

It was the Ruby community that first got me excited about Open Source. Ruby was free and open, Matz was a likable and intelligent role model, and it wasn't too long before I wondered if I could give back to the community like Matz, Wayne Seguin, Aaron Patterson, and others. 

Today I have a much more realistic view of the enterprise of free software than I've had before. And the biggest lesson I can share is probably as true of your job as much as in Open Source:

> Your Contribution is not limited to your Code.

So now that you have the TL;DR, the tweetable phrase, let me share the my Open Source attempts that I learned the most from. If you're trying to get an idea of what it might be like for you, check out a guide like [First Timers Only](https://www.firsttimersonly.com), or read on.

## 2012 - Ruby - Chronic 

As I played with new Ruby libraries, I would often find something they didn't do that seemed natural to me, but they didn't handle. Chronic, the library that turns DateTime values like `-0.1250` into the text "3 hours ago" was surpemely useful, but the first thing I tried did not work. Maybe not everyone wanted "quarter till one" to parse into 0.55, but I did! _"Could this be my first PR?"_, I thought.

My PR was accepted on its first attempt. How did I do it? I looked for issues matching mine first, before writing code. I found other PRs that were like mine, and copied them. I added code, tests, and docs to match other PRs. It was a quick turn around. 

It was a small change, but it felt exhilarating to know thousands of users would get this code. It made the whole community feel less distant. It was small, but that was enough—it was only the beginning.

__Lesson:__ Stay within the project style. No change is too small if it's done well.  [Link to Commit](https://github.com/mojombo/chronic/commit/c3b311cf68c2b0642121b2fefffbf357abef014d)


## 2012 - Scheme - Lilypond

Lilypond is a music software, written in Scheme, and a custom markup language, that can turn plain text into MIDI, staff notation and chord charts. Music is like a second language to me, and particularly music that swings, like blues and jazz. But Lilypond lacked a feature to take uniformly spaced notes like `1 & 2 & 3 4 &` and play them with a shuffle like `1  &2  &3 &4  &`. 

I had never written Scheme, and it was __hard__ to do so! But I tried and tried, until I had something that kinda worked—for my limited use case. But in the time that I was struggling, people took my use case, and wanted to expand it. "But Brazilian samba", "But the Viennese Waltz" the comments poured in. How could I code all those variations when I could barely transform 50% to 66% in a language with so many parentheses?! 

At first I was disappointed that my code got relegated to a user-downloadable plugin, and not part of Lilypond core. But I was mistaken not to see what happened. People piled their expertise and ideas into a feature _I_ wanted, to make it far better than I could have expected. My name is still mentioned in the comment threads, though none of my amateurish Scheme code made the cut.

__Lesson:__ Starting a discussion is often enough. If someone else can take your idea and run with it (and do it better), be glad! You can learn alot for the price of your ego. [Link to thread](http://git.savannah.gnu.org/gitweb/?p=lilypond.git;a=commit;h=464cf0d8111976c63fe778f358ddbe28bce532a8)


## 2016 - JavaScript - Scripty

Well into the JavaScript renaissance, the fabulous Justin Searls came up with a solution to ugly, long scripts appearing in `package.json` files, called Scripty. Only one problem: arguments passed after a double-dash did not make it to the script that Scripty referred to. `npm run scripty -- -addArg1` didn't work.

I flipped open my shiny new MacBook pro (the last one with a good keyboard!) and banged out a solution and submitted a PR. It was backward compatible. It was elegant. It... didn't work on Windows.

My change did not hurt Windows users - it just didn't extend the new benefits to them. So we went back and forth about it, but ultimately I didn't see a benefit to me in doing the work to embrace Windows users. As a maintainer, though, Justin did not want to leave anyone behind. 4 commits of his later, it was fixed and merged for Windows. I learned about AppVeyor, a CI tool to run on Windows from his solution.

__Lesson:__ Maintainers have to meet the needs of a broader audience than you might imagine. You can learn from them if you can hang in there, but everyone has to decide where their involvement is good enough. [Link to Issue](https://github.com/testdouble/scripty/issues/6)

## 2019 - Ruby - Overcommit

I'd been in the land of NPM and Husky commit hooks for so long, I didn't know Ruby had Overcommit. Until I was commiting my JavaScript code into a mono-repo that was mainly Ruby. Imagine my shock and horror when I saw that the commit hooks _edited your files_ 😱😱. This was a minor nuisance at first, but at one point I lost work. And this happened to a coworker too. Something had to be done.

Like before I started with the intent to write the code to fix it. I had patience. I opened the issue. I floated an idea for an implementation. I knew Ruby wasn't my strong suit anymore, but I refused to get stuck. And I got really great guidance. Ultimately though, I just couldn't keep up. But not 2 weeks after the idea crystallized and was validated, a new release made it so my files (and my coworkers') would not be touched in the vast majority of circumstances. I updated our shared repos gems with a smile just this morning :)

[Link to Pull Request](https://github.com/sds/overcommit/issues/669)

__Lesson:__ Maintainers will help you if you're inquisitive and show a willingness to implement their ideas. But if you can't keep up, don't take it personally if they close the issue, or go and implement it without you.

---

I don't believe it's right for everybody at every time to contribute to Open Source. But there's a feeling that comes from doing it that is horizon-broadening. And if you're looking to affect people positively, it's certainly one channel. I hope the stories above give you a taste of what can happen. None of it was very bad, thankfully. Just remember, read what you can - the Code of Conduct, the Contributor's guide, the README, LICENSE, issues and PRs, and try to be patient. Many maintainers will help you. The world needs your input - if you've got the time, then what have you got to lose?!

---

Honorable mentions for most learning:

[2015 - MeteorJS](https://github.com/meteor/meteor/pull/4710) - This was the largest OSS project to have accepted a contribution of mine. I learned the value of patience. Also, I did work on an issue that was already being championed by other people. I just put up an acceptable implementation. Other original ideas I put up ([here](https://github.com/meteor/meteor/issues/4891) and [here](https://github.com/meteor/meteor/issues/3776)) were not accepted. 

[2015 - deanius:promise](https://atmospherejs.com/deanius/promise) - This package earned the most downloads/installs of any package I authored. I learned how much time it can take to build and promote a package. It was helpful to a lot of people, however, and as I gave talks on it, its help to my career and understanding of async and Promises was invaluable.



