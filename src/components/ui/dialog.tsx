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
			className={cn("fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm animate-backdrop-fade-in", className)}
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
					"bg-surface rounded-t-[20px] md:rounded-[20px] px-5 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]",
					"border border-border border-b-0 md:border-b",
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
		<DialogPrimitive.Title className={cn("font-display text-[22px] text-text-primary italic", className)} {...props} />
	);
}

function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
	return <DialogPrimitive.Description className={cn("text-sm text-text-muted", className)} {...props} />;
}

function DialogCloseButton() {
	return (
		<DialogPrimitive.Close asChild>
			<button
				type="button"
				className="bg-surface-alt border-none rounded-[10px] w-11 h-11 flex items-center justify-center cursor-pointer"
			>
				<X size={16} className="text-text-muted" />
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
