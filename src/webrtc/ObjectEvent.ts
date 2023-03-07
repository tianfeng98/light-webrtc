export type EventHandler<T> = (e: T) => void;

class ObjectEvent {
  private listenerList: Record<string, EventHandler<any>> = {};

  dispatchEvent<T>(name: string, e: T) {
    this.listenerList[name]?.(e);
  }

  addEventListener<T>(name: string, callback: EventHandler<T>) {
    this.listenerList[name] = callback;
  }

  on<T>(name: string, callback: EventHandler<T>) {
    return this.addEventListener<T>(name, callback);
  }

  removeEventListener(name: string) {
    delete this.listenerList[name];
  }

  clearEvents() {
    this.listenerList = {};
  }
}

export default ObjectEvent;
