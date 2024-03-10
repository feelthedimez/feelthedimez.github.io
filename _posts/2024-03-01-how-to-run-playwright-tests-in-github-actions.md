---
layout: post
title: "Power Up Your Pipeline: Playwright Tests with Github"
date: 2024-02-04 22:32:00 +0200
tags: [Software Engineering]
archive: false
permalink: /:title
featured_img: assets/img/featured-img-how-to-run-github-actions.png
---

So, let's talk about a common scenario: QA teams diving into automation testing with all the enthusiasm in the world, only to find themselves drowning in a sea of forgotten scripts and missed updates. Sound familiar?

Well, here's the scoop: there's a simple yet powerful solution that could save the day – Git. Yeah, that version control thingy developers swear by? Turns out, it's a total game-changer for QA too.

Heard about something called **[cron jobs](https://en.wikipedia.org/wiki/Cron)**? In simple terms, it's just a way to repeat the same process at scheduled time intervals, such as daily at 2 pm or every 2 hours, etc.

Imagine this: no more sweating over test maintenance or struggling to keep up with changes. With Git in your toolkit and a well-oiled automation pipeline, you're set for smoother sailing through the testing waters.

Let's dive into setting up GitHub Actions to seamlessly integrate with **[Playwright](https://playwright.dev/)**, setting up cron jobs, and ultimately solving the challenge of maintaining scripts

## 1. Getting started with Playwright

We can do a basic Playwright setup; we will use the following technologies:

- [Typescript](https://www.typescriptlang.org/) - dealing with types is much easier
- [yarn](https://yarnpkg.com/) as our package manager
- [Github](https://github.com/) with Github Actions
- [Playwright](https://playwright.dev/) itself

Make sure you have `yarn` installed.

```shell
npm install -g yarn
```

Create a repo on Github, clone it and initialize a `project.json` file

```shell
git clone <project repo>
cd <project repo>
yarn init . # then follow the prompts
```

Setup playwright by following the prompts.

```shell
yarn create playwright

Initializing project in '.'
✔ Do you want to use TypeScript or JavaScript? · TypeScript
✔ Where to put your end-to-end tests? · tests
✔ Add a GitHub Actions workflow? (y/N) · false
✔ Install Playwright browsers (can be done manually via 'yarn playwright install')? (Y/n) · true
✔ Install Playwright operating system dependencies (requires sudo / root - can be done manually via 'sudo yarn playwright install-deps')? (y/N) · true
```

If some installations fail, like the Playwright Browsers, or Playwright; you might need to run the `yarn` command using `sudo`.

```shell
sudo yarn create playwright
```

At this stage, I am assuming everything went well.

## 2. Setup basic tests

