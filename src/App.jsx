import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import MovieDetailsPage from './pages/MovieDetailsPage.jsx';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
            </Routes>
        </Router>
    );
};

export default App;