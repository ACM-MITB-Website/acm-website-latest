import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/NavbarOptimized';
import Footer from './components/Footer';
import { ArrowRight, Calendar, Tag, User } from 'lucide-react';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ProfileCompletion from './components/ProfileCompletion';

gsap.registerPlugin(ScrollTrigger);

const NewsHero = () => {
    const titleRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(titleRef.current,
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: 'power4.out', delay: 0.2 }
        );
    }, []);

    return (
        <section className="relative h-[50vh] w-full overflow-hidden flex items-center justify-center pt-20">
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 8] }}>
                    <ambientLight intensity={0.2} />
                    <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" />
                    <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
                    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                        <Sphere args={[2, 64, 64]}>
                            <MeshDistortMaterial
                                color="#8b5cf6"
                                emissive="#8b5cf6"
                                emissiveIntensity={0.2}
                                roughness={0.2}
                                metalness={0.8}
                                distort={0.4}
                                speed={2}
                            />
                        </Sphere>
                    </Float>
                </Canvas>
            </div>
            <div className="relative z-10 text-center px-4">
                <h1 ref={titleRef} className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4">
                    NEWS <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">ROOM</span>
                </h1>
                <p className="text-xl md:text-2xl text-violet-300 font-mono tracking-widest">
                    LATEST UPDATES & INSIGHTS
                </p>
            </div>
        </section>
    );
};

