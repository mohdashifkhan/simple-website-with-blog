"use strict";

// Suppress [ts] Cannot find name 'QUnit'.
// eslint-disable-next-line no-var, no-use-before-define
var QUnit = QUnit;

const assertSingleTagText = (assert, document, tag, text) => {
  assert.equal(document.getElementsByTagName(tag).length, 1);
  assert.equal(document.getElementsByTagName(tag)[0].innerText, text);
};

const assertElementNameText = (assert, element, name, text) => {
  assert.equal(element.nodeName, name);
  assert.equal(element.textContent, text);
};

QUnit.module("Requirements");

QUnit.test("Browser supports fetch API", (assert) => {
  assert.expect(1);
  assert.ok(fetch);
});

QUnit.module("Static");

QUnit.test("Get of / returns expected HTTP headers", (assert) => {
  assert.expect(13);
  const done = assert.async();
  fetch("/").
    then((response) => {
      const {headers} = response;
      [
        // Content headers
        "Content-Encoding",
        "Content-Type",
        // Caching headers
        "Cache-Control",
        "ETag",
        "Last-Modified",
        // Security headers
        "Content-Security-Policy",
        "Referrer-Policy",
        "Strict-Transport-Security",
        "X-Content-Type-Options",
        "X-DNS-Prefetch-Control",
        "X-Download-Options",
        "X-Frame-Options",
        "X-XSS-Protection"
      ].forEach((name) => {
        assert.ok(headers.has(name));
      });
    }).
    then(done);
});

QUnit.test("Get of / returns ok and compressed HTML", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/").
    then((response) => {
      assert.ok(response.ok);
      assert.equal(response.headers.get("Content-Encoding"), "gzip");
      assert.equal(response.headers.get("Content-Type"), "text/html; charset=UTF-8");
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
    }).
    then(done);
});

QUnit.test("Get of /tests.js returns ok and compressed JS", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/tests.js").
    then((response) => {
      assert.ok(response.ok);
      assert.equal(response.headers.get("Content-Encoding"), "gzip");
      assert.equal(response.headers.get("Content-Type"), "application/javascript; charset=UTF-8");
      return response.text();
    }).
    then((text) => {
      assert.ok((/^"use strict";/u).test(text));
    }).
    then(done);
});

QUnit.test("Get of /missing returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/missing").
    then((response) => {
      assert.ok(!response.ok);
      assert.equal(response.status, 404);
      assert.equal(response.statusText, "Not Found");
      return response.text();
    }).
    then((text) => {
      assert.equal(text, "Not Found");
    }).
    then(done);
});

QUnit.module("List");

QUnit.test("Get of /blog returns ok, compressed HTML, and 10 posts", (assert) => {
  assert.expect(28);
  const done = assert.async();
  fetch("/blog").
    then((response) => {
      assert.ok(response.ok);
      assert.equal(response.headers.get("Content-Encoding"), "gzip");
      assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
      const doc = new DOMParser().parseFromString(text, "text/html");
      assertSingleTagText(assert, doc, "title", "simple-website-with-blog/test");
      assertSingleTagText(assert, doc, "h1", "Test blog");
      assertSingleTagText(assert, doc, "h2", "");
      assert.equal(doc.getElementsByTagName("h3").length, 10);
      const postTitles = "one two three four five six seven eight nine ten".split(" ");
      for (const item of doc.getElementsByTagName("h3")) {
        assert.equal(item.innerText, postTitles.shift());
      }
      assert.equal(doc.getElementsByTagName("a").length, 7);
      const nav = doc.getElementsByClassName("navigation");
      assert.equal(nav.length, 1);
      assert.equal(nav[0].childElementCount, 1);
      assertElementNameText(assert, nav[0].firstElementChild, "A", "Next Posts \u00bb");
      assert.equal(nav[0].firstElementChild.getAttribute("href"), "/blog?page=eleven");
      assert.equal(doc.getElementsByTagName("li").length, 6);
    }).
    then(done);
});

