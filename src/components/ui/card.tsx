import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { WashiTape } from "./washi-tape";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	tilt?: number;
	tape?: "top-left" | "top-right" | false;
	tapeColor?: string;
}

function Card({ className, tilt, tape = false, tapeColor, style, children, ...props }: CardProps) {
	const hasPolaroid = typeof tilt === "number" || tape !== false;
	return (
		<div
			className={cn(
				"relative bg-card border border-border-light rounded-[14px] p-4 pb-5 transition-all",
				hasPolaroid && "polaroid",
				className,
			)}
			style={{ ...(typeof tilt === "number" ? { ["--tilt" as never]: `${tilt}deg` } : {}), ...style }}
			{...props}
		>
			{tape && <WashiTape position={tape} color={tapeColor} />}
			{children}
		</div>
	);
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />;
}

function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h3
			className={cn("font-display text-[22px] leading-none tracking-tight text-text-primary", className)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
	return <p className={cn("text-sm text-text-muted font-body italic", className)} {...props} />;
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("p-4 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("flex items-center p-4 pt-0", className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
