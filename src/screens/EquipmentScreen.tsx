import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BacksTab } from "@/components/equipment/BacksTab";
import { CamerasTab } from "@/components/equipment/CamerasTab";
import { LensesTab } from "@/components/equipment/LensesTab";
import { Button } from "@/components/ui/button";
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

	const tabs: { key: EquipmentTab; label: string }[] = [
		{ key: "cameras", label: t("equipment.camerasTab") },
		{ key: "lenses", label: t("equipment.lensesTab") },
		{ key: "backs", label: t("equipment.backsTab") },
	];

	return (
		<div className="flex flex-col gap-5" data-tour="cameras-tab">
			<div className="flex gap-2">
				{tabs.map((tab) => (
					<Button
						key={tab.key}
						variant="ghost"
						size="sm"
						onClick={() => setActiveTab(tab.key)}
						className={cn(
							"rounded-full px-4 text-sm font-body",
							activeTab === tab.key ? "bg-accent-soft text-accent font-semibold" : "text-text-sec hover:bg-surface-alt",
						)}
					>
						{tab.label}
					</Button>
				))}
			</div>

			{activeTab === "cameras" && <CamerasTab data={data} setData={setData} onCameraClick={onCameraClick} />}
			{activeTab === "lenses" && <LensesTab data={data} setData={setData} />}
			{activeTab === "backs" && <BacksTab data={data} setData={setData} />}
		</div>
	);
}
