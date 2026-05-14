import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Zap, ChevronDown, Menu, X, Check, ChevronRight,
  Brain, Map, TrendingUp, Shield, Bot, Target,
  GraduationCap, Building2, BarChart3, Users,
  ArrowRight, Sparkles, Star, Play, Award, Clock,
  Code, Activity, TrendingDown, ZapOff,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES - Enhanced & Production Ready
═══════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  
  *, *::before, *::after { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
  }
  
  html { 
    scroll-behavior: smooth;
    font-size: 16px;
  }
  
  body { 
    background: #0a0a0f; 
    color: #f1f5f9; 
    font-family: 'Inter', sans-serif; 
    overflow-x: hidden;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Enhanced Animations */
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-20px) rotate(1deg); }
    75% { transform: translateY(10px) rotate(-1deg); }
  }

  @keyframes pulse-ring {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 30px rgba(99, 102, 241, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
  }

  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes fadeInUp {
    from { 
      opacity: 0; 
      transform: translateY(40px);
    }
    to { 
      opacity: 1; 
      transform: translateY(0);
    }
  }

  @keyframes fadeInDown {
    from { 
      opacity: 0; 
      transform: translateY(-20px);
    }
    to { 
      opacity: 1; 
      transform: translateY(0);
    }
  }

  @keyframes fadeInLeft {
    from { 
      opacity: 0; 
      transform: translateX(-30px);
    }
    to { 
      opacity: 1; 
      transform: translateX(0);
    }
  }

  @keyframes fadeInRight {
    from { 
      opacity: 0; 
      transform: translateX(30px);
    }
    to { 
      opacity: 1; 
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from { 
      opacity: 0; 
      transform: scale(0.8);
    }
    to { 
      opacity: 1; 
      transform: scale(1);
    }
  }

  @keyframes borderGlow {
    0%, 100% { 
      border-color: rgba(99, 102, 241, 0.3);
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.1), inset 0 0 20px rgba(99, 102, 241, 0.05);
    }
    50% { 
      border-color: rgba(99, 102, 241, 0.6);
      box-shadow: 0 0 40px rgba(99, 102, 241, 0.2), inset 0 0 40px rgba(99, 102, 241, 0.1);
    }
  }

  @keyframes numberScroll {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes typewriter {
    from { width: 0; }
    to { width: 100%; }
  }

  @keyframes blink {
    0%, 100% { border-color: transparent; }
    50% { border-color: #6366f1; }
  }

  /* Enhanced Hover Effects */
  .lp-nav-btn:hover { 
    color: #f1f5f9 !important; 
    background: rgba(99, 102, 241, 0.15) !important;
    transform: translateY(-1px);
  }
  
  .lp-btn-p { 
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .lp-btn-p:hover { 
    transform: translateY(-3px) scale(1.02) !important; 
    box-shadow: 0 0 80px rgba(99, 102, 241, 0.6), 0 12px 40px rgba(0, 0, 0, 0.5) !important;
  }
  
  .lp-btn-p:active {
    transform: translateY(-1px) scale(0.98) !important;
  }
  
  .lp-btn-o:hover { 
    background: rgba(99, 102, 241, 0.15) !important; 
    border-color: rgba(99, 102, 241, 0.8) !important;
    transform: translateY(-2px);
  }
  
  .lp-card { 
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .lp-card:hover { 
    transform: translateY(-8px) scale(1.02) !important; 
    border-color: rgba(99, 102, 241, 0.6) !important; 
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6) !important;
  }
  
  .lp-pricing { 
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .lp-pricing:hover { 
    transform: translateY(-6px) scale(1.02) !important; 
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.6) !important;
  }
  
  .lp-pricing-highlight:hover {
    transform: translateY(-6px) scale(1.05) !important;
  }
  
  .lp-faq-btn:hover { 
    color: #a78bfa !important; 
    padding-left: 8px;
  }
  
  .lp-foot-link:hover { 
    color: #f1f5f9 !important; 
    transform: translateX(3px);
  }

  /* Glass Morphism Effects */
  .glass-effect {
    background: rgba(17, 17, 32, 0.6);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(99, 102, 241, 0.1);
  }

  .glass-card {
    background: rgba(17, 17, 32, 0.8);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(30, 30, 53, 0.8);
  }

  /* Gradient Text Effects */
  .gradient-text {
    background: linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #38bdf8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
  }

  .gradient-text-warm {
    background: linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #0a0a0f;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #6366f1, #a78bfa);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #7c3aed, #6366f1);
  }

  /* Selection Styling */
  ::selection {
    background: rgba(99, 102, 241, 0.3);
    color: #f1f5f9;
  }

  /* Responsive Typography */
  @media (max-width: 1200px) {
    html { font-size: 15px; }
  }

  @media (max-width: 768px) {
    html { font-size: 14px; }
    .lp-desktop-nav { display: none !important; }
    .lp-hamburger { display: flex !important; }
    .lp-steps { flex-direction: column !important; gap: 1.5rem !important; }
    .lp-grid-3 { grid-template-columns: 1fr !important; }
    .lp-grid-2 { grid-template-columns: 1fr !important; }
    .lp-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
    .lp-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 1.5rem !important; }
    .lp-footer-row { flex-direction: column !important; align-items: center !important; text-align: center !important; }
    .lp-footer-links { justify-content: center !important; }
    .lp-pricing-highlight { transform: scale(1) !important; }
    .lp-hero-title { font-size: clamp(2.5rem, 8vw, 5rem) !important; }
  }

  @media (max-width: 480px) {
    .lp-stats-grid { grid-template-columns: 1fr !important; }
    .lp-hero-cta { flex-direction: column !important; }
    .lp-hero-badge { font-size: 0.7rem !important; }
  }
`;

/* ═══════════════════════════════════════════════════════════
   ENHANCED COUNT-UP HOOK
═══════════════════════════════════════════════════════════ */
function useCountUp(target, duration = 2000, delay = 0) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    let animationFrame;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, target, duration]);

  return { ref, count };
}

/* ═══════════════════════════════════════════════════════════
   ENHANCED SUB-COMPONENTS
═══════════════════════════════════════════════════════════ */
function StatCard({ value, suffix, label, icon, delay = 0 }) {
  const { ref, count } = useCountUp(value, 2500, delay);
  
  return (
    <div ref={ref} style={{
      textAlign: "center",
      padding: "2rem",
      background: "rgba(17, 17, 32, 0.6)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(99, 102, 241, 0.15)",
      borderRadius: "20px",
      transition: "all 0.3s ease",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-5px)";
      e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.3)";
      e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.15)";
    }}
    >
      {icon && (
        <div style={{ marginBottom: "1rem", color: "#6366f1" }}>
          {icon}
        </div>
      )}
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "clamp(2rem, 4vw, 3.2rem)",
        fontWeight: 800,
        letterSpacing: "-0.03em",
        lineHeight: 1,
        background: "linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #38bdf8 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        backgroundSize: "200% 200%",
        animation: "gradientShift 4s ease infinite",
        marginBottom: "0.5rem",
      }}>
        {count.toLocaleString()}{suffix || ""}
      </div>
      <div style={{
        fontSize: "0.85rem",
        color: "#94a3b8",
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}>
        {label}
      </div>
    </div>
  );
}

function FaqItem({ q, a, delay = 0 }) {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} style={{
      borderBottom: "1px solid rgba(30, 30, 53, 0.7)",
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    }}>
      <button
        className="lp-faq-btn"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          color: "#f1f5f9",
          fontSize: "1rem",
          fontWeight: 600,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.5rem 0",
          textAlign: "left",
          gap: "1rem",
          transition: "all 0.3s ease",
        }}
      >
        <span>{q}</span>
        <ChevronDown
          size={20}
          style={{
            flexShrink: 0,
            color: "#6366f1",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <div style={{
        overflow: "hidden",
        maxHeight: open ? "500px" : "0px",
        transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
        opacity: open ? 1 : 0,
      }}>
        <p style={{
          fontSize: "0.9rem",
          color: "#94a3b8",
          lineHeight: 1.8,
          paddingBottom: "1.5rem",
          fontFamily: "'Inter', sans-serif",
        }}>
          {a}
        </p>
      </div>
    </div>
  );
}

function CheckRow({ text, color = "#22c55e" }) {
  const bg = color === "#6366f1" ? "rgba(99, 102, 241, 0.1)" : "rgba(34, 197, 94, 0.1)";
  const border = color === "#6366f1" ? "rgba(99, 102, 241, 0.3)" : "rgba(34, 197, 94, 0.3)";

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "0.75rem",
      marginBottom: "0.9rem",
      animation: "fadeInUp 0.5s ease both",
    }}>
      <div style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        flexShrink: 0,
        marginTop: 1,
        background: bg,
        border: `1.5px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Check size={14} color={color} strokeWidth={3} />
      </div>
      <span style={{
        fontSize: "0.92rem",
        color: "#94a3b8",
        lineHeight: 1.6,
        fontFamily: "'Inter', sans-serif",
      }}>
        {text}
      </span>
    </div>
  );
}

function SectionTag({ text, icon }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "0.75rem",
      fontWeight: 700,
      color: "#6366f1",
      textTransform: "uppercase",
      letterSpacing: "0.15em",
      background: "rgba(99, 102, 241, 0.08)",
      border: "1px solid rgba(99, 102, 241, 0.2)",
      borderRadius: "100px",
      padding: "0.35rem 1rem",
      marginBottom: "1rem",
      animation: "fadeInUp 0.6s ease both",
    }}>
      {icon && <span style={{ fontSize: "1rem" }}>{icon}</span>}
      {text}
    </div>
  );
}

