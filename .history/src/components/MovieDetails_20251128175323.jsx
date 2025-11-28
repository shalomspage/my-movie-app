import { useState, useEffect } from 'react';
import Spinner from "./Spinner.jsx";

const MovieDetails = ({ movieId, onClose }) => {
    const [movieDetails, setMovieDetails] = useState(null);
    const [trailerKey, setTrailerKey] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('🎬 MovieDetails mounted with ID:', movieId);
        
        const fetchMovieDetails = async () => {
            if (!movieId) {
                console.log('❌ No movieId provided');
                return;
            }

            setLoading(true);
            setError(null);
            try {
                console.log('🔄 Fetching movie details for ID:', movieId);
                
                const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
                console.log('🔑 API Key exists:', !!API_KEY);
                
                if (!API_KEY) {
                    throw new Error('TMDB API key is missing');
                }

                const response = await fetch(
                    `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=videos`,
                    {
                        method: 'GET',
                        headers: {
                            'accept': 'application/json',
                            'Authorization': `Bearer ${API_KEY}`,
                        }
                    }
                );

                console.log('📡 Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('✅ Movie data received:', data);
                console.log('🎥 Videos available:', data.videos?.results?.length || 0);

                setMovieDetails(data);

                // Find the first YouTube trailer
                const trailer = data.videos?.results?.find(
                    video => video.type === 'Trailer' && video.site === 'YouTube'
                );
                console.log('📹 Trailer found:', trailer);
                setTrailerKey(trailer?.key);

            } catch (error) {
                console.error('❌ Error fetching movie details:', error);
                setError(error.message);
            } finally {
                console.log('🏁 Loading complete');
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [movieId]);

    console.log('🔄 Current state - isLoading:', isLoading, 'error:', error, 'movieDetails:', !!movieDetails);

    if (isLoading) {
        console.log('⏳ Rendering loading state');
        return (
            <div className="movie-details-overlay">
                <div className="movie-details-modal">
                    <div className="spinner-container">
                        <Spinner />
                        <p className="text-white text-center mt-4">Loading movie details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        console.log('🚨 Rendering error state:', error);
        return (
            <div className="movie-details-overlay">
                <div className="movie-details-modal">
                    <button className="close-btn" onClick={onClose}>×</button>
                    <div className="movie-info">
                        <h2>Error Loading Movie</h2>
                        <p className="overview text-red-400">{error}</p>
                        <p className="text-light-200 mt-2">Please check your API key and try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    console.log('🎭 Rendering movie details for:', movieDetails?.title);
    
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
                            onError={(e) => {
                                e.target.src = '/no-movie.png';
                            }}
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