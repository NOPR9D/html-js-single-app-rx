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
