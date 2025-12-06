import React, { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Link, useNavigate } from "react-router-dom";
import Heading from "../components/Heading";
import Loader from "../components/Loader";

const MainLayout = ({ title, data, label, endpoint }) => {
  const [hoveredId, setHoveredId] = useState(null);
  const [hoverDetails, setHoverDetails] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const navigate = useNavigate();

  if (!data || data.length === 0) return null;

  const visibleData =
    title === "Top Upcoming" || title === "Newly Added"
      ? data.slice(0, 10)
      : data;

  const fetchAnimeDetails = async (id) => {
    if (hoverDetails[id]) return;
    try {
      setLoadingId(id);
      const res = await fetch(`https://titianime.vercel.app/api/anime/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setHoverDetails((prev) => ({ ...prev, [id]: json.data }));
      }
    } catch (err) {
      console.error("Error fetching anime details:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleMouseEnter = (id) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredId(id);
    fetchAnimeDetails(id);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setHoveredId(null), 150);
  };

  const handleHoverCardEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleHoverCardLeave = () => setHoveredId(null);

  const handleCardClick = (id) => {
    navigate(`/anime/${id}`);
  };

  // ✅ Slightly larger cards only for "Top Upcoming" & "Newly Added"
  const isSlightlyBigger = title === "Top Upcoming" || title === "Newly Added";

  return (
    <div className="main-layout mt-10 px-2 md:px-4 relative z-0 isolate w-full max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <Heading className="text-3xl font-extrabold tracking-wide text-white">
          {title}
        </Heading>

        {endpoint && title !== "Trending Now" && (
          <Link
            to={`/animes/${endpoint}`}
            className="text-sm text-sky-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>View More</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        )}
      </div>

      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={16}
        breakpoints={
          isSlightlyBigger
            ? {
                0: { slidesPerView: 1.9 },
                600: { slidesPerView: 3 },
                1024: { slidesPerView: 4.2 },
                1320: { slidesPerView: 5 },
              }
            : {
                0: { slidesPerView: 2.4 },
                600: { slidesPerView: 3.5 },
                1024: { slidesPerView: 5 },
                1320: { slidesPerView: 6 },
              }
        }
        className="overflow-visible relative z-0"
        style={{ maxWidth: "100%" }}
      >
        {visibleData.map((item) => {
          const anime = {
            id: item.id,
            title: item.title || item.name || "Unknown Title",
            poster: item.poster || item.image || "",
          };

          const details = hoverDetails[anime.id];
          const loading = loadingId === anime.id;
          const isHovered = hoveredId === anime.id;

          return (
            <SwiperSlide key={anime.id} className="!overflow-visible relative z-0">
              <div
                className="relative group flex flex-col items-center px-1 cursor-pointer"
                onMouseEnter={() => handleMouseEnter(anime.id)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleCardClick(anime.id)}
              >
                {/* ✅ Card height adjusts depending on section */}
                <div
                  className={`relative w-full h-0 overflow-hidden shadow-lg transition-transform duration-300 ease-in-out group-hover:scale-[1.05] rounded-xl
                  ${
                    isSlightlyBigger
                      ? "pb-[132%]" // a little taller, not too big
                      : title === "Trending Now"
                      ? "pb-[140%]"
                      : "pb-[145%]"
                  }`}
                >
                  <img
                    src={anime.poster}
                    alt={anime.title}
                    loading="lazy"
                    className={`absolute inset-0 w-full h-full object-cover rounded-xl transition-all duration-300 ${
                      isHovered ? "brightness-50 scale-[1.02]" : ""
                    }`}
                  />

                  {/* ✅ Label Badge */}
                  {label && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-sky-500 to-teal-500 text-white font-semibold px-3 py-1 rounded-full text-sm shadow-md select-none">
                      {label}
                    </div>
                  )}

                  {/* ✅ Hover Details Overlay */}
                  {isHovered && (
                    <div
                      onMouseEnter={handleHoverCardEnter}
                      onMouseLeave={handleHoverCardLeave}
                      className="absolute inset-0 bg-[#0b0b0c]/85 backdrop-blur-sm text-white p-4 flex flex-col justify-between rounded-xl transition-opacity duration-200 z-20"
                    >
                      {loading ? (
                        <div className="flex justify-center items-center h-full">
                          <Loader />
                        </div>
                      ) : (
                        details && (
                          <>
                            <div className="flex flex-col gap-2 overflow-hidden">
                              <h2 className="font-bold text-lg line-clamp-2">
                                {details.title}
                              </h2>

                              <div className="flex items-center gap-2 flex-wrap">
                                {details.score && (
                                  <span className="text-yellow-400 text-sm">
                                    ⭐ {details.score}
                                  </span>
                                )}
                                {details.type && (
                                  <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">
                                    {details.type}
                                  </span>
                                )}
                                {details.status && (
                                  <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">
                                    {details.status}
                                  </span>
                                )}
                              </div>

                              {details.genres && (
                                <p className="text-xs text-gray-300 line-clamp-1">
                                  {details.genres.join(" • ")}
                                </p>
                              )}

                              {details.synopsis && (
                                <p className="text-sm text-gray-300 line-clamp-3 mt-1">
                                  {details.synopsis}
                                </p>
                              )}
                            </div>

                            {title !== "Top Upcoming" && (
                              <Link
                                to={`/watch/${anime.id}`}
                                className="mt-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-center py-2 rounded-lg font-semibold hover:opacity-90 transition"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Watch Now
                              </Link>
                            )}
                          </>
                        )
                      )}
                    </div>
                  )}
                </div>

                <h2
                  title={anime.title}
                  className="mt-3 text-center text-gray-300 font-semibold text-base truncate w-full select-none group-hover:text-sky-400 transition-colors"
                >
                  {anime.title}
                </h2>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default MainLayout; 
