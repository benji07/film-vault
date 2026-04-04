import type { Camera } from "@/types";

export function cameraDisplayName(cam: Camera): string {
	if (cam.nickname) return cam.nickname;
	return [cam.brand, cam.model].filter(Boolean).join(" ");
}
