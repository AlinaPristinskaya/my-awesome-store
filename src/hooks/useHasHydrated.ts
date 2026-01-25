import { useSyncExternalStore } from 'react';

// Заглушка для сервера
const emptySubscribe = () => () => {};

export function useHasHydrated() {
  const hasHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,  // Значение на клиенте
    () => false  // Значение на сервере
  );

  return hasHydrated;
}