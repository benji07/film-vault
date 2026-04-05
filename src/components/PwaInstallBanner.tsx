import { Download, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		const handler = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
		};
		window.addEventListener("beforeinstallprompt", handler);
		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	const handleInstall = useCallback(async () => {
		if (!deferredPrompt) return;
		await deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			setDeferredPrompt(null);
		}
	}, [deferredPrompt]);

	const handleDismiss = useCallback(() => {
		setDismissed(true);
	}, []);

	if (!deferredPrompt || dismissed) return null;

	return (
		<div className="fixed bottom-20 left-3 right-3 md:bottom-4 md:left-auto md:right-4 md:w-80 z-[400] bg-surface border border-border rounded-[14px] p-4 shadow-lg animate-banner-enter">
			<button
				type="button"
				onClick={handleDismiss}
				className="absolute top-2.5 right-2.5 text-text-muted hover:text-text-primary transition-colors"
			>
				<X size={16} />
			</button>
			<p className="text-sm font-body text-text-primary pr-5">Ajouter FilmVault sur l'écran d'accueil</p>
			<p className="text-xs text-text-sec mt-1 mb-3">Accès rapide, même hors-ligne.</p>
			<div className="flex gap-2">
				<Button size="sm" onClick={handleInstall} className="gap-1.5">
					<Download size={13} />
					Installer
				</Button>
				<Button size="sm" variant="ghost" onClick={handleDismiss}>
					Plus tard
				</Button>
			</div>
		</div>
	);
}
