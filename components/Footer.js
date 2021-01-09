import { _fetchLocal } from "./../scripts/api/index.js";

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
