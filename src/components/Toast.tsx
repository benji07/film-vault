import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastType = "success" | "info" | "warning" | "error";

interface ToastItem {
	id: number;
	message: string;
	type: ToastType;
	exiting: boolean;
}

const TOAST_STYLES: Record<ToastType, { background: string; color: string; border: string }> = {
	success: {
		background: "var(--color-sage)",
		color: "var(--color-bg)",
		border: "transparent",
	},
	info: {
		background: "var(--color-smoke)",
		color: "var(--color-bg)",
		border: "transparent",
	},
	warning: {
		background: "var(--color-amber)",
		color: "var(--color-bg)",
		border: "transparent",
	},
	error: {
		background: "var(--color-accent)",
		color: "var(--color-bg)",
		border: "transparent",
	},
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
				{toasts.map((t) => {
					const style = TOAST_STYLES[t.type];
					return (
						<div
							key={t.id}
							className={t.exiting ? "animate-toast-exit" : "animate-toast-enter"}
							style={{
								background: style.background,
								color: style.color,
								padding: "10px 16px",
								fontSize: "13px",
								fontWeight: 500,
								whiteSpace: "nowrap",
								borderRadius: "10px",
								boxShadow: "0 4px 16px -4px rgba(0,0,0,0.18)",
							}}
						>
							{t.message}
						</div>
					);
				})}
			</div>
		</ToastContext>
	);
}
