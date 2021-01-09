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
