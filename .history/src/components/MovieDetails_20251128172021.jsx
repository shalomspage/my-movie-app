import { useState, useEffect } from 'react';
import Spinner from "./Spinner.jsx";

const MovieDetails = ({ movieId, onClose }) => {
    const [movieDetails, setMovieDetails] = useState(null);
    const [trailerKey, setTrailerKey] = useState(null);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            setLoading(true);
            try {
                // Fetch movie details
                const detailsResponse = await fetch(
                    `${API_BASE_URL}/movie/${movieId}?append_to_response=videos`,
                    API_OPTIONS
                );
                const detailsData = await detailsResponse.json();
                setMovieDetails(detailsData);

                // Find trailer
                const trailer = detailsData.videos?.results.find(
                    video => video.type === 'Trailer' && video.site === 'YouTube'
                );
                setTrailerKey(trailer?.key);
            } catch (error) {
                console.error('Error fetching movie details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (movieId) fetchMovieDetails();
    }, [movieId]);

    if (isLoading) return <Spinner />;

    return (
        <div className="movie-details-overlay">
            <div className="movie-details-modal">
                <button className="close-btn" onClick={onClose}>×</button>

                {trailerKey && (
                    <div className="trailer-section">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailerKey}`}
                            title="Movie Trailer"
                            allowFullScreen
                        />
                    </div>
                )}

                <div className="movie-info">
                    <h2>{movieDetails?.title}</h2>
                    <p className="overview">{movieDetails?.overview}</p>

                    <div className="movie-meta">
                        <span>Rating: {movieDetails?.vote_average}/10</span>
                        <span>Release: {movieDetails?.release_date}</span>
                        <span>Runtime: {movieDetails?.runtime}min</span>
                    </div>

                    <div className="genres">
                        {movieDetails?.genres?.map(genre => (
                            <span key={genre.id} className="genre-tag">{genre.name}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};