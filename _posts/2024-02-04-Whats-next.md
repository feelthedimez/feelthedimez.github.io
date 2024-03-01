---
layout: post
title: "What's next?"
date: 2024-02-04 22:32:00 +0200
tags: [Software Engineering]
archive: false
permalink: /:title
featured_img: assets/img/image.jpg
---

![]({{page.featured_img | relative_url}})

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla condimentum dui sed ex semper porttitor. Cras gravida ligula in faucibus varius. Sed placerat diam eu erat consectetur, ut tincidunt nibh ullamcorper. Suspendisse molestie ante a condimentum interdum. Donec id erat dui. Sed porta sed erat ut vehicula. Fusce pulvinar diam urna, quis hendrerit ipsum porta eu. Cras eget arcu dui. Curabitur pretium libero metus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur lacinia cursus nibh. Vivamus tempus lorem ut felis sollicitudin sollicitudin. Donec quis justo ut massa cursus porta vitae in ligula. Praesent non libero varius, cursus dolor non, tempus urna. Integer vitae sodales diam.

> A crazy world we live in yea?

```typescript
interface Account {
  id: number;
  displayName: string;
  version: 1;
}

function welcome(user: Account) {
  console.log(user.id);
}
```

```ruby
def sum_eq_n?(arr, n)
  return true if arr.empty? && n == 0

  arr.product(arr).reject { |a,b| a == b }.any? { |a,b| a + b == n }
end
```
