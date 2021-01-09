import { _fetchLocal } from "./../scripts/api/index.js";

export default class Header extends HTMLElement {
  constructor() {
    super();
    _fetchLocal("/components", "Header.html").subscribe({
      next: (data) => {
        this.innerHTML = data.response;
      },
    });
  }
}
