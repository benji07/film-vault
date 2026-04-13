/** Light haptic feedback for taps and small interactions */
export function hapticLight(): void {
	navigator.vibrate?.(10);
}

/** Medium haptic feedback for successful state changes */
export function hapticSuccess(): void {
	navigator.vibrate?.([30, 50, 30]);
}

/** Heavy haptic feedback for destructive actions */
export function hapticWarning(): void {
	navigator.vibrate?.([50, 30, 50, 30, 50]);
}
