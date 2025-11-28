import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from "../components/Spinner.jsx";

const MovieDetailsPage = () => {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const [movieDetails, setMovieDetails] = useState(null);
    const [trailerKey, setTrailerKey] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            if (!movieId) {
                navigate('/');
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
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

                if (!response.ok) throw new Error('Failed to fetch movie details');

                const data = await response.json();
                setMovieDetails(data);

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
    }, [movieId, navigate]);

    const goBack = () => {
        navigate(-1); // Go back to previous page
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-white text-2xl mb-4">Error Loading Movie</h2>
                    <p className="text-light-200">{error}</p>
                    <button
                        onClick={goBack}
                        className="mt-4 bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-primary px-6 py-2 rounded-lg font-medium"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary">
            <div className="pattern" />
            <div className="wrapper">
                <button
                    onClick={goBack}
                    className="mb-6 flex items-center gap-2 text-light-200 hover:text-white transition-colors"
                >
                    ← Back to Movies
                </button>

                <div className="movie-details-container bg-dark-100 rounded-2xl overflow-hidden">
                    {trailerKey ? (
                        <div className="trailer-section">
                            <iframe
                                src={`https://www.youtube.com/embed/${trailerKey}`}
                                title="Movie Trailer"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-80 xs:h-96 md:h-[450px]"
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
                                className="w-full h-80 xs:h-96 md:h-[450px] object-cover"
                            />
                        </div>
                    )}

                    <div className="movie-info p-6">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {movieDetails?.title}
                        </h1>

                        <p className="overview text-light-200 leading-relaxed text-lg mb-6">
                            {movieDetails?.overview || 'No description available.'}
                        </p>

                        <div className="movie-meta flex flex-wrap gap-4 py-4 border-t border-b border-light-100/20 mb-6">
                            <div className="rating flex items-center gap-2">
                                <img src='/star.svg' alt='Star Icon' className="w-5 h-5"/>
                                <span className="text-light-200">{movieDetails?.vote_average?.toFixed(1) || 'N/A'}/10</span>
                            </div>
                            <span className="text-light-200">Release: {movieDetails?.release_date || 'Unknown'}</span>
                            <span className="text-light-200">Runtime: {movieDetails?.runtime || 'N/A'} min</span>
                            <span className="text-light-200">Language: {movieDetails?.original_language?.toUpperCase() || 'N/A'}</span>
                        </div>

                        {movieDetails?.genres?.length > 0 && (
                            <div className="genres flex flex-wrap gap-2">
                                {movieDetails.genres.map(genre => (
                                    <span key={genre.id} className="genre-tag bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-primary px-3 py-1 rounded-full text-sm font-medium">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetailsPage;