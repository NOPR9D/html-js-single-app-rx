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
