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
