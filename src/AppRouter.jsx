import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Loader from './components/Loader';
import { LoaderProvider, useLoader } from './context/LoaderContext';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./App'));
const AboutPage = lazy(() => import('./AboutPageApp'));
const AcmMitbPage = lazy(() => import('./AcmMitbApp'));
const AcmWPage = lazy(() => import('./AcmWApp'));
const NewsPage = lazy(() => import('./NewsApp'));
const MembershipPage = lazy(() => import('./MembershipApp'));
const SigAiPage = lazy(() => import('./SigAiApp'));
const SigSoftPage = lazy(() => import('./SigSoftApp'));
const TownhallPage = lazy(() => import('./TownhallApp'));
const EventsPage = lazy(() => import('./EventsApp')); // New Page

import ScrollToTop from './components/ScrollToTop';

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RedirectToHome = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // If the user lands on any page other than home, redirect to home
        // This satisfies "whenever someone refreshes the website it should go to home"
        if (location.pathname !== '/') {
            navigate('/', { replace: true });
        }
    }, [location.pathname, navigate]); // Run once per landed path

    return null;
};

const SuspenseFallback = () => {
    const { loading } = useLoader();
    // Only show the loader in the fallback if the global loading state is true
    // (i.e., first visit). Otherwise, show nothing or a minimal spinner 
    // to avoid the "full entry animation" reappearing.
    return loading ? <Loader /> : null;
};

const AppRouter = () => {
    return (
        <ErrorBoundary>
            <LoaderProvider>
                <Router>
                    <ScrollToTop />
                    <RedirectToHome />
                    <Suspense fallback={<SuspenseFallback />}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/acm-mitb" element={<AcmMitbPage />} />
                            <Route path="/acm-w" element={<AcmWPage />} />
                            <Route path="/news" element={<NewsPage />} />
                            <Route path="/membership" element={<MembershipPage />} />
                            <Route path="/events" element={<EventsPage />} /> {/* New Route */}
                            <Route path="/sigai" element={<SigAiPage />} />
                            <Route path="/sigsoft" element={<SigSoftPage />} />
                            <Route path="/townhall" element={<TownhallPage />} />
                            {/* Fallback route for 404s/Refreshes */}
                            <Route path="*" element={<HomePage />} />
                        </Routes>
                    </Suspense>
                </Router>
            </LoaderProvider>
        </ErrorBoundary>
    );
};

export default AppRouter;
