---
title: Kata, Bunkai and Testing
published: true
description: The karate method of "Bunkai" can be applied to our software practice. By focusing **both** on testing and prod code we improve both sides of our practice.
tags: testing, TDD, kata, karate
cover_image: https://images.unsplash.com/photo-1555597673-b21d5c935865?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1744&q=80
---

## Kata
> Kata (martial arts): A detailed, choreographed sequence of movements, blocks, strikes and footwork, executed without a partner. Kata are used as a mnemonic device for a series of techniques, flowed together.

## Bunkai
> Bunkai (分解) in Japanese, literally meaning "analysis" or "disassembly" is used in Japanese martial arts to describe the process of extracting fighting techniques from the movements of a **kata**.

## Kata in the Karate Kid (and Cobra Kai)

In the 1989 film Karate Kid, Mr. Miyagi has Daniel-san practice cleaning the dojo as part of his training. You may recall the "wax-on, wax-off" lesson. This introduced Daniel to a technique, or fragment of a kata. For the longest time Daniel didn't know if he was doing it right. Then Mr. Miyagi throws a punch at him - and his body reacts with the technique he rehearsed. "Wax on" - and he deflects the punch automatically! This illustrates the power of intentional practice - which by analogy we will extend to writing production code as its own kind of fight.

## Kata in Karate
A karate class usually has a group kata practice toward its end. The time before is spent focusing on individual techniques, often practiced with partners. This helps establish the building blocks of the kata.

A belt promotion depends, among other things, on satisfactory demonstration of that belt's entire kata. This ensures that all the techniques associated with that belt level are demonstrated by the student. Thus the number of demonstrable katas is one measure of a student's skill level. The first 10 levels up to 1st degree black have widely varying kata, ensuring each level adds to the student's skill.

## "Code" Kata

Code Kata is the rehearsal of specific coding problems, and I've definitely seen workshops built on it. Sites like Project Euler and Code Warrior provide simple problems where you can focus on honing individual skills. I suggest at least trying them. Many coders think it's pointless to solve 'simple' problems, and thus miss the opportunity to develop the "wax on wax off" kind of mastery that comes only from repetition.

## Testing as Bunkai

The analogy of kata to production code is pretty interesting. Both are composed of smaller building blocks. Both are complex and take time to get right. Kata, like production code, are what get people promotions and recognition. But bunkai, like testing, is the counterpoint is needed to develop them.

How bunkai develops kata is like this: To practice a kata's block/punch combination, your partner will throw an attack. When you respond to the attack, you practice the kata's technique _in the context of its intended application_. 

_In this way, the bunkai is the ***reason*** for the kata._ Exactly as test-first development 'throws the first punch' and puts pressure on the code to respond correctly!

Kata that are not practiced against opponents' bunkai seldom have the snap or polish they could have. Could the same be true about code that is not robustly tested?

## Tests Shape Code as Testing Shapes Developers.

What if I said, "I think 50/50 is a good theoretical split of time focused on tests/prod code". Would that be an uncomfortable thought to you? If so-why? It could be that you haven't figured out how to turn its benefits to your favor. Perhaps doing an 'analysis' aka bunkai will help.

If you believe testing is less than 50% important, consider a thought experiment: Imagine a machine, or an AI, that could spit out source code, which you could quickly test whether that source code satisfied the test suite or not. You might not know or care what the code looks like, you just know it does *what you specified in the test suite!* Programmers may become replaceable, but those who write the specifications (aka tests) can't be replaced! Investing in those skills just seems smart to me.

---

In summary, testing is an "analysis" or "disassembly" of production-ready code, as bunkai is for kata in karate. When there are complementary evolutionary pressures, it results in growth on both sides. Anyway its secretly fun! If you've never written a failing test first, then made it pass, you are missing out on one of the great satisfactions of programming. To have pairing sessions where someone 'tests' and another codes - aka "ping-pong" style 🏓 - is simply delightful.
 
Let testing do for your software practice what bunkai does for kata in karate. Enjoy crane-kicking your way to success!

---

_A Personal note: My adult karate path began in 2010 when my friend Hope gave me a gift certificate for a membership at her karate dojo. Though I saw her achieve 1st black belt, mental health and depression issues claimed her before her time. This one is for mental health awareness—and Hope._