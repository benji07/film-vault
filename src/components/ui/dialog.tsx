import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
	return <DialogPrimitive.Trigger {...props} />;
}

function DialogPortal(props: ComponentProps<typeof DialogPrimitive.Portal>) {
	return <DialogPrimitive.Portal {...props} />;
}

function DialogClose(props: ComponentProps<typeof DialogPrimitive.Close>) {
	return <DialogPrimitive.Close {...props} />;
}

function DialogOverlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			className={cn("fixed inset-0 z-[1000] bg-ink/55 backdrop-blur-sm animate-backdrop-fade-in", className)}
			{...props}
		/>
	);
}

function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				className={cn(
					"fixed z-[1000] w-full max-w-[480px] md:max-w-lg max-h-[85vh] overflow-auto",
					"bg-paper px-5 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]",
					"border-2 border-ink shadow-[5px_5px_0_var(--color-ink)]",
					"bottom-0 left-1/2 -translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2",
					"animate-slide-up md:animate-backdrop-fade-in",
					"outline-none",
					className,
				)}
				{...props}
			>
				{children}
			</DialogPrimitive.Content>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("flex justify-between items-center mb-5", className)} {...props} />;
}

function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			className={cn("font-caveat text-[26px] font-bold text-ink leading-none tracking-[-0.5px]", className)}
			{...props}
		/>
	);
}

function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			className={cn("font-typewriter text-[10px] tracking-[0.12em] text-ink-faded uppercase", className)}
			{...props}
		/>
	);
}

function DialogCloseButton() {
	return (
		<DialogPrimitive.Close asChild>
			<button
				type="button"
				aria-label="Close"
				className="bg-paper-card border-[1.5px] border-ink shadow-[2px_2px_0_var(--color-ink)] w-11 h-11 flex items-center justify-center cursor-pointer hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kodak-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-paper transition-all"
			>
				<X size={16} className="text-ink" />
			</button>
		</DialogPrimitive.Close>
	);
}

export {
	Dialog,
	DialogClose,
	DialogCloseButton,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
