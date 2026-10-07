import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const pagePalettes = {
  login: ["#ffffff", "#ded5ff", "#b8aaff", "#c5e6ff"],
  signup: ["#ffffff", "#c9ddff", "#b8aaff", "#88e7dd"],
  home: ["#ffffff", "#c9ddff", "#b8aaff", "#88e7dd"],
  dashboard: ["#ffffff", "#d4e2ff", "#b8aaff", "#74e4d8"],
  games: ["#ffffff", "#d9e5ff", "#a99aff", "#8be5d6"],
  planner: ["#ffffff", "#d9e5ff", "#91a9ff", "#85e2d5"],
  borrowed: ["#ffffff", "#d9e5ff", "#b8aaff", "#f2c879"],
  profile: ["#ffffff", "#d9e5ff", "#c0b3ff", "#84dfd5"],
};

function getPageTheme(pathname, theme) {
  if (theme && pagePalettes[theme]) return theme;
  if (pathname.startsWith("/login")) return "login";
  if (pathname.startsWith("/signup")) return "signup";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/games")) return "games";
  if (pathname.startsWith("/planner")) return "planner";
  if (pathname.startsWith("/borrowed")) return "borrowed";
  if (pathname.startsWith("/profile")) return "profile";
  return "home";
}

function AmbientStarfield({ local = false, theme }) {
  const canvasRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const palette = pagePalettes[getPageTheme(pathname, theme)];
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let tick = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let stars = [];
    let shootingStars = [];

    const createStars = () => {
      const count = Math.min(
        420,
        Math.max(36, Math.floor((width * height) / 3200))
      );
      stars = Array.from({ length: count }, () => {
        const sparkle = Math.random() < 0.075;
        const color = palette[Math.floor(Math.random() * palette.length)];
        const baseOpacity = sparkle
          ? 0.52 + Math.random() * 0.34
          : 0.18 + Math.random() * 0.52;

        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: sparkle ? 1.2 + Math.random() * 1.8 : 0.5 + Math.random() * 1.3,
          baseOpacity,
          twinkleSpeed: 0.008 + Math.random() * 0.02,
          phase: Math.random() * Math.PI * 2,
          color,
          sparkle,
        };
      });
    };

    const resizeCanvas = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      createStars();
    };

    const handleMouseMove = (event) => {
      targetMouseX = (event.clientX - width / 2) * 0.03;
      targetMouseY = (event.clientY - height / 2) * 0.03;
    };

    const addShootingStar = () => {
      if (shootingStars.length >= 2 || Math.random() > 0.012) return;
      shootingStars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.45,
        length: 40 + Math.random() * 80,
        speed: 7 + Math.random() * 9,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        life: 1,
      });
    };

    const drawStar = (star, index) => {
      const opacity = mediaQuery.matches
        ? star.baseOpacity
        : Math.max(
            0.08,
            Math.min(1, star.baseOpacity + Math.sin(tick * star.twinkleSpeed + star.phase + index) * 0.35)
          );
      const x = star.x + currentMouseX * star.size;
      const y = star.y + currentMouseY * star.size;

      context.globalAlpha = opacity;
      context.fillStyle = star.color;
      context.beginPath();

      if (star.sparkle) {
        const size = star.size * 2.1;
        context.moveTo(x, y - size);
        context.lineTo(x + size * 0.28, y - size * 0.28);
        context.lineTo(x + size, y);
        context.lineTo(x + size * 0.28, y + size * 0.28);
        context.lineTo(x, y + size);
        context.lineTo(x - size * 0.28, y + size * 0.28);
        context.lineTo(x - size, y);
        context.lineTo(x - size * 0.28, y - size * 0.28);
        context.closePath();
        context.fill();
      } else {
        context.arc(x, y, star.size, 0, Math.PI * 2);
        context.fill();
      }
    };

    const drawShootingStars = () => {
      addShootingStar();
      for (let index = shootingStars.length - 1; index >= 0; index -= 1) {
        const shootingStar = shootingStars[index];
        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
        shootingStar.life -= 0.015;

        if (
          shootingStar.life <= 0 ||
          shootingStar.x > width + shootingStar.length ||
          shootingStar.y > height + shootingStar.length
        ) {
          shootingStars.splice(index, 1);
          continue;
        }

        const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
        const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;
        const trail = context.createLinearGradient(shootingStar.x, shootingStar.y, tailX, tailY);
        trail.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.life * 0.8})`);
        trail.addColorStop(1, "rgba(184, 170, 255, 0)");

        context.globalAlpha = 1;
        context.strokeStyle = trail;
        context.lineWidth = 1.4;
        context.beginPath();
        context.moveTo(shootingStar.x, shootingStar.y);
        context.lineTo(tailX, tailY);
        context.stroke();
      }
    };

    const render = () => {
      tick += 1;
      currentMouseX += (targetMouseX - currentMouseX) * 0.045;
      currentMouseY += (targetMouseY - currentMouseY) * 0.045;
      context.clearRect(0, 0, width, height);
      stars.forEach(drawStar);
      context.globalAlpha = 1;

      if (!mediaQuery.matches && !document.hidden) {
        drawShootingStars();
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const startAnimation = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      if (!document.hidden) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const handleMotionPreference = () => {
      shootingStars = [];
      startAnimation();
    };

    const handleVisibility = () => {
      startAnimation();
    };

    const handleResize = () => {
      resizeCanvas();
      if (mediaQuery.matches) render();
    };

    resizeCanvas();
    if (mediaQuery.matches) {
      render();
    } else {
      startAnimation();
    }
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    mediaQuery.addEventListener("change", handleMotionPreference);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      mediaQuery.removeEventListener("change", handleMotionPreference);
    };
  }, [pathname, theme]);

  if (!local && (pathname === "/login" || pathname === "/signup")) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`site-ambient-canvas${local ? " site-ambient-canvas--local" : ""}`}
      aria-hidden="true"
    />
  );
}

export default AmbientStarfield;
