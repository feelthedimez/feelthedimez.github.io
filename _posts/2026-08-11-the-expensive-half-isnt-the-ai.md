---
layout: post
title: "The Expensive Half Isn't the AI"
date: 2026-08-11 14:00:00 +0200
tags: [AI | Knowledge Management | Business | Opinion]
archive: false
permalink: /:title
featured_img: assets/img/featured-expensive-half.png
---

![Featured Image]({{page.featured_img | relative_url}})

Last month I ran 124 working sessions with an AI coding assistant. 117 of them opened the same way: not with a prompt about the task, but with a query against my own notes.

That ratio is the whole post.

The obvious explanation for getting more done with AI is the AI. I use it every day, all day. The obvious explanation is wrong. Not about the model, but about which half of the arrangement is doing the work.

## It Wasn't the AI

Every engineer reading this can buy the exact subscription I have. Same models. Same tools. Same price.

So the tool can't be the advantage. If the thing you're paying for is available to everyone at the same cost, it's a commodity, and commodities don't create advantages. They remove them.

What differs is what the tool knows about your work.

Mine knows a lot. Not because it runs a better model, but because there are months of written-down decisions sitting behind it in a form it can actually read.

## Context Is the Bottleneck

Here's the part that doesn't make it into the sales deck.

An AI assistant starts every conversation knowing nothing about your company. Not your architecture. Not why you picked the payment provider you picked. Not the bug someone fixed in March that everyone has since forgotten. Not the client constraint that makes the obvious solution the wrong one.

So you explain. Every session. And when the conversation runs long enough, the model's working memory fills up, it loses the earlier context, and you explain again.

That re-explaining is the real cost, and almost nobody measures it. I did. Over the last month, a third of my sessions ended because the conversation ran out of room and had to restart. Every one of those was an opportunity to lose context I had already paid to establish.

The fix isn't a smarter model. It's giving the model somewhere to look.

## How It Actually Works

There's no magic in this. It's a filing system with a good index.

![How it works, in six steps]({{ "assets/img/expensive-half-six-steps.png" | relative_url }})

Six steps, start to finish:

1. **Everything written gets read** by a pipeline running in the background. Notes, documents, source code, all of it.

2. **It gets cut into small pieces.** A whole document is a bad answer. You want the paragraph that answers the question, not the forty pages around it. Code is split along syntax boundaries so a function doesn't get cut in half.

3. **Each piece gets a label stapled to it** recording where it came from. This one matters far more than it sounds like it should.

4. **Each piece is converted into an embedding**, a list of numbers standing for its meaning. Two pieces about the same idea land near each other even when they share no vocabulary at all.

5. **Your question gets the same treatment**, then two searches run in parallel. A vector search over those embeddings finds meaning. A full-text search finds exact strings. Each is weak where the other is strong, so both run and the two ranked lists are fused into one.

6. **The best pieces come back** with the file and line they came from.

The stack, briefly: **Postgres with the pgvector extension** as the single store, **CocoIndex** as the pipeline that keeps the index in step with the files, an **embedding model** to do the conversion in step four, and **MCP** (Model Context Protocol, the emerging standard for how assistants call external tools) as the interface the assistant talks to. One table, 30,446 pieces of text, roughly 4,000 files.

Step three is worth slowing down on. A paragraph torn out of a document means nothing alone. "Restart it after the migration." Restart what? Staple a label on first, saying _this came from the billing document, under the retry section_, and it becomes findable.

Remember that step. It's about to break.

## Why I Added the Code

The first version indexed notes only. It worked, and for nearly four months I thought that was the finished product.

What changed my mind was noticing how many of my questions were half-and-half. _Why does the payment retry work this way_ is partly a decision I wrote down and partly a function somebody wrote. Answering from the notes alone gives you the intent with no implementation. Answering from the code alone gives you the mechanism with no reason.

The notes and the code needed to be in the same index.

That's when I found [CocoIndex](https://cocoindex.io), an open-source framework built for exactly this: keeping embeddings of a codebase current without re-processing everything on every commit. I got there through _How We Built Our Knowledge Base_, written by Isaac Tai, Daniel Kim and Mike Gao at Cerebras, which is worth reading in full if this is your problem too.

What struck me was how closely their architecture matched the one I'd landed on independently, at a wildly different scale. By their own account they serve 15,000 questions a day across chip design, data centre operations and inference teams. I serve one person. And we both ended up with a single Postgres table, pgvector for the embeddings, full-text and vector search fused together, per-repository config files with allowlists and denylists, and MCP as the way agents reach it.

When a company that size and a person working alone converge on the same shape, that's usually a sign the shape is right rather than a sign either of us is clever.

## Then It Stopped Working

So I rebuilt it with the code included, ran it for a while, and noticed something.

It was very good at finding my notes. It was almost useless at finding my code.

I asked it a pure location question. _Where is the payment signature generated?_ It returned eight documents about payments and zero lines of code, even though the file it wanted was indexed and sitting right there.

That's a bad failure. Not "I couldn't find anything". That's obvious, and you go looking yourself. This was confident and wrong. A real answer, from a real document, that wasn't what I asked for.

