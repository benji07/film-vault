import { useEffect, useState } from "react";

export function usePersistedState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
	const [value, setValue] = useState<T>(() => {
		try {
			const stored = localStorage.getItem(key);
			if (stored === null) return defaultValue;
			return JSON.parse(stored) as T;
		} catch {
			return defaultValue;
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch {
			// ignore quota / serialization errors
		}
	}, [key, value]);

	return [value, setValue];
}
