import React, { useEffect, useState } from 'react';
import Navbar from './components/NavbarOptimized';
import Footer from './components/Footer';
import Galaxy from './components/ui/Galaxy';
import { motion, useScroll, useTransform } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Calendar, Clock, MapPin, ArrowRight, ExternalLink } from 'lucide-react';

// --- Components ---

const GlitchText = ({ text, className }) => {
    return (
        <div className={`relative inline-block ${className}`}>
            <span className="relative z-10">{text}</span>
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-red-500 opacity-70 animate-pulse translate-x-[2px]">{text}</span>
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-blue-500 opacity-70 animate-pulse -translate-x-[2px]">{text}</span>
        </div>
    );
};

const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center mx-4 md:mx-8">
        <div className="relative">
            <div className="text-4xl md:text-7xl font-bold font-mono text-white tracking-tighter">
                {String(value).padStart(2, '0')}
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.8)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>
        </div>
        <span className="text-xs md:text-sm font-mono text-acm-teal tracking-[0.3em] mt-2 uppercase">{label}</span>
    </div>
);

const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return timeLeft;
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    return (
        <div className="flex justify-center items-center py-8">
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.minutes} label="Mins" />
            <TimeUnit value={timeLeft.seconds} label="Secs" />
        </div>
    );
};

const HolographicCard = ({ event }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.4 }}
            className="group relative w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-acm-teal/50 transition-all duration-300 shadow-xl h-full flex flex-col"
        >
            {/* Glowing Border Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-acm-teal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ transform: 'skewX(-20deg) translateX(-150%)', animation: 'shine 3s infinite' }}></div>

            {/* Image Section - Reduced Height */}
            <div className="relative h-40 overflow-hidden shrink-0">
                <img
                    src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070"}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                />

                {/* Date Badge - Compact */}
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-acm-teal/30 px-2 py-1 rounded text-center">
                    <span className="block text-lg font-bold text-white font-mono leading-none">{new Date(event.date).getDate()}</span>
                    <span className="block text-[10px] text-acm-teal uppercase font-bold leading-none">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
            </div>

            {/* Content Section - Compact Padding */}
            <div className="p-5 flex flex-col flex-grow relative">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-white/10 text-gray-300 border border-white/10">
                            {event.chapter || "ACM GENERAL"}
                        </span>
                        {event.virtual && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                VIRTUAL
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-acm-teal transition-colors line-clamp-2">
                        {event.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-gray-400 text-xs mb-3 font-mono">
                        <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{event.time || "10:00 AM"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span className="truncate max-w-[100px]">{event.location || "MIT Building"}</span>
                        </div>
                    </div>

                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-4">
                        {event.description}
                    </p>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <a href={event.link || "#"} className="flex items-center gap-2 text-white font-bold tracking-wider text-xs hover:gap-3 transition-all group/btn">
                        REGISTER <ArrowRight size={14} className="text-acm-teal group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                    <ExternalLink size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Page ---

const EventsApp = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [countdownEvent, setCountdownEvent] = useState(null);

    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }

        // Fetch countdown timer event
        const fetchCountdown = async () => {
            try {
                const docSnap = await getDoc(doc(db, "eventsPage", "countdown"));
                if (docSnap.exists()) {
                    setCountdownEvent(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching countdown:", error);
            }
        };
        fetchCountdown();

        // Real-time listener for incoming events
        const q = query(
            collection(db, "eventsPageEvents"),
            orderBy("date", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEvents(fetchedEvents);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching events:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Scroll opacity for Hero
    const scrollY = useScroll().scrollY;
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
    const heroY = useTransform(scrollY, [0, 500], [0, 200]);

    return (
        <div className="bg-black min-h-screen text-white selection:bg-acm-teal selection:text-black font-sans overflow-x-hidden">
            <Navbar />

            {/* --- Hero Section --- */}
            <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Galaxy density={0.5} glowIntensity={0.2} /> {/* Reusing Galaxy for consistency */}
                </div>

                {/* Gradient Overlay for Fade */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-10"></div>

                <motion.div
                    className="relative z-20 text-center px-4 max-w-5xl mx-auto"
                    style={{ opacity: heroOpacity, y: heroY }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    >
                        <div className="mb-6 flex justify-center">
                            <span className="px-4 py-1 border border-acm-teal/50 rounded-full bg-acm-teal/10 text-acm-teal text-xs font-mono tracking-[0.4em] backdrop-blur-md uppercase">
                                System Status: Online
                            </span>
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white mb-2 leading-none">
                            {countdownEvent?.title || "TURINGER"}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 font-light tracking-wide mb-12">
                            {countdownEvent?.subtitle || "The Ultimate Coding Showdown"}
                        </p>
                    </motion.div>

                    {/* Countdown */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-10 mb-10 shadow-[0_0_50px_rgba(34,197,94,0.1)] inline-block">
                        <CountdownTimer targetDate={countdownEvent?.targetDate || '2026-01-30T00:00:00'} />
                    </div>

                    <motion.p
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-sm font-mono text-gray-500 tracking-widest mt-8"
                    >
                        SCROLL TO INITIALIZE
                    </motion.p>
                </motion.div>
            </div>

            {/* --- Event Grid Section --- */}
            <section className="relative z-20 pb-40 px-4 md:px-10 -mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-16 border-b border-white/10 pb-6">
                        <div>
                            <h2 className="text-4xl font-bold text-white mb-2">INCOMING TRANSMISSIONS</h2>
                            <p className="text-gray-400 font-mono text-sm">SECURE CHANNEL // ENCRYPTED</p>
                        </div>
                        <div className="hidden md:block">
                            <div className="flex gap-2">
                                {['ALL', 'SIG AI', 'MITB', 'WORKSHOPS'].map((tag) => (
                                    <button key={tag} className="px-4 py-2 border border-white/10 hover:border-acm-teal hover:text-acm-teal text-gray-400 text-xs font-mono transition-colors rounded">
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {loading ? (
                            <div className="col-span-full text-center py-20 text-gray-500 font-mono animate-pulse">LOADING DATA STREAMS...</div>
                        ) : (
                            events.map((event) => (
                                <HolographicCard key={event.id} event={event} />
                            ))
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default EventsApp;
