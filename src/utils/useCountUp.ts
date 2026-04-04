import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 600): number {
	const [current, setCurrent] = useState(0);
	const startTime = useRef<number | null>(null);
	const rafId = useRef<number>(0);

	useEffect(() => {
		if (target === 0) {
			setCurrent(0);
			return;
		}

		startTime.current = null;

		const step = (timestamp: number) => {
			if (startTime.current === null) startTime.current = timestamp;
			const elapsed = timestamp - startTime.current;
			const t = Math.min(elapsed / duration, 1);
			const eased = 1 - (1 - t) ** 3; // ease-out cubic
			setCurrent(Math.round(eased * target));

			if (t < 1) {
				rafId.current = requestAnimationFrame(step);
			}
		};

		rafId.current = requestAnimationFrame(step);
		return () => cancelAnimationFrame(rafId.current);
	}, [target, duration]);

	return current;
}
