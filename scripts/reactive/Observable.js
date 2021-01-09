import Subscriber from "./Subscriber.js";
import Subscription from "./Subscription.js";

const pipe = (...fns) => (val) => fns.reduce((acc, f) => f(acc), val);

export default class Observable {
  constructor(initFunc) {
    this.initFunc = initFunc;
  }
  subscribe(observer) {
    const subscription = new Subscription();
    const subscriber = new Subscriber(observer, subscription); // <- passed by reference

    const teardown = this.initFunc(subscriber);
    // 3. add the teardown logic to the Subscription instance
    subscription.add(teardown); // <- second function inside the subscription

    return subscription;
  }
  pipe(...fns) {
    // provide source Obx to each function returned from pipeable operators,
    // to start the chaining operation provide the current source Obx (this)
    return pipe(...fns)(this);
  }
}
