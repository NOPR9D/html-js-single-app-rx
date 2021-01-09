| _<a id="backToTable"></a> Table _                                                       |
| --------------------------------------------------------------------------------------- |
| _<a id="introPartTop"></a> [How ?](#htmlPart)_                                          |
| _<a id="htmlPartTop"></a> [Basic, add your Html](#htmlPart)_                            |
| _<a id="rxPartTop"></a> [Implement RxJS from Scratch](#rxPart)_                         |
| _<a id="fetchHtmlPartTop"></a> [Fetch html files, Generate components](#fetchHtmlPart)_ |
| _<a id="routerPartTop"></a> [Router and Pages](#routerPart)_                            |
| _<a id="codeVizExempleTop"></a> [Codeviz Exemple](#codeVizExemple)_                     |

---

# <a id="htmlPart"></a> [How ?](#backToTable)

So, you have already worked on current frameworks like Angular, Vue or React and you wanna build a single page app.

But this time you wanna challenge yourself and build all from strach, if this is not enougth you also wanna implement your own RxJS.

Here we will see how we can do this, simply and efficiently.

So for this we will just use javascript, Html, Css and nodejs for live-refresh

Before if you want you can take a look to :

- [HTML Custom Elements](https://developers.google.com/web/fundamentals/web-components/customelements)
- [RxJS from scratch (by _Andrea Bertoli_)](https://dev.to/mr_bertoli/rxjs-from-scratch-observables-hl6)

---

# <a id="htmlPart"></a> [Basic, add your Html](#backToTable)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <title>Exemple</title>
  </head>
  <body>
    <my-header></my-header>
    <div id="app"></div>
    <my-footer></my-footer>
  </body>
  <script type="module" src="./index.js"></script>
  <link rel="stylesheet" href="./styles/index.css" />
</html>
```

```html
<script type="module" src="./index.js"></script>
```

Cause we import our script like a module, we import any other js file with "import { } from './any.js'" in our js file.

```html
<my-header></my-header>

<my-footer></my-footer>
```

```html
<div id="app"></div>
```

This is the container we will use for our single app view.

These Custom elements are undefined for the moment, later you will be able to replace 'my-' with your own naming convention.

---

# <a id="rxPart"></a> [Implement RxJS from Scratch](#backToTable)

For this part we can say Thanks to [Andrea Bertoli](https://dev.to/mr_bertoli) for [Implements RxJS from Scratch](https://dev.to/mr_bertoli/rxjs-from-scratch-observables-hl6), we will use a lighter version

So,

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/ubcgkvzequ02lk4ww74m.gif)

If you want to implements our own RxJS we need to begin with Subscriptions class, this is a container for functions, including the old one. When you call the `unsubscribe` method, each of there functions will be called.

```javascript
// a container for functions
class Subscription {
  constructor() {
    this.teardowns = [];
  }
  add(teardown) {
    this.teardowns.push(teardown);
  }
  unsubscribe() {
    this.teardowns.forEach((teardown) => teardown());
    this.teardowns = [];
  }
}
```

Observable

Operator composition with pipe

The concept of `pipe` if simple, it combiens `n` functions, calling each with the output of the last one.
This is the logic we need to chain Observables, the `pipe` method will return another Observable.

```javascript
const pipe = (...fns) => (val) => fns.reduce((acc, f) => f(acc), val);
```

With `pipe`, we need to implement the Observable abstraction with a class too.

When we init it, this class requires a function as argument `initFunc`, so we use the subscribe function, the `initFunc` will be called with the observer as argument.

```javascript
const pipe = (...fns) => (val) => fns.reduce((acc, f) => f(acc), val);

class Observable {
  constructor(initFunc) {
    this.initFunc = initFunc;
  }
  subscribe(observer) {
    const subscription = new Subscription();
    const subscriber = new Subscriber(observer, subscription);
    const teardown = this.initFunc(subscriber);
    subscription.add(teardown);
    return subscription;
  }
  pipe(...fns) {
    // provide source Obx to each function returned from pipeable operators,
    // to start the chaining operation provide the current source Obx (this)
    return pipe(...fns)(this);
  }
}
```

At last we need to implement an proxy-like object, the role of `Subscriber` class is to stops the event propagation into the wrapped Observer if `complete` is called.

```javascript
// a safe wrapper around observers
export default class Subscriber {
  constructor(_observer, _subscription) {
    this.observer = _observer;
    this.closed = false;
    this.subscription = _subscription;
    // 1. add an Observer completion logic to the Subscription container
    this.subscription.add(() => (this.closed = true)); // <- first function inside the subscription
  }
  next(value) {
    if (!this.closed) {
      this.observer.next(value);
    }
  }
  error(err) {
    if (!this.closed) {
      this.closed = true;
      this.observer.error(err);
      // 2. enable the Subscriber to call `unsubscribe` on completion
      this.subscription.unsubscribe(); // <- unsubscribe on error
    }
  }
  complete() {
    if (!this.closed) {
      this.closed = true;
      this.observer.complete();
      this.subscription.unsubscribe(); // <- unsubscribe on completion
    }
  }
}
```

---

# <a id="fetchHtmlPart"></a> [Fetch html files | Generate components](#backToTable)

Welcome to the fetch part ! Cause we are in local use and without any dependencies, we need to fetch ourself our html files. No, you can't juste import them like `import * as htmlTemplate from './template.html`.

But you know what? Now we had implemented our own RxJS, we can use an Observable instead of a Promise.

We can create a method called `_fetchLocal` in a `api.js` file, return a new `Observable` with the request value.

`_fetchLocal` will take the path and the name of the html file you wanna import. (So we can import page and components with the same function).

```javascript
import Observable from "./../reactive/Observable.js";

export const _fetchLocal = (path, file) => {
  return new Observable((observer) => {
    const req = new XMLHttpRequest();
    const url = `${path}/${file}`;
    req.responseType = "text/html";
    req.open("GET", url);
    req.send();
    req.onloadend = (e) => {
      observer.next(req);
    };
  });
};
```

Now you can create a `dom.js` file and put in it the `registerComponent` function, this function will take the component Class ass argument.

In this function you can customise your own naming convention for component or page (feel free to add your logic to this function)

```javascript
export const registerComponent = (componentClass) => {
  const componentName = `my-${componentClass.name.toLowerCase()}`;
  customElements.define(componentName, componentClass);
};
```

Now we had your base and we can begin to work easier, let's create a compoments folder and create our first compomenents.

In it create files for footer and header (`Footer.html`,`Footer.js`,`Header.html`,`Header.js`), don't forget, we use [Custom Elements](https://developers.google.com/web/fundamentals/web-components/customelements), so in this case we extends our class to `HTMLElement`.

In the constructor we fetch the associated template with our `_fetchLocal` method.

```html
<!-- footer -->
<div class="footer">
  Hey footer
</div>
```

```javascript
import { _fetchLocal } from "./../scripts/api/index.js";

// Footer
export default class Footer extends HTMLElement {
  constructor() {
    super();
    _fetchLocal("/components", "Footer.html").subscribe({
      next: (data) => {
        this.innerHTML = data.response;
      },
    });
  }
}
```

---

```html
<!-- header -->
<div class="flex-row">
  <nav class="nav">
    <a href="/" class="nav__link" data-link>Home</a>
    <a href="/dashboard" class="nav__link" data-link>Dashboard</a>
    <a href="/thispagedontexist" class="nav__link" data-link
      >This page don't exist</a
    >
  </nav>
</div>
```

```javascript
// Header
export default class Header extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    _fetchLocal("/components", "Header.html").subscribe({
      next: (data) => {
        this.innerHTML = data.response;
      },
    });
  }
}
```

---

So, now we need to register our component.

In our main.js create a `define` method, we register all of our component in it, for that we use our `registerComponent`.

Put the `define` method in your `init` function.

```javascript
import Header from "./../components/Header.js";
import Footer from "./../components/Footer.js";

import { _fetchLocal } from "./api/index.js";

import { registerComponent } from "./dom/index.js";

export function init() {
  define();
}

function define() {
  registerComponent(Header);
  registerComponent(Footer);
}
```

---

# <a id="routerPart"></a> [Router and Pages](#backToTable)

We had our reactive logic, our components are reconized by the app, now we can attack the `Router` and `Pages`.

We begin with the easlier, like the components we can create the files for our pages, we also respect the component logic.

So we can create files for 404, Dashboard and Home into a `pages` folder. (`404.html`,`404.js`,`Dashboard.html`,`Dashboard.js`,`Home.html`,`Home.js`)

```html
<!-- 404 -->
<div class="404">
  <div>Are you lost ?</div>
</div>
```

```javascript
import { _fetchLocal } from "./../scripts/api/index.js";

export default class NotFound extends HTMLElement {
  constructor() {
    super();
    _fetchLocal("/components", "404.html").subscribe({
      next: (data) => {
        this.innerHTML = data.response;
      },
    });
  }
}
```

---

```html
<!-- Dashboard -->
<div class="dashboard">
  <div>this is dashboard</div>
</div>
```

```javascript
import { _fetchLocal } from "./../scripts/api/index.js";

export default class Dashboard extends HTMLElement {
  constructor() {
    super();
    _fetchLocal("/components", "Dashboard.html").subscribe({
      next: (data) => {
        this.innerHTML = data.response;
      },
    });
  }
}
```

---

```html
<!-- Home -->
<div class="home">
  <div>this is home</div>
</div>
```

```javascript
import { _fetchLocal } from "./../scripts/api/index.js";

export default class Home extends HTMLElement {
  constructor() {
    super();
    _fetchLocal("/components", "Home.html").subscribe({
      next: (data) => {
        this.innerHTML = data.response;
      },
    });
  }
}
```

So create a `router` folder and `index.js` file.

In our `index.js` file you can put our routing logic into and `routes` Object with `path` and `component` as key.

Like this :

```javascript
export * as Utils from "./utils.js";

export const routes = [
  { path: "/", component: "Home" },
  { path: "/dashboard", component: "Dashboard" },
  { path: "/home", component: "Home" },
  { path: "/404", component: "404" },
];
```

Now we need a `Views` class, so we can set the fetched `HTML` provided by the view into our `#app` container.

In the constructor get the user location pathname, compare it to the path of our `routes`, if no match we will show the 404 page.

The `getHtml` method return the result of `_fetchLocal` and the `setView` method put the fetched html into the `#app` container.

```javascript
import { routes } from "./../router/index.js";
import { _fetchLocal } from "./../api/index.js";

export default class Views {
  layout;
  constructor() {
    this.layout = routes.filter((route) => {
      return route.path === location.pathname;
    })[0] || { component: "404" };
    this.getHtml().subscribe({ next: this.setView });
  }

  getHtml() {
    return _fetchLocal("/pages", `${this.layout.component}.html`);
  }

  setView(data) {
    document.querySelector("#app").innerHTML = data.response;
  }
}
```

Comeback to our `main.js` file and call an instance of `Views` class in the `define` function.

```javascript
import Header from "./../components/Header.js";
import Footer from "./../components/Footer.js";

import { _fetchLocal } from "./api/index.js";

import { registerComponent } from "./dom/index.js";
import Views from "./dom/views.js";

export function init() {
  define();
}

function define() {
  registerComponent(Header);
  registerComponent(Footer);

  new Views();
}
```

For the presentation we can add a little of css, for auto-size and centered layout add this :

```css
html,
body {
  height: 100%;
  width: auto;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* reset all */
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

a {
  padding: 0.25em;
}

#app {
  display: flex;
  flex-grow: 1;
  align-items: center;
  align-self: center;
}
```

---

# <a id="codeVizExemple"></a> [Codeviz Exemple](#backToTable)

```javascript
```
