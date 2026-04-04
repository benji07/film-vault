const MAX_DIMENSION = 1200;

export async function compressImage(file: File, maxSizeKB = 200): Promise<string> {
	const bitmap = await createImageBitmap(file);
	const { width, height } = bitmap;

	let targetW = width;
	let targetH = height;
	if (Math.max(width, height) > MAX_DIMENSION) {
		const ratio = MAX_DIMENSION / Math.max(width, height);
		targetW = Math.round(width * ratio);
		targetH = Math.round(height * ratio);
	}

	const canvas = new OffscreenCanvas(targetW, targetH);
	const ctx = canvas.getContext("2d")!;
	ctx.drawImage(bitmap, 0, 0, targetW, targetH);
	bitmap.close();

	let quality = 0.8;
	const maxBytes = maxSizeKB * 1024;

	while (quality > 0.1) {
		const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
		if (blob.size <= maxBytes || quality <= 0.1) {
			return blobToDataUrl(blob);
		}
		quality -= 0.1;
	}

	const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.1 });
	return blobToDataUrl(blob);
}

function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

export function estimateStorageUsage(): { usedKB: number; percentUsed: number } {
	let totalBytes = 0;
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key) {
			const value = localStorage.getItem(key);
			totalBytes += (key.length + (value?.length ?? 0)) * 2;
		}
	}
	const usedKB = Math.round(totalBytes / 1024);
	const totalKB = 5 * 1024; // 5 MB typical limit
	return { usedKB, percentUsed: Math.round((usedKB / totalKB) * 100) };
}