QUnit.test("Get of /blog?page=eleven returns ok and 10 posts", (assert) => {
  assert.expect(29);
  const done = assert.async();
  fetch("/blog?page=eleven").
    then((response) => {
      assert.ok(response.ok);
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
      const doc = new DOMParser().parseFromString(text, "text/html");
      assertSingleTagText(assert, doc, "title", "simple-website-with-blog/test");
      assertSingleTagText(assert, doc, "h1", "Test blog");
      assertSingleTagText(assert, doc, "h2", "");
      assert.equal(doc.getElementsByTagName("h3").length, 10);
      const postTitles =
        "eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty".
          split(" ");
      for (const item of doc.getElementsByTagName("h3")) {
        assert.equal(item.innerText, postTitles.shift());
      }
      assert.equal(doc.getElementsByTagName("a").length, 8);
      const nav = doc.getElementsByClassName("navigation");
      assert.equal(nav.length, 1);
      assert.equal(nav[0].childElementCount, 2);
      assertElementNameText(assert, nav[0].firstElementChild, "A", "\u00ab Previous Posts");
      assert.equal(nav[0].firstElementChild.getAttribute("href"), "/blog");
      assertElementNameText(assert, nav[0].lastElementChild, "A", "Next Posts \u00bb");
      assert.equal(nav[0].lastElementChild.getAttribute("href"), "/blog?page=twentyone");
      assert.equal(doc.getElementsByTagName("li").length, 6);
    }).
    then(done);
});

QUnit.test("Get of /blog?page=twentyone returns ok and 1 post", (assert) => {
  assert.expect(17);
  const done = assert.async();
  fetch("/blog?page=twentyone").
    then((response) => {
      assert.ok(response.ok);
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
      const doc = new DOMParser().parseFromString(text, "text/html");
      assertSingleTagText(assert, doc, "title", "simple-website-with-blog/test");
      assertSingleTagText(assert, doc, "h1", "Test blog");
      assertSingleTagText(assert, doc, "h2", "");
      assert.equal(doc.getElementsByTagName("h3").length, 1);
      const postTitles = "twentyone".split(" ");
      for (const item of doc.getElementsByTagName("h3")) {
        assert.equal(item.innerText, postTitles.shift());
      }
      assert.equal(doc.getElementsByTagName("a").length, 7);
      const nav = doc.getElementsByClassName("navigation");
      assert.equal(nav.length, 1);
      assert.equal(nav[0].childElementCount, 1);
      assertElementNameText(assert, nav[0].firstElementChild, "A", "\u00ab Previous Posts");
      assert.equal(nav[0].firstElementChild.getAttribute("href"), "/blog?page=eleven");
      assert.equal(doc.getElementsByTagName("li").length, 6);
    }).
    then(done);
});

QUnit.module("Post");

QUnit.test("Get of /blog/post/one (publish date) returns ok and compressed HTML", (assert) => {
  assert.expect(28);
  const done = assert.async();
  fetch("/blog/post/one").
    then((response) => {
      assert.ok(response.ok);
      assert.equal(response.headers.get("Content-Encoding"), "gzip");
      assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
      const doc = new DOMParser().parseFromString(text, "text/html");
      assertSingleTagText(assert, doc, "title", "Test post - one - simple-website-with-blog/test");
      assertSingleTagText(assert, doc, "h1", "Test blog");
      assertSingleTagText(assert, doc, "h2", "");
      assertSingleTagText(assert, doc, "h3", "one");
      assertSingleTagText(assert, doc, "h4", "Test post - one");
      assertSingleTagText(assert, doc, "h5", "2018-02-28T12:00:00.000Z");
      assertSingleTagText(assert, doc, "h5", "2018-02-28T12:00:00.000Z");
      assert.equal(doc.getElementsByTagName("div").length, 1);
      assert.equal(doc.getElementsByTagName("div")[0].childElementCount, 3);
      const [parent] = doc.getElementsByTagName("div");
      assertElementNameText(assert, parent.childNodes[0], "P", "Content");
      assertElementNameText(assert, parent.childNodes[1], "P", "for");
      assertElementNameText(assert, parent.childNodes[2], "P", "one");
      assert.equal(doc.getElementsByTagName("a").length, 6);
      assert.equal(doc.getElementsByTagName("li").length, 6);
    }).
    then(done);
});

QUnit.test(
  "Get of /blog/post/eleven (publish/content dates, Markdown) returns ok and content",
  (assert) => {
    assert.expect(24);
    const done = assert.async();
    fetch("/blog/post/eleven").
      then((response) => {
        assert.ok(response.ok);
        return response.text();
      }).
      then((text) => {
        assert.ok((/^<!DOCTYPE html>/u).test(text));
        const doc = new DOMParser().parseFromString(text, "text/html");
        assertSingleTagText(
          assert,
          doc,
          "title",
          "Test post - eleven - simple-website-with-blog/test"
        );
        assertSingleTagText(assert, doc, "h1", "Test blog");
        assertSingleTagText(assert, doc, "h2", "");
        assertSingleTagText(assert, doc, "h3", "eleven");
        assertSingleTagText(assert, doc, "h4", "Test post - eleven");
        assertSingleTagText(assert, doc, "h5", "2017-11-01T12:00:00.000Z");
        assertSingleTagText(assert, doc, "h6", "2017-11-20T12:00:00.000Z");
        assert.equal(doc.getElementsByTagName("div").length, 1);
        assert.equal(doc.getElementsByTagName("div")[0].childElementCount, 1);
        const content = doc.getElementsByTagName("div")[0].firstElementChild;
        assertElementNameText(assert, content, "P", "Content for eleven");
        assertElementNameText(assert, content.firstElementChild, "STRONG", "eleven");
        assert.equal(doc.getElementsByTagName("a").length, 6);
        assert.equal(doc.getElementsByTagName("li").length, 6);
      }).
      then(done);
  }
);