The cause was step three. My notes carried their titles and headings into that label. My code carried nothing. Every function in every repository went in as an anonymous fragment with no record of where it lived or what it belonged to.

The search was fine. The filing was broken. And I would never have found it by tuning the search, because the search was never the problem.

Once code chunks got the same label notes had always received:

| Measure                                             | Before | After  |
| --------------------------------------------------- | ------ | ------ |
| Code appearing in results, all questions            | 9%     | 38%    |
| Code appearing in results, implementation questions | 8%     | 44%    |
| Implementation questions with code ranked first     | 2 of 6 | 4 of 6 |

## The Number That Lied

This is the part I'd want to read if I were deciding whether to fund something like this.

Once it was fixed, I built a proper test. Sixty-three questions spanning every part of one system, each with a recorded correct answer. Then I scored it.

It got 100%. Every question, correct answer in the top five, no misses.

I didn't believe it, and I was right not to.

I had written those questions by reading the headings in my own documents. And the system, thanks to the fix above, now indexes those exact headings. So I had built a test that handed the system its own answer key. It scored perfectly because it was matching text against a near-copy of itself.

So I rewrote the questions the way somebody would actually ask them, deliberately avoiding the vocabulary the documents used, describing symptoms instead of naming concepts.

| Measure                        | Questions taken from my own headings | Questions phrased naturally |
| ------------------------------ | ------------------------------------ | --------------------------- |
| Correct answer ranked first    | 75%                                  | 41%                         |
| Correct answer in the top five | 100%                                 | 65%                         |
| Correct answer in the top ten  | 100%                                 | 74%                         |

The right-hand column is the real one. It's what I work from now.

I'll go further. When I audited the failures, five of the nine were my fault rather than the system's. I had recorded the wrong document as the correct answer, one that looked like it covered the topic but never actually mentioned it.

None of this surfaces if you don't check. Nothing about a benchmark announces that it's measuring itself. You have to go looking.

If somebody demos an AI system to you and quotes a number, ask who wrote the questions.

## Why Documentation Changed Jobs

Here's the shift I think most companies have missed.

Documentation used to be a cost. You wrote it because you were supposed to, it went stale within a quarter, and roughly nobody read it. The honest business case was compliance and onboarding, and even that was thin.

That calculation has inverted.

Written-down knowledge is now the input that determines how much you get out of every AI tool you are already paying for. It isn't overhead any more. It's the fuel.

And it compounds the way infrastructure does. A month of notes is a convenience. A year is a reference library. Three years is an asset a competitor with the same tools and the same budget cannot buy, because it's a record of decisions only your company made.

Everybody is buying the tools. Almost nobody is buying the input.

## Someone Still Has to Write It Down

I'd like to end somewhere more comfortable than this, but it wouldn't be true.

There's no shortcut. The system I've described works because there are hundreds of notes behind it, written by hand, over months, by someone who was tired and would rather have been doing something else.

You can generate documentation automatically. I've tried it. It reads plausibly, restates what the code already says, and quietly goes stale because nothing keeps it honest.

More documentation is not automatically better, either. A team at ETH Zurich evaluated the instruction files people write for coding agents and found they produced no improvement in task success at all, while adding over 20% to the cost of running the agent. Their conclusion was that such files should describe only minimal requirements. That is a different artifact from the retrievable notes I'm describing, but the lesson carries: volume is not the thing that helps.

The notes worth anything are the ones recording what the code cannot tell you. Why you rejected the other option. What the client actually meant. What you tried that didn't work.

A machine can't write those, because it wasn't in the room.

## Where to Start

You don't need what I built. Not yet, and possibly not ever.

You need the habit that makes it worth building.

Every time someone on your team solves something that took more than an afternoon, they write down what the problem was, what didn't work, and what fixed it. Not a summary. The actual investigation. Somewhere searchable, in plain text, that you own.

That's it. That's the whole starting move.

The tooling on top gets cheaper and better every quarter. I rebuilt mine twice this year and the second rebuild took a weekend. But no tool, at any price, in any year, recovers a decision nobody bothered to write down.

In three years, the companies that have been writing things down will be compounding returns from AI tools. The ones that didn't will be buying the same subscriptions and wondering why it isn't working.

That's the whole difference. It was never the model.

## Sources

Isaac Tai, Daniel Kim and Mike Gao, [_How We Built Our Knowledge Base_](https://www.cerebras.ai/blog/how-we-built-our-knowledge-base), Cerebras, 15 July 2026. The 15,000 questions a day figure and their architecture are theirs, not mine. It is the piece that convinced me to put code and notes in the same index.

Thibaud Gloaguen, Niels Mündler, Mark Niklas Müller, Veselin Raychev and Martin Vechev, [_Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?_](https://www.sri.inf.ethz.ch/publications/gloaguen2026agentsmd), SRI Lab, ETH Zurich. Presented at the ICLR 2026 Workshop on Memory for LLM-Based Agentic Systems. Source for the no-improvement and 20% cost findings.

[CocoIndex](https://cocoindex.io), the open-source incremental indexing framework doing the ingestion work described in steps one to four.
