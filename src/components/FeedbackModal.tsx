import { Send } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type FeedbackCategory, submitFeedback } from "@/utils/feedback";

const MESSAGE_MAX = 4000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FeedbackModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
	const { t } = useTranslation();
	const { toast } = useToast();

	const [category, setCategory] = useState<FeedbackCategory>("bug");
	const [message, setMessage] = useState("");
	const [email, setEmail] = useState("");
	const [sending, setSending] = useState(false);

	const trimmedMessage = message.trim();
	const trimmedEmail = email.trim();
	const emailInvalid = trimmedEmail.length > 0 && !EMAIL_REGEX.test(trimmedEmail);
	const canSubmit = !sending && trimmedMessage.length > 0 && trimmedMessage.length <= MESSAGE_MAX && !emailInvalid;

	function reset() {
		setCategory("bug");
		setMessage("");
		setEmail("");
		setSending(false);
	}

	function handleOpenChange(next: boolean) {
		if (!next) reset();
		onOpenChange(next);
	}

	async function handleSubmit() {
		if (!canSubmit) return;
		setSending(true);
		const { ok } = await submitFeedback({
			category,
			message: trimmedMessage,
			contactEmail: trimmedEmail || undefined,
		});
		setSending(false);
		if (ok) {
			toast(t("feedback.submissionSuccess"), "success");
			reset();
			onOpenChange(false);
		} else {
			toast(t("feedback.submissionError"), "error");
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("feedback.title")}</DialogTitle>
					<DialogCloseButton />
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<p className="text-xs text-text-muted -mt-2">{t("feedback.subtitle")}</p>

					<FormField label={t("feedback.categoryLabel")}>
						<Select value={category} onValueChange={(v) => setCategory(v as FeedbackCategory)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="bug">{t("feedback.categoryBug")}</SelectItem>
								<SelectItem value="suggestion">{t("feedback.categorySuggestion")}</SelectItem>
								<SelectItem value="other">{t("feedback.categoryOther")}</SelectItem>
							</SelectContent>
						</Select>
					</FormField>

					<FormField label={t("feedback.messageLabel")}>
						<Textarea
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder={t("feedback.messagePlaceholder")}
							rows={6}
							maxLength={MESSAGE_MAX}
						/>
						<div className="text-[10px] text-text-muted text-right font-mono">
							{trimmedMessage.length}/{MESSAGE_MAX}
						</div>
					</FormField>

					<FormField label={t("feedback.emailLabel")}>
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder={t("feedback.emailPlaceholder")}
							autoComplete="email"
						/>
						<div className="text-[11px] text-text-muted">
							{emailInvalid ? t("feedback.emailInvalid") : t("feedback.emailHelper")}
						</div>
					</FormField>

					<Button onClick={handleSubmit} disabled={!canSubmit} className="w-full justify-center">
						<Send size={16} />
						{sending ? t("feedback.sending") : t("feedback.sendButton")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
