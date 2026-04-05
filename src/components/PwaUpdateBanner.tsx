import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PwaUpdateBanner() {
	const {
		needRefresh: [needRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegisteredSW(_swUrl, registration) {
			if (registration) {
				setInterval(
					() => {
						registration.update();
					},
					60 * 60 * 1000,
				);
			}
		},
	});

	if (!needRefresh) return null;

	return (
		<div className="fixed top-0 left-0 right-0 z-[400] flex items-center justify-center gap-3 bg-surface border-b border-border px-4 pt-[max(0.625rem,env(safe-area-inset-top))] pb-2.5 animate-banner-enter">
			<span className="text-xs font-body text-text-sec">Nouvelle version disponible</span>
			<Button size="sm" onClick={() => updateServiceWorker(true)} className="gap-1.5">
				<RefreshCw size={13} />
				Recharger
			</Button>
		</div>
	);
}