function SectionHeading({ children, delay = 0 }) {
  return (
    <h2 style={{
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
      fontWeight: 800,
      letterSpacing: "-0.03em",
      color: "#f1f5f9",
      marginBottom: "1rem",
      animation: `fadeInUp 0.6s ${delay}s ease both`,
    }}>
      {children}
    </h2>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroAnimationComplete, setHeroAnimationComplete] = useState(false);
  const loginRef = useRef(null);

  // Inject enhanced CSS
  useEffect(() => {
    const el = document.createElement("style");
    el.setAttribute("data-lp-enhanced", "1");
    el.textContent = GLOBAL_CSS;
    if (!document.querySelector("[data-lp-enhanced]")) {
      document.head.appendChild(el);
    }
    return () => {
      const s = document.querySelector("[data-lp-enhanced]");
      if (s) s.remove();
    };
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close login dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) {
        setLoginOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Trigger hero animation
  useEffect(() => {
    const timer = setTimeout(() => setHeroAnimationComplete(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  /* ── Enhanced Shared Styles ── */
  const cardBase = {
    background: "rgba(17, 17, 32, 0.8)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(30, 30, 53, 0.8)",
    borderRadius: "24px",
    padding: "2rem",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const buttonPrimary = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.6rem",
    background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "1rem 2.2rem",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: "-0.01em",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 0 40px rgba(99, 102, 241, 0.4), 0 4px 20px rgba(0, 0, 0, 0.3)",
    whiteSpace: "nowrap",
    position: "relative",
    overflow: "hidden",
  };

  const buttonOutline = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.6rem",
    background: "transparent",
    color: "#f1f5f9",
    border: "2px solid rgba(99, 102, 241, 0.4)",
    borderRadius: "14px",
    padding: "1rem 2.2rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: "-0.01em",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    whiteSpace: "nowrap",
  };

  const navButtonStyle = {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    padding: "0.6rem 1rem",
    borderRadius: "10px",
    transition: "all 0.3s ease",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
  };

  /* ── Enhanced Data ── */
  const features = [
    { 
      icon: <Brain size={28} />, 
      emoji: "🔀",
      title: "Real-Time AI Questions", 
      desc: "Diagnostic questions generated by AI live. Every student gets unique questions. Questions are deleted immediately after the session ends — impossible to share.",
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)"
    },
    { 
      icon: <Shield size={28} />, 
      emoji: "🛡️",
      title: "7-Layer Anti-Malpractice", 
      desc: "Options shuffled per student. Behavioral tracking detects cheating patterns. Even students sitting side-by-side receive completely different exam papers.",
      gradient: "linear-gradient(135deg, #3b82f6, #6366f1)"
    },
    { 
      icon: <Target size={28} />, 
      emoji: "🤖",
      title: "ML Placement Prediction", 
      desc: "Ensemble model: Random Forest + Gradient Boost + Logistic Regression. 13 behavioral features analyzed in real-time. Predict readiness before placement drives begin.",
      gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)"
    },
    { 
      icon: <Map size={28} />, 
      emoji: "📍",
      title: "Weak Area Detection", 
      desc: "Identifies conceptual vs application gaps with precision. Targeted revision instead of random practice. Priority-ranked action plan auto-generated for each student.",
      gradient: "linear-gradient(135deg, #f59e0b, #ef4444)"
    },
    { 
      icon: <GraduationCap size={28} />, 
      emoji: "🎓",
      title: "Behavior-Enforced Learning", 
      desc: "Cannot skip videos. Cannot skip practice sessions. Gates unlock only after task completion is verified. Real learning, not passive watching or button-clicking.",
      gradient: "linear-gradient(135deg, #10b981, #059669)"
    },
    { 
      icon: <Building2 size={28} />, 
      emoji: "🏢",
      title: "Institution Analytics", 
      desc: "Department-wise progress tracking and detailed reporting. At-risk student early warning system with email alerts. Placement prediction timelines by batch.",
      gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)"
    },
  ];

  const steps = [
    {
      icon: <Brain size={28} color="#6366f1" />,
      num: "01",
      title: "AI Diagnoses You",
      desc: "20 unique questions generated live by AI. Never stored. Unique every time. Results in 10 minutes.",
      color: "#6366f1",
      bg: "rgba(99, 102, 241, 0.1)",
      border: "rgba(99, 102, 241, 0.25)",
    },
    {
      icon: <Map size={28} color="#a78bfa" />,
      num: "02",
      title: "Follow Your Roadmap",
      desc: "Get a personalized 90/60/30 day plan. Video → Practice → Code. In order. No skipping allowed.",
      color: "#a78bfa",
      bg: "rgba(167, 139, 250, 0.1)",
      border: "rgba(167, 139, 250, 0.25)",
    },
    {
      icon: <TrendingUp size={28} color="#38bdf8" />,
      num: "03",
      title: "Track & Get Placed",
      desc: "ML tracks 13 behavioral signals. Know your placement probability. Get alerted on weak areas automatically.",
      color: "#38bdf8",
      bg: "rgba(56, 189, 248, 0.1)",
      border: "rgba(56, 189, 248, 0.25)",
    },
  ];

  const instFeatures = [
    { 
      icon: <BarChart3 size={24} color="#6366f1" />, 
      title: "Department Analytics", 
      desc: "Track CSE, IT, ECE separately. See exactly which department needs attention before it's too late.",
    },
    { 
      icon: <Users size={24} color="#a78bfa" />, 
      title: "Bulk Student Management", 
      desc: "Add 100 students in one CSV upload. Auto-generate secure credentials and send onboarding instantly.",
    },
    { 
      icon: <Target size={24} color="#38bdf8" />, 
      title: "Placement Predictions", 
      desc: "Know who will be ready and when. Plan your placement drives with data, not intuition.",
    },
  ];

  const instPlans = [
    {
      name: "Basic",
      price: "₹5,000",
      period: "/month",
      students: "Up to 100 students",
      features: [
        "All 11 DSA modules",
        "Basic analytics dashboard",
        "Bulk student upload",
        "Email support",
        "Monthly report export",
      ],
      cta: "Get Started",
      highlight: false,
    },
    {
      name: "Pro",
      price: "₹15,000",
      period: "/month",
      students: "Up to 500 students",
      features: [
        "Everything in Basic",
        "ML placement predictions",
        "At-risk early warnings",
        "Malpractice reports",
        "Priority support + API",
      ],
      cta: "Get Pro",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      students: "Unlimited students",
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "On-site training sessions",
      ],
      cta: "Contact Us",
      highlight: false,
    },
  ];

  const faqs = [
    { 
      q: "Is the diagnostic test really unique each time?", 
      a: "Yes. Questions are generated live by Gemini AI during your session. They are never stored in any database. It is mathematically impossible to share answers because no two sessions produce the same questions — even for the same topic." 
    },
    { 
      q: "How does anti-malpractice work?", 
      a: "Our 7-layer system includes: unique question selection per student, option shuffling, timing analysis to detect abnormal speeds, browser tab-switch detection, copy-paste detection, behavioral biometrics, and proximity-based exam differentiation so nearby students always get different papers." 
    },
    { 
      q: "What language is used for coding?", 
      a: "Java only. All examples, problems, execution environments, and AI explanations are Java-specific. This gives students deep mastery instead of shallow breadth across multiple languages — far more valuable for DSA interviews." 
    },
    { 
      q: "How does ML predict placement readiness?", 
      a: "Our ensemble model analyzes 13 behavioral signals including accuracy rate, attempt speed, hint usage frequency, session consistency, error pattern recognition, revision behavior, streak data, and more. The model is periodically retrained on real placement outcomes." 
    },
    { 
      q: "Can institutions see individual student data?", 
      a: "Yes. Institutions get full per-student and per-department analytics including at-risk alerts, malpractice reports, weak area breakdowns, and placement readiness timelines. All data is role-gated and privacy-compliant." 
    },
  ];

  /* ══════════════════════════════════════════════════════
     ENHANCED RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#0a0a0f", 
      fontFamily: "'Inter', sans-serif",
      position: "relative",
    }}>

      {/* ── ENHANCED NAVBAR ── */}
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? "rgba(10, 10, 15, 0.98)" : "rgba(10, 10, 15, 0.8)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        borderBottom: scrolled ? "1px solid rgba(99, 102, 241, 0.2)" : "1px solid transparent",
        boxShadow: scrolled ? "0 8px 32px rgba(0, 0, 0, 0.4)" : "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        height: "72px",
        padding: "0 2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            background: "linear-gradient(135deg, #6366f1, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "1.3rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <Zap size={24} style={{ color: "#6366f1", flexShrink: 0 }} />
          DSA Master
        </button>

        {/* Desktop Navigation */}
        <div className="lp-desktop-nav" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button className="lp-nav-btn" style={navButtonStyle} onClick={() => scrollTo("students")}>
            For Students
          </button>
          <button className="lp-nav-btn" style={navButtonStyle} onClick={() => scrollTo("institutions")}>
            For Institutions
          </button>

          {/* Enhanced Login Dropdown */}
          <div ref={loginRef} style={{ position: "relative", marginLeft: "1rem" }}>
            <button
              className="lp-nav-btn"
              onClick={() => setLoginOpen(!loginOpen)}
              style={{
                ...navButtonStyle,
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "#f1f5f9",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.2rem",
              }}
            >
              Login
              <ChevronDown 
                size={16} 
                style={{ 
                  transition: "transform 0.3s ease", 
                  transform: loginOpen ? "rotate(180deg)" : "none" 
                }} 
              />
            </button>
            
            {loginOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 12px)",
                right: 0,
                minWidth: "220px",
                background: "rgba(17, 17, 32, 0.98)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
                animation: "fadeInDown 0.3s ease both",
              }}>
                {[
                  { label: "Student Login", icon: <GraduationCap size={16} />, path: "/login" },
                  { label: "Institution Login", icon: <Building2 size={16} />, path: "/institution/login" },
                ].map(({ label, icon, path }, i) => (
                  <React.Fragment key={label}>
                    {i > 0 && <div style={{ borderTop: "1px solid rgba(30, 30, 53, 0.5)" }} />}
                    <button
                      className="lp-nav-btn"
                      onClick={() => { navigate(path); setLoginOpen(false); }}
                      style={{
                        ...navButtonStyle,
                        width: "100%",
                        borderRadius: 0,
                        textAlign: "left",
                        padding: "1rem 1.5rem",
                        color: "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        fontWeight: 500,
                      }}
                    >
                      <span style={{ color: "#6366f1" }}>{icon}</span>
                      {label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <button 
            className="lp-btn-p" 
            style={{ ...buttonPrimary, marginLeft: "1rem", padding: "0.7rem 1.8rem" }}
            onClick={() => navigate("/register")}
          >
            Start Free <ArrowRight size={16} />
          </button>
        </div>

        {/* Hamburger Menu Button */}
        <button
          className="lp-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "#f1f5f9",
            cursor: "pointer",
            padding: "8px",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Enhanced Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: "fixed",
          top: "72px",
          left: 0,
          right: 0,
          zIndex: 999,
          background: "rgba(10, 10, 15, 0.99)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          borderBottom: "1px solid rgba(30, 30, 53, 0.8)",
          padding: "1.5rem",
          animation: "fadeInDown 0.3s ease both",
        }}>
          {[
            { label: "For Students", fn: () => scrollTo("students") },
            { label: "For Institutions", fn: () => scrollTo("institutions") },
            { label: "Student Login", fn: () => { navigate("/login"); setMenuOpen(false); } },
            { label: "Institution Login", fn: () => { navigate("/institution/login"); setMenuOpen(false); } },
          ].map(({ label, fn }) => (
            <button 
              key={label} 
              onClick={fn} 
              style={{
                display: "block",
                width: "100%",
                background: "none",
                border: "none",
                color: "#94a3b8",
                fontSize: "1rem",
                fontWeight: 500,
                cursor: "pointer",
                padding: "1rem 1rem",
                textAlign: "left",
                borderBottom: "1px solid rgba(30, 30, 53, 0.5)",
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#f1f5f9";
                e.currentTarget.style.paddingLeft = "1.5rem";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#94a3b8";
                e.currentTarget.style.paddingLeft = "1rem";
              }}
            >
              {label}
            </button>
          ))}
          <button 
            className="lp-btn-p" 
            style={{ ...buttonPrimary, width: "100%", marginTop: "1.5rem" }} 
            onClick={() => { navigate("/register"); setMenuOpen(false); }}
          >
            Start Free <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── ENHANCED HERO SECTION ── */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "8rem 2rem 6rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Enhanced Background Effects */}
        <div style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse 100% 70% at 50% -10%, rgba(99, 102, 241, 0.25) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 85% 80%, rgba(167, 139, 250, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 15% 80%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)
          `,
          animation: "float 8s ease-in-out infinite alternate",
        }} />
        
        {/* Enhanced Dot Grid */}
        <div style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 80% 80% at center, black 30%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at center, black 30%, transparent 70%)",
        }} />

        <div style={{ 
          position: "relative", 
          zIndex: 1, 
          maxWidth: "900px", 
          width: "100%", 
          margin: "0 auto",
          opacity: heroAnimationComplete ? 1 : 0,
          transform: heroAnimationComplete ? "translateY(0)" : "translateY(20px)",
          transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
        }}>
          {/* Enhanced Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.4)",
            borderRadius: "100px",
            padding: "0.5rem 1.3rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#a78bfa",
            letterSpacing: "0.05em",
            marginBottom: "2.5rem",
            animation: "fadeInUp 0.8s ease both",
            boxShadow: "0 0 30px rgba(99, 102, 241, 0.2)",
          }}>
            <Sparkles size={16} color="#6366f1" />
            AI-Powered &nbsp;•&nbsp; Java Only &nbsp;•&nbsp; Anti-Cheat System
          </div>

          {/* Enhanced H1 */}
          <h1 className="lp-hero-title" style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(3.5rem, 8vw, 7rem)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: "#f1f5f9",
            marginBottom: "2rem",
            animation: "fadeInUp 0.8s 0.2s ease both",
          }}>
            Master DSA in{" "}
            <span className="gradient-text" style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #6366f1 0%, #a78bfa 40%, #38bdf8 70%, #6366f1 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradientShift 4s ease infinite",
            }}>
              90 Days.
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p style={{
            fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
            color: "#94a3b8",
            maxWidth: "600px",
            margin: "0 auto 3rem",
            lineHeight: 1.9,
            animation: "fadeInUp 0.8s 0.4s ease both",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
          }}>
            The only platform that forces consistent practice, detects your weak areas 
            with ML, and predicts your placement readiness.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="lp-hero-cta" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
            marginBottom: "5rem",
            animation: "fadeInUp 0.8s 0.6s ease both",
          }}>
            <button 
              className="lp-btn-p" 
              style={{ ...buttonPrimary, padding: "1.1rem 2.8rem", fontSize: "1.1rem" }} 
              onClick={() => navigate("/register")}
            >
              <Play size={18} fill="currentColor" />
              Start Free
              <ArrowRight size={20} />
            </button>
            <button 
              className="lp-btn-o" 
              style={{ ...buttonOutline, padding: "1.1rem 2.8rem", fontSize: "1.1rem" }} 
              onClick={() => scrollTo("institutions")}
            >
              For Institutions
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Enhanced Stats Row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(2rem, 5vw, 4rem)",
            flexWrap: "wrap",
            animation: "fadeInUp 0.8s 0.8s ease both",
          }}>
            {[
              { icon: <BarChart3 size={18} />, text: "11 DSA Modules" },
              { icon: <Brain size={18} />, text: "AI Diagnostic" },
              { icon: <Shield size={18} />, text: "Anti-Malpractice" },
              { icon: <Target size={18} />, text: "Placement Prediction" },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                fontSize: "0.9rem",
                color: "#94a3b8",
                fontWeight: 500,
                padding: "0.5rem 1rem",
                background: "rgba(17, 17, 32, 0.6)",
                borderRadius: "100px",
                border: "1px solid rgba(30, 30, 53, 0.5)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(30, 30, 53, 0.5)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              >
                <span style={{ color: "#6366f1" }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <div style={{
        background: "rgba(13, 13, 24, 0.8)",
        borderTop: "1px solid rgba(30, 30, 53, 0.6)",
        borderBottom: "1px solid rgba(30, 30, 53, 0.6)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "7rem 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <SectionTag text="Process" icon="⚡" />
            <SectionHeading delay={0.2}>How It Works</SectionHeading>
            <p style={{
              color: "#94a3b8",
              fontSize: "1.1rem",
              lineHeight: 1.8,
              maxWidth: "500px",
              margin: "0 auto",
              animation: "fadeInUp 0.6s 0.4s ease both",
            }}>
              Three steps that transform you from confused to confident.
            </p>
          </div>
          
          <div className="lp-steps" style={{
            display: "flex",
            gap: "2rem",
            alignItems: "stretch",
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                flex: 1,
                animation: `fadeInUp 0.6s ${0.2 + i * 0.2}s ease both`,
              }}>
                <div className="lp-card" style={{
                  ...cardBase,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "1.2rem",
                  height: "100%",
                  padding: "2.5rem 2rem",
                }}>
                  <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "24px",
                    flexShrink: 0,
                    background: step.bg,
                    border: `2px solid ${step.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1) rotate(5deg)";
                    e.currentTarget.style.boxShadow = `0 0 30px ${step.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  >
                    {step.icon}
                    <div style={{
                      position: "absolute",
                      top: "-12px",
                      right: "-12px",
                      width: "32px",
                      height: "32px",
                      borderRadius: "12px",
                      background: step.color,
                      color: "#fff",
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Space Grotesk', sans-serif",
                      boxShadow: `0 4px 12px ${step.color}60`,
                    }}>
                      {step.num}
                    </div>
                  </div>
                  <h3 style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "#f1f5f9",
                    letterSpacing: "-0.02em",
                    marginTop: "0.5rem",
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: "0.95rem",
                    color: "#94a3b8",
                    lineHeight: 1.8,
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES SECTION ── */}
      <div style={{ padding: "7rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <SectionTag text="Capabilities" icon="🚀" />
            <SectionHeading delay={0.2}>Everything You Need to Succeed</SectionHeading>
            <p style={{
              color: "#94a3b8",
              fontSize: "1.1rem",
              lineHeight: 1.8,
              maxWidth: "550px",
              margin: "0 auto",
              animation: "fadeInUp 0.6s 0.4s ease both",
            }}>
              Built with cutting-edge AI and ML to give you a measurable edge.
            </p>
          </div>
          
          <div className="lp-grid-3" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
          }}>
            {features.map((f, i) => (
              <div 
                key={f.title} 
                className="lp-card" 
                style={{
                  ...cardBase,
                  animation: `fadeInUp 0.6s ${0.1 + i * 0.1}s ease both`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: f.gradient,
                }} />
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "rgba(99, 102, 241, 0.1)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.2rem",
                  color: "#6366f1",
                }}>
                  {f.icon}
                </div>
                <h3 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#f1f5f9",
                  letterSpacing: "-0.02em",
                  marginBottom: "0.8rem",
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontSize: "0.9rem",
                  color: "#94a3b8",
                  lineHeight: 1.8,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STUDENTS SECTION ── */}
      <div id="students" style={{
        background: "rgba(13, 13, 24, 0.8)",
        borderTop: "1px solid rgba(30, 30, 53, 0.6)",
        borderBottom: "1px solid rgba(30, 30, 53, 0.6)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "7rem 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <SectionTag text="Individual" icon="🎯" />
            <SectionHeading delay={0.2}>For Individual Students</SectionHeading>
            <p style={{
              color: "#94a3b8",
              fontSize: "1.1rem",
              lineHeight: 1.8,
              maxWidth: "500px",
              margin: "0 auto",
              animation: "fadeInUp 0.6s 0.4s ease both",
            }}>
              Start free. Build deep. Get placed.
            </p>
          </div>
          
          <div className="lp-grid-2" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "start",
          }}>
            {/* Benefits */}
            <div style={{ animation: "fadeInLeft 0.6s 0.3s ease both" }}>
              <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-0.02em",
                marginBottom: "2rem",
              }}>
                What you get:
              </h3>
              {[
                "Free AI diagnostic assessment — unique every time",
                "Personalized 90-day Java DSA roadmap",
                "AI-powered hints when you're stuck",
                "Real Java code execution environment",
                "ML-powered placement readiness score",
                "Streak tracking + consistency analytics",
                "Weak area auto-detection + action plan",
              ].map((t) => <CheckRow key={t} text={t} />)}
            </div>

            {/* Pricing Cards */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              animation: "fadeInRight 0.6s 0.3s ease both",
            }}>
              {/* Free Plan */}
              <div className="lp-pricing" style={{
                ...cardBase,
                padding: "2.5rem",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.6rem",
                }}>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#f1f5f9",
                  }}>
                    Free Plan
                  </span>
                  <span style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#64748b",
                    background: "rgba(100, 116, 139, 0.15)",
                    borderRadius: "100px",
                    padding: "0.3rem 0.8rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    border: "1px solid rgba(100, 116, 139, 0.2)",
                  }}>
                    FREE FOREVER
                  </span>
                </div>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "3rem",
                  fontWeight: 900,
                  color: "#f1f5f9",
                  letterSpacing: "-0.05em",
                  marginBottom: "1.5rem",
                  background: "linear-gradient(135deg, #64748b, #94a3b8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  ₹0
                </div>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                  marginBottom: "1.8rem",
                }}>
                  {[
                    "All 11 DSA modules",
                    "AI diagnostic (unique every time)",
                    "Basic MCQ practice",
                    "20 coding problems/month",
                    "Community support",
                  ].map((t) => (
                    <div key={t} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      fontSize: "0.9rem",
                      color: "#94a3b8",
                    }}>
                      <Check size={14} color="#22c55e" strokeWidth={2.5} />
                      {t}
                    </div>
                  ))}
                </div>
                <button
                  className="lp-btn-o"
                  style={{ ...buttonOutline, width: "100%", borderRadius: "14px" }}
                  onClick={() => navigate("/register")}
                >
                  Start Free
                </button>
              </div>

              {/* Pro Plan */}
              <div className="lp-pricing lp-pricing-highlight" style={{
                ...cardBase,
                padding: "2.5rem",
                border: "2px solid rgba(99, 102, 241, 0.5)",
                boxShadow: "0 0 60px rgba(99, 102, 241, 0.15)",
                transform: "scale(1.05)",
                position: "relative",
                animation: "borderGlow 3s ease infinite",
              }}>
                <div style={{
                  position: "absolute",
                  top: "-16px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                  color: "#fff",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "0.35rem 1.2rem",
                  borderRadius: "100px",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
                }}>
                  ⭐ MOST POPULAR
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.6rem",
                }}>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#f1f5f9",
                  }}>
                    Pro Plan
                  </span>
                  <span style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#6366f1",
                    background: "rgba(99, 102, 241, 0.15)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    borderRadius: "100px",
                    padding: "0.3rem 0.8rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}>
                    ⭐ POPULAR
                  </span>
                </div>
                <div className="gradient-text" style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "3rem",
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  marginBottom: "0.2rem",
                  background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  ₹499
                </div>
                <div style={{
                  fontSize: "0.85rem",
                  color: "#64748b",
                  marginBottom: "1.5rem",
                }}>
                  per month
                </div>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                  marginBottom: "1.8rem",
                }}>
                  {[
                    "Everything in Free",
                    "Unlimited coding problems",
                    "Unlimited AI hints",
                    "Priority support",
                    "Performance export PDF",
                  ].map((t) => (
                    <div key={t} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      fontSize: "0.9rem",
                      color: "#94a3b8",
                    }}>
                      <Check size={14} color="#6366f1" strokeWidth={2.5} />
                      {t}
                    </div>
                  ))}
                </div>
                <button
                  className="lp-btn-p"
                  style={{ ...buttonPrimary, width: "100%", borderRadius: "14px" }}
                >
                  Get Pro
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── INSTITUTIONS SECTION ── */}
      <div id="institutions" style={{
        background: "rgba(10, 12, 28, 0.9)",
        borderTop: "1px solid rgba(30, 30, 70, 0.6)",
        borderBottom: "1px solid rgba(30, 30, 70, 0.6)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "7rem 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <SectionTag text="Institutions" icon="🏢" />
            <SectionHeading delay={0.2}>For Colleges & Institutes</SectionHeading>
            <p style={{
              color: "#94a3b8",
              fontSize: "1.1rem",
              lineHeight: 1.8,
              maxWidth: "550px",
              margin: "0 auto",
              animation: "fadeInUp 0.6s 0.4s ease both",
            }}>
              Give your students a data-driven edge. Manage, track, and predict at scale.
            </p>
          </div>

          {/* Enhanced Institution Feature Cards */}
          <div className="lp-grid-3" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
            marginBottom: "4rem",
          }}>
            {instFeatures.map((f, i) => (
              <div 
                key={f.title} 
                className="lp-card" 
                style={{
                  ...cardBase,
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  animation: `fadeInUp 0.6s ${0.2 + i * 0.2}s ease both`,
                }}
              >
                <div style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "rgba(99, 102, 241, 0.12)",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {f.icon}
                </div>
                <h3 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#f1f5f9",
                  letterSpacing: "-0.02em",
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontSize: "0.9rem",
                  color: "#94a3b8",
                  lineHeight: 1.8,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Enhanced Pricing Table */}
          <div className="lp-grid-3" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
            marginBottom: "4rem",
            alignItems: "start",
          }}>
            {instPlans.map((plan, i) => (
              <div
                key={plan.name}
                className={`lp-pricing${plan.highlight ? " lp-pricing-highlight" : ""}`}
                style={{
                  ...cardBase,
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  padding: plan.highlight ? "2.8rem 2rem" : "2.5rem 2rem",
                  ...(plan.highlight ? {
                    border: "2px solid rgba(99, 102, 241, 0.5)",
                    boxShadow: "0 0 60px rgba(99, 102, 241, 0.2)",
                    transform: "scale(1.05)",
                    animation: "borderGlow 3s ease infinite",
                    zIndex: 2,
                  } : {}),
                }}
              >
                {plan.highlight && (
                  <div style={{
                    position: "absolute",
                    top: "-16px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                    color: "#fff",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "0.35rem 1.2rem",
                    borderRadius: "100px",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
                  }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: plan.highlight ? "#a78bfa" : "#f1f5f9",
                  marginBottom: "0.4rem",
                }}>
                  {plan.name}
                </div>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "2.5rem",
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  marginBottom: "0.3rem",
                  ...(plan.highlight ? {
                    background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  } : { color: "#f1f5f9" }),
                }}>
                  {plan.price}
                </div>
                <div style={{
                  fontSize: "0.85rem",
                  color: "#64748b",
                  marginBottom: "0.3rem",
                }}>
                  {plan.period}
                </div>
                <div style={{
                  fontSize: "0.85rem",
                  color: "#6366f1",
                  fontWeight: 600,
                  marginBottom: "1.5rem",
                }}>
                  {plan.students}
                </div>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.7rem",
                  marginBottom: "2rem",
                  flex: 1,
                }}>
                  {plan.features.map((ft) => (
                    <div key={ft} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      fontSize: "0.88rem",
                      color: "#94a3b8",
                    }}>
                      <Check
                        size={14}
                        color={plan.highlight ? "#6366f1" : "#22c55e"}
                        strokeWidth={2.5}
                      />
                      {ft}
                    </div>
                  ))}
                </div>
                <button
                  className={plan.highlight ? "lp-btn-p" : "lp-btn-o"}
                  style={plan.highlight ? 
                    { ...buttonPrimary, width: "100%", borderRadius: "14px" } : 
                    { ...buttonOutline, width: "100%", borderRadius: "14px" }
                  }
                  onClick={() => navigate("/institution/register")}
                >
                  {plan.cta}
                  {plan.highlight && <ArrowRight size={16} />}
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", animation: "fadeInUp 0.6s 0.6s ease both" }}>
            <button
              className="lp-btn-p"
              style={{ ...buttonPrimary, padding: "1.2rem 3rem", fontSize: "1.1rem" }}
              onClick={() => navigate("/institution/register")}
            >
              Register Your Institution
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ── ENHANCED STATS SECTION ── */}
      <div style={{ padding: "7rem 2rem", background: "rgba(12, 12, 22, 0.8)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <SectionTag text="By the numbers" icon="📊" />
            <SectionHeading delay={0.2}>Trusted by Serious Learners</SectionHeading>
          </div>
          <div className="lp-grid-4" style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "2rem",
          }}>
            <StatCard 
              value={10000} 
              suffix="+" 
              label="Problems in Bank" 
              icon={<Code size={24} />}
              delay={0}
            />
            <StatCard 
              value={500} 
              suffix="+" 
              label="Students Placed" 
              icon={<Award size={24} />}
              delay={200}
            />
            <StatCard 
              value={11} 
              label="DSA Topics" 
              icon={<Activity size={24} />}
              delay={400}
            />
            <StatCard 
              value={95} 
              suffix="%" 
              label="Accuracy Rate" 
              icon={<Target size={24} />}
              delay={600}
            />
          </div>
        </div>
      </div>

      {/* ── ENHANCED FAQ SECTION ── */}
      <div style={{
        background: "rgba(13, 13, 24, 0.8)",
        borderTop: "1px solid rgba(30, 30, 53, 0.6)",
        borderBottom: "1px solid rgba(30, 30, 53, 0.6)",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "7rem 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <SectionTag text="FAQ" icon="💬" />
            <SectionHeading delay={0.2}>Common Questions</SectionHeading>
          </div>
          <div style={{
            background: "rgba(17, 17, 32, 0.8)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(30, 30, 53, 0.8)",
            borderRadius: "24px",
            padding: "0 2.5rem",
          }}>
            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} delay={i * 100} />
            ))}
          </div>
        </div>
      </div>

      {/* ── ENHANCED FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(30, 30, 53, 0.8)",
        background: "rgba(7, 7, 13, 0.98)",
        padding: "4rem 2.5rem 2rem",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="lp-footer-row" style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "2rem",
            marginBottom: "3rem",
            flexWrap: "wrap",
          }}>
            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "0.6rem",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "1.3rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                <Zap size={22} style={{ color: "#6366f1" }} />
                DSA Master
              </div>
              <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
                Master DSA. Get Placed.
              </p>
            </div>
            <div className="lp-footer-links" style={{
              display: "flex",
              gap: "0.3rem",
              flexWrap: "wrap",
            }}>
              {["Features", "Pricing", "Students", "Institutions", "Contact"].map((link) => (
                <button
                  key={link}
                  className="lp-foot-link"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
          <div style={{
            borderTop: "1px solid rgba(30, 30, 53, 0.6)",
            paddingTop: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {["Privacy Policy", "Terms of Service"].map((l) => (
                <button
                  key={l}
                  className="lp-foot-link"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#475569",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                    transition: "all 0.3s ease",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
            <span style={{ fontSize: "0.85rem", color: "#334155" }}>
              © 2024 DSA Master. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}