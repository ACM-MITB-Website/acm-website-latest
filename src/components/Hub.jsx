import React from 'react';
import { Link } from 'react-router-dom';

const chapters = [
    {
        id: 'acm-mitb',
        name: 'ACM MITB',
        role: 'Student Chapter',
        link: '/acm-mitb',
        image: '/assets/team-1.png',
        logo: '/assets/acm-mitb-logo.png',
        gradient: 'from-blue-600 to-cyan-500',
    },
    {
        id: 'acm-w',
        name: 'ACM-W',
        role: 'Women in Computing',
        link: '/acm-w',
        image: '/assets/team-2.png',
        logo: '/assets/acm-w-logo.png',
        gradient: 'from-pink-500 to-rose-500',
    },
    {
        id: 'sigsoft',
        name: 'SIGSOFT',
        role: 'Special Interest Group',
        link: '/sigsoft',
        image: '/assets/team-3.png',
        logo: '/assets/sigsoft-logo.png',
        gradient: 'from-purple-600 to-indigo-500',
        position: 'object-[50%_25%]',
    },
    {
        id: 'sigai',
        name: 'SIG AI',
        role: 'Special Interest Group',
        link: '/sigai',
        image: '/assets/team-4.png',
        logo: '/assets/sigai-logo.png',
        gradient: 'from-emerald-500 to-teal-500',
    },
];

const ChapterCard = ({ chapter }) => {
    return (
        <Link
            to={chapter.link}
            className="group relative block w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-white/5 transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/5"
        >
            {/* Background Image - Full Visibility */}
            <div className="absolute inset-0">
                <img
                    src={chapter.image}
                    alt={chapter.name}
                    className={`w-full h-full object-cover transition-all duration-500 group-hover:blur-sm group-hover:scale-105 group-hover:brightness-50 ${chapter.position || 'object-center'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />
            </div>

            {/* Default State: Bottom Text */}
            <div className="absolute bottom-0 left-0 w-full p-6 transform transition-transform duration-300 group-hover:translate-y-2 group-hover:opacity-0">
                <p className="text-xs font-mono text-acm-teal tracking-widest uppercase mb-1">{chapter.role}</p>
                <h3 className="text-2xl md:text-3xl font-bold text-white">{chapter.name}</h3>
            </div>

            {/* Hover State: Logo and Button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-4">
                <img
                    src={chapter.logo}
                    alt={`${chapter.name} Logo`}
                    className="w-24 h-24 md:w-32 md:h-32 object-contain mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transform scale-90 transition-transform duration-300 group-hover:scale-100"
                />
                <div className={`px-6 py-2 rounded-full bg-gradient-to-r ${chapter.gradient} text-white font-bold text-sm tracking-wide shadow-lg transform translate-y-4 transition-transform duration-300 group-hover:translate-y-0`}>
                    EXPLORE
                </div>
            </div>

            {/* Border highlight on hover */}
            <div className={`absolute inset-0 border-2 border-transparent transition-colors duration-300 rounded-2xl group-hover:border-white/20`} />
        </Link>
    );
};

const Hub = () => {
    return (
        <section className="py-24 relative z-10 min-h-screen flex flex-col justify-center bg-transparent">
            {/* Background Mesh/Glow for section context */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-900/10 rounded-full blur-[120px] -z-20 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="text-left mb-12">
                    <h2 className="text-sm font-mono text-acm-teal tracking-widest mb-2">EXPLORE DOMAINS</h2>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">
                        OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">UNIVERSE</span>
                    </h1>
                </div>

                {/* Performance Grid - No WebGL, simple CSS grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {chapters.map((chapter) => (
                        <ChapterCard key={chapter.id} chapter={chapter} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hub;
