import { ArrowRight, CheckCircle2, Cloud, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithEmail } from "@/utils/supabase";

interface WelcomeScreenProps {
	onContinueLocal: () => void;
}

type Step = "intro" | "email" | "sent";

export function WelcomeScreen({ onContinueLocal }: WelcomeScreenProps) {
	const { t } = useTranslation();
	const [step, setStep] = useState<Step>("intro");
	const [email, setEmail] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSendLink = async () => {
		const trimmed = email.trim();
		if (!trimmed) return;
		setSubmitting(true);
		setError(null);
		const { error: err } = await signInWithEmail(trimmed);
		setSubmitting(false);
		if (err) {
			setError(t("account.sendError"));
			return;
		}
		setStep("sent");
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
								{t("account.sendMagicLink")}
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

				{step === "sent" && (
					<>
						<div className="flex flex-col items-center gap-3 text-center">
							<div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center">
								<CheckCircle2 size={28} className="text-accent" />
							</div>
							<h1 className="text-xl font-bold font-body">{t("account.checkInbox")}</h1>
							<p className="text-sm text-text-sec font-body">{t("account.checkInboxHelp", { email: email.trim() })}</p>
						</div>

						<div className="flex flex-col gap-2.5">
							<Button
								variant="outline"
								onClick={() => {
									setStep("email");
								}}
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
