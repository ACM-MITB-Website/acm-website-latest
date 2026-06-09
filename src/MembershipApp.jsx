import React, { useEffect, useRef, useState } from 'react';
import Navbar from './components/NavbarOptimized';
import Footer from './components/Footer';
import ProfileCompletion from './components/ProfileCompletion';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import step1 from './assets/step1-join.png';
import step2 from './assets/step2-india.png';
import step3 from './assets/step3-details.png';
import step4 from './assets/step4-resources.png';
import step5 from './assets/step5-payment.png';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MembershipApp = () => {
    const stepsRef = useRef([]);
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

    useEffect(() => {
        stepsRef.current.forEach((el) => {
            gsap.fromTo(el,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 80%",
                    }
                }
            );
        });
    }, []);

    const steps = [
        {
            title: "Step 1: Visit ACM & Join",
            description: "Visit https://www.acm.org/ and click on the 'Join' button in the top right corner.",
            image: step1
        },
        {
            title: "Step 2: Select Country & Type",
            description: "If you're from India, specifically select 'India' under the Students section to avail special regional pricing.",
            image: step2
        },
        {
            title: "Step 3: Fill Your Details",
            description: "Fill in your personal and academic details accurately, scroll down to review, and click Continue.",
            image: step3
        },
        {
            title: "Step 4: Additional Resources",
            description: "You can select additional resources like the ACM Books Series, Special Interest Groups (SIGs), and Magazines if interested.",
            image: step4
        },
        {
            title: "Step 5: Complete Payment",
            description: "Choose your state, click 'Complete using Indian CC', make the payment securely. Don't forget to take a screenshot of the confirmation!",
            image: step5
        }
    ];

    return (
        <div className="bg-black min-h-screen text-white font-sans selection:bg-acm-teal selection:text-black">
            {showProfileForm && user && (
                <ProfileCompletion user={user} onComplete={() => setShowProfileForm(false)} />
            )}
            <Navbar />

            <div className="pt-32 pb-20 px-4 max-w-5xl mx-auto">
                <div className="text-center mb-20 space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-acm-teal to-blue-500">
                        BECOME A MEMBER
                    </h1>
                    <p className="text-xl text-gray-400 font-light">
                        Follow these simple steps to join the world's largest computing society.
                    </p>
                </div>

                <div className="space-y-32">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            ref={el => stepsRef.current[index] = el}
                            className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
                        >
                            {/* Text Content */}
                            <div className="flex-1 space-y-6">
                                <div className="inline-block bg-acm-teal/10 text-acm-teal font-bold px-4 py-2 rounded-full border border-acm-teal/20">
                                    STEP {index + 1}
                                </div>
                                <h2 className="text-4xl font-bold">{step.title}</h2>
                                <p className="text-xl text-gray-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* visual Content */}
                            <div className="flex-1 relative group w-full">
                                <div className="absolute -inset-1 bg-gradient-to-r from-acm-teal to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-700"></div>
                                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl">
                                    <img
                                        src={step.image}
                                        alt={step.title}
                                        className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition duration-500"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-32 text-center space-y-8 animate-fade-in-up">
                    <p className="text-3xl font-bold text-white">
                        Welcome to ACM! Happy Learning!
                    </p>
                    <a
                        href="https://www.acm.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-acm-teal text-black font-bold text-xl px-10 py-4 rounded-full hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                    >
                        Start Registration
                    </a>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default MembershipApp;
