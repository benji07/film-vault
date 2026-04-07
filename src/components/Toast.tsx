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
	success: "var(--color-green)",
	info: "var(--color-blue)",
	warning: "var(--color-amber)",
	error: "var(--color-accent)",
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
							color: "white",
							padding: "6px 16px",
							borderRadius: "9999px",
							fontSize: "12px",
							fontFamily: "var(--font-body)",
							fontWeight: 600,
							whiteSpace: "nowrap",
							boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
						}}
					>
						{t.message}
					</div>
				))}
			</div>
		</ToastContext>
	);
}
