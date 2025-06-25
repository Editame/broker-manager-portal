import { useState, useEffect } from 'react';

/**
 * Hook para debouncing - evita ejecutar funciones muy frecuentemente
 * Mejora el rendimiento al reducir peticiones innecesarias
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
