import React, { useEffect, useRef, useState, Suspense } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Galaxy from './ui/Galaxy';

// Lazy Load Robot
const Robot = React.lazy(() => import('./ui/Robot'));

const Hero = () => {
    const heroRef = useRef(null);
    const { scrollY } = useScroll();
    const [isMobile, setIsMobile] = useState(false);
    const [scrollDirection, setScrollDirection] = useState('down');
    const prevScrollY = useRef(0);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia("(max-width: 768px)").matches);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Track scroll direction
    useEffect(() => {
        const unsubscribe = scrollY.on('change', (latest) => {
            if (latest > prevScrollY.current) {
                setScrollDirection('down');
            } else if (latest < prevScrollY.current) {
                setScrollDirection('up');
            }
            prevScrollY.current = latest;
        });
        return () => unsubscribe();
    }, [scrollY]);

    // Cinematic Zoom & Parallax Effects (Only when scrolling UP, disabled on mobile)
    const yRobot = useTransform(scrollY, [0, 1000], [0, isMobile || scrollDirection === 'down' ? 0 : 400]);
    const scaleRobot = useTransform(scrollY, [0, 500], [1, isMobile || scrollDirection === 'down' ? 1 : 1.6]);
    const opacityRobot = useTransform(scrollY, [300, 600], [1, 0]);

    // Bubble moves faster out of view (Only when scrolling UP, disabled on mobile)
    const yBubble = useTransform(scrollY, [0, 500], [0, isMobile || scrollDirection === 'down' ? 0 : -500]);

    // Background deep space zoom (Only when scrolling UP, disabled on mobile)
    const scaleGalaxy = useTransform(scrollY, [0, 1000], [1, isMobile || scrollDirection === 'down' ? 1 : 1.5]);

    // Smooth physics - Always call hooks, but use instant animation on mobile (very high stiffness)
    const smoothYRobot = useSpring(yRobot, { stiffness: isMobile ? 1000 : 60, damping: 20 });
    const smoothScaleRobot = useSpring(scaleRobot, { stiffness: isMobile ? 1000 : 60, damping: 20 });
    const smoothYBubble = useSpring(yBubble, { stiffness: isMobile ? 1000 : 50, damping: 20 });

    return (
        <section ref={heroRef} id="home" className="relative h-screen w-full bg-black overflow-hidden">
            {/* Black background layer - always visible to prevent white flash */}
            <div className="absolute inset-0 bg-black z-0" />

            {/* Background with Slow Zoom - Desktop Only */}
            {!isMobile ? (
                <motion.div
                    className="absolute inset-0 z-0 will-change-transform"
                    style={{ scale: scaleGalaxy }}
                >
                    <Galaxy density={0.4} glowIntensity={0.2} />
                </motion.div>
            ) : (
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-gray-900 to-black" />
            )}

            {/* Parallax Container */}
            <div className="relative z-10 w-full h-full pointer-events-none">

                {/* Robot - Positioned properly on mobile */}
                <motion.div
                    className={isMobile
                        ? "absolute top-[15%] left-1/2 -translate-x-1/2 w-full h-[50vh] flex items-center justify-center pointer-events-auto"
                        : "absolute inset-0 md:w-[70%] md:right-auto flex items-center justify-center md:justify-start pointer-events-auto"
                    }
                    style={{
                        y: smoothYRobot,
                        scale: smoothScaleRobot,
                        opacity: opacityRobot,
                        x: isMobile ? 0 : -50
                    }}
                >
                    <Suspense fallback={<div className="text-white/20 tracking-widest font-mono text-sm">INITIALIZING AI...</div>}>
                        <Robot />
                    </Suspense>
                </motion.div>

                {/* Minimalist Right-Aligned Label */}
                <motion.div
                    className={`absolute z-20 text-center ${isMobile ? 'top-[55%] left-1/2 -translate-x-1/2 w-[90%]' : 'top-[35%] right-[10%] text-right'
                        }`}
                    style={{ y: smoothYBubble }}
                    initial={{ opacity: 0, x: isMobile ? 0 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: isMobile ? 0.5 : 1, duration: isMobile ? 0.5 : 1, ease: "easeOut" }}
                >
                    <div className="flex flex-col items-center">
                        <p className="text-white font-mono text-xl md:text-3xl tracking-[0.2em] mb-3 animate-pulse text-center font-bold">
                            WELCOME TO
                        </p>
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black font-sans tracking-tighter text-white mb-4 drop-shadow-2xl text-center">
                            ACM <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">MITB</span>
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-cyan-500 to-transparent"></div>
                            <p className="text-gray-300 font-mono text-base md:text-xl tracking-[0.3em] uppercase text-center">
                                Student Chapter
                            </p>
                            <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-cyan-500 to-transparent"></div>
                        </div>
                    </div>
                </motion.div>

                {/* Aesthetic Scroll Indicator */}
                <motion.div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                >
                    <div className="w-[1px] h-12 bg-linear-to-b from-transparent via-cyan-500 to-transparent opacity-50"></div>
                    <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-500/50 uppercase">Scroll to Explore</span>
                </motion.div>

            </div>
        </section>
    );
};

export default Hero;
