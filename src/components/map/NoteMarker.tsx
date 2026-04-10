import { MapPin } from "lucide-react";
import { Marker } from "react-map-gl/maplibre";
import type { Cluster } from "@/utils/map-helpers";
import { getMarkerColor } from "@/utils/map-helpers";

interface NoteMarkerProps {
	cluster: Cluster;
	onClick: (cluster: Cluster) => void;
}

export function NoteMarker({ cluster, onClick }: NoteMarkerProps) {
	const isCluster = cluster.notes.length > 1;
	const geoNote = cluster.notes[0]!;
	const color = isCluster ? "#c4392d" : getMarkerColor(geoNote.film.type);
	const size = isCluster ? Math.min(20 + cluster.notes.length * 3, 44) : 28;

	return (
		<Marker latitude={cluster.latitude} longitude={cluster.longitude} anchor="center">
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onClick(cluster);
				}}
				className="flex items-center justify-center rounded-full border-2 border-white/80 shadow-lg cursor-pointer transition-transform hover:scale-110"
				style={{ width: size, height: size, backgroundColor: color }}
			>
				{isCluster ? (
					<span className="text-[11px] font-bold text-white font-body">{cluster.notes.length}</span>
				) : geoNote.note.frameNumber != null ? (
					<span className="text-[10px] font-bold text-white font-mono">{geoNote.note.frameNumber}</span>
				) : (
					<MapPin size={14} className="text-white" />
				)}
			</button>
		</Marker>
	);
}
