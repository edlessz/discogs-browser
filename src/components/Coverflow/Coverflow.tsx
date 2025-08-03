import { useCallback, useEffect, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { EffectCoverflow, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { CollectionItemsResponse, ReleaseInstance } from "../../api/types";
import type { MasterRelease } from "../../api/types/database";

import "swiper/swiper-bundle.css";
import "./Coverflow.css";

interface CoverflowProps {
	collection: CollectionItemsResponse | null;
	selectedFormat: string;
	masterReleases: Record<number, MasterRelease>;
	className?: string;
}

export function Coverflow({
	collection,
	selectedFormat,
	masterReleases,
	className = "",
}: CoverflowProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const swiperRef = useRef<SwiperType | null>(null);

	const normalizeArtistName = (name: string) => {
		return name.replace(/^(The|A|An)\s+/i, "").trim();
	};

	const filteredAndSortedReleases = collection
		? (collection.releases ?? [])
				.filter(
					(release) =>
						selectedFormat === "all" ||
						release.basic_information.formats?.some(
							(format) => format.name === selectedFormat,
						),
				)
				.sort((a, b) => {
					const artistA = normalizeArtistName(
						a.basic_information.artists.map((x) => x.name).join(", "),
					);
					const artistB = normalizeArtistName(
						b.basic_information.artists.map((x) => x.name).join(", "),
					);

					const yearA =
						masterReleases[a.basic_information.master_id]?.year ??
						a.basic_information.year ??
						0;
					const yearB =
						masterReleases[b.basic_information.master_id]?.year ??
						b.basic_information.year ??
						0;

					const artistComparison = artistA.localeCompare(artistB);
					if (artistComparison !== 0) {
						return artistComparison;
					}

					return yearA - yearB;
				})
		: [];

	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		if (event.key === "ArrowLeft") {
			swiperRef.current?.slidePrev();
		} else if (event.key === "ArrowRight") {
			swiperRef.current?.slideNext();
		}
	}, []);

	const handleWheel = useCallback((event: WheelEvent) => {
		event.preventDefault();
		if (event.deltaY > 0) {
			swiperRef.current?.slideNext();
		} else if (event.deltaY < 0) {
			swiperRef.current?.slidePrev();
		}
	}, []);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("wheel", handleWheel, { passive: false });
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("wheel", handleWheel);
		};
	}, [handleKeyDown, handleWheel]);

	if (!collection) return null;

	const currentRelease = filteredAndSortedReleases[currentIndex];

	const getFormats = (release: ReleaseInstance) => {
		return [
			...new Set(
				release.basic_information.formats?.map((format) => format.name) ?? [],
			),
		]
			.filter((x) => x !== "All Media")
			.join(", ");
	};

	return (
		<div className={`h-full flex flex-col ${className}`}>
			<div className="flex-1 flex flex-col justify-center">
				<div>
					<Swiper
						effect="coverflow"
						grabCursor={true}
						centeredSlides={true}
						slidesPerView={5}
						coverflowEffect={{
							rotate: 30,
							stretch: 10,
							depth: 100,
							modifier: 1,
							slideShadows: true,
							scale: 1,
						}}
						pagination={{
							enabled: false,
						}}
						navigation={true}
						modules={[EffectCoverflow, Pagination, Navigation]}
						className="h-half"
						onSwiper={(swiper) => {
							swiperRef.current = swiper;
						}}
						onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
					>
						{filteredAndSortedReleases.map((release) => (
							<SwiperSlide key={release.basic_information.id}>
								{release.basic_information.cover_image ? (
									<img
										src={release.basic_information.cover_image}
										alt={release.basic_information.title}
										className="w-full h-full object-contain"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg shadow-lg">
										<div className="text-center p-4">
											<div className="text-sm font-semibold text-gray-700 mb-1">
												{release.basic_information.artists
													.map((x) => x.name)
													.join(", ")}
											</div>
											<div className="text-xs text-gray-600">
												{release.basic_information.title}
											</div>
										</div>
									</div>
								)}
							</SwiperSlide>
						))}
					</Swiper>
				</div>
			</div>

			{currentRelease && (
				<div className="bg-gray-50 p-6">
					<div className="max-w-4xl mx-auto text-center">
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							{currentRelease.basic_information.title}
						</h2>
						<p className="text-lg text-gray-700 mb-1">
							{currentRelease.basic_information.artists
								.map((x) => x.name)
								.join(", ")}
						</p>
						<p className="text-sm text-gray-500 mb-4">
							{masterReleases[currentRelease.basic_information.master_id]
								?.year ??
								currentRelease.basic_information.year ??
								"Unknown Year"}
							{currentRelease.basic_information.formats && (
								<span> • {getFormats(currentRelease)}</span>
							)}
						</p>
						<div className="flex justify-center gap-4 text-sm text-gray-600">
							<span>
								{currentIndex + 1} of {filteredAndSortedReleases.length}
							</span>
							<span>•</span>
							<a
								href={
									currentRelease.basic_information.master_id !== 0
										? `https://www.discogs.com/master/${currentRelease.basic_information.master_id}`
										: `https://www.discogs.com/release/${currentRelease.basic_information.id}`
								}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:text-blue-800 underline"
							>
								View on Discogs
							</a>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