QUnit.test("Get of /blog/post/twenty (Markdown+code) returns ok and highlighting", (assert) => {
  assert.expect(3);
  const done = assert.async();
  fetch("/blog/post/twenty").
    then((response) => {
      assert.ok(response.ok);
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
      const doc = new DOMParser().parseFromString(text, "text/html");
      assert.equal(doc.getElementsByClassName("language-js").length, 1);
    }).
    then(done);
});

QUnit.test("Get of /blog/post/nan (no dates, HTML) returns ok and content", (assert) => {
  assert.expect(24);
  const done = assert.async();
  fetch("/blog/post/nan").
    then((response) => {
      assert.ok(response.ok);
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
      const doc = new DOMParser().parseFromString(text, "text/html");
      assertSingleTagText(assert, doc, "title", "Test post - nan - simple-website-with-blog/test");
      assertSingleTagText(assert, doc, "h1", "Test blog");
      assertSingleTagText(assert, doc, "h2", "");
      assertSingleTagText(assert, doc, "h3", "nan");
      assertSingleTagText(assert, doc, "h4", "Test post - nan");
      assertSingleTagText(assert, doc, "h5", "1970-01-01T00:00:00.000Z");
      assertSingleTagText(assert, doc, "h6", "1970-01-01T00:00:00.000Z");
      assert.equal(doc.getElementsByTagName("div").length, 1);
      assert.equal(doc.getElementsByTagName("div")[0].childElementCount, 1);
      const content = doc.getElementsByTagName("div")[0].firstElementChild;
      assertElementNameText(assert, content, "P", "Content for nan");
      assertElementNameText(assert, content.firstElementChild, "I", "nan");
      assert.equal(doc.getElementsByTagName("a").length, 6);
      assert.equal(doc.getElementsByTagName("li").length, 6);
    }).
    then(done);
});

QUnit.test("Get of /blog/post/zero (unpublished) returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/blog/post/zero").
    then((response) => {
      assert.ok(!response.ok);
      assert.equal(response.status, 404);
      assert.equal(response.statusText, "Not Found");
      return response.text();
    }).
    then((text) => {
      assert.equal(text, "Not Found");
    }).
    then(done);
});

QUnit.module("Search");

QUnit.test("Get of /blog/search?query=tw* returns ok, compressed HTML, and 4 posts", (assert) => {
  assert.expect(17);
  const done = assert.async();
  fetch("/blog/search?query=tw*").
    then((response) => {
      assert.ok(response.ok);
      assert.equal(response.headers.get("Content-Encoding"), "gzip");
      assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
      const doc = new DOMParser().parseFromString(text, "text/html");
      assertSingleTagText(assert, doc, "title", "Search: tw* - simple-website-with-blog/test");
      assertSingleTagText(assert, doc, "h1", "Test blog");
      assertSingleTagText(assert, doc, "h2", "Search: tw*");
      assert.equal(doc.getElementsByTagName("h3").length, 4);
      const postTitles = "two twentyone twenty twelve".split(" ");
      for (const item of doc.getElementsByTagName("h3")) {
        assert.equal(item.innerText, postTitles.shift());
      }
      assert.equal(doc.getElementsByTagName("a").length, 6);
      assert.equal(doc.getElementsByTagName("li").length, 6);
    }).
    then(done);
});

