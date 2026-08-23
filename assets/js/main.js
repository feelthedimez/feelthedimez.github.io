/**
 * Small progressive enhancements for post lists. Everything here has a
 * no-JavaScript fallback: pills are real links, hidden rows show, and
 * details blocks are plain HTML.
 */
(function () {
  document.documentElement.classList.add("js");

  /** Reveal the rows hidden behind a "show more" button. */
  document.querySelectorAll("[data-show-more]").forEach(function (button) {
    button.addEventListener("click", function () {
      button.parentElement
        .querySelectorAll(".post-row.is-hidden")
        .forEach(function (row) { row.classList.remove("is-hidden"); });
      button.remove();
    });
  });

  /** Topic pills filter the compact list in place instead of navigating. */
  var pills = document.querySelector("[data-topic-pills]");
  var list = document.querySelector("[data-post-list]");
  if (pills && list) {
    pills.addEventListener("click", function (event) {
      var pill = event.target.closest("[data-filter]");
      if (!pill) return;
      event.preventDefault();
      filterList(pill.dataset.filter);
      pills.querySelectorAll("[data-filter]").forEach(function (p) {
        p.classList.toggle("is-active", p === pill);
      });
    });
  }

  function filterList(slug) {
    var any = false;
    list.querySelectorAll(".post-row").forEach(function (row) {
      var show = slug === "all" || row.dataset.category === slug;
      row.hidden = !show;
      if (show) {
        any = true;
        if (slug !== "all") row.classList.remove("is-hidden");
      }
    });
    list.querySelectorAll("[data-show-more]").forEach(function (b) {
      b.hidden = slug !== "all";
    });
    list.querySelectorAll(".post-year").forEach(function (year) {
      var visible = year.querySelectorAll(".post-row:not([hidden])").length;
      year.hidden = visible === 0;
      if (slug !== "all") year.open = true;
      var count = year.querySelector("[data-year-count]");
      if (count) count.textContent = visible + (visible === 1 ? " post" : " posts");
    });
    var empty = list.querySelector("[data-empty]");
    if (empty) empty.hidden = any;
  }

  /** Add a language label and a copy button to every fenced code block. */
  document.querySelectorAll(".highlighter-rouge").forEach(function (block) {
    var pre = block.querySelector("pre");
    if (!pre) return;

    var toolbar = document.createElement("div");
    toolbar.className = "code-toolbar";

    var langMatch = block.className.match(/language-([\w-]+)/);
    if (langMatch && langMatch[1] !== "plaintext") {
      var label = document.createElement("span");
      label.className = "code-lang";
      label.textContent = langMatch[1];
      toolbar.appendChild(label);
    }

    var button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code to clipboard");
    button.addEventListener("click", function () {
      navigator.clipboard.writeText(pre.innerText).then(function () {
        button.textContent = "Copied";
        button.classList.add("is-copied");
        setTimeout(function () {
          button.textContent = "Copy";
          button.classList.remove("is-copied");
        }, 1500);
      });
    });
    toolbar.appendChild(button);

    block.appendChild(toolbar);
  });

  /** On /tags/, open the block named in the URL hash. */
  function openHashTarget() {
    if (!location.hash) return;
    var target = document.getElementById(location.hash.slice(1));
    if (target && target.tagName === "DETAILS") {
      target.open = true;
      target.scrollIntoView();
    }
  }
  openHashTarget();
  window.addEventListener("hashchange", openHashTarget);
})();
