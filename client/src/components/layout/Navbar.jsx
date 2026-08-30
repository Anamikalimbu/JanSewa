import React, { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <a href="/" className="navbar__logo">
          <span className="logo-icon">JS</span>
          <span className="logo-text">JanSewa</span>
        </a>

        {/* Desktop links */}
        <ul className="navbar__links">
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#departments">Services</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        {/* CTA */}
        <div className="navbar__actions">
          <button className="btn btn--ghost">Login</button>
          <button className="btn btn--primary">Register</button>
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-menu">
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#departments" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <div className="mobile-menu__btns">
            <button className="btn btn--ghost">Login</button>
            <button className="btn btn--primary">Register</button>
          </div>
        </div>
      )}
    </nav>
  );
}