import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const EventSidebar = React.memo(() => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isInHero, setIsInHero] = useState(true);
    const [events, setEvents] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const handleScroll = () => {
            // Hide sidebar if scrolled past the hero section (approx 100vh)
            const heroHeight = window.innerHeight * 0.8;
            setIsInHero(window.scrollY < heroHeight);
        };

        window.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }

        // Fetch up to 6 events from Firebase
        const q = query(
            collection(db, "nextEvents"), 
            orderBy("order", "asc"),
            limit(6)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventsData.filter(e => e.status !== 'hidden'));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching events:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const nextEvent = () => {
        setCurrentIndex((prev) => (prev + 1) % events.length);
    };

    const prevEvent = () => {
        setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
    };

    if (!isInHero || loading || events.length === 0) return null;

    const currentEvent = events[currentIndex];

    return (
        <>
            {/* Collapsed State - Side Tab */}
            <AnimatePresence>
                {!isExpanded && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-1/2 -translate-y-1/2 z-40"
                    >
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="group flex items-center gap-2 bg-linear-to-r from-red-600 to-purple-600 text-white px-3 py-4 rounded-l-xl shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all duration-300 hover:px-4"
                        >
                            <ChevronLeft size={18} className="group-hover:animate-pulse" />
                            <div className="writing-vertical-rl rotate-180 text-sm font-bold tracking-wider">
                                NEXT EVENT
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Expanded State - Sidebar Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 w-80"
                    >
                        <div className="relative overflow-hidden rounded-l-2xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                            {/* Background Effects */}
                            <div className="absolute inset-0 bg-linear-to-br from-red-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
                            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-red-500/20 blur-2xl"></div>
                            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl"></div>

                            {/* Close Button */}
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white transition-colors z-20 rounded-full hover:bg-white/10"
                            >
                                <ChevronRight size={20} />
                            </button>


                            <div className="relative z-10 p-6 pt-10">
                                {/* Event Badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1">
                                        <Calendar size={12} className="text-red-400" />
                                        <span className="text-xs font-mono text-red-400">
                                            {currentEvent.status === 'live' ? 'LIVE NOW' : 'UPCOMING'}
                                        </span>
                                    </div>
                                    {events.length > 1 && (
                                        <span className="text-xs font-mono text-gray-500">
                                            {currentIndex + 1} / {events.length}
                                        </span>
                                    )}
                                </div>

                                {/* Event Content */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentEvent.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Event Title */}
                                        <h3 className="text-2xl font-bold text-white tracking-tight mb-1">
                                            {currentEvent.title}
                                        </h3>
                                        {currentEvent.subtitle && (
                                            <p className="text-purple-400 font-mono text-sm mb-4">
                                                {currentEvent.subtitle}
                                            </p>
                                        )}

                                        {/* Date */}
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 mb-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 uppercase">Date</span>
                                                <span className="text-white font-semibold">{currentEvent.date}</span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {currentEvent.description && (
                                            <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                                                {currentEvent.description}
                                            </p>
                                        )}

                                        {/* Register Button */}
                                        {currentEvent.link && (
                                            <a
                                                href={currentEvent.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative w-full inline-flex items-center justify-center overflow-hidden rounded-lg bg-linear-to-r from-red-600 to-purple-600 px-6 py-3 font-bold text-white transition-all hover:from-red-500 hover:to-purple-500 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    {currentEvent.status === 'live' ? 'JOIN NOW' : 'REGISTER NOW'}
                                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            </a>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation Arrows */}
                                {events.length > 1 && (
                                    <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/10">
                                        <button
                                            onClick={prevEvent}
                                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:scale-110"
                                            aria-label="Previous event"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        
                                        {/* Dots Indicator */}
                                        <div className="flex gap-2">
                                            {events.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentIndex(index)}
                                                    className={`w-2 h-2 rounded-full transition-all ${
                                                        index === currentIndex 
                                                            ? 'bg-red-500 w-6' 
                                                            : 'bg-white/20 hover:bg-white/40'
                                                    }`}
                                                    aria-label={`Go to event ${index + 1}`}
                                                />
                                            ))}
                                        </div>

                                        <button
                                            onClick={nextEvent}
                                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:scale-110"
                                            aria-label="Next event"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Decorative Line */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-red-500 via-purple-500 to-red-500"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CSS for vertical text */}
            <style jsx>{`
                .writing-vertical-rl {
                    writing-mode: vertical-rl;
                }
            `}</style>
        </>
    );
});

export default EventSidebar;
