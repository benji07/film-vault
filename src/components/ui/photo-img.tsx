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
 */
export function PhotoImg({ src, className, alt = "", ...props }: PhotoImgProps) {
	const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

	useEffect(() => {
		if (!src) {
			setResolvedSrc(null);
			return;
		}

		if (isBase64Photo(src)) {
			setResolvedSrc(src);
			return;
		}

		// Storage path — resolve async
		let cancelled = false;
		getSignedDownloadUrl(src).then((url) => {
			if (!cancelled && url) {
				setResolvedSrc(url);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [src]);

	if (!resolvedSrc) return null;

	return <img src={resolvedSrc} alt={alt} className={cn(className)} {...props} />;
}
