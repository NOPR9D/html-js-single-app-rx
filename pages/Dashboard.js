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
