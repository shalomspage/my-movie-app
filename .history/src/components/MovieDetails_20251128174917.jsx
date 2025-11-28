import { useState, useEffect } from 'react';
import Spinner from "./Spinner.jsx";

const MovieDetails = ({ movieId, onClose }) => {
    const [movieDetails, setMovieDetails] = useState(null);
    const [trailerKey, setTrailerKey] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            if (!movieId) return;

            setLoading(true);
            setError(null);
            try {
                // Fetch movie details with videos (trailers)
                const response = await fetch(
                    `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=videos`,
                    {
                        method: 'GET',
                        headers: {
                            'accept': 'application/json',
                            'Authorization': `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
                        }
                    }
                );

                if (!response.ok) throw new Error('Failed to fetch movie details');

                const data = await response.json();
                setMovieDetails(data);

                // Find the first YouTube trailer
                const trailer = data.videos?.results?.find(
                    video => video.type === 'Trailer' && video.site === 'YouTube'
                );
                setTrailerKey(trailer?.key);

            } catch (error) {
                console.error('Error fetching movie details:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [movieId]);

    if (isLoading) return (
        <div className="movie-details-overlay">
            <div className="movie-details-modal">
                <Spinner />
                <p className="text-white text-center mt-4">Loading movie details...</p>
            </div>
        </div>
    );

    if (error) {
        return (
            <div className="movie-details-overlay">
                <div className="movie-details-modal">
                    <button className="close-btn" onClick={onClose}>×</button>
                    <div className="movie-info">
                        <h2>Error Loading Movie</h2>
                        <p className="overview">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="movie-details-overlay" onClick={onClose}>
            <div className="movie-details-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>

                {trailerKey ? (
                    <div className="trailer-section">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailerKey}`}
                            title="Movie Trailer"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className="poster-section">
                        <img
                            src={movieDetails?.poster_path
                                ? `https://image.tmdb.org/t/p/w500/${movieDetails.poster_path}`
                                : '/no-movie.png'
                            }
                            alt={movieDetails?.title}
                        />
                    </div>
                )}

                <div className="movie-info">
                    <h2>{movieDetails?.title}</h2>
                    <p className="overview">{movieDetails?.overview || 'No description available.'}</p>

                    <div className="movie-meta">
                        <div className="rating">
                            <img src='/star.svg' alt='Star Icon'/>
                            <span>{movieDetails?.vote_average?.toFixed(1) || 'N/A'}/10</span>
                        </div>
                        <span>Release: {movieDetails?.release_date || 'Unknown'}</span>
                        <span>Runtime: {movieDetails?.runtime || 'N/A'} min</span>
                        <span>Language: {movieDetails?.original_language?.toUpperCase() || 'N/A'}</span>
                    </div>

                    {movieDetails?.genres?.length > 0 && (
                        <div className="genres">
                            {movieDetails.genres.map(genre => (
                                <span key={genre.id} className="genre-tag">{genre.name}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;