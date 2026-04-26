import { useCallback, useState } from "react";

export function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
	const [value, setValueState] = useState<T>(() => {
		try {
			const stored = localStorage.getItem(key);
			if (stored === null) return defaultValue;
			return JSON.parse(stored) as T;
		} catch {
			return defaultValue;
		}
	});

	const setValue = useCallback(
		(next: T | ((prev: T) => T)) => {
			setValueState((prev) => {
				const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
				try {
					localStorage.setItem(key, JSON.stringify(resolved));
				} catch {
					// ignore quota / serialization errors
				}
				return resolved;
			});
		},
		[key],
	);

	return [value, setValue];
}
