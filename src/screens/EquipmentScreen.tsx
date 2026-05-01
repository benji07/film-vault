import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BacksTab } from "@/components/equipment/BacksTab";
import { CamerasTab } from "@/components/equipment/CamerasTab";
import { LensesTab } from "@/components/equipment/LensesTab";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import type { AppData } from "@/types";

type EquipmentTab = "cameras" | "lenses" | "backs";

interface EquipmentScreenProps {
	data: AppData;
	setData: (data: AppData) => void;
	onCameraClick?: (camId: string) => void;
}

export function EquipmentScreen({ data, setData, onCameraClick }: EquipmentScreenProps) {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<EquipmentTab>("cameras");

	const counts = {
		cameras: data.cameras.length,
		lenses: data.lenses.length,
		backs: data.backs.length,
	};

	const tabs: { key: EquipmentTab; label: string; count: number }[] = [
		{ key: "cameras", label: t("equipment.camerasTab"), count: counts.cameras },
		{ key: "lenses", label: t("equipment.lensesTab"), count: counts.lenses },
		{ key: "backs", label: t("equipment.backsTab"), count: counts.backs },
	];

	const headerTitle = t(activeTab === "cameras" ? "nav.cameras" : `equipment.${activeTab}Tab`, {
		defaultValue: activeTab,
	}) as string;

	return (
		<div className="-mx-4 md:-mx-8 -mt-5 md:-mt-[max(1.25rem,env(safe-area-inset-top))]" data-tour="cameras-tab">
			<PageHeader title={headerTitle} count={counts[activeTab]}>
				<nav className="grid grid-cols-3 mx-[18px] mb-2.5 border-2 border-ink shadow-[3px_3px_0_var(--color-ink)] bg-paper-card">
					{tabs.map((tab, i) => {
						const active = activeTab === tab.key;
						return (
							<button
								type="button"
								key={tab.key}
								onClick={() => setActiveTab(tab.key)}
								aria-pressed={active}
								className={cn(
									"font-archivo-black text-[10px] uppercase tracking-[0.15em] py-2 px-2 cursor-pointer leading-none",
									"flex items-center justify-center gap-1.5",
									active ? "bg-kodak-yellow text-ink" : "bg-transparent text-ink-faded hover:bg-paper-dark/30",
									i < 2 && "border-r-2 border-ink",
								)}
							>
								{tab.label}
								<span className="font-archivo font-bold text-[9px] tracking-[0.15em] opacity-70">
									{String(tab.count).padStart(2, "0")}
								</span>
							</button>
						);
					})}
				</nav>
			</PageHeader>

			<div className="px-[18px] pt-3 pb-32 flex flex-col gap-4">
				{activeTab === "cameras" && <CamerasTab data={data} setData={setData} onCameraClick={onCameraClick} />}
				{activeTab === "lenses" && <LensesTab data={data} setData={setData} />}
				{activeTab === "backs" && <BacksTab data={data} setData={setData} />}
			</div>
		</div>
	);
}
