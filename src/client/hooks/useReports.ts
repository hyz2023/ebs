import { useEffect, useState } from 'react';

export function useReports<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const response = await fetch(url);
      const payload = (await response.json()) as T;

      if (!active) {
        return;
      }

      setData(payload);
      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [url]);

  return { data, loading, setData };
}
