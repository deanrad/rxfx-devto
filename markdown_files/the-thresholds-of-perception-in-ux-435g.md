---
title: The Thresholds of Perception in UX 
published: true
description: In this article we'll focus on the time constants that define various milestones in human perception.
tags: ux, animation, async
cover_image: https://images.unsplash.com/photo-1508962061361-bcb4d4c477f8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80
---

There hasn't been a front-end codebase I've been in that isn't peppered with constants related to time. Common cases include `debounce(fn, 250)` - but, why 250? We'll focus here on the thresholds of the human experience that these times relate to. We'll build a timeline of durations as they relate to the human senses of sight, hearing and touch. Next we'll tell the story of what happens as those events unfold. First the reference table:

# Table of perceivable durations
TL;DR The human sense that is most capable of distinguishing small amounts of time is our hearing, even more than the sense of touch. Visually we can be slower than we realize, as our brain is adept at telling us a story about what we are seeing. The time scale:

10 ms - Audio unison. Frame paint (with 6 ms room to paint)
16 ms - 1 animation frame (60 FPS)
25 ms - Monitor paint time (LCD), haptic response, audio chorus
42 ms - 1 movie frame (24 FPS)
50 ms - Tactility threshold
100 ms - Audio echo (at 60 feet)
150 ms - 1 blink of an eye (or 1 keystroke at 90 wpm)
200 ms - Short animation. 1 keystroke at 60 wpm
250 ms - 1 keystroke at 48 wpm
330 ms - 1 keystroke at 38 wpm (mobile)
400 ms - Long animation
500 ms - 1 beat of techno (120 bpm)
1000 ms - 1 contiguous thought
2000 ms - Target web page load time p90
4000 ms - 1 deep breath.
6000 ms - A spoken sentence (15 words @150wpm).
8000 ms - Needs a progress bar
10000 ms - User lost

I feel like the most important numbers are 10 ms - the time to shoot for for smoothest animation, 150 ms - the time it takes to blink, 200 and 400 ms - the time for short and long animations. And 1000 ms - the time at which ones' mind starts to wander without feedback. Times above that, when they can't be avoided, must be supplemented with feedback providers that update within one of the lower time durations.

---

## 10 ms
There's effectively no perceivable audible separation between an audio signal and one delayed 10 ms. Visually this is not a perceivable delay. To ensure smooth animation, leaving room for painting, shoot for 10ms.

## 16 ms
Animators and game players know 16 ms well. At 16 ms per frame, you achieve 60 FPS (frames per second). 60 FPS is a good benchmark for animation, and is more than sufficient to ensure a visual perception of smooth motion. If an application doesn't complete its work to compute and paint the next frame in 16 ms, a frame is said to be "dropped". Dropped frames create unsmooth motion and animation.

## 25 ms
At 25 ms, we have the time it takes to hear the 'click' of a mechanical keyboard - pretty instantaneous, which is why we love it. At this duration of separation audio signals create "chorus" - a thickening of the sound. LCD monitors took this long to alter a pixel.

## 42 ms
At 42 ms, we have the venerable frame rate of 24 FPS film. This frame rate was used for everything of the first 100 years of cinema- until digital. It is enshrined in history, and a kind of upper bound on what looks smooth.

## 50 ms
At 50 ms, we have the threshold where haptic feedback ceases to feel immediate, and more like an echo. Stay within 50 ms when users need to feel 'in touch'.

## 100 ms
100 ms is a well studied threshold, the threshold of 'immediacy'. It's the duration of an echo from a wall 18m (60 feet) away. See the Nielsen study on the Powers of 10 in UX for more.

---

# UX Thresholds 
The previous values are more or less splitting hairs, as 100 ms feels more-or-less immediate, via any sense. The higher durations are all in the perceivable zone, and are established as thresholds to stay under, when adjusting your UX intentionally.

## 150 ms
150 ms - Literally the blink of an eye, in the faster half of the population (400ms is not an uncommon blink duration). Very little visually perceived delay, though audible as a thickened chorus.

## 200 ms
200 ms - The recommended duration for a 'short animation'. It's slightly longer than the blink of an eye. So it's likely to be perceived, if only subliminally. When proper easing is used, 200 ms can be very pleasant, feeling polished but not intrusive. 200 ms is also the time it takes for a typist at 60 WPM to type a keystroke, so Web Forms should ensure their work is done within 200 ms to not impede typing. 

## 250 ms
250 ms - A minimal debounce duration. A typist at 48 WPM is fully debounced by this interval. But studied input rates are lower on mobile - about 38 WPM on average - so consider your audience.

## 330 ms
330 ms - The ideal debounce duration in my opinion - a fine default. Fully debounces many mobile users at 38 WPM. Feels like a pause - but no more.

## 400 ms
400 ms - If short animation durations are 200 ms, then twice that is a long animation. If animating across a larger portion of the screen / field of view, then using a long animation makes sense.

## 500 ms
500 ms - The duration of a beat in a dance song played at 120 BPM (beats per minute). In other words, forming a pleasant 'pulse', feeling separate, but related.

## 1,000 ms
1000 ms - The duration of one thought. Subjective, you might think. But the Nielsen study defines it as the amount of time it takes the user to be snapped out of their current thought, and into wondering "what is happening?", consciously or not. Bearable, but not pleasing.

## 2,000 ms
2000 ms - How long a web page can take to load, and still feel reasonable. A duration an interstitial page can take and still feel short. Rhythms that are separated by 2 seconds (eg 30 BPM and lower) cease to be perceivable as rhythms, and more like distinct sounds

## 4,000 ms
4000 ms - One deep breath. When a user experiences frustration and sighs, the inhale and exhale takes around 4000 ms. To provide a response within it is to not make the user too angry, but you're starting to lose the fight for users' attention.

## 6,000 ms
6000 ms - An average sentence of this complexity will take a speaker about 6 seconds to speak. Also - remember Vine videos?

## 8,000 ms
8,000 ms - This is the current average human attention span. A progress bar, or interstitial is certainly needed to hold a user's attention as long.  According to studies, this average is down from 10 or 12 seconds a couple decades ago. 

## 10,000 ms
10,000 ms - The longest a user will stay on a page without seeing progress. Enough time to completely break a user's flow. 

--- 
## References
* 3 important UX limits -https://www.nngroup.com/articles/response-times-3-
* The Ultimate Animation Guide - https://uxdesign.cc/the-ultimate-guide-to-proper-use-of-animation-in-ux-10bd98614fa9
important-limits/
* The 8 Second Rule - https://uxdesign.cc/the-8-second-rule-ef2a60c5813c
* The Slowest Music - https://www.youtube.com/watch?v=afhSDK5DJqA

---
# Wrapping Up

That concludes our tour up the scale of human perception and attention. If you want programmatic access to these (in TypeScript or JavaScript), they are available [on Github](https://github.com/deanrad/rxfx/blob/main/perception/src/constants.ts), as part of a suite of tools called 𝗥𝘅𝑓𝑥. Just `import { THRESHOLD } from '@rxfx/perception'` and control timing exactly to make your users, and other developers happy!
