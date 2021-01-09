import Observable from "./Observable.js";

// THROTTLE TIME operator
const throttleTime = (time) => (sourceObservable) => {
  let lastEventTime = 0;
  return new Observable((observer) => {
    const sourceSubscription = sourceObservable.subscribe({
      next(val) {
        // rarefy event emission
        if (Date.now() - lastEventTime > time) {
          lastEventTime = Date.now();
          observer.next(val);
        }
      },
      error: (err) => observer.error(err),
      complete: () => observer.complete(),
    });
    return () => sourceSubscription.unsubscribe();
  });
};

// DEBOUNCE TIME operator
const debounceTime = (delay) => (sourceObservable) => {
  let interval;
  return new Observable((observer) => {
    const sourceSubscription = sourceObservable.subscribe({
      next: (val) => {
        // postpone and group rapid sequences of events
        clearInterval(interval);
        interval = setTimeout(() => observer.next(val), delay);
      },
      error: (err) => observer.error(err),
      complete: () => observer.complete(),
    });
    return () => {
      // teardown logic
      clearInterval(interval);
      sourceSubscription.unsubscribe();
    };
  });
};

// map operator
const map = (mapFunc) => (sourceObservable) => {
  // return a new Observable
  return new Observable((observer) => {
    const sourceSubscription = sourceObservable.subscribe({
      next(val) {
        let next;
        try {
          next = mapFunc(val);
        } catch (e) {
          this.error(e);
          this.complete();
        }
        observer.next(next);
      },
      error(err) {
        observer.error(err);
      },
      complete() {
        observer.complete();
      },
    });
    return () => {
      // --- operator specific TEARDOWN LOGIC
      // when the new Obx is unsubscribed
      // simply unsubscribe from the source Obx
      sourceSubscription.unsubscribe();
    };
  });
};

// TAKE operator
const take = (howMany) => (sourceObservable) => {
  let counter = 0;
  return new Observable((observer) => {
    const sourceSubscription = sourceObservable.subscribe({
      next: (val) => {
        counter++;
        observer.next(val);
        if (counter >= howMany) {
          this.complete();
          sourceSubscription.unsubscribe();
        }
      },
      error: (err) => observer.error(err),
      complete: () => observer.complete(),
    });
    return () => sourceSubscription.unsubscribe();
  });
};

// SWITCH MAP operator
const switchMap = (innerObxReturningFunc) => (sourceObx) => {
  let innerSubscription;
  return new Observable((observer) => {
    const sourceSubscription = sourceObx.subscribe({
      next(val) {
        // unsubscribe from previous subscription if exists
        innerSubscription && innerSubscription.unsubscribe();

        // subscribe to inner Observable
        const innerObx = innerObxReturningFunc(val);
        innerSubscription = innerObx.subscribe({
          // <- start the inner Obx
          next: (_val) => observer.next(_val),
          error: (_err) => observer.error(_err),
          complete: () => observer.complete(),
        });
      },
      error() {
        // doesn’t care about source Obx errors
      },
      complete() {
        // doesn’t care about source Obx completion
      },
    });
    return () => {
      innerSubscription.unsubscribe();
      sourceSubscription.unsubscribe();
    };
  });
};

export { debounceTime, switchMap, take, throttleTime, map };
