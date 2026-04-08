import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface AutocompleteInputProps {
	label?: string;
	value: string;
	onChange: (value: string) => void;
	onSelect?: (value: string) => void;
	suggestions: string[];
	placeholder?: string;
	className?: string;
	showAllOnFocus?: boolean;
}

function AutocompleteInput({
	label,
	value,
	onChange,
	onSelect,
	suggestions,
	placeholder,
	className,
	showAllOnFocus,
}: AutocompleteInputProps) {
	const [isOpen, setIsOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const filtered = value
		? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
		: showAllOnFocus
			? suggestions.slice(0, 6)
			: [];

	const handleSelect = (item: string) => {
		onChange(item);
		onSelect?.(item);
		setIsOpen(false);
	};

	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			{label && (
				<label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">{label}</label>
			)}
			<PopoverPrimitive.Root open={isOpen && filtered.length > 0} onOpenChange={setIsOpen}>
				<PopoverPrimitive.Anchor asChild>
					<Input
						ref={inputRef}
						type="text"
						value={value}
						onChange={(e) => {
							onChange(e.target.value);
							setIsOpen(true);
						}}
						onFocus={() => setIsOpen(true)}
						placeholder={placeholder}
						autoComplete="off"
					/>
				</PopoverPrimitive.Anchor>
				<PopoverPrimitive.Portal>
					<PopoverPrimitive.Content
						className="z-[1001] w-[var(--radix-popover-trigger-width)] bg-surface-alt border border-border rounded-[10px] overflow-hidden shadow-lg max-h-[220px] overflow-y-auto"
						sideOffset={4}
						onOpenAutoFocus={(e) => e.preventDefault()}
						onInteractOutside={() => setIsOpen(false)}
					>
						<ul>
							{filtered.map((item) => (
								<li key={item}>
									<button
										type="button"
										className="w-full text-left px-3.5 py-2.5 text-sm text-text-primary font-body hover:bg-surface cursor-pointer border-none bg-transparent"
										onMouseDown={(e) => {
											e.preventDefault();
											handleSelect(item);
										}}
									>
										{item}
									</button>
								</li>
							))}
						</ul>
					</PopoverPrimitive.Content>
				</PopoverPrimitive.Portal>
			</PopoverPrimitive.Root>
		</div>
	);
}

export { AutocompleteInput };
