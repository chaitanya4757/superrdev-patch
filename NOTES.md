# NOTES.md

## Summary of changes

Six bugs fixed across backend, frontend, and SQL layers:

**Bug 1 – SQL operator-precedence (highest value)**
`TaskRepository.java` and the reference SQL files had a missing pair of 
parentheses around the `OR` in the WHERE clause. SQL evaluates `AND` before 
`OR`, so the query was parsed as `(archived=FALSE AND title LIKE term) OR 
(description LIKE term AND statusFilter)`. Result: archived tasks could appear 
in description matches, and the status filter was silently ignored for title 
matches. Fixed by wrapping the OR in parentheses.

**Bug 2 – Artificial `Thread.sleep` in TaskController**
A block labelled "Query complexity estimation for logging" sleeps up to 
1000 ms per request (inversely proportional to query length — shortest 
queries sleep longest). This is not estimation; it is a performance landmine. 
Removed entirely.

**Bug 3 – `setLoading(false)` never called on error in `useTasks.js`**
The `catch` block set the error state but never cleared `loading`. After any 
failed request the UI showed the loading spinner forever. Fixed with a 
`.finally(() => setLoading(false))` block; also added `setError(null)` at 
the start of each effect run to clear stale errors.

**Bug 4 – Page not reset on filter change in `App.jsx`**
Changing the search query or status filter while on page > 1 left the page 
counter unchanged, producing an empty or wrong page of results. Fixed by 
resetting `page` to 1 inside `handleQueryChange` and `handleStatusChange`.

**Bug 5 – No debounce on search input**
`SearchBar` fired `onChange` on every keystroke, triggering a full API 
round-trip per character. Added a `useDebounce` hook (300ms) so the request 
fires only after the user pauses.

**Bug 6 – `TaskStatus.valueOf()` throws 500 on bad input**
An unrecognised status value caused an uncaught `IllegalArgumentException`, 
returned to the client as HTTP 500. Wrapped in try/catch to return a 400 
Bad Request with a human-readable message.

**Bug 7 – Same operator-precedence bug in Oracle PL/SQL artifact**
Both the COUNT query and the paginated cursor in `task_search_package.sql` 
had the same missing parentheses as Bug 1. Fixed in both locations.

---

## What I chose not to change

- **No structured logging migration** — replacing System.out.println with 
  SLF4J is tech debt but not a correctness bug.
- **No database indexes** — H2 in-memory with 50 rows, no measurable impact.
- **No input validation on task creation** — only a GET endpoint exists in 
  this exercise, adding POST validation is out of scope.
- **No UI redesign** — this is a patch exercise not a rebuild.

---

## Biggest remaining risk

**No pagination at the database level** — `searchTasks` returns ALL matching 
rows and slices them in Java. With a large dataset this causes high memory 
usage and slow queries. The correct fix is LIMIT/OFFSET in SQL.

---

## Tools used

- **Claude (claude.ai)** — used to cross-check analysis and draft fixes. 
  All changes were understood and verified personally.
- **Git / VS Code** — used to clone, explore and edit the repo.