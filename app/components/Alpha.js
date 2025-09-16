import { useState, useEffect } from "react"
import { Box, Flex } from "@chakra-ui/react"
import { isNil } from "ramda"
import { login } from "../lib/db"

export default ({
  user,
  setUser,
  identity,
  setIdentity,
  setEditUser,
  setEditStatus,
  setEditPost,
}) => {
  const [matrixColumns, setMatrixColumns] = useState([])

  useEffect(() => {
    const matrixChars =
      "01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?"

    const createWeaveColumn = () => {
      const id = Date.now() + Math.random()
      const directions = ["top", "bottom", "left", "right"]
      const direction =
        directions[Math.floor(Math.random() * directions.length)]

      const column = {
        id,
        direction,
        position: Math.random() * 100 + "%",
        duration: 5 + Math.random() * 5,
        chars: Array(Math.floor(20 + Math.random() * 30))
          .fill()
          .map(
            () => matrixChars[Math.floor(Math.random() * matrixChars.length)],
          )
          .join("\n"),
      }

      setMatrixColumns(prev => [...prev, column])

      setTimeout(() => {
        setMatrixColumns(prev => prev.filter(col => col.id !== id))
      }, column.duration * 1000)
    }

    const interval = setInterval(createWeaveColumn, 300)

    // Create initial columns from all directions
    for (let i = 0; i < 16; i++) {
      setTimeout(createWeaveColumn, i * 150)
    }

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap");

        .alpha-body {
          font-family: "Raleway", sans-serif;
          background: radial-gradient(
            circle at center,
            #ffffff 0%,
            #f8fafc 40%,
            #e2e8f0 100%
          );
          background-size: 120% 120%;
          animation: pulseGradient 6s ease-in-out infinite;
          height: calc(100vh - 50px);
          overflow: hidden;
          position: relative;
        }

        @keyframes pulseGradient {
          0%,
          100% {
            background-size: 120% 120%;
          }
          50% {
            background-size: 140% 140%;
          }
        }

        .hero {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: calc(100vh - 170px);
          text-align: center;
          position: relative;
          z-index: 10;
          padding-inline: clamp(16px, 5vw, 96px);
        }

        .logo {
          font-weight: 400;
          font-size: clamp(6rem, 18vw, 18rem);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
          line-height: 0.92;
          text-transform: uppercase;
          background: linear-gradient(180deg, #000000 0%, #333333 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          opacity: 1;
          transition: opacity 2.5s ease;
          transition-delay: 1s;
          padding-inline: 0.08em;
        }

        .tagline {
          font-weight: 300;
          font-size: clamp(1.2rem, 3vw, 2.2rem);
          color: #666666;
        }

        .matrix-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 1;
          pointer-events: none;
        }

        .matrix-column {
          position: absolute;
          font-family: "Courier New", monospace;
          font-size: 14px;
          color: rgba(200, 200, 200, 0.3);
          white-space: pre;
          pointer-events: none;
        }

        .weave-from-top {
          top: -100px;
          animation: weaveFromTop linear infinite;
        }

        .weave-from-bottom {
          bottom: -100px;
          animation: weaveFromBottom linear infinite;
        }

        .weave-from-left {
          left: -100px;
          top: 50%;
          transform: translateY(-50%);
          animation: weaveFromLeft linear infinite;
          writing-mode: vertical-lr;
        }

        .weave-from-right {
          right: -100px;
          top: 50%;
          transform: translateY(-50%);
          animation: weaveFromRight linear infinite;
          writing-mode: vertical-rl;
        }

        @keyframes weaveFromTop {
          0% {
            transform: translateY(-100px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }

        @keyframes weaveFromBottom {
          0% {
            transform: translateY(100px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh);
            opacity: 0;
          }
        }

        @keyframes weaveFromLeft {
          0% {
            transform: translateY(-50%) translateX(-100px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-50%) translateX(100vw);
            opacity: 0;
          }
        }

        @keyframes weaveFromRight {
          0% {
            transform: translateY(-50%) translateX(100px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-50%) translateX(-100vw);
            opacity: 0;
          }
        }

        .footer {
          position: fixed;
          inset-inline: 0;
          bottom: 0;
          padding: 2rem 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          z-index: 20;
          display: flex;
          justify-content: center;
        }

        .footer-content {
          max-width: 760px;
          width: 100%;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .built-by {
          font-size: 0.9rem;
          color: #666;
          white-space: nowrap;
        }
        .built-by a {
          color: #000;
          text-decoration: none;
          font-weight: 500;
        }
        .built-by a:hover {
          color: #333;
        }

        .social-links {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-shrink: 0;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          color: #333;
          text-decoration: none;
          transition: all 0.2s ease;
          backdrop-filter: blur(5px);
        }

        .social-link:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .social-link.x:hover {
          background: #000;
          color: #fff;
          border-color: #000;
        }
        .social-link.github:hover {
          background: #24292e;
          color: #fff;
          border-color: #24292e;
        }
        .social-link.discord:hover {
          background: #5865f2;
          color: #fff;
          border-color: #5865f2;
        }

        .social-link svg {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }

        .connect-button {
          display: none;
        }

        @media (max-width: 768px) {
          .footer-content {
            padding: 0 1rem;
            gap: 1rem;
          }

          .built-by {
            font-size: 0.8rem;
          }

          .social-links {
            gap: 0.5rem;
          }

          .social-link {
            width: 36px;
            height: 36px;
          }

          .social-link svg {
            width: 16px;
            height: 16px;
          }
        }

        @media (max-width: 480px) {
          .footer-content {
            padding: 0 0.5rem;
          }

          .built-by {
            font-size: 0.75rem;
          }

          .social-links {
            gap: 0.3rem;
          }

          .social-link {
            width: 32px;
            height: 32px;
          }

          .social-link svg {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>

      <div className="alpha-body">
        {/* Connect Button */}
        <div
          className="connect-button"
          onClick={async () => {
            const { user, identity } = await login()
            if (!isNil(identity)) {
              setIdentity(identity)
              if (isNil(user)) {
                setEditUser(true)
              } else {
                setUser(user)
              }
            }
          }}
        >
          Connect Wallet
        </div>
        <div className="matrix-container">
          {matrixColumns.map(column => {
            let className = "matrix-column weave-from-" + column.direction
            let style = { animationDuration: `${column.duration}s` }

            if (column.direction === "top" || column.direction === "bottom") {
              style.left = column.position
            } else {
              style.top = column.position
            }

            return (
              <div key={column.id} className={className} style={style}>
                {column.chars}
              </div>
            )
          })}
        </div>

        <div className="hero">
          <h1 className="logo">W</h1>
          <p className="tagline">Social where U and Urs Weave.</p>
        </div>

        <footer className="footer">
          <div className="footer-content">
            <div className="built-by">
              Built by{" "}
              <a
                href={`${process.env.NEXT_PUBLIC_SCAN}/db/${process.env.NEXT_PUBLIC_DB_ID}?url=${process.env.NEXT_PUBLIC_ROLLUP}`}
                target="_blank"
              >
                WeaveDB
              </a>
            </div>
            <div className="social-links">
              <a
                href="https://x.com/weave_db"
                className="social-link x"
                target="_blank"
                rel="noopener"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://github.com/weavedb"
                className="social-link github"
                target="_blank"
                rel="noopener"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://discord.com/invite/YMe3eqf69M"
                className="social-link discord"
                target="_blank"
                rel="noopener"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.445.865-.608 1.25-1.845-.276-3.68-.276-5.487 0-.164-.393-.406-.875-.618-1.25a.077.077 0 00-.078-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.319 13.58.099 18.058a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.031-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.029zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.332-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.175 1.096 2.156 2.42 0 1.332-.956 2.418-2.156 2.418z" />
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
