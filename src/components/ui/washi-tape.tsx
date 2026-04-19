import { T } from "@/constants/theme";
import { cn } from "@/lib/utils";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface WashiTapeProps {
	className?: string;
	position?: Position;
	color?: string;
	width?: number;
	rotate?: number;
}

const POSITION_STYLES: Record<Position, React.CSSProperties> = {
	"top-left": { top: -10, left: 16 },
	"top-right": { top: -10, right: 16 },
	"bottom-left": { bottom: -10, left: 16 },
	"bottom-right": { bottom: -10, right: 16 },
};

export function WashiTape({ className, position = "top-right", color = T.tape1, width = 72, rotate }: WashiTapeProps) {
	const angle = rotate ?? (position.includes("right") ? 6 : -6);
	return (
		<div
			aria-hidden="true"
			className={cn("absolute pointer-events-none select-none", className)}
			style={{
				...POSITION_STYLES[position],
				width,
				height: 22,
				transform: `rotate(${angle}deg)`,
				zIndex: 2,
			}}
		>
			<svg
				viewBox="0 0 72 22"
				preserveAspectRatio="none"
				className="w-full h-full"
				role="presentation"
				aria-hidden="true"
			>
				<defs>
					<pattern
						id={`stripes-${position}`}
						patternUnits="userSpaceOnUse"
						width="8"
						height="8"
						patternTransform="rotate(45)"
					>
						<rect width="8" height="8" fill={color} />
						<line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
					</pattern>
				</defs>
				<rect width="72" height="22" fill={color} opacity="0.95" />
				<rect width="72" height="22" fill={`url(#stripes-${position})`} opacity="0.55" />
				{/* Torn edges */}
				<path d="M0,2 L2,1 L4,3 L6,0 L8,2 L10,1 L72,1 L72,0 L0,0 Z" fill="rgba(0,0,0,0.1)" />
				<path d="M0,20 L3,21 L6,19 L9,22 L12,20 L72,21 L72,22 L0,22 Z" fill="rgba(0,0,0,0.1)" />
			</svg>
		</div>
	);
}
