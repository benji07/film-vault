import type { Back, Camera } from "@/types";

export function cameraDisplayName(cam: Camera): string {
	const brandModel = [cam.brand, cam.model].filter(Boolean).join(" ");
	if (cam.nickname) return `${cam.nickname} (${brandModel})`;
	return brandModel;
}

export function backDisplayName(back: Back): string {
	if (back.nickname) return `${back.nickname} (${back.name})`;
	return back.name;
}
