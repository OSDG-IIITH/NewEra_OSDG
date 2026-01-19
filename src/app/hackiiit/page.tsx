"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function HackIIIT() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cursor & Glow Logic
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    const glow = glowRef.current;

    if (!cursor || !follower || !glow) return;

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursor.style.left = mouseX + "px";
      cursor.style.top = mouseY + "px";

      glow.style.left = mouseX + "px";
      glow.style.top = mouseY + "px";
    };

    const animateFollower = () => {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.left = followerX + "px";
      follower.style.top = followerY + "px";
      requestAnimationFrame(animateFollower);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animateFollower();

    // Hover interactions
    const hoverElements = document.querySelectorAll(
      ".hover-target, a, .timeline-item, .logo-wrapper",
    );
    hoverElements.forEach((el) => {
      el.addEventListener("mouseenter", () =>
        follower?.classList.add("cursor-hover"),
      );
      el.addEventListener("mouseleave", () =>
        follower?.classList.remove("cursor-hover"),
      );
    });

    // Reveal Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.style.opacity = "1";
            target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Smooth Scroll Navigation
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach((anchor) => {
      anchor.addEventListener(
        "click",
        function (this: HTMLAnchorElement, e: Event) {
          (e as MouseEvent).preventDefault();
          const target = document.querySelector(this.getAttribute("href")!);
          if (target) {
            target.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        },
      );
    });

    // Scroll to Top Button
    const scrollTopBtn = document.getElementById("scroll-top");
    const handleScroll = () => {
      if (window.pageYOffset > 500) {
        scrollTopBtn?.classList.add("visible");
      } else {
        scrollTopBtn?.classList.remove("visible");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        /* ---- Swipe-in primitives ---- */
        .reveal-swipe-left {
          opacity: 0;
          transform: translateX(-40px);
        }

        .reveal-swipe-right {
          opacity: 0;
          transform: translateX(40px);
        }

        .reveal-swipe-up {
          opacity: 0;
          transform: translateY(30px);
        }

        .reveal-active {
          opacity: 1;
          transform: translate(0, 0);
          transition:
            opacity 0.8s ease,
            transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        :root {
          --black: #000000;
          --blue: #0d1164;
          --purple: #640d5f;
          --pink: #ea2264;
          --peach: #f78d60;
          --glass: rgba(255, 255, 255, 0.03);
          --border: rgba(255, 255, 255, 0.1);
        }

        * {
          cursor: none;
        }

        body {
          font-family: "Plus Jakarta Sans", sans-serif;
          background: var(--black);
          color: #fff;
        }

        #cursor {
          width: 8px;
          height: 8px;
          background: var(--peach);
          border-radius: 50%;
          position: fixed;
          pointer-events: none;
          z-index: 10001;
          transform: translate(-50%, -50%);
        }

        #cursor-follower {
          width: 30px;
          height: 30px;
          border: 1px solid var(--pink);
          border-radius: 50%;
          position: fixed;
          pointer-events: none;
          z-index: 10000;
          transform: translate(-50%, -50%);
          transition:
            width 0.3s,
            height 0.3s,
            background 0.3s,
            border 0.3s;
        }

        .cursor-hover {
          width: 80px !important;
          height: 80px !important;
          background: rgba(234, 34, 100, 0.1) !important;
          border: 1px solid var(--peach) !important;
        }

        .grid-overlay {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(100, 13, 95, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 13, 95, 0.15) 1px, transparent 1px);
          background-size: 50px 50px;
          z-index: 0;
          pointer-events: none;
        }

        .ambient-glow {
          position: fixed;
          width: 60vmax;
          height: 60vmax;
          background: radial-gradient(
            circle,
            rgba(100, 13, 95, 0.3) 0%,
            transparent 70%
          );
          top: 0;
          left: 0;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1;
        }

        #scroll-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          background: var(--pink);
          border: 2px solid var(--border);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          pointer-events: none;
          transition:
            opacity 0.3s,
            transform 0.3s;
          font-size: 1.5rem;
          color: white;
        }

        #scroll-top.visible {
          opacity: 1;
          pointer-events: auto;
        }

        #scroll-top:hover {
          background: var(--purple);
          transform: translateY(-5px);
          box-shadow: 0 5px 20px var(--purple);
        }

        .section {
          min-height: 100vh;
          padding: 120px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
        }

        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .hero-title {
          font-family: "Press Start 2P", cursive;
          font-size: clamp(2rem, 8vw, 5rem);
          margin-bottom: 20px;
          color: #fff;
          text-shadow: 4px 4px var(--purple);
          text-align: center;
          line-height: 1.2;
        }

        .btn-cta {
          background: var(--pink);
          color: white;
          padding: 16px 40px;
          border-radius: 4px;
          text-decoration: none;
          font-family: "Space Mono", monospace;
          font-weight: bold;
          transition: 0.3s;
          display: inline-block;
          border: none;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-top: 20px;
        }

        .btn-cta:hover {
          background: var(--purple);
          box-shadow: 0 0 30px var(--purple);
          transform: translateY(-3px);
        }

        .hero-graphic {
          position: absolute;
          left: 25%;
          top: 55%;
          transform: translateY(-50%);
          width: 50%;
          opacity: 0.1;
          z-index: -1;
        }

        .glass-box {
          border: 11px solid var(--border);
          padding: 60px;
          border-radius: 30px;
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 50px;
          align-items: center;
        }

        .carousel-container {
          overflow: hidden;
          width: 100%;
          padding: 40px 0;
        }

        .carousel-track {
          display: flex;
          gap: 20px;
          width: fit-content;
          animation: scroll 30s linear infinite;
        }

        .carousel-img {
          width: 350px;
          height: 220px;
          object-fit: cover;
          border-radius: 15px;
          border: 1px solid var(--border);
          transition: 0.4s;
          filter: grayscale(1);
          flex-shrink: 0;
        }

        .carousel-img:hover {
          filter: grayscale(0);
          border-color: var(--pink);
          transform: scale(1.05);
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-350px * 4 - 80px));
          }
        }

        .timeline-item {
          padding: 40px;
          border-left: 2px solid var(--purple);
          margin-left: 20px;
          position: relative;
          transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .timeline-item:hover {
          border-left: 8px solid var(--pink);
          padding-left: 60px;
          background: linear-gradient(
            90deg,
            rgba(100, 13, 95, 0.2),
            transparent
          );
        }

        .timeline-item::after {
          content: "";
          position: absolute;
          left: -6px;
          top: 50px;
          width: 10px;
          height: 10px;
          background: var(--purple);
          border-radius: 50%;
          transition: 0.3s;
        }

        .timeline-item:hover::after {
          background: var(--pink);
          box-shadow: 0 0 15px var(--pink);
          transform: scale(1.5);
        }

        .faq-item {
          background: var(--glass);
          border: 1px solid var(--border);
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 20px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .faq-item:hover {
          border-color: var(--pink);
          background: rgba(234, 34, 100, 0.05);
          transform: translateX(10px);
        }

        .faq-question {
          font-family: "Space Mono", monospace;
          font-size: clamp(1rem, 2vw, 1.1rem);
          color: var(--pink);
          margin-bottom: 15px;
        }

        .faq-answer {
          color: #ccc;
          font-size: clamp(0.9rem, 2vw, 1rem);
          line-height: 1.8;
        }

        .footer-logo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 40px;
          align-items: center;
          justify-items: center;
          padding: 60px 0;
        }

        .logo-wrapper {
          transition: 0.4s;
          filter: grayscale(1) brightness(1.5);
          opacity: 0.6;
        }

        .logo-wrapper:hover {
          transform: scale(1.1);
          filter: grayscale(0) brightness(1);
          opacity: 1;
        }

        .logo-img {
          height: 50px;
          width: auto;
          object-fit: contain;
          max-width: 100%;
        }

        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition:
            opacity 1s,
            transform 1s;
        }

        @media (max-width: 1024px) {
          .section {
            padding: 100px 20px;
          }
          .glass-box {
            grid-template-columns: 1fr;
            padding: 40px;
            gap: 30px;
          }
          .carousel-img {
            width: 680px;
            height: 480px;
          }
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-280px * 4 - 80px));
            }
          }
        }

        @media (max-width: 768px) {
          #cursor,
          #cursor-follower {
            display: none;
          }
          * {
            cursor: auto;
          }
          #scroll-top {
            width: 45px;
            height: 45px;
            bottom: 20px;
            right: 20px;
          }
          .btn-cta {
            padding: 12px 24px;
            font-size: 0.8rem;
            letter-spacing: 1px;
          }
          .section {
            min-height: 100vh;
            padding: 80px 15px;
          }
          .hero-title {
            font-size: clamp(1.5rem, 10vw, 2.5rem);
            text-shadow: 2px 2px var(--purple);
          }
          .hero-graphic {
            position: absolute;
            left: 50%;
            top: 65%;
            transform: translate(-50%, -180%);
            width: 140%;
            opacity: 0.26;
            filter: blur(1px);
            pointer-events: none;
            z-index: -1;
          }
          .glass-box {
            padding: 30px 20px;
            border-width: 6px;
            border-radius: 20px;
            gap: 20px;
          }
          .glass-box h2 {
            font-size: 0.9rem !important;
          }
          .glass-box p {
            font-size: 1rem !important;
          }
          .carousel-img {
            width: 550px;
            height: 360px;
          }
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-250px * 4 - 80px));
            }
          }
          .timeline-item {
            padding: 25px 20px;
            margin-left: 10px;
          }
          .timeline-item:hover {
            padding-left: 30px;
          }
          .timeline-item h3 {
            font-size: 1rem;
          }
          .timeline-item p {
            font-size: 0.85rem;
          }
          .footer-logo-grid {
            grid-template-columns: repeat(2, 1fr); /* 2 columns */
            grid-template-rows: repeat(2, auto); /* 2 rows */
            gap: 23px;
            padding: 40px 0;
          }
          .logo-img {
            height: 40px;
          }
          .grid-overlay {
            background-size: 30px 30px;
          }
        }

        @media (max-width: 480px) {
          .btn-cta {
            padding: 10px 20px;
            font-size: 0.7rem;
          }
          .section {
            padding: 60px 10px;
          }
          .hero-title {
            margin-bottom: 15px;
          }
          .glass-box {
            padding: 20px 15px;
            border-width: 4px;
            border-radius: 15px;
          }
          .carousel-img {
            width: 400px;
            height: 330px;
          }
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-200px * 4 - 80px));
            }
          }
          .timeline-item {
            padding: 20px 15px;
          }
          .footer-logo-grid {
            grid-template-columns: repeat(2, 1fr); /* 2 columns */
            grid-template-rows: repeat(2, auto); /* 2 rows */
            gap: 25px;
          }
        }

        .section.compact {
          min-height: auto;
          padding: 80px 20px;
        }

        @media (max-width: 768px) {
          .section.compact {
            padding: 60px 15px;
          }
        }

        @media (min-width: 1440px) {
          .container {
            max-width: 1400px;
          }
          .carousel-img {
            width: 600px;
            height: 450px;
          }
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-400px * 4 - 80px));
            }
          }
        }

        @media (max-width: 768px) {
          .ambient-glow {
            animation: floatGlow 28s ease-in-out infinite alternate;
            background: radial-gradient(
              circle,
              rgba(200, 13, 95, 0.3) 0%,
              transparent 70%
            );
          }

          @keyframes floatGlow {
            0% {
              transform: translate(-45%, -50%) scale(1);
            }

            12% {
              transform: translate(10%, -30%) scale(1.1);
            }

            27% {
              transform: translate(40%, 15%) scale(0.95);
            }

            41% {
              transform: translate(-20%, 45%) scale(1.15);
            }

            56% {
              transform: translate(-55%, 100%) scale(0.9);
            }

            68% {
              transform: translate(25%, -45%) scale(1.08);
            }

            82% {
              transform: translate(50%, 35%) scale(0.92);
            }

            100% {
              transform: translate(-35%, -40%) scale(1.05);
            }
          }
        }

        /* Prizes Section Styles */
        .prize-grid {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 60px;
          flex-wrap: wrap;
        }

        .prize-card {
          background: var(--glass);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 40px 20px;
          text-align: center;
          width: 280px;
          position: relative;
          backdrop-filter: blur(10px);
          transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .prize-card:hover {
          transform: translateY(-10px);
          border-color: var(--pink);
          background: rgba(234, 34, 100, 0.1);
          box-shadow: 0 10px 30px rgba(234, 34, 100, 0.2);
        }

        .prize-card.first {
          height: 380px;
          border-color: var(--peach);
          background: rgba(247, 141, 96, 0.05);
          order: 2;
          z-index: 2;
        }

        .prize-card.first:hover {
          border-color: var(--peach);
          background: rgba(247, 141, 96, 0.15);
          box-shadow: 0 10px 40px rgba(247, 141, 96, 0.3);
        }

        .prize-card.second {
          height: 320px;
          order: 1;
        }

        .prize-card.third {
          height: 300px;
          order: 3;
        }

        .prize-rank {
          font-family: "Press Start 2P";
          font-size: 2rem;
          margin-bottom: 20px;
          color: #fff;
          opacity: 0.8;
        }

        .prize-card.first .prize-rank {
          color: var(--peach);
        }

        .prize-amount {
          font-family: "Space Mono";
          font-size: 1.8rem;
          font-weight: bold;
          color: #fff;
          margin-bottom: 10px;
        }

        .prize-label {
          font-family: "Space Mono";
          color: #888;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .prize-crown {
          font-size: 3rem;
          margin-bottom: 15px;
          animation: float 3s ease-in-out infinite;
          display: block;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .awards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }

        .award-item {
          background: var(--glass);
          border: 1px solid var(--border);
          border-radius: 15px;
          padding: 30px;
          text-align: center;
          transition: 0.3s;
          backdrop-filter: blur(5px);
        }

        .award-item:hover {
          border-color: var(--purple);
          transform: translateY(-5px);
          background: rgba(100, 13, 95, 0.15);
        }

        .award-icon {
          font-size: 2.5rem;
          margin-bottom: 15px;
        }

        .award-amount {
          font-family: "Space Mono";
          color: var(--peach);
          font-weight: bold;
          font-size: 1.2rem;
          margin-bottom: 5px;
        }

        .award-title {
          color: #fff;
          font-size: 1rem;
          font-family: "Plus Jakarta Sans", sans-serif;
          font-weight: 600;
        }

        .award-desc {
          font-size: 0.8rem;
          color: #888;
          margin-top: 5px;
          font-family: "Space Mono";
        }

        @media (max-width: 1024px) {
          .prize-grid {
            gap: 15px;
          }
          .prize-card {
            min-width: 260px;
          }
        }

        @media (max-width: 900px) {
          .award-desc {
            font-size: 0.8rem;
            color: #888;
            margin-top: 5px;
            font-family: "Space Mono";
            visibility: hidden;
            display: none;
          }

          .prize-grid {
            flex-direction: column;
            align-items: center;
            gap: 30px;
          }

          .prize-card {
            width: 100%;
            max-width: 450px;
            height: auto !important;
            order: unset !important;
            padding: 30px 20px;
            display: grid;
            grid-template-columns: auto 1fr;
            grid-template-rows: auto auto;
            text-align: left;
            align-items: center;
            column-gap: 20px;
          }

          .prize-card.first {
            order: -1 !important;
            grid-template-rows: auto auto auto;
          }

          .prize-rank {
            grid-row: 1 / 3;
            margin-bottom: 0;
            font-size: 1.5rem;
          }

          .prize-amount {
            grid-column: 2;
            grid-row: 1;
            font-size: 1.4rem;
            margin-bottom: 5px;
          }

          .prize-label {
            grid-column: 2;
            grid-row: 2;
            font-size: 0.8rem;
          }

          .prize-crown {
            grid-column: 1 / 3;
            grid-row: 1;
            font-size: 2rem;
            margin-bottom: 10px;
            text-align: center;
            width: 100%;
          }
        }

        @media (max-width: 600px) {
          .awards-grid {
            grid-template-columns: 1fr; /* Stack awards on small mobile */
          }

          .award-item {
            display: flex;
            align-items: center;
            text-align: left;
            padding: 20px;
            gap: 20px;
          }

          .award-icon {
            margin-bottom: 0;
            font-size: 2rem;
          }

          .award-info {
            flex-grow: 1;
          }

          /* Need to wrap content in a div for flex layout in JS logic?
              CSS-only fix: assume direct children.
              But wait, the HTML structure is: icon, amount, title, desc.
              Flexbox will put them in a row. We want icon + (stack of rest).
           */
        }

        /* Better Approach for Mobile Awards: Keep grid but center content or allow 2 cols on slightly larger mobile */
        @media (max-width: 480px) {
          .prize-card {
            grid-template-columns: 1fr;
            text-align: center;
            justify-items: center;
            gap: 10px;
          }

          .prize-rank,
          .prize-rank,
          .prize-amount,
          .prize-label {
            grid-column: auto;
            grid-row: auto;
          }

          .prize-crown {
            grid-column: auto;
            margin-bottom: 5px;
          }

          .award-item {
            padding: 20px;
          }
        }
      `}</style>

      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;700&family=Space+Mono:wght@400;700&family=Press+Start+2P&display=swap"
        rel="stylesheet"
      />
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;700&family=Space+Mono:wght@400;700&family=Press+Start+2P&display=swap');
            `}</style>

      <div ref={cursorRef} id="cursor"></div>
      <div ref={followerRef} id="cursor-follower"></div>
      <div className="grid-overlay"></div>
      <div ref={glowRef} className="ambient-glow" id="glow"></div>

      {/* Hero */}
      <section className="section" id="hero">
        <Image
          src="/hackiiit/beige-hackintosh-nobg.png"
          className="hero-graphic"
          alt=""
          width={500}
          height={500}
        />
        <div className="container" style={{ textAlign: "center" }}>
          <p
            className="reveal"
            style={{
              color: "var(--pink)",
              fontFamily: "Space Mono",
              letterSpacing: "6px",
              marginBottom: "15px",
              fontSize: "clamp(0.7rem, 2vw, 1rem)",
            }}
          >
            [ SESSION_OPEN ]
          </p>
          <h1 className="hero-title reveal">HACKIIIT</h1>
          <p
            className="reveal"
            style={{
              fontSize: "clamp(1rem, 3vw, 1.3rem)",
              color: "#888",
              fontFamily: "Space Mono",
              marginBottom: "10px",
            }}
          >
            BUILD_THE_FUTURE_OF_CAMPUS
          </p>
          <p
            className="reveal"
            style={{
              color: "var(--peach)",
              fontFamily: "Space Mono",
              fontWeight: "bold",
              fontSize: "clamp(1.1rem, 3.5vw, 1.5rem)",
            }}
          >
            PRIZE POOL: ₹1,00,000
          </p>

          <div className="reveal">
            <a
              href="/hackiiit#timeline"
              className="btn-cta hover-target disabled:"
            >
              Registrations Closed, View Timeline 🠞
            </a>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section" id="mission">
        <div className="container">
          <div className="glass-box reveal">
            <div>
              <Image
                src="/hackiiit/audio_cassette_black.png"
                style={{
                  width: "100%",
                  filter: "drop-shadow(0 0 25px #472635)",
                }}
                alt=""
                width={400}
                height={400}
              />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "Press Start 2P",
                  fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
                  color: "var(--pink)",
                  marginBottom: "25px",
                }}
              >
                THE_MISSION
              </h2>
              <p
                style={{
                  color: "#ccc",
                  fontSize: "clamp(1rem, 2vw, 1.1rem)",
                  lineHeight: "1.6",
                  maxWidth: "70ch",
                  marginBottom: "25px",
                }}
              >
                We challenge you to take on a real campus problem and solve it
                in the open.
                <br />
                Open source, always. No gates. No secrets. Just code that
                matters.
                <br />
                <br />
                IIIT is home to some of the country’s best engineers. It’s also
                home to outdated portals, clunky websites, and missing
                quality-of-life features.
                <br />
                <br />
                At OSDG, we believe the best way to fix problems is to build.
                Welcome to{" "}
                <span style={{ color: "var(--peach)", fontWeight: 600 }}>
                  HackIIIT
                </span>
                , our annual hackathon focused on one simple idea:
                <br />
                <strong style={{ color: "#fff" }}>
                  build anything that makes life at IIIT better.
                </strong>
                <br />
                <br />
                This year, we’re going bigger. A larger prize pool. A sharper
                judging process. A unified theme,{" "}
                <a
                  href="https://google.com"
                  style={{ color: "var(--peach)", textDecoration: "none" }}
                >
                  Sunset
                </a>
                .
                <br />
                Let’s reimagine campus life, one open-source project at a time.
              </p>

              <div
                style={{
                  fontFamily: "Space Mono",
                  color: "var(--purple)",
                  fontWeight: "bold",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                }}
              >
                <p style={{ color: "var(--pink)" }}>[ WHAT: 24H_HACK ]</p>
                <p style={{ color: "var(--pink)" }}>[ WHEN: JAN_24-26 ]</p>
                <p style={{ color: "var(--pink)" }}>
                  [ WHERE: IIIT Hyderabad ]
                </p>
                <p style={{ color: "var(--pink)" }}>
                  [ WHY: BECAUSE_CODE_CHANGES_CAMPUS ]
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Memories Carousel */}
      <section className="section compact" id="memories">
        <div className="container">
          <h2
            className="reveal"
            style={{
              fontFamily: "Press Start 2P",
              fontSize: "clamp(0.7rem, 2vw, 1rem)",
              textAlign: "center",
              marginBottom: "50px",
            }}
          >
            MEMORIES_HACKIIIT_2025
          </h2>
          <div className="carousel-container reveal">
            <div className="carousel-track">
              {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                <Image
                  key={num}
                  className="carousel-img"
                  src={`/hackiiit/carousel${num}.JPG`}
                  alt={`Carousel ${num}`}
                  width={350}
                  height={220}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section className="section" id="prizes">
        <div className="container">
          <h2
            className="reveal"
            style={{
              fontFamily: "Space Mono",
              fontSize: "clamp(1rem, 2vw, 1.5rem)",
              margin: "100px 0 50px",
              color: "#e4c66bff",
              textAlign: "center",
              letterSpacing: "4px",
            }}
          >
            [ PRIZE_POOL_BREAKDOWN ]
          </h2>

          <div className="prize-grid reveal">
            {/* 2nd Prize */}
            <div className="prize-card second hover-target">
              <span className="prize-crown">🥈</span>
              <div className="prize-rank">2ND</div>
              <div className="prize-amount">₹25,000</div>
              <div className="prize-label">Runner Up</div>
            </div>

            {/* 1st Prize */}
            <div className="prize-card first hover-target">
              <span className="prize-crown">🥇</span>
              <div className="prize-rank">1ST</div>
              <div className="prize-amount">₹40,000</div>
              <div className="prize-label">Winner</div>
            </div>

            {/* 3rd Prize */}
            <div className="prize-card third hover-target">
              <span className="prize-crown">🥉</span>
              <div className="prize-rank">3RD</div>
              <div className="prize-amount">₹15,000</div>
              <div className="prize-label">2nd Runner Up</div>
            </div>
          </div>

          <h3
            className="reveal"
            style={{
              fontFamily: "Space Mono",
              fontSize: "clamp(1rem, 2vw, 1.5rem)",
              margin: "100px 0 50px",
              color: "#fff",
              textAlign: "center",
              letterSpacing: "4px",
            }}
          >
            [ ADDITIONAL_AWARDS ]
          </h3>

          <div className="awards-grid reveal">
            <div className="award-item hover-target">
              <div className="award-icon">🎨</div>
              <div className="award-amount">₹5,000</div>
              <div className="award-title">Most Creative Project</div>
            </div>
            <div className="award-item hover-target">
              <div className="award-icon">👨‍🏫</div>
              <div className="award-amount">₹5,000</div>
              <div className="award-title">Best Mentor Award</div>
            </div>
            <div className="award-item hover-target">
              <div className="award-icon">✨</div>
              <div className="award-amount">₹5,000</div>
              <div className="award-title">Best UI/UX</div>
            </div>
            <div className="award-item hover-target">
              <div className="award-icon">🎁</div>
              <div className="award-amount">₹5,000</div>
              <div className="award-title">Special Prize</div>
              <div className="award-desc">To be revealed soon</div>
            </div>
          </div>
        </div>
      </section>

      {/* Jane Street Spotlight */}
      <section className="section compact">
        <div className="container" style={{ textAlign: "center" }}>
          <h2
            className="reveal"
            style={{
              fontFamily: "Press Start 2P",
              fontSize: "clamp(0.7rem, 2vw, 1rem)",
              textAlign: "center",
              marginBottom: "50px",
            }}
          >
            PARTNERING WITH
          </h2>
          <Image
            src="/hackiiit/Jane_street_logo.png"
            alt="Jane Street"
            width={500}
            height={200}
            style={{
              display: "block",
              margin: "0 auto 30px",
              maxHeight: "200px",
              width: "auto",
              maxWidth: "90%",
            }}
          />

          <p
            style={{
              maxWidth: "700px",
              margin: "0 auto",
              fontSize: "clamp(1rem, 2vw, 1.1rem)",
              lineHeight: "1.8",
              padding: "0 20px",
            }}
          >
            Jane Street is a quantitative trading firm with a unique focus on
            technology and collaborative problem-solving. We are proud to have
            them as our sponsor for HackIIIT 2026.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" id="timeline">
        <div className="container" style={{ maxWidth: "800px" }}>
          <h2
            className="reveal"
            style={{
              fontFamily: "Press Start 2P",
              fontSize: "clamp(0.8rem, 2vw, 1rem)",
              marginBottom: "60px",
              color: "var(--peach)",
            }}
          >
            CHRONOLOGY_LOG
          </h2>
          <div className="timeline-item reveal hover-target">
            <h3
              style={{
                color: "var(--pink)",
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              }}
            >
              REGISTRATIONS
            </h3>
            <p
              style={{
                color: "#666",
                fontFamily: "Space Mono",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
              }}
            >
              DEADLINE | 17th JAN //
              <br />
              Assemble your team and start tinkering! Only a few projects will
              be shortlisted based on proposal quality.
            </p>
          </div>
          <div className="timeline-item reveal hover-target">
            <h3 style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}>
              THE KICKOFF
            </h3>
            <p
              style={{
                color: "#666",
                fontFamily: "Space Mono",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
              }}
            >
              JAN 24 | 14:00 // EVENT OPENING
              <br /> Keynote Adress by Prof. Karthik Vaidhyanathan. Proposal
              submissions and evaluations.
            </p>
          </div>
          <div className="timeline-item reveal hover-target">
            <h3 style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}>
              24H HACKING
            </h3>
            <p
              style={{
                color: "#666",
                fontFamily: "Space Mono",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
              }}
            >
              JAN 24 | 17:00 // PURE HACKING BEGINS (24 HOURS)
            </p>
          </div>
          <div className="timeline-item reveal hover-target">
            <h3 style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}>
              CODING & SNACKS
            </h3>
            <p
              style={{
                color: "#666",
                fontFamily: "Space Mono",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
              }}
            >
              JAN 24 | We'll give some snacks somewhere. TBD
            </p>
          </div>
          <div className="timeline-item reveal hover-target">
            <h3 style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}>
              FINAL SUBMISSION
            </h3>
            <p
              style={{
                color: "#666",
                fontFamily: "Space Mono",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
              }}
            >
              JAN 25 | 15:00 // EVENT ENDS (3:00 PM)
            </p>
          </div>
          <div className="timeline-item reveal hover-target">
            <h3 style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}>
              EVALS AND RESULTS
            </h3>
            <p
              style={{
                color: "#666",
                fontFamily: "Space Mono",
                fontSize: "clamp(0.85rem, 2vw, 1rem)",
              }}
            >
              JAN 26 // Eval Slots will be announced, followed by winners
              announcements.
            </p>
          </div>
        </div>
      </section>

      {/* What Can You Build */}
      <section className="section compact" id="what-can-you-build">
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2
            className="reveal"
            style={{
              fontFamily: "Press Start 2P",
              fontSize: "clamp(0.8rem, 2vw, 1rem)",
              marginBottom: "50px",
              color: "var(--peach)",
              textAlign: "center",
            }}
          >
            WHAT_CAN_YOU_BUILD
          </h2>

          <div
            className="glass-box reveal"
            style={{ gridTemplateColumns: "1fr" }}
          >
            <p
              style={{
                color: "#ccc",
                fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
                lineHeight: "1.7",
                marginBottom: "25px",
              }}
            >
              Build anything that improves life at IIIT Hyderabad. Tools,
              platforms, automations, fixes, experiments, or ideas we did not
              know we knew we needed.
              <br />
              <br />
              Your project must be{" "}
              <span style={{ color: "var(--peach)" }}>open source </span>
              and meaningful to the campus community.
            </p>

            <p
              style={{
                color: "#bbb",
                fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
                lineHeight: "1.7",
                marginBottom: "25px",
              }}
            >
              You are expected to start building{" "}
              <strong>during the hackathon</strong>.
              <br />
              Using pre-existing code, libraries, or old projects is allowed,
              <strong> but must be clearly disclosed</strong>.
            </p>

            <p
              style={{
                color: "#bbb",
                fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
                lineHeight: "1.7",
                marginBottom: "25px",
              }}
            >
              If you build on top of something that already exists, your
              submission must include <strong>significant new features</strong>{" "}
              developed during the hackathon. These cases will be evaluated
              individually. Please reach out to mentors{" "}
              <strong> before hacking period </strong>to clearify what you'll be
              working on improving.
              <br />
              <br />
              OSDG reserves rights to disqualify participants found using
              undisclosed previous work.
            </p>

            <p
              style={{
                color: "var(--pink)",
                fontFamily: "Space Mono",
                fontSize: "clamp(0.9rem, 2vw, 1rem)",
                lineHeight: "1.7",
              }}
            >
              [ FAIR_PLAY_NOTICE ]
              <br />
              If you believe a team has used undisclosed pre-existing work,
              report it to the organizing team. All reports will be handled
              discreetly and fairly.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section" id="faq">
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2
            className="reveal"
            style={{
              fontFamily: "Press Start 2P",
              fontSize: "clamp(0.8rem, 2vw, 1rem)",
              marginBottom: "60px",
              color: "var(--peach)",
              textAlign: "center",
            }}
          >
            FREQUENTLY_ASKED_QUESTIONS
          </h2>

          <div className="faq-item reveal">
            <h3 className="faq-question">Who can participate?</h3>
            <p className="faq-answer">
              HackIIIT is open to all IIIT Hyderabad students. You must form
              teams of 2 to 4 members to participate.
            </p>
          </div>

          <div className="faq-item reveal">
            <h3 className="faq-question">What should I build?</h3>
            <p className="faq-answer">
              Focus on solving real campus problems. Your solution must be open
              source and should address an actual need within our community.
            </p>
          </div>

          <div className="faq-item reveal">
            <h3 className="faq-question">What is the proposal about???</h3>
            <p className="faq-answer">
              Give a short summary of your solution in a simple one page pdf.
              Submissions will open on 24th Jan, 2:00 PM.
            </p>
          </div>

          <div className="faq-item reveal">
            <h3 className="faq-question">Do I need to be experienced?</h3>
            <p className="faq-answer">
              No! HackIIIT welcomes all skill levels. Whether you&apos;re a
              beginner or an experienced developer, there&apos;s a place for you
              here.
            </p>
          </div>

          <div className="faq-item reveal">
            <h3 className="faq-question">
              What&apos;s the prize pool distribution?
            </h3>
            <p className="faq-answer">
              The total prize pool of ₹1,00,000 will be distributed among top
              teams and a few top mentors. Exact distribution will be announced
              closer to the event.
            </p>
          </div>

          <div className="faq-item reveal">
            <h3 className="faq-question">Will there be mentorship?</h3>
            <p className="faq-answer">
              Yes! Mentors will be available throughout the 24-hour period to
              guide you and answer your questions.
            </p>
          </div>

          <div className="faq-item reveal">
            <h3 className="faq-question">What do I need to bring?</h3>
            <p className="faq-answer">
              Bring your laptop, charger, and enthusiasm! We&apos;ll provide
              food, beverages, and a great hacking environment.
            </p>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <button
        id="scroll-top"
        className="hover-target"
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>

      {/* Footer */}
      <footer
        style={{
          padding: "100px 20px",
          borderTop: "1px solid var(--border)",
          background: "#000",
        }}
      >
        <div className="container">
          <div className="footer-logo-grid">
            <div className="logo-wrapper reveal">
              <Image
                src="/hackiiit/OSDG-logo.png"
                alt="OSDG"
                className="logo-img"
                width={150}
                height={50}
              />
            </div>
            <div className="logo-wrapper reveal">
              <Image
                src="/hackiiit/Jane_street_logo.png"
                alt="Jane Street"
                className="logo-img"
                width={150}
                height={50}
              />
            </div>
            <div className="logo-wrapper reveal">
              <Image
                src="/hackiiit/iiit-logo.png"
                alt="IIIT"
                className="logo-img"
                width={150}
                height={50}
              />
            </div>
            <div className="logo-wrapper reveal">
              <Image
                src="/hackiiit/sponsor_2.png"
                alt="Sponsor"
                className="logo-img"
                width={150}
                height={50}
              />
            </div>
          </div>
          <p
            style={{
              textAlign: "center",
              fontFamily: "Space Mono",
              color: "#fff",
              fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
              marginTop: "50px",
            }}
          >
            Copyright (c) 2026 OSDG. All Rights Reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
