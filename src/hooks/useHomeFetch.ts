import { useState, useEffect, useRef } from 'react';
import API, { Movie } from '../API';
// helpers
import { isPersistedState } from '../helpers';

const initalState = {
    page: 0,
    results: [] as Movie[],
    total_pages: 0,
    total_results: 0,
};

export const useHomeFetch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [state, setState] = useState(initalState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const fetchMovies = async (page: number, searchTerm: string = '') => {
        try {
            setError(false);
            setLoading(true);

            const movies = await API.fetchMovies(searchTerm, page);

            setState((prev) => ({
                ...movies,
                results:
                    page > 1
                        ? [...prev.results, ...movies.results]
                        : [...movies.results],
            }));
        } catch (error) {
            setError(true);
        }
        setLoading(false);
    };

    // fetch on search and on initial render
    useEffect(() => {
        if (!searchTerm) {
            const sessionState = isPersistedState('homeState');

            if (sessionState) {
                setState(sessionState);
                return;
            }
        }

        fetchMovies(1, searchTerm);
    }, [searchTerm]);

    // Load More
    useEffect(() => {
        if (!isLoadingMore) return;

        fetchMovies(state.page + 1, searchTerm);
        setIsLoadingMore(false);
    }, [isLoadingMore, searchTerm, state.page]);

    // Write to sessionStorage
    useEffect(() => {
        if (!searchTerm)
            sessionStorage.setItem('homeState', JSON.stringify(state));
    }, [searchTerm, state]);

    return {
        state,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        setIsLoadingMore,
    };
};
