import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Lightbulb } from 'lucide-react';
import TiltCard from './ui/TiltCard';
import DotGrid from './ui/DotGrid';

const Card = ({ icon: Icon, title, description, delay }) => {
    const CardIcon = Icon;
    return (
        <TiltCard
            className="h-full"
        >
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay, ease: "easeOut" }}
                className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:border-acm-teal/50 hover:bg-zinc-900/80 transition-all group h-full flex flex-col"
            >
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-zinc-800 to-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                    <CardIcon size={32} className="text-white group-hover:text-acm-teal transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-acm-teal transition-colors">{title}</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors grow">
                    {description}
                </p>
            </motion.div>
        </TiltCard>
    );
};

const About = () => {
    const containerRef = useRef(null);
    return (
        <section ref={containerRef} className="relative py-32 min-h-screen flex items-center z-10 overflow-hidden">
            {/* Dot Grid Background */}
            <div className="absolute inset-0 z-[1]">
                <DotGrid
                    dotSize={5}
                    gap={35}
                    gradientStart="#ff1744"
                    gradientEnd="#00D9FF"
                    activeColor="#ffffff"
                    proximity={150}
                    scaleTrigger={1.5}
                    maxDisplacement={8}
                />
            </div>

            {/* Background Gradient for Merge - Blur and darken to hide universe animation */}
            <div
                className="absolute inset-0 z-0 pointer-events-none backdrop-blur-3xl"
                style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 100%)'
                }}
            />

            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-acm-teal/10 blur-[120px] rounded-full pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-acm-purple/10 blur-[120px] rounded-full pointer-events-none z-0" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-[2] pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-24 pointer-events-auto"
                >
                    <h2 className="text-sm font-mono text-acm-teal tracking-widest mb-4">WHO WE ARE</h2>
                    <h3 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6">
                        Innovating for the Future
                    </h3>
                    <p className="max-w-2xl mx-auto text-gray-400 text-lg leading-relaxed">
                        ACM MIT Bengaluru is a student chapter dedicated to fostering a community of developers, researchers, and tech enthusiasts. We bridge the gap between academic learning and industry standards.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pointer-events-auto">
                    <Card
                        icon={Users}
                        title="Community First"
                        description="Building a strong network of like-minded individuals passionate about technology and innovation."
                        delay={0}
                    />
                    <Card
                        icon={Lightbulb}
                        title="Learn & Grow"
                        description="Providing resources, workshops, and mentorship to help students master the latest technologies."
                        delay={0.2}
                    />
                    <Card
                        icon={Target}
                        title="Industry Ready"
                        description="Organizing hackathons and projects that mimic real-world challenges to prepare you for your career."
                        delay={0.4}
                    />
                </div>
            </div>
        </section>
    );
};

export default About;
