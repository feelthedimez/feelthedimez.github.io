---
layout: post
title: "Your Knowledge Is the Expensive Part"
date: 2026-08-11 14:00:00 +0200
category: AI & Knowledge
tags: [AI, Knowledge Management, Business, Opinion]
archive: false
permalink: /:title
featured_img: assets/img/featured-expensive-half.png
---

![Featured Image]({{page.featured_img | relative_url}})

Last month I ran 124 working sessions with an AI coding assistant. 117 of them started with me asking something about my own notes before I even got into the actual task.

I originally just wanted a way to search through my own notes without having to remember where I put everything. Then I added more notes, then documentation, then code, and eventually I ended up with a system that I use almost every time I work with AI.

It made me realise that the thing making the AI useful wasn't really the AI. It was everything I had written down before using it.

## I've Been Writing Things Down for a While

I've written about this before in [What If You Could Query Your Own Brain?](https://feelthedimez.github.io/what-if-you-could-query-your-own-brain/).

The idea was pretty simple. I've been using Obsidian as a second brain because I don't trust myself to remember everything I've learnt or every problem I've solved. If I fix a weird bug today, there is a good chance I'll forget exactly what I did six months from now. So I started writing those things down.

Not just the solution, but the problem, what I tried, what didn't work and why I eventually settled on the solution I did. Over time, that became quite a lot of information. That's where AI became interesting.

Instead of just asking an AI model a question and getting an answer based on its general knowledge, I could ask it something about my own work and let it search through everything I'd already written. It meant I didn't have to explain myself from scratch every time.

## The Problem With Starting Every Conversation From Zero

One of the frustrating things about using AI for development is that it doesn't know your history.

It doesn't know why you chose a particular architecture. It doesn't know that you already tried three different solutions to a problem last month. It doesn't know why the obvious solution doesn't work for a particular client. It doesn't know about that strange production bug that took you an entire afternoon to figure out.

So every time you start a new conversation, you end up transferring some of that context into the conversation again. I have done it a thousand times, and eventually I got tired.

That's why I started building a RAG system around my notes. The idea wasn't particularly complicated. I wanted to be able to ask a question in normal language and have the system find the parts of my own notes that were relevant to it.

The setup ended up using Postgres and pgvector as the database, CocoIndex to keep everything indexed, embeddings for semantic search, and MCP so that my AI tools could actually query the system.

![How it works, in six steps]({{ "assets/img/expensive-half-six-steps.png" | relative_url }})

I had around 4,000 files in the system and roughly 30,446 pieces of text indexed. That included my notes and documentation, and eventually I decided to put my source code in there as well.

That's where things got interesting.

## My Notes Weren't Enough

A lot of the questions I ask while working aren't purely about documentation.

Take something like:

> Why does the payment retry work this way?

Part of that answer might be in a note where I explained why we chose a particular approach.

The other part might be in the actual code that implements it.

If I only search my notes, I can find the reasoning but not the implementation. If I only search the code, I can find the implementation but not necessarily why it was written that way.

So I wanted both in the same place.

