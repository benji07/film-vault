import { Camera, Plus, X } from "lucide-react";
import { useRef } from "react";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { compressImage, estimateStorageUsage } from "@/utils/image";

interface PhotoPickerProps {
	photos: string[];
	onChange: (photos: string[]) => void;
	max?: number;
	size?: number;
	placeholderIcon?: boolean;
	label?: string;
}

export function PhotoPicker({ photos, onChange, max = 3, size = 64, placeholderIcon, label }: PhotoPickerProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();

	const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		e.target.value = "";

		try {
			const dataUrl = await compressImage(file);
			const next = max === 1 ? [dataUrl] : [...photos, dataUrl];
			onChange(next);

			const { percentUsed } = estimateStorageUsage();
			if (percentUsed > 80) {
				toast(`Stockage presque plein (${percentUsed}%)`, "warning");
			}
		} catch {
			toast("Erreur lors du traitement de l'image", "error");
		}
	};

	const remove = (index: number) => {
		onChange(photos.filter((_, i) => i !== index));
	};

	const showAdd = photos.length < max;
	const delSize = Math.max(16, Math.round(size * 0.35));

	return (
		<div className="flex flex-col gap-1.5">
			{label && (
				<span className="text-[11px] font-semibold text-text-muted font-body">
					{label}
					{max > 1 && ` (${photos.length}/${max})`}
				</span>
			)}
			<div className="flex items-center gap-2 flex-wrap">
				{photos.map((photo, i) => (
					<div key={photo.slice(-20)} className="relative group" style={{ width: size, height: size }}>
						<img src={photo} alt="" className="w-full h-full rounded-lg object-cover border border-border" />
						<Button
							variant="destructive"
							onClick={() => remove(i)}
							className="absolute -top-1.5 -right-1.5 bg-accent text-white rounded-full !p-0 !min-h-0"
							style={{ width: delSize, height: delSize }}
						>
							<X size={delSize - 4} />
						</Button>
					</div>
				))}
				{showAdd && !placeholderIcon && (
					<Button
						variant="ghost"
						onClick={() => inputRef.current?.click()}
						className="rounded-lg border-2 border-dashed border-border-light bg-surface-alt !p-0 !min-h-0 hover:border-text-muted"
						style={{ width: size, height: size }}
					>
						<Plus size={Math.round(size * 0.35)} className="text-text-muted" />
					</Button>
				)}
				{placeholderIcon && photos.length === 0 && (
					<Button
						variant="ghost"
						onClick={() => inputRef.current?.click()}
						className="rounded-lg bg-surface-alt border border-border !p-0 !min-h-0 hover:border-text-muted"
						style={{ width: size, height: size }}
					>
						<Camera size={Math.round(size * 0.4)} className="text-text-muted opacity-40" />
					</Button>
				)}
				{placeholderIcon && photos.length > 0 && showAdd && (
					<Button
						variant="ghost"
						onClick={() => inputRef.current?.click()}
						className="rounded-lg border-2 border-dashed border-border-light bg-surface-alt !p-0 !min-h-0 hover:border-text-muted"
						style={{ width: size, height: size }}
					>
						<Plus size={Math.round(size * 0.35)} className="text-text-muted" />
					</Button>
				)}
			</div>
			<input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
		</div>
	);
}
