import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PhotoImg } from "@/components/ui/photo-img";

interface PhotoViewerProps {
	photos: string[];
	initialIndex: number;
	onClose: () => void;
}

export function PhotoViewer({ photos, initialIndex, onClose }: PhotoViewerProps) {
	const { t } = useTranslation();
	const [index, setIndex] = useState(initialIndex);
	const touchRef = useRef<number | null>(null);

	const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
	const next = useCallback(() => setIndex((i) => Math.min(photos.length - 1, i + 1)), [photos.length]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowLeft") prev();
			if (e.key === "ArrowRight") next();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose, prev, next]);

	const onTouchStart = (e: React.TouchEvent) => {
		const touch = e.touches[0];
		if (touch) touchRef.current = touch.clientX;
	};

	const onTouchEnd = (e: React.TouchEvent) => {
		if (touchRef.current === null) return;
		const touch = e.changedTouches[0];
		if (!touch) return;
		const delta = touch.clientX - touchRef.current;
		if (Math.abs(delta) > 50) {
			if (delta > 0) prev();
			else next();
		}
		touchRef.current = null;
	};

	return (
		<div
			className="fixed inset-0 z-[1100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-backdrop-fade-in"
			onClick={onClose}
			onKeyDown={undefined}
		>
			<Button
				variant="ghost"
				size="icon"
				onClick={(e) => {
					e.stopPropagation();
					onClose();
				}}
				className="absolute top-4 right-4 z-10 bg-surface-alt/80 rounded-full"
				aria-label={t("aria.close")}
			>
				<X size={18} className="text-text-primary" />
			</Button>

			{photos.length > 1 && index > 0 && (
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={(e) => {
						e.stopPropagation();
						prev();
					}}
					className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-surface-alt/60 rounded-full"
					aria-label={t("aria.previousPhoto")}
				>
					<ChevronLeft size={18} className="text-text-primary" />
				</Button>
			)}

			{photos.length > 1 && index < photos.length - 1 && (
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={(e) => {
						e.stopPropagation();
						next();
					}}
					className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-surface-alt/60 rounded-full"
					aria-label={t("aria.nextPhoto")}
				>
					<ChevronRight size={18} className="text-text-primary" />
				</Button>
			)}

			<PhotoImg
				src={photos[index]}
				alt=""
				className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={undefined}
				onTouchStart={onTouchStart}
				onTouchEnd={onTouchEnd}
				draggable={false}
			/>

			{photos.length > 1 && (
				<div className="flex gap-2 mt-4">
					{photos.map((photo, i) => (
						<button
							key={photo.slice(-20)}
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								setIndex(i);
							}}
							className={`w-2.5 h-2.5 rounded-full border-none cursor-pointer p-0 transition-colors ${
								i === index ? "bg-accent" : "bg-text-muted/40"
							}`}
						/>
					))}
				</div>
			)}
		</div>
	);
}
