import { UseFormReturnType } from "@mantine/form";
import { useEffect } from "react";

export function useLocalStorageFormCache(
  form: UseFormReturnType<any>,
  key: string
) {
  useEffect(() => {
    const storedValue = window.localStorage.getItem(key);

    if (storedValue) {
      try {
        form.setValues(JSON.parse(storedValue));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(form.values));
  }, [key, form.values]);
}
