import { ref, shallowRef, watchEffect } from 'vue';
import localforage from 'localforage';

localforage.config({
  driver: localforage.INDEXEDDB,
});

const useLocalForage = <StoredValueType>(
  key: string,
  initialValue: StoredValueType,
): {
  storedValue: StoredValueType;
  setValue: (value: StoredValueType | ((val: StoredValueType) => StoredValueType)) => Promise<void>;
  remove: () => Promise<void>;
  error: Error | undefined;
  getValue: () => Promise<StoredValueType | null>;
} => {
  const storedValue = shallowRef<StoredValueType>(initialValue);
  const error = ref<Error>();

  // TODO: Im not too sure we need this. The was a convert from the react SHQ code.
  // which used a useEffect hook. I think we can just use a watch on the key and
  // initialValue and then set the storedValue.value to the saved value.
  watchEffect(() => {
    (async () => {
      try {
        const savedValue = (await localforage.getItem(key)) as StoredValueType;
        storedValue.value = savedValue ?? initialValue;
      } catch (err) {
        if (err instanceof Error) {
          error.value = err;
        }
      }
    })();
  });

  async function setValue(value: StoredValueType | ((val: StoredValueType) => StoredValueType)) {
    try {
      const valueToStore = value instanceof Function ? value(storedValue.value) : value;
      // Save state
      storedValue.value = valueToStore;
      // Save to local storage
      await localforage.setItem(key, valueToStore);
    } catch (err) {
      if (err instanceof Error) {
        error.value = err;
      }
    }
  }

  async function remove() {
    try {
      await localforage.removeItem(key);
      storedValue.value = initialValue;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err;
      }
    }
  }

  async function getValue(): Promise<StoredValueType | null> {
    return localforage.getItem(key);
  }

  return {
    storedValue: storedValue.value,
    setValue,
    remove,
    error: error.value,
    getValue,
  };
};

export default useLocalForage;
