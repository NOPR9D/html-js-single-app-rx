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
