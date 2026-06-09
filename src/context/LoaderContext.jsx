import React, { createContext, useState, useContext } from 'react';

const LoaderContext = createContext();

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }) => {
    // Initialize loading based on session storage to prevent showing it
    // every time the user navigates back to home in this MPA structure.
    const [loading, setLoading] = useState(() => {
        return !sessionStorage.getItem('hasSeenLoader');
    });

    const handleSetLoading = (isLoading) => {
        setLoading(isLoading);
        if (!isLoading) {
            sessionStorage.setItem('hasSeenLoader', 'true');
        }
    };

    return (
        <LoaderContext.Provider value={{ loading, setLoading: handleSetLoading }}>
            {children}
        </LoaderContext.Provider>
    );
};
