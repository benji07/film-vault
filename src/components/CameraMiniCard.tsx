import { Camera as CameraIcon, ChevronRight } from "lucide-react";
import { PhotoImg } from "@/components/ui/photo-img";
import { cn } from "@/lib/utils";
import type { Back, Camera } from "@/types";
import { backDisplayName, cameraDisplayName } from "@/utils/camera-helpers";

interface CameraMiniCardProps {
	camera: Camera;
	back?: Back | null;
	onClick?: () => void;
	className?: string;
}

export function CameraMiniCard({ camera, back, onClick, className }: CameraMiniCardProps) {
	const subtitleParts = [camera.format, camera.mount || null, back ? backDisplayName(back) : null].filter(
		Boolean,
	) as string[];

	const content = (
		<>
			{camera.photo ? (
				<PhotoImg
					src={camera.photo}
					alt=""
					aria-hidden="true"
					className="w-14 h-14 rounded-lg object-cover border border-border shrink-0"
				/>
			) : (
				<div className="w-14 h-14 rounded-lg bg-surface-alt flex items-center justify-center shrink-0">
					<CameraIcon size={22} className="text-text-muted opacity-40" />
				</div>
			)}
			<div className="flex-1 min-w-0">
				<div className="text-[14px] font-semibold text-text-primary font-body truncate">
					{cameraDisplayName(camera)}
				</div>
				{subtitleParts.length > 0 && (
					<div className="text-[12px] font-mono truncate text-text-muted">{subtitleParts.join(" · ")}</div>
				)}
			</div>
			{onClick && <ChevronRight size={16} className="text-text-muted shrink-0" />}
		</>
	);

	const baseClass = cn(
		"flex items-center gap-3 w-full rounded-[12px] border border-border bg-card p-3 text-left",
		onClick && "transition-colors hover:bg-card-hover cursor-pointer",
		className,
	);

	if (onClick) {
		return (
			<button type="button" onClick={onClick} className={baseClass}>
				{content}
			</button>
		);
	}
	return <div className={baseClass}>{content}</div>;
}
