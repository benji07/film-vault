import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type WashiColor = "w1" | "w2" | "w3" | "w4" | "yellow";

interface WashiTapeProps {
	color?: WashiColor;
	rotate?: number;
	width?: number;
	className?: string;
	style?: CSSProperties;
}

const WASHI_BG: Record<WashiColor, string> = {
	w1: "bg-washi-1",
	w2: "bg-washi-2",
	w3: "bg-washi-3",
	w4: "bg-washi-4",
	yellow: "bg-kodak-yellow",
};

/**
 * Petit ruban décoratif (washi tape) avec mask gradient pour effet déchiré
 * sur les bords. À positionner via className (top/left/right) ou style.
 */
export function WashiTape({ color = "w1", rotate = -2, width = 60, className, style }: WashiTapeProps) {
	return (
		<div
			aria-hidden="true"
			className={cn("fv-washi-mask absolute h-3.5 opacity-80 z-[3]", WASHI_BG[color], className)}
			style={{
				width,
				transform: `rotate(${rotate}deg)`,
				...style,
			}}
		/>
	);
}
