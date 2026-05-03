import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	destructive?: boolean;
	onConfirm: () => void;
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	cancelLabel,
	destructive = false,
	onConfirm,
}: ConfirmDialogProps) {
	const { t } = useTranslation();
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[420px]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{description && <p className="font-cormorant text-[14px] text-ink-soft mb-5 leading-snug">{description}</p>}
				<div className="flex gap-2 justify-end">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{cancelLabel ?? t("common.cancel")}
					</Button>
					<Button
						variant={destructive ? "destructive" : "default"}
						onClick={() => {
							onConfirm();
							onOpenChange(false);
						}}
					>
						{confirmLabel ?? t("common.confirm")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
