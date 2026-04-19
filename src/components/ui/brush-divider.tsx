import { cn } from "@/lib/utils";

export interface BrushDividerProps {
	className?: string;
	color?: string;
	thickness?: number;
}

export function BrushDivider({ className, color = "currentColor", thickness = 3 }: BrushDividerProps) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 300 12"
			preserveAspectRatio="none"
			className={cn("block w-full", className)}
			style={{ height: `${thickness + 6}px` }}
		>
			<path
				d="M2,7 C30,3 55,10 85,6 C115,2 140,9 170,5 C200,1 225,8 255,5 C275,3 290,7 298,6"
				stroke={color}
				strokeWidth={thickness}
				strokeLinecap="round"
				fill="none"
				opacity="0.85"
			/>
			<path
				d="M6,9 C40,6 70,11 110,8 C160,5 210,10 260,7 C280,6 292,9 296,8"
				stroke={color}
				strokeWidth={thickness * 0.5}
				strokeLinecap="round"
				fill="none"
				opacity="0.45"
			/>
		</svg>
	);
}
