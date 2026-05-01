import { ArrowRight, Cloud, KeyRound, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInErrorMessage, signInWithEmail, verifyEmailOtp, verifyOtpErrorMessage } from "@/utils/supabase";

interface WelcomeScreenProps {
	onContinueLocal: () => void;
}

type Step = "intro" | "email" | "code";

export function WelcomeScreen({ onContinueLocal }: WelcomeScreenProps) {
	const { t } = useTranslation();
	const [step, setStep] = useState<Step>("intro");
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [verifying, setVerifying] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSendLink = async () => {
		const trimmed = email.trim();
		if (!trimmed) return;
		setSubmitting(true);
		setError(null);
		const { error: err } = await signInWithEmail(trimmed);
		setSubmitting(false);
		if (err) {
			setError(signInErrorMessage(t, err));
			return;
		}
		setCode("");
		setStep("code");
	};

	const handleVerifyCode = async () => {
		const trimmedCode = code.replace(/\s+/g, "");
		const trimmedEmail = email.trim();
		if (!trimmedCode || !trimmedEmail) return;
		setVerifying(true);
		setError(null);
		const { error: err } = await verifyEmailOtp(trimmedEmail, trimmedCode);
		setVerifying(false);
		if (err) {
			setError(verifyOtpErrorMessage(t, err));
			return;
		}
		// Success: App.tsx subscribes to onAuthStateChange and will hide the WelcomeScreen.
	};

	return (
		<div className="min-h-[100dvh] bg-bg text-text-primary flex flex-col items-center justify-center p-6">
			<div className="w-full max-w-sm flex flex-col gap-6">
				{step === "intro" && (
					<>
						<div className="flex flex-col items-center gap-3 text-center">
							<div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center">
								<Cloud size={28} className="text-accent" />
							</div>
							<h1 className="text-xl font-bold font-body">{t("account.welcomeTitle")}</h1>
							<p className="text-sm text-text-sec font-body">{t("account.welcomeSubtitle")}</p>
						</div>

						<div className="flex flex-col gap-2.5 mt-2">
							<Button onClick={() => setStep("email")} className="w-full justify-center">
								<Mail size={16} /> {t("account.signInWithEmail")}
								<ArrowRight size={14} />
							</Button>
							<Button variant="ghost" onClick={onContinueLocal} className="w-full justify-center">
								{t("account.continueWithoutAccount")}
							</Button>
						</div>
						<p className="text-[11px] text-text-muted font-body text-center">{t("account.welcomeFooter")}</p>
					</>
				)}

				{step === "email" && (
					<>
						<div className="flex flex-col items-center gap-3 text-center">
							<div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center">
								<Mail size={28} className="text-accent" />
							</div>
							<h1 className="text-xl font-bold font-body">{t("account.signInWithEmail")}</h1>
							<p className="text-sm text-text-sec font-body">{t("account.emailHelp")}</p>
						</div>

						<div className="flex flex-col gap-3">
							<Input
								type="email"
								autoComplete="email"
								inputMode="email"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									setError(null);
								}}
								placeholder={t("account.emailPlaceholder")}
								disabled={submitting}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSendLink();
								}}
							/>
							{error && <span className="text-xs text-accent font-body">{error}</span>}
							<Button onClick={handleSendLink} disabled={submitting || !email.trim()} className="w-full justify-center">
								{submitting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
								{t("account.sendCode")}
							</Button>
							<Button
								variant="ghost"
								onClick={() => setStep("intro")}
								disabled={submitting}
								className="w-full justify-center"
							>
								{t("account.back")}
							</Button>
						</div>
					</>
				)}

				{step === "code" && (
					<>
						<div className="flex flex-col items-center gap-3 text-center">
							<div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center">
								<KeyRound size={28} className="text-accent" />
							</div>
							<h1 className="text-xl font-bold font-body">{t("account.codeStepTitle")}</h1>
							<p className="text-sm text-text-sec font-body">{t("account.codeStepHelp", { email: email.trim() })}</p>
						</div>

						<div className="flex flex-col gap-3">
							<Input
								type="text"
								inputMode="numeric"
								autoComplete="one-time-code"
								pattern="[0-9]*"
								maxLength={6}
								value={code}
								onChange={(e) => {
									setCode(e.target.value.replace(/\D/g, ""));
									setError(null);
								}}
								placeholder={t("account.codePlaceholder")}
								disabled={verifying}
								className="text-center text-lg font-mono tracking-[0.5em]"
								onKeyDown={(e) => {
									if (e.key === "Enter") handleVerifyCode();
								}}
							/>
							{error && <span className="text-xs text-accent font-body">{error}</span>}
							<Button
								onClick={handleVerifyCode}
								disabled={verifying || code.length < 6}
								className="w-full justify-center"
							>
								{verifying ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
								{t("account.verifyCode")}
							</Button>
							<Button
								variant="ghost"
								onClick={() => {
									setStep("email");
									setCode("");
									setError(null);
								}}
								disabled={verifying}
								className="w-full justify-center"
							>
								{t("account.useDifferentEmail")}
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
