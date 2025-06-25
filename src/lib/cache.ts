/**
 * Sistema de cache simple para optimizar peticiones repetitivas
 * Reduce la carga en el broker y mejora el rendimiento
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en milisegundos
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlSeconds: number = 10): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar si el cache ha expirado
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Verificar si el cache ha expirado
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpiar entradas expiradas
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Instancia global del cache
export const apiCache = new SimpleCache();

// Limpiar cache cada 30 segundos
setInterval(() => {
  apiCache.cleanup();
}, 30000);

// Función helper para cachear peticiones
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 10
): Promise<T> {
  // Intentar obtener del cache primero
  const cached = apiCache.get<T>(key);
  if (cached !== null) {
    console.log(`Cache hit for: ${key}`);
    return cached;
  }

  // Si no está en cache, hacer la petición
  console.log(`Cache miss for: ${key} - fetching...`);
  const data = await fetchFn();
  
  // Guardar en cache
  apiCache.set(key, data, ttlSeconds);
  
  return data;
}
