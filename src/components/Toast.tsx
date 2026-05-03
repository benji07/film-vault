import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastType = "success" | "info" | "warning" | "error";

interface ToastItem {
	id: number;
	message: string;
	type: ToastType;
	exiting: boolean;
}

const TOAST_COLORS: Record<ToastType, string> = {
	success: "var(--color-kodak-teal)",
	info: "var(--color-ink)",
	warning: "var(--color-kodak-yellow-deep)",
	error: "var(--color-kodak-red)",
};

interface ToastContextValue {
	toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
	return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const idRef = useRef(0);

	const toast = useCallback((message: string, type: ToastType = "success") => {
		const id = ++idRef.current;
		setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

		setTimeout(() => {
			setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
			setTimeout(() => {
				setToasts((prev) => prev.filter((t) => t.id !== id));
			}, 200);
		}, 2500);
	}, []);

	return (
		<ToastContext value={{ toast }}>
			{children}
			<div
				className="fixed left-1/2 z-[300] pointer-events-none flex flex-col gap-2"
				style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
			>
				{toasts.map((t) => (
					<div
						key={t.id}
						className={t.exiting ? "animate-toast-exit" : "animate-toast-enter"}
						style={{
							background: TOAST_COLORS[t.type],
							color: t.type === "warning" ? "var(--color-ink)" : "var(--color-paper)",
							padding: "8px 16px",
							fontSize: "11px",
							fontFamily: "var(--font-archivo-black)",
							fontWeight: 900,
							letterSpacing: "0.12em",
							textTransform: "uppercase",
							whiteSpace: "nowrap",
							border: "2px solid var(--color-ink)",
							boxShadow: "3px 3px 0 var(--color-ink)",
						}}
					>
						{t.message}
					</div>
				))}
			</div>
		</ToastContext>
	);
}