I found CocoIndex while looking for a way to keep the code index up to date without having to re-process the entire codebase every time something changed. Around the same time I came across [How We Built Our Knowledge Base](https://www.cerebras.ai/blog/how-we-built-our-knowledge-base).

Their system was obviously operating at a completely different scale to mine. They were dealing with thousands of questions a day across engineering and infrastructure teams, while mine was just for me.

But the underlying idea was surprisingly similar.

Both systems ended up using Postgres, pgvector, vector search, full-text search and MCP. Their implementation is much larger, but it was interesting seeing that some of the same design decisions appeared naturally at completely different scales.

## The Code Was There, But I Couldn't Find It

After adding the code to the index, I started testing it with questions I would normally ask while working.

One of those questions was:

> Where is the payment signature generated?

The system returned eight documents about payments. It returned no code.

That was strange because the code was definitely there. It had been indexed. I could manually find the file myself. The problem turned out not to be the search. It was how I had stored the code.

My notes already had useful information attached to them. A note had a title, headings and the context around where a particular piece of information came from.

The code didn't have any of that.

I was taking functions out of files and putting them into the index without enough information about where they came from. The search could understand the contents of the function, but it didn't have enough context around it.

Once I started attaching that information to the code chunks as well, the results improved quite a bit.

| Measure                                             | Before | After  |
| --------------------------------------------------- | ------ | ------ |
| Code appearing in results, all questions            | 9%     | 38%    |
| Code appearing in results, implementation questions | 8%     | 44%    |
| Implementation questions with code ranked first     | 2 of 6 | 4 of 6 |

## Then I Tested It Properly

Once I had fixed that, I wanted to see how well the system actually worked.

So I made a test with 63 questions covering different parts of one of my systems. Each question had a correct answer that I could use to measure whether the search was returning the right information.

The first result was 100%. Every question had the correct answer somewhere in the top five results. It was also completely misleading.

The problem was how I'd written the questions.

I had created most of them by looking at the headings in my own documents and turning those headings into questions.

So if one of my documents had a heading about payment retries, I would create a question about payment retries.

The system was essentially being tested using the same language that was already sitting inside the documents.

So I rewrote the questions. Instead of using the terminology from my documents, I tried to ask them more naturally. I described symptoms or problems without necessarily using the same words I'd used when writing the original documentation.

The results were much more realistic.

| Measure                        | Questions taken from my own headings | Questions phrased naturally |
| ------------------------------ | ------------------------------------ | --------------------------- |
| Correct answer ranked first    | 75%                                  | 41%                         |
| Correct answer in the top five | 100%                                 | 65%                         |
| Correct answer in the top ten  | 100%                                 | 74%                         |

The second column is the one I actually care about. That's much closer to how I use the system in real life.

And when I went through the failures manually, five of the nine failures were actually caused by me. I had recorded the wrong document as the correct answer because it looked like it covered the topic, even though it didn't actually contain the answer.

That was another reminder that measuring these systems is harder than it looks. You can get a very impressive number if you aren't careful about what you're measuring.

## This Changed How I Think About Documentation

I've never really enjoyed writing documentation.

I understand why it's important, but it has always felt like one of those things you do because you're supposed to. You write it, eventually it becomes outdated, somebody finds it six months later and realises half of it isn't true anymore.

The things I write down are now useful to something other than myself. If I document why I made a decision, an AI can eventually use that information when I'm working on something related. If I document a problem I solved six months ago, I don't have to remember exactly where I put the answer. If I document something about a system that I've built, I can give an AI access to that context without having to explain the entire system every time.

The more I write down, the more useful the system becomes. And that's where I think the real value is. A month of notes is useful. A year of notes becomes a pretty good reference library.

A few years of notes starts becoming something else entirely because it contains the history of the decisions you've made and the problems you've actually encountered.

Someone else can buy the same AI subscription I use. They can use the same models and the same tools. They can't buy the last five years of things I've learnt.

## AI Can Generate Documentation, But That's Not Quite the Same Thing

This is also where I've become a bit sceptical of automatically generated documentation. I've tried using AI to generate documentation from code.

But most of the time it's just explaining what the code already says.

If a function is called `generatePaymentSignature()`, I don't particularly need AI to tell me that the function generates a payment signature. What I actually want to know is why we generate the signature that way. Why we didn't use the other approach. What problem caused us to add the extra validation. What happened when we tried something else.

Those things usually aren't in the code. They're in someone's head. And once that person leaves the project, they're gone unless they were written down somewhere. That's the part that AI can't really generate for you.

## So What Is the Expensive Part?

This is where I think the title comes from. The AI itself is becoming increasingly easy to access. You can subscribe to the same models that everyone else is using. The models are getting better, the context windows are getting bigger, and the tools around them are improving constantly.

The difficult part is building the body of knowledge that you can actually give to those tools. That takes time. Someone has to write the notes. Someone has to explain the decisions. Someone has to document the weird bug that took half a day to solve. Someone has to record what didn't work.

And most of the time, that person is you.

I've definitely been guilty of finishing a difficult problem and thinking, "I'll document this later."

Then I never do. The few times I actually did write it down, I've found myself coming back to those notes months later and thinking, "I'm glad I wrote this." That's probably the simplest reason I've continued building this system. Not because I want some massive AI knowledge platform. I just don't want to keep solving the same problems.

## Sources

Isaac Tai, Daniel Kim and Mike Gao, [_How We Built Our Knowledge Base_](https://www.cerebras.ai/blog/how-we-built-our-knowledge-base), Cerebras, 15 July 2026. The 15,000 questions a day figure and their architecture are theirs, not mine. It is the piece that convinced me to put code and notes in the same index.

Thibaud Gloaguen, Niels Mündler, Mark Niklas Müller, Veselin Raychev and Martin Vechev, [_Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?_](https://www.sri.inf.ethz.ch/publications/gloaguen2026agentsmd), SRI Lab, ETH Zurich. Presented at the ICLR 2026 Workshop on Memory for LLM-Based Agentic Systems. Source for the no-improvement and 20% cost findings.

[CocoIndex](https://cocoindex.io), the open-source incremental indexing framework doing the ingestion work described in steps one to four.
