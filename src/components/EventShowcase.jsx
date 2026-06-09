import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const EventShowcase = ({ chapter }) => {
    const [activeCard, setActiveCard] = useState(0);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const textCardsRef = useRef([]);

    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }

        let q;
        if (chapter) {
            q = query(collection(db, "stories"), where("chapters", "array-contains", chapter));
        } else {
            q = query(collection(db, "stories"));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by date descending (newest first)
            data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setEvents(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [chapter]);

    useEffect(() => {
        if (events.length === 0) return;

        const handleScroll = () => {
            const centerLine = window.innerHeight / 2;
            let closestIndex = 0;
            let minDistance = Number.MAX_VALUE;

            textCardsRef.current.forEach((card, index) => {
                if (card) {
                    const rect = card.getBoundingClientRect();
                    const cardCenter = rect.top + rect.height / 2;
                    const distance = Math.abs(centerLine - cardCenter);

                    if (distance < minDistance) {
                        minDistance = distance;
                        closestIndex = index;
                    }
                }
            });

            setActiveCard(closestIndex);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check on mount
        return () => window.removeEventListener('scroll', handleScroll);
    }, [events.length]);

    if (loading) return null;
    if (events.length === 0) return null;

    return (
        <section className="bg-black relative py-20 px-4 md:px-10 font-sans">
            {/* Section Header */}
            <div className="max-w-7xl mx-auto mb-20 text-center">
                <h2 className="text-sm font-mono text-acm-teal tracking-widest mb-4">EVENTS CHRONICLE</h2>
                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
                    MOMENTS IN <span className="text-white">TIME</span>
                </h1>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">

                {/* Visual Side (Sticky) */}
                <div className="md:w-1/2 sticky top-24 h-[50vh] md:h-[60vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black order-1 md:order-2 mb-10 md:mb-0 flex items-center justify-center">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={events[activeCard].id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute inset-0 w-full h-full z-10 p-4"
                        >
                            <img
                                src={events[activeCard].image}
                                alt={events[activeCard].title}
                                className="w-full h-full object-contain"
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Text Side (Scrollable) */}
                <div className="md:w-1/2 order-2 md:order-1 relative pb-[50vh]">
                    {events.map((event, index) => (
                        <div
                            key={event.id}
                            ref={(el) => (textCardsRef.current[index] = el)}
                            className="min-h-[80vh] flex flex-col justify-center py-10 pl-4 border-l-2 transition-colors duration-500"
                            style={{ borderColor: activeCard === index ? '#2563eb' : 'rgba(255,255,255,0.1)' }}
                        >
                            <motion.div
                                animate={{ opacity: activeCard === index ? 1 : 0.3, x: activeCard === index ? 0 : -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <span className="text-sm font-mono text-acm-teal mb-2 block">{event.date}</span>
                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                    {event.title}
                                </h2>
                                <p className="text-lg text-gray-400 leading-relaxed max-w-md">
                                    {event.description}
                                </p>

                                {event.link ? (
                                    <a
                                        href={event.link.startsWith('http://') || event.link.startsWith('https://') ? event.link : `https://${event.link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-8 px-6 py-2 border border-white/20 rounded-full text-sm hover:bg-white/10 hover:border-acm-teal transition-all group flex items-center gap-2 text-white w-fit"
                                    >
                                        EXPLORE
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    </a>
                                ) : (
                                    <div className="mt-8 px-6 py-2 border border-white/20 rounded-full text-sm flex items-center gap-2 text-gray-600 w-fit cursor-not-allowed opacity-0">
                                        {/* Hidden NO LINK */}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default EventShowcase;

