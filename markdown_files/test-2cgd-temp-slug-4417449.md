---
title: Elderly and UX
published: false
description:
tags:
# cover_image: https://direct_url_to_image.jpg
# Use a ratio of 100:42 for best results.
# published_at: 2023-07-11 00:12 +0000
---

Though the elderly account for a large percentage of the population, it is not widely understood how to accommodate their needs in the UX on websites and mobile devices. Guidelines that speak to typography, contrast, and accessibility (a11y) are a great start. But they don't address the specific concerns of the elderly, or more generally the less-coordinated, slower, or easily confused.

It's not surprising that we often fail to deliver products that the elderly can use with ease. Not every able-bodied person realizes how confusing an app can become when a user has placed an errant finger on a touchscreen, or when the app fails to show visual feedback in response to user actions.

But, with years of work and life experience dealing with the elderly population, I've distilled some principles that you, the JavaScript developer, can use to improve your interaction design. These tips will be a supplement to all of the issues like font size and accessibility Let's exemplify them, then see the coding tools - RxFx libraries - that can help you raise your code to these standards without losing focus on the path of the regular user. Grandparents deserve a great user experience too!

Here are 5 principles which you should test any code for the elderly against before shipping:

1. Does it show in-progress activity prominently, and include progress updates? This can answer the question "Is it working?" that a less-confident user often has after an interaction.
1. Does it prevent concurrent requests, or allow them to proceed in the appropriate mode? Double-taps on buttons are common by those with less coordinated fingers, and should not ruin their experience.
1. Does it allow for cancelation? If an operation is in progress, and the user made a mistake, or decide they can't wait that long, can they cancel it and return the app to a usable state?
1. Does it use animation appropriately? Are techniques used to minimize jerkiness, and are the animations of an appropriate duration?
1. Are errors, including timeouts, clear, and recoverable? Will the user feel helpless looking at an eternal loading spinner or have a more actionable path forward?

Let's give these principles short names, for ease of reference, and dive right in!

1. Activity and Progress
1. Concurrency
1. Cancelation
1. Animation
1. Errors and Timeouts

## Activity and Progress

## Concurrency

## Cancelation

## Animation

## Errors and Timeouts
