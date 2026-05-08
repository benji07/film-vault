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
			className={cn("fixed inset-0 z-[1000] bg-text/40 backdrop-blur-sm animate-backdrop-fade-in", className)}
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
					"bg-surface px-5 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]",
					"rounded-t-[16px] md:rounded-[16px] shadow-2xl",
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
		<DialogPrimitive.Title className={cn("text-xl font-semibold text-text leading-tight", className)} {...props} />
	);
}

function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
	return <DialogPrimitive.Description className={cn("text-sm text-text-3", className)} {...props} />;
}

function DialogCloseButton() {
	return (
		<DialogPrimitive.Close asChild>
			<button
				type="button"
				aria-label="Close"
				className="bg-surface-2 hover:bg-line w-9 h-9 rounded-full flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 focus-visible:ring-offset-bg transition-colors"
			>
				<X size={16} className="text-text-2" />
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
