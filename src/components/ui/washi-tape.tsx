import type { CSSProperties } from "react";

type WashiColor = "w1" | "w2" | "w3" | "w4" | "yellow";

interface WashiTapeProps {
	color?: WashiColor;
	rotate?: number;
	width?: number;
	className?: string;
	style?: CSSProperties;
}

/**
 * Composant neutralisé dans le thème monochrome moderne.
 * L'API est conservée pour ne pas casser les callers — le composant ne rend rien.
 */
export function WashiTape(_props: WashiTapeProps) {
	return null;
}
