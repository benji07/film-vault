import { Download, Share, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIosSafari(): boolean {
	const ua = navigator.userAgent;
	return /iP(hone|od|ad)/.test(ua) && /WebKit/.test(ua) && !/(CriOS|FxiOS|OPiOS|mercury)/.test(ua);
}

function isStandalone(): boolean {
	return (
		window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && !!navigator.standalone)
	);
}

export function PwaInstallBanner() {
	const { t } = useTranslation();
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
	const [showIosBanner, setShowIosBanner] = useState(false);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		if (isStandalone()) return;

		if (isIosSafari()) {
			const alreadyDismissed = localStorage.getItem(DISMISS_KEY);
			if (!alreadyDismissed) {
				setShowIosBanner(true);
			}
			return;
		}

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
		if (showIosBanner) {
			localStorage.setItem(DISMISS_KEY, "1");
		}
	}, [showIosBanner]);

	if (dismissed) return null;
	if (!deferredPrompt && !showIosBanner) return null;

	return (
		<div className="fixed bottom-20 left-3 right-3 md:bottom-4 md:left-auto md:right-4 md:w-80 z-[400] bg-surface border border-border rounded-[14px] p-4 shadow-lg animate-banner-enter">
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={handleDismiss}
				className="absolute top-2.5 right-2.5 text-text-muted hover:text-text-primary !min-h-0 !w-auto !h-auto p-1"
			>
				<X size={16} />
			</Button>
			<p className="text-sm font-body text-text-primary pr-5">{t("pwa.addToHome")}</p>
			{showIosBanner ? (
				<>
					<p className="text-xs text-text-sec mt-1 mb-3">
						{t("pwa.iosTapShare")} <Share size={12} className="inline-block align-text-bottom text-accent" />{" "}
						{t("pwa.iosThen")} <span className="text-text-primary">{t("pwa.iosInstructions")}</span>.
					</p>
					<Button size="sm" variant="ghost" onClick={handleDismiss}>
						{t("pwa.gotIt")}
					</Button>
				</>
			) : (
				<>
					<p className="text-xs text-text-sec mt-1 mb-3">{t("pwa.quickAccess")}</p>
					<div className="flex gap-2">
						<Button size="sm" onClick={handleInstall} className="gap-1.5">
							<Download size={13} />
							{t("pwa.install")}
						</Button>
						<Button size="sm" variant="ghost" onClick={handleDismiss}>
							{t("pwa.later")}
						</Button>
					</div>
				</>
			)}
		</div>
	);
}
