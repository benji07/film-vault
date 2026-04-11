import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getSignedDownloadUrl, isBase64Photo } from "@/utils/photo-sync";

interface PhotoImgProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
	src: string | null | undefined;
}

/**
 * Drop-in replacement for <img> that handles both base64 data URLs
 * and Supabase Storage paths transparently.
 *
 * - base64 data URLs: rendered immediately
 * - Storage paths: resolved to signed download URLs asynchronously
 * - Shows a placeholder skeleton while a Storage path is resolving
 */
export function PhotoImg({ src, className, alt = "", ...props }: PhotoImgProps) {
	const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!src) {
			setResolvedSrc(null);
			setLoading(false);
			return;
		}

		if (isBase64Photo(src)) {
			setResolvedSrc(src);
			setLoading(false);
			return;
		}

		// Storage path — clear previous and resolve async
		setResolvedSrc(null);
		setLoading(true);
		let cancelled = false;
		getSignedDownloadUrl(src).then((url) => {
			if (!cancelled) {
				setResolvedSrc(url);
				setLoading(false);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [src]);

	if (!src) return null;

	// Placeholder while loading a storage path
	if (loading || (!resolvedSrc && !isBase64Photo(src))) {
		return <div className={cn("animate-pulse bg-surface-alt rounded", className)} {...props} />;
	}

	if (!resolvedSrc) return null;

	return <img src={resolvedSrc} alt={alt} className={cn(className)} {...props} />;
}
