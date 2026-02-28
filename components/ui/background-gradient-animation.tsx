"use client";
import { useEffect, useRef, useState } from "react";

export const BackgroundGradientAnimation = ({
    children,
    className = "",
    containerClassName = "",
}: {
    children?: React.ReactNode;
    className?: string;
    containerClassName?: string;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setMousePos({ x, y });
        };

        const el = containerRef.current;
        if (el) {
            el.addEventListener("mousemove", handleMouseMove);
        }
        return () => {
            if (el) el.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`min-h-screen w-full relative overflow-hidden ${containerClassName}`}
            style={{
                background: `
          radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(168, 85, 247, 0.35), transparent 40%),
          radial-gradient(800px circle at 20% 80%, rgba(88, 28, 135, 0.3), transparent 50%),
          radial-gradient(600px circle at 80% 20%, rgba(126, 34, 206, 0.2), transparent 50%),
          linear-gradient(135deg, #0a0515 0%, #1a0a3e 50%, #0f0525 100%)
        `,
                transition: "background 0.15s ease-out",
            }}
        >
            <div className={`relative z-10 ${className}`}>{children}</div>
        </div>
    );
};
