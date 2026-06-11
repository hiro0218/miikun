const eventTarget = new EventTarget();

export const EventBus = {
  $on(name, handler) {
    eventTarget.addEventListener(name, (event) => {
      handler(...event.detail);
    });
  },
  $emit(name, ...args) {
    eventTarget.dispatchEvent(new CustomEvent(name, { detail: args }));
  },
};
