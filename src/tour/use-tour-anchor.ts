import { useCallback, useEffect, useRef, useState } from "react";

function isInViewport(el: Element): boolean {
	const r = el.getBoundingClientRect();
	return r.top >= 0 && r.bottom <= window.innerHeight;
}

export function useTourAnchor(selector: string | null, delay = 0): DOMRect | null {
	const [rect, setRect] = useState<DOMRect | null>(null);
	const observerRef = useRef<ResizeObserver | null>(null);
	const elementRef = useRef<Element | null>(null);
	const retryRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const handlersRef = useRef<{ scroll: () => void; resize: () => void } | null>(null);
	const rafRef = useRef<number | null>(null);
	const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const measure = useCallback(() => {
		if (!selector) {
			setRect(null);
			return;
		}
		const el = document.querySelector(selector);
		if (!el) {
			elementRef.current = null;
			setRect(null);
			return;
		}

		elementRef.current = el;

		if (isInViewport(el)) {
			// Element already visible — measure immediately
			setRect(el.getBoundingClientRect());
		} else {
			// Element off-screen — scroll into view, then re-measure after scroll settles
			el.scrollIntoView({ behavior: "smooth", block: "center" });
			if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
			scrollTimerRef.current = setTimeout(() => {
				setRect(el.getBoundingClientRect());
			}, 400);
		}
	}, [selector]);

	useEffect(() => {
		const cleanup = () => {
			if (retryRef.current) clearInterval(retryRef.current);
			if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
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
