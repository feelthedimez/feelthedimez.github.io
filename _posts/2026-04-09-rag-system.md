---
layout: post
title: "I Built a RAG System So My AI Agent Stops Asking Me the Same Questions"
date: 2026-04-09 18:11:00 +0200
tags: [RAG | Python | AI | LangChain | Obsidian | MCP]
archive: false
permalink: /:title
featured_img: assets/img/featured-vector-embeddings.png
---

> I am workon on [production AI agent infrastructure](https://www.scrums.com/ai-agent-platform) at Scrums.com. This post covers a personal RAG system I built for my own coding sessions. Same pattern, different governance.

![Featured Image]({{page.featured_img | relative_url}})

Every time I start a new session with an AI agent, I spend the first 10 minutes re-explaining my project. The architecture. The decisions I've already made. The context that lives in my head but not in the conversation.

It's exhausting. And it's a waste of time I could be spending actually building.

So I built Cortex RAG. A personal ingestion system that chunks my knowledge vault and makes it queryable from any MCP-compatible coding environment. Now, instead of re-explaining everything, my agent just queries my notes and picks up where we left off. There are plans to expose it to an API, and use Supabase Vector Database for more cloud based/remote situations.

Here's how I built it, and how you can too.

## The Problem Worth Solving

I keep my notes in Obsidian. Over time, those notes have become a real knowledge base — feature specs, design decisions, database schemas, bug post-mortems, framework gotchas. Stuff I've already figured out.

But an AI agent in a fresh session knows none of that. It starts from zero every time.

RAG (Retrieval-Augmented Generation) solves this. Instead of piping your entire vault into the context window, you:

1. Convert your notes to vector embeddings and store them
2. At query time, find the most semantically similar chunks to the question
3. Send only those chunks to the LLM as context

Your agent gets the relevant context. Fast. Without you lifting a finger.

## The Stack

Before we get into the code, here's what we're working with:

- **Python** — the whole thing runs in Python
- **LangChain** — chunking and retrieval pipeline
- **ChromaDB** — local vector store, persists to disk
- **OpenRouter** — embeddings via `openai/text-embedding-3-small`
- **FastMCP** — exposes search as a tool to any MCP-compatible client

## Part 1: Ingestion

This is the foundation. Everything else depends on getting this right. I called my project `cortex` - I'm sure you understand the reference.

### Setting Up

```bash
mkdir cortex-rag && cd cortex-rag
mkdir src
python3 -m venv .venv && source .venv/bin/activate
pip install langchain langchain-text-splitters langchain-chroma langchain-openai chromadb python-dotenv
```

Create a `.env` file:

```
VAULT_PATH=/path/to/your/obsidian/vault
CHROMA_PATH=./chroma_db
OPENROUTER_API_KEY=sk-or-...
EMBED_MODEL=openai/text-embedding-3-small
TOP_K=5
```

### Walking the Vault

Create `src/ingest.py`. First, we need to collect all the markdown files:

```python
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

VAULT_PATH = Path(os.getenv("VAULT_PATH"))
SKIP_DIRS = {"99-templates"}

def collect_vault_files() -> list[Path]:
    files = []
    for md_file in VAULT_PATH.rglob("*.md"):
        parts = md_file.relative_to(VAULT_PATH).parts
        if any(part in SKIP_DIRS or part.startswith(".") for part in parts):
            continue
        files.append(md_file)
    return sorted(files)

if __name__ == "__main__":
    files = collect_vault_files()
    for f in files:
        print(f.relative_to(VAULT_PATH))
    print(f"\n{len(files)} files found")
```

Run it:

```bash
python src/ingest.py
```

You should see every markdown file in your vault listed out. If you see your template folder in there, double check your `SKIP_DIRS`.

### Chunking by Heading

This is the most important part. Don't just split files by character count — split by meaning. Every `##` heading in your notes is a natural semantic boundary.

```python
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

HEADERS_TO_SPLIT_ON = [
    ("#", "h1"),
    ("##", "h2"),
    ("###", "h3"),
]

def chunk_file(path: Path) -> list:
    text = path.read_text(encoding="utf-8")

    md_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=HEADERS_TO_SPLIT_ON,
        strip_headers=False,
    )
    header_chunks = md_splitter.split_text(text)

    char_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
    )
    chunks = char_splitter.split_documents(header_chunks)

    for chunk in chunks:
        chunk.metadata["source"] = str(path.relative_to(VAULT_PATH))
        chunk.metadata["file_name"] = path.name

    return chunks
```

Two stages here. First, `MarkdownHeaderTextSplitter` splits on headings. Then `RecursiveCharacterTextSplitter` handles any sections that are too long. Every chunk carries metadata — where it came from and what heading it lives under.

Update `__main__` to see what a chunked file looks like:

```python
if __name__ == "__main__":
    files = collect_vault_files()
    chunks = chunk_file(files[0])
    for i, chunk in enumerate(chunks):
        print(f"\n Chunk {i+1} ")
        print("Metadata:", chunk.metadata)
        print(chunk.page_content[:200])
```

This is what you want to see:

```
 Chunk 1
Metadata: {'h1': 'Hive', 'h2': 'Goal', 'source': '01-projects/hive/hive-index.md', 'file_name': 'hive-index.md'}
# Hive
## Goal
Freelancer marketplace connecting clients to independent contractors.

 Chunk 2
Metadata: {'h1': 'Hive', 'h2': 'Status', 'source': '01-projects/hive/hive-index.md', 'file_name': 'hive-index.md'}
## Status
- [x] Contractor profile creation and onboarding
- [ ] Job posting and matching flow
```

Each section of each note is its own chunk. The heading hierarchy is captured in metadata. The chunk knows where it came from.

### Storing in ChromaDB

```python
import chromadb
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")
EMBED_MODEL = os.getenv("EMBED_MODEL", "openai/text-embedding-3-small")

def get_vectorstore() -> Chroma:
    embeddings = OpenAIEmbeddings(
        model=EMBED_MODEL,
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url="https://openrouter.ai/api/v1",
        check_embedding_ctx_length=False,
    )
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    return Chroma(
        collection_name="cortex",
        embedding_function=embeddings,
        client=client,
    )
```

One thing worth noting: `OpenAIEmbeddings` works with OpenRouter because OpenRouter mirrors the OpenAI API spec for embeddings. The key parameters are `api_key`, `base_url`, and `check_embedding_ctx_length=False` — that last one is important. Without it, LangChain tries to tokenize your text before sending it, which OpenRouter doesn't support.

### The Ingest Function

```python
def ingest_file(vs: Chroma, path: Path) -> int:
    chunks = chunk_file(path)
    if not chunks:
        print(f"No chunks: {path.name}")
        return 0
    vs.add_documents(chunks)
    print(f"{len(chunks)} chunks — {path.relative_to(VAULT_PATH)}")
    return len(chunks)
```

### Running It

Update `__main__` to run the full ingest:

```python
if __name__ == "__main__":
    vs = get_vectorstore()
    files = collect_vault_files()
    total = 0
    for f in files:
        total += ingest_file(vs, f)
    print(f"\nDone. {total} chunks across {len(files)} files.")
    print(f"ChromaDB now has: {vs._collection.count()} chunks")
```

```bash
python src/ingest.py
```

```
1 chunks — 00-inbox/2026-04-07.md
5 chunks — 01-projects/hive/hive-index.md
38 chunks — 01-projects/hive/db/hive-db.md
24 chunks — 01-projects/hive/features/contractor-onboarding.md
19 chunks — 02-areas/react-native/zustand-basics.md
...
Done. 112 chunks across 6 files.
ChromaDB now has: 112 chunks
```

Your vault is now embedded and stored locally.

### Incremental Re-indexing

You don't want to re-embed every file every time. Add hash-based change detection:

```python
import json
import hashlib
import argparse

STATE_FILE = Path(CHROMA_PATH) / ".ingest_state.json"

def file_hash(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()

def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {}

def save_state(state: dict):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2))

def delete_file_from_store(vs: Chroma, rel_path: str):
    collection = vs._collection
    results = collection.get(where={"source": rel_path})
    if results and results["ids"]:
        collection.delete(ids=results["ids"])
        print(f"Deleted {len(results['ids'])} stale chunks: {rel_path}")
```

Update `__main__`:

```python
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--changed-only", action="store_true")
    args = parser.parse_args()

    vs = get_vectorstore()
    files = collect_vault_files()
    state = load_state()
    total = 0
    updated = 0

    for f in files:
        rel_path = str(f.relative_to(VAULT_PATH))
        current_hash = file_hash(f)

        if args.changed_only and state.get(rel_path) == current_hash:
            continue

        delete_file_from_store(vs, rel_path)
        total += ingest_file(vs, f)
        updated += 1
        state[rel_path] = current_hash

    save_state(state)
    print(f"\nDone. {updated} files indexed, {total} chunks added.")
    print(f"ChromaDB now has: {vs._collection.count()} chunks")
```

Now `python src/ingest.py --changed-only` only re-embeds what actually changed. It also deletes stale chunks before re-indexing, so you never accumulate duplicates.

## Part 2: Querying

Create `src/query.py`. This is where a question becomes a vector and the vector becomes relevant context.

```python
import os
import chromadb
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

load_dotenv()

CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")
EMBED_MODEL = os.getenv("EMBED_MODEL", "openai/text-embedding-3-small")
TOP_K = int(os.getenv("TOP_K", "5"))

def get_vectorstore() -> Chroma:
    embeddings = OpenAIEmbeddings(
        model=EMBED_MODEL,
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url="https://openrouter.ai/api/v1",
        check_embedding_ctx_length=False,
    )
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    return Chroma(
        collection_name="cortex",
        embedding_function=embeddings,
        client=client,
    )

def search(question: str, k: int = TOP_K) -> list[dict]:
    vs = get_vectorstore()
    results = vs.similarity_search_with_relevance_scores(question, k=k)

    hits = []
    for doc, score in results:
        heading_parts = []
        for key in ("h1", "h2", "h3"):
            val = doc.metadata.get(key)
            if val:
                heading_parts.append(val)

        hits.append({
            "source": doc.metadata.get("source", "unknown"),
            "file_name": doc.metadata.get("file_name", "unknown"),
            "heading": " › ".join(heading_parts) if heading_parts else "(no heading)",
            "content": doc.page_content,
            "score": round(score, 4),
        })

    return hits

if __name__ == "__main__":
    hits = search("How does a contractor get approved on Hive?")
    for i, hit in enumerate(hits, 1):
        print(f"\n[{i}] score: {hit['score']}")
        print(f"     file: {hit['source']}")
        print(f"  heading: {hit['heading']}")
        print(f"  content: {hit['content'][:200]}")
        print("─" * 60)
```

Run it:

```bash
python src/query.py
```

```
[1] score: 0.6341
     file: 01-projects/hive/features/contractor-onboarding.md
  heading: Hive — Contractor Happy Path › Overview
  content: Covers the full onboarding and approval flow for contractors on Hive,
           from profile completion to client-facing activation...
────────────────────────────────────────────────────────────

[2] score: 0.4812
     file: 01-projects/hive/features/contractor-onboarding.md
  heading: Hive — Contractor Happy Path › Flows
  content: 1. Contractor fills in profile fields
           2. Contractor uploads required documents
           3. Contractor submits for review
           4. Admin approves contractor...
────────────────────────────────────────────────────────────
```

Two things to notice here. Natural language questions outperform keyword searches. "How does a contractor get approved on Hive?" will score higher than just "contractor approval". The embedding model was trained on natural language, so use it that way.

The scores also tell you something. Anything above 0.35 is a real match. Below that, you're getting noise. You can add a threshold filter later if retrieval quality becomes an issue.

## Part 3: MCP Integration

This is where it gets interesting. Instead of building a chatbot on top of your vault, you expose it as a tool. Any MCP-compatible editor — Windsurf, Claude CLI, anything — can call it automatically during a session.

Your agent doesn't need you to paste context anymore. It queries your vault directly.

### Install the MCP SDK

```bash
pip install "mcp[cli]"
```

Add to `requirements.txt`:

```txt
mcp[cli]
```

### Building the Server

Create `src/server.py`:

```python
"""
server.py — Cortex MCP server.

Exposes the vault search as an MCP tool that any MCP-compatible
client can call — Windsurf, Claude CLI, Open WebUI, etc.

Runs locally on http://localhost:8000/mcp
"""

from mcp.server.fastmcp import FastMCP
from query import search

mcp = FastMCP("cortex", host="0.0.0.0", port=8000)

@mcp.tool()
def search_vault(question: str, top_k: int = 5) -> list[dict]:
    """
    Search the Cortex knowledge vault for relevant notes.

    Use this when you need context about a project, feature, decision,
    or any topic the user has written notes on. Returns the most
    semantically similar chunks with their source file and heading.

    Args:
        question: Natural language question to search the vault with.
        top_k: Number of chunks to retrieve. Defaults to 5.
    """
    return search(question, k=top_k)

if __name__ == "__main__":
    mcp.run(transport="streamable-http")
```

The docstring on `search_vault` matters. That's what Windsurf's AI reads to decide when to call this tool automatically. Make it descriptive.

Start the server:

```bash
python src/server.py
```

```
INFO:     Started server process [24951]
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Connecting to Windsurf

Open `~/.codeium/windsurf/mcp_config.json` and add:

```json
{
  "mcpServers": {
    "cortex": {
      "serverUrl": "http://localhost:8000/mcp"
    }
  }
}
```

Restart Windsurf. Open Cascade and ask it something about your project. Watch it call `search_vault` automatically and pull context from your vault before answering.

That's the moment it clicks.

## Keeping It in Sync

The last piece is automation. You don't want to manually re-ingest every time you update a note.

Create `vault-sync.sh`:

```bash
#!/bin/bash

VAULT=/path/to/your/obsidian/vault
RAG=/path/to/cortex-rag

cd $VAULT

git pull --rebase --autostash

if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  git add .
  git commit -m "vault: auto-sync $(date '+%Y-%m-%d %H:%M')"
  git push
  echo "[$(date '+%Y-%m-%d %H:%M')] vault synced"
else
  echo "[$(date '+%Y-%m-%d %H:%M')] vault unchanged, skipping commit"
fi

cd $RAG
source .venv/bin/activate
python src/ingest.py --changed-only

echo "[$(date '+%Y-%m-%d %H:%M')] RAG index updated"
```

Add a cron job to run it every 3 hours:

```bash
crontab -e
```

```
0 */3 * * * /bin/bash /path/to/cortex-rag/vault-sync.sh >> /path/to/cortex-rag/vault-sync.log 2>&1
```

On Mac, make sure cron has Full Disk Access in **System Settings → Privacy & Security → Full Disk Access**. Without it, cron can't read your vault files and will fail silently.

## What This Actually Changes

Before Cortex RAG, every session started the same way. Me explaining the architecture. Me pasting in schemas. Me re-establishing context that already existed somewhere in my notes.

Now I just start coding. The agent queries the vault, finds the relevant context, and we pick up where we left off. The cognitive overhead of context management is gone.

It's not magic. It's just your own knowledge, made queryable.

Build it once. Let it run in the background. Write good notes and they'll pay you back every session.
