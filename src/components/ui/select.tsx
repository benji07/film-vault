import { cn } from "@/lib/utils";

interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps {
	label?: string;
	value: string;
	onChange: (value: string) => void;
	options: SelectOption[];
	placeholder?: string;
	className?: string;
}

export function Select({ label, value, onChange, options, placeholder, className }: SelectProps) {
	return (
		<div className="flex flex-col gap-1.5">
			{label && (
				<label className="text-[11px] font-semibold text-text-sec font-body uppercase tracking-wide">{label}</label>
			)}
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={cn(
					"bg-surface-alt border border-border rounded-[10px] py-2.5 px-3.5",
					"text-sm font-body outline-none appearance-none",
					"bg-no-repeat bg-[right_12px_center]",
					value ? "text-text-primary" : "text-text-muted",
					className,
				)}
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B665F' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
				}}
			>
				{placeholder && <option value="">{placeholder}</option>}
				{options.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
		</div>
	);
}