const FeaturedPost = () => {
    return (
        <section className="py-10 px-4 md:px-20 max-w-7xl mx-auto">
            <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    <div className="h-64 lg:h-auto overflow-hidden relative">
                        <img
                            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2032&auto=format&fit=crop"
                            alt="Featured"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-violet-900/20 group-hover:bg-transparent transition-colors duration-500"></div>
                    </div>
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="flex items-center space-x-4 text-sm text-violet-400 font-mono mb-4">
                            <span className="flex items-center"><Calendar size={14} className="mr-1" /> Dec 10, 2025</span>
                            <span className="flex items-center"><Tag size={14} className="mr-1" /> Tech Policy</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight group-hover:text-violet-400 transition-colors">
                            The New Systemic Risks of Agentic AI
                        </h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            The Association for Computing Machinery (ACM) weighs in on the emerging challenges of autonomous AI agents. As these systems become more capable, understanding their potential impact on security, privacy, and control becomes paramount.
                        </p>
                        <a
                            href="https://diginomica.com/what-are-new-systemic-risks-agentic-ai-association-computing-machinery-weighs?amp"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-white font-bold tracking-wide group/btn w-max"
                        >
                            <span>READ ARTICLE</span>
                            <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

const realNewsData = [
    {
        id: 1,
        title: "Congress Must Preserve State Authority in AI Governance",
        excerpt: "As Congress considers AI legislation, ACM argues for preserving state authority to foster innovation and ensure local needs are met in the rapidly evolving landscape of artificial intelligence.",
        date: "Dec 02, 2025",
        author: "StateScoop",
        category: "Policy",
        image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2070&auto=format&fit=crop",
        link: "https://statescoop.com/congress-must-preserve-state-authority-in-ai-governance/"
    },
    {
        id: 2,
        title: "Future Cybersecurity Incidents a Certainty, Asserts Expert",
        excerpt: "'We must assume that future cybersecurity incidents are a certainty, not a possibility,' says ACM expert, emphasizing the critical need for digital resilience strategies.",
        date: "Aug 21, 2024",
        author: "TechXplore",
        category: "Security",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
        link: "https://techxplore.com/news/2024-08-future-cybersecurity-incidents-certainty-asserts.html#google_vignette"
    },
    {
        id: 3,
        title: "How Supercomputing Simulations Help Device Developers",
        excerpt: "Duke's Amanda Randles leverages high-performance computing to create 'digital twins' of the human circulatory system, revolutionizing biomedical device testing and development.",
        date: "May 29, 2024",
        author: "Medical Design",
        category: "Biotech",
        image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2080&auto=format&fit=crop",
        link: "https://www.medicaldesignandoutsourcing.com/duke-amanda-randles-supercomputing-simulations-device-developers/"
    },
    {
        id: 4,
        title: "Pioneers in Artificial Intelligence Win Nobel Prize in Physics",
        excerpt: "Celebrating the foundational work in machine learning that paved the way for the AI revolution, recognized by the Nobel Committee.",
        date: "Oct 08, 2024",
        author: "AP News",
        category: "AI Research",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2065&auto=format&fit=crop",
        link: "https://apnews.com/article/nobel-prize-physics-fc0567de3f2ca45f81a7359a017cd542"
    },
    {
        id: 5,
        title: "US AI Action Plan: Environmental Consequences",
        excerpt: "ACM warns of the local and environmental impacts of the US AI Action Plan, emphasizing the need for sustainable computing practices.",
        date: "Aug 29, 2025",
        author: "Diginomica",
        category: "Sustainability",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2113&auto=format&fit=crop",
        link: "https://diginomica.com/us-ai-action-plan-part-one-beware-its-local-and-environmental-consequences-warns-amc"
    },
    {
        id: 6,
        title: "Beyond the Nobel Prizes Is a World of Scientific Awards",
        excerpt: "A deep dive into the broader landscape of prestigious scientific awards, including the ACM Turing Award, that often predict Nobel glory and honor specialized fields.",
        date: "Oct 05, 2025",
        author: "NY Times",
        category: "Science",
        image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop",
        link: "https://www.nytimes.com/2025/10/05/science/awards-prizes-non-nobels.html?unlocked_article_code=1.rU8.FjDt.HgqcTrZeExrQ&smid=nytcore-ios-share&referringSource=articleShare"
    }
];

const NewsGrid = ({ posts }) => {
    useEffect(() => {
        const cards = document.querySelectorAll('.news-card');

        gsap.fromTo(cards,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: ".news-grid",
                    start: "top 80%",
                }
            }
        );
    }, [posts]);

    return (
        <section className="py-10 px-4 md:px-20 max-w-7xl mx-auto mb-20">
            <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-bold text-white flex items-center">
                    <span className="w-2 h-8 bg-violet-500 mr-4 rounded-full"></span>
                    TOP STORIES
                </h2>
                <a
                    href="https://www.acm.org/media-center/acm-in-the-news"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-white transition-colors text-sm font-mono"
                >
                    VIEW ALL ARCHIVES
                </a>
            </div>

            <div className="news-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                    <article key={post.id} className="news-card group bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-2 flex flex-col h-full">
                        <div className="h-48 overflow-hidden relative shrink-0">
                            <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                <span className="text-xs font-mono text-violet-300">{post.category}</span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col grow">
                            <div className="flex items-center text-xs text-gray-500 mb-3 space-x-4">
                                <span className="flex items-center"><Calendar size={12} className="mr-1" /> {post.date}</span>
                                <span className="flex items-center"><User size={12} className="mr-1" /> {post.author}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-400 transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-3 grow">
                                {post.excerpt}
                            </p>
                            <a
                                href={post.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-violet-400 text-sm font-bold hover:text-white transition-colors mt-auto"
                            >
                                READ MORE <ArrowRight size={14} className="ml-1" />
                            </a>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

const NewsApp = () => {
    const newsRef = useRef(null);
    // Use static real data directly to avoid HMR state persistence issues
    const [user, setUser] = useState(null);
    const [showProfileForm, setShowProfileForm] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                setShowProfileForm(!userDoc.exists());
            } else {
                setShowProfileForm(false);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-black min-h-screen text-white selection:bg-violet-500 selection:text-white">
            {showProfileForm && user && (
                <ProfileCompletion user={user} onComplete={() => setShowProfileForm(false)} />
            )}
            <Navbar />
            <NewsHero />
            <div ref={newsRef}>
                <FeaturedPost />
            </div>
            <NewsGrid posts={realNewsData} />
            <Footer />
        </div>
    );
};

export default NewsApp;
