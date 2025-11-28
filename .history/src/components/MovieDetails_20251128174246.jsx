import { useState, useEffect } from 'react';
import Spinner from "./Spinner.jsx";

// Define API constants here or import from a config file
const API_BASE_URL = "https://api.themoviedb.org/3";

const MovieDetails = ({ movieId, onClose }) => {
    const [movieDetails, setMovieDetails] = useState(null);
    const [trailerKey, setTrailerKey] = useState(null);
    const [isLoading, setLoading] = useState(true);

    // Create API options inside component
    const getApiOptions = () => {
        const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
        return {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            }
        };
    };

    useEffect(() => {
        const fetchMovieDetails = async () => {
            if (!movieId) return;
            
            setLoading(true);
            try {
                // Fetch movie details with videos (trailers)
                const response = await fetch(
                    `${API_BASE_URL}/movie/${movieId}?append_to_response=videos`,
                    getApiOptions()
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
            </div>
        </div>
    );

    return (
        <div className="movie-details-overlay" onClick={onClose}>
            <div className="movie-details-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                
                {trailerKey ? (
                    <div className="trailer-section">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
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
                    <p className="overview">{movieDetails?.overview}</p>
                    
                    <div className="movie-meta">
                        <div className="rating">
                            <img src='/star.svg' alt='Star Icon'/>
                            <span>{movieDetails?.vote_average?.toFixed(1)}/10</span>
                        </div>
                        <span>Release: {movieDetails?.release_date}</span>
                        <span>Runtime: {movieDetails?.runtime} min</span>
                        <span>Language: {movieDetails?.original_language?.toUpperCase()}</span>
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

export default MovieDetails; // Make sure this export is at the end