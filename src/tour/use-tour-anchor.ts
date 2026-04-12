import { useCallback, useEffect, useRef, useState } from "react";

export function useTourAnchor(selector: string | null, delay = 0): DOMRect | null {
	const [rect, setRect] = useState<DOMRect | null>(null);
	const observerRef = useRef<ResizeObserver | null>(null);
	const elementRef = useRef<Element | null>(null);
	const retryRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const handlersRef = useRef<{ scroll: () => void; resize: () => void } | null>(null);
	const rafRef = useRef<number | null>(null);

	const measure = useCallback(() => {
		if (!selector) {
			setRect(null);
			return;
		}
		const el = document.querySelector(selector);
		if (el) {
			elementRef.current = el;
			setRect(el.getBoundingClientRect());
		} else {
			elementRef.current = null;
			setRect(null);
		}
	}, [selector]);

	useEffect(() => {
		const cleanup = () => {
			if (retryRef.current) clearInterval(retryRef.current);
			observerRef.current?.disconnect();
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			if (handlersRef.current) {
				window.removeEventListener("scroll", handlersRef.current.scroll, true);
				window.removeEventListener("resize", handlersRef.current.resize);
			}
			handlersRef.current = null;
		};

		if (!selector) {
			setRect(null);
			cleanup();
			return;
		}

		const delayTimer = setTimeout(() => {
			measure();

			// Retry up to 3 times if element not found
			let retries = 0;
			retryRef.current = setInterval(() => {
				if (elementRef.current || retries >= 3) {
					if (retryRef.current) clearInterval(retryRef.current);
					return;
				}
				retries++;
				measure();
			}, 100);

			// Observe resize changes (with feature detection)
			if (typeof ResizeObserver !== "undefined") {
				observerRef.current = new ResizeObserver(() => {
					if (elementRef.current) {
						setRect(elementRef.current.getBoundingClientRect());
					}
				});
				if (elementRef.current) {
					observerRef.current.observe(elementRef.current);
				}
			}

			// Throttled re-measure on scroll / resize via requestAnimationFrame
			const handleLayout = () => {
				if (rafRef.current) return;
				rafRef.current = requestAnimationFrame(() => {
					rafRef.current = null;
					if (elementRef.current) {
						setRect(elementRef.current.getBoundingClientRect());
					}
				});
			};
			handlersRef.current = { scroll: handleLayout, resize: handleLayout };
			window.addEventListener("scroll", handleLayout, true);
			window.addEventListener("resize", handleLayout);
		}, delay);

		return () => {
			clearTimeout(delayTimer);
			cleanup();
		};
	}, [selector, delay, measure]);

	return rect;
}
