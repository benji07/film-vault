import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AutocompleteInputProps {
	label?: string;
	value: string;
	onChange: (value: string) => void;
	onSelect?: (value: string) => void;
	suggestions: string[];
	placeholder?: string;
	className?: string;
}

export function AutocompleteInput({
	label,
	value,
	onChange,
	onSelect,
	suggestions,
	placeholder,
	className,
}: AutocompleteInputProps) {
	const [isOpen, setIsOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const filtered = value ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase())).slice(0, 6) : [];

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
			<input
				ref={inputRef}
				type="text"
				value={value}
				onChange={(e) => {
					onChange(e.target.value);
					setIsOpen(true);
				}}
				onFocus={() => setIsOpen(true)}
				onBlur={() => {
					// Delay to allow click on dropdown item
					setTimeout(() => setIsOpen(false), 150);
				}}
				placeholder={placeholder}
				className={cn(
					"bg-surface-alt border border-border rounded-[10px] py-2.5 px-3.5",
					"text-text-primary text-sm outline-none transition-colors font-body",
					"focus:border-accent",
				)}
				autoComplete="off"
			/>
			{isOpen && filtered.length > 0 && (
				<ul className="bg-surface-alt border border-border rounded-[10px] overflow-hidden shadow-lg max-h-[220px] overflow-y-auto -mt-1">
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
			)}
		</div>
	);
}
