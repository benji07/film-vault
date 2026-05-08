import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Plus, X } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface TagInputProps {
	label?: string;
	value: string[];
	onChange: (tags: string[]) => void;
	suggestions: string[];
	placeholder?: string;
	className?: string;
}

function TagInput({ label, value, onChange, suggestions, placeholder, className }: TagInputProps) {
	const { t } = useTranslation();
	const [input, setInput] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const trimmed = input.trim();
	const lower = trimmed.toLowerCase();
	const selectedLower = new Set(value.map((v) => v.toLowerCase()));
	const filteredSuggestions = suggestions
		.filter((s) => !selectedLower.has(s.toLowerCase()) && s.toLowerCase().includes(lower))
		.slice(0, 12);
	const canCreate =
		trimmed.length > 0 && !suggestions.some((s) => s.toLowerCase() === lower) && !selectedLower.has(lower);

	const addTag = (tag: string) => {
		const normalized = tag.trim();
		if (!normalized) return;
		const canonical = suggestions.find((s) => s.toLowerCase() === normalized.toLowerCase()) ?? normalized;
		if (value.some((v) => v.toLowerCase() === canonical.toLowerCase())) return;
		onChange([...value, canonical]);
		setInput("");
		setIsOpen(false);
		inputRef.current?.focus();
	};

	const removeTag = (tag: string) => {
		onChange(value.filter((v) => v !== tag));
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			if (trimmed) addTag(trimmed);
		} else if (e.key === "Backspace" && input === "" && value.length > 0) {
			e.preventDefault();
			removeTag(value[value.length - 1]!);
		}
	};

	const popoverOpen = isOpen && (filteredSuggestions.length > 0 || canCreate);

	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			{label && <label className="text-xs font-medium text-text-2">{label}</label>}
			<PopoverPrimitive.Root open={popoverOpen} onOpenChange={setIsOpen}>
				<PopoverPrimitive.Anchor asChild>
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: inner input handles keyboard interaction */}
					<div
						className={cn(
							"bg-surface ring-1 ring-line rounded-[10px] px-2 py-1.5",
							"focus-within:ring-2 focus-within:ring-text transition-shadow",
							"flex flex-wrap items-center gap-1.5",
						)}
						onClick={() => inputRef.current?.focus()}
					>
						{value.map((tag) => (
							<span
								key={tag}
								className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-surface-2 text-text rounded-full"
							>
								{tag}
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										removeTag(tag);
									}}
									aria-label={t("common.removeTag")}
									className="flex items-center justify-center hover:opacity-70 cursor-pointer"
								>
									<X size={11} />
								</button>
							</span>
						))}
						<input
							ref={inputRef}
							type="text"
							value={input}
							onChange={(e) => {
								setInput(e.target.value);
								setIsOpen(true);
							}}
							onFocus={() => setIsOpen(true)}
							onKeyDown={handleKeyDown}
							placeholder={value.length === 0 ? placeholder : ""}
							autoComplete="off"
							className="flex-1 min-w-[80px] bg-transparent outline-none text-text text-base placeholder:text-text-3 py-1"
						/>
					</div>
				</PopoverPrimitive.Anchor>
				<PopoverPrimitive.Portal>
					<PopoverPrimitive.Content
						className="z-[1001] w-[var(--radix-popover-trigger-width)] bg-surface ring-1 ring-line rounded-[10px] shadow-lg overflow-hidden max-h-[220px] overflow-y-auto"
						sideOffset={4}
						onOpenAutoFocus={(e) => e.preventDefault()}
						onInteractOutside={() => setIsOpen(false)}
					>
						<ul>
							{filteredSuggestions.map((item) => (
								<li key={item}>
									<button
										type="button"
										className="w-full text-left px-3 py-2 text-base text-text hover:bg-surface-2 cursor-pointer border-none bg-transparent"
										onMouseDown={(e) => {
											e.preventDefault();
											addTag(item);
										}}
									>
										{item}
									</button>
								</li>
							))}
							{canCreate && (
								<li>
									<button
										type="button"
										className="w-full text-left px-3 py-2 text-base text-accent hover:bg-surface-2 cursor-pointer border-none bg-transparent flex items-center gap-1.5"
										onMouseDown={(e) => {
											e.preventDefault();
											addTag(trimmed);
										}}
									>
										<Plus size={14} />
										{t("addFilm.createTag", { value: trimmed })}
									</button>
								</li>
							)}
						</ul>
					</PopoverPrimitive.Content>
				</PopoverPrimitive.Portal>
			</PopoverPrimitive.Root>
		</div>
	);
}

export { TagInput };