QUnit.test(
  "Get of /blog/search?query=content&page=thirteen returns ok, compressed HTML, and 10 posts",
  (assert) => {
    assert.expect(11);
    const done = assert.async();
    fetch("/blog/search?query=content&page=thirteen").
      then((response) => {
        assert.ok(response.ok);
        return response.text();
      }).
      then((text) => {
        assert.ok((/^<!DOCTYPE html>/u).test(text));
        const doc = new DOMParser().parseFromString(text, "text/html");
        assertSingleTagText(
          assert,
          doc,
          "title",
          "Search: content - simple-website-with-blog/test"
        );
        assertSingleTagText(assert, doc, "h1", "Test blog");
        assertSingleTagText(assert, doc, "h2", "Search: content");
        assert.equal(doc.getElementsByTagName("h3").length, 10);
        assert.equal(doc.getElementsByTagName("a").length, 7);
        assert.equal(doc.getElementsByTagName("li").length, 6);
      }).
      then(done);
  }
);

QUnit.test("Get of /blog/search?query=missing returns ok and 0 posts", (assert) => {
  assert.expect(11);
  const done = assert.async();
  fetch("/blog/search?query=missing").
    then((response) => {
      assert.ok(response.ok);
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
      const doc = new DOMParser().parseFromString(text, "text/html");
      assertSingleTagText(assert, doc, "title", "Search: missing - simple-website-with-blog/test");
      assertSingleTagText(assert, doc, "h1", "Test blog");
      assertSingleTagText(assert, doc, "h2", "Search: missing");
      assert.equal(doc.getElementsByTagName("h3").length, 0);
      assert.equal(doc.getElementsByTagName("a").length, 6);
      assert.equal(doc.getElementsByTagName("li").length, 6);
    }).
    then(done);
});

QUnit.test("Get of /blog/search returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/blog/search").
    then((response) => {
      assert.ok(!response.ok);
      assert.equal(response.status, 404);
      assert.equal(response.statusText, "Not Found");
      return response.text();
    }).
    then((text) => {
      assert.equal(text, "Not Found");
    }).
    then(done);
});

QUnit.module("Archive");

QUnit.test("Get of /blog returns 6 archive links", (assert) => {
  assert.expect(21);
  const done = assert.async();
  fetch("/blog").
    then((response) => {
      assert.ok(response.ok);
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
      const doc = new DOMParser().parseFromString(text, "text/html");
      assert.equal(doc.getElementsByTagName("li").length, 6);
      const archiveText =
        "February 2018,January 2018,December 2017,November 2017,October 2017,September 2017".
          split(",");
      const archiveLinks = "201802,201801,201712,201711,201710,201709".split(",");
      for (const li of doc.getElementsByTagName("li")) {
        assertElementNameText(assert, li.firstElementChild, "A", archiveText.shift());
        const href = `/blog/archive/${archiveLinks.shift()}`;
        assert.equal(li.firstElementChild.getAttribute("href"), href);
      }
    }).
    then(done);
});

QUnit.test("Get of /blog/archive/201801 returns ok, compressed HTML, and 3 posts", (assert) => {
  assert.expect(16);
  const done = assert.async();
  fetch("/blog/archive/201801").
    then((response) => {
      assert.ok(response.ok);
      assert.equal(response.headers.get("Content-Encoding"), "gzip");
      assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
      return response.text();
    }).
    then((text) => {
      assert.ok((/^<!DOCTYPE html>/u).test(text));
      const doc = new DOMParser().parseFromString(text, "text/html");
      assertSingleTagText(
        assert,
        doc,
        "title",
        "Posts from January 2018 - simple-website-with-blog/test"
      );
      assertSingleTagText(assert, doc, "h1", "Test blog");
      assertSingleTagText(assert, doc, "h2", "Posts from January 2018");
      assert.equal(doc.getElementsByTagName("h3").length, 3);
      const postTitles = "four five six".split(" ");
      for (const item of doc.getElementsByTagName("h3")) {
        assert.equal(item.innerText, postTitles.shift());
      }
      assert.equal(doc.getElementsByTagName("a").length, 6);
      assert.equal(doc.getElementsByTagName("li").length, 6);
    }).
    then(done);
});

QUnit.test("Get of /blog/archive/300001 (unpublished post) returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/blog/archive/300001").
    then((response) => {
      assert.ok(!response.ok);
      assert.equal(response.status, 404);
      assert.equal(response.statusText, "Not Found");
      return response.text();
    }).
    then((text) => {
      assert.equal(text, "Not Found");
    }).
    then(done);
});

QUnit.test("Get of /blog/archive/1234 (unpublished post) returns 404", (assert) => {
  assert.expect(4);
  const done = assert.async();
  fetch("/blog/archive/1234").
    then((response) => {
      assert.ok(!response.ok);
      assert.equal(response.status, 404);
      assert.equal(response.statusText, "Not Found");
      return response.text();
    }).
    then((text) => {
      assert.equal(text, "Not Found");
    }).
    then(done);
});
