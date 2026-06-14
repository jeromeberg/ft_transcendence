import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/useAuth";
import { LanguageSwitcher } from "@/components";
import { ChatNotif } from "@/features/chat";
import { useIsMod } from "@/features/auth";

const NAV_LINKS = [
  { key: "play",        href: "/play" },
  { key: "leaderboard", href: "/leaderboard" },
];

const AUTH_NAV_LINKS = [
  { key: "play",        href: "/play" },
  { key: "leaderboard", href: "/leaderboard" },
  { key: "profile",     href: "/profile" },
];

function isActive(href: string, pathname: string) {
  if (href === "/play") return pathname === "/" || pathname.startsWith("/play");
  return pathname === href || pathname.startsWith(href + "/");
}

// == NAVLINK ==

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = isActive(href, pathname);
  return (
    <Link
      to={href}
      className={[
        "px-3 py-1 text-xs uppercase tracking-widest transition-colors duration-100",
        active ? "text-black bg-default" : "text-dim hover:text-default hover:bg-muted",
      ].join(" ")}>
      {active && <span className="mr-1">[*]</span>}
      {label}
    </Link>
  );
}

// == USERMENU ==

function UserMenu({ username, onLogout, isMod }: { username: string; onLogout: () => void; isMod: boolean }) {
  const { t } = useTranslation('nav');
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const itemClass = "block w-full text-left px-4 py-2 text-xs uppercase tracking-widest text-dim hover:text-default hover:bg-muted transition-colors duration-100";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 px-3 py-1 text-xs uppercase tracking-widest text-dim hover:text-default hover:bg-muted transition-colors duration-100"
        >
        {username} <span>{isOpen ? "[-]" : "[+]"}</span>
      </button>

      {isOpen && (
        <ul className="absolute right-0 top-full mt-1 min-w-[10rem] bg-black border border-muted z-50">
          <li><Link to="/profile"          onClick={() => setIsOpen(false)} className={itemClass}>{t('profile')}</Link></li>
          <li><Link to="/chat"             onClick={() => setIsOpen(false)} className={itemClass}>{t('chat')}</Link></li>
          <li><Link to="/friends"          onClick={() => setIsOpen(false)} className={itemClass}>{t('friends')}</Link></li>
          <li><Link to="/friends/requests" onClick={() => setIsOpen(false)} className={itemClass}>{t('requests')}</Link></li>
          <li><Link to="/settings"         onClick={() => setIsOpen(false)} className={itemClass}>{t('settings')}</Link></li>
          {isMod? <li><Link to="/admin" onClick={() => setIsOpen(false)} className={itemClass}>Admin</Link></li> : null }
          <li>
            <button
              type="button"
              onClick={() => { onLogout(); setIsOpen(false); }}
              className="block w-full text-left px-4 py-2 text-xs uppercase tracking-widest text-danger hover:text-black hover:bg-danger transition-colors duration-100">
              {t('logout')}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

// == MOBILEMENU ==

function MobileMenu({ pathname, user, onLogout, isMod }: {
  pathname: string;
  user: { username: string } | null;
  onLogout: () => void;
  isMod: boolean;
}) {
  const { t } = useTranslation('nav');
  const linkClass = "block w-full px-3 py-2 text-xs uppercase tracking-widest transition-colors duration-100";

  return (
    <ul className="md:hidden border-t border-muted px-4 pb-3 flex flex-col gap-1">
      {NAV_LINKS.map(({ key, href }) => {
        const active = isActive(href, pathname);
        return (
          <li key={key}>
            <Link
              to={href}
              className={[linkClass, active ? "text-black bg-default" : "text-dim hover:text-default hover:bg-muted"].join(" ")}>
              {active && <span className="mr-1">[*]</span>}
              {t(key)}
            </Link>
          </li>
        );
      })}

      <li>
        {user ? (
          <>
            <Link to="/profile"          className={`${linkClass} text-dim hover:text-default hover:bg-muted`}>{t('profile')}</Link>
            <Link to="/chat"             className={`${linkClass} text-dim hover:text-default hover:bg-muted`}>{t('chat')}</Link>
            <Link to="/friends"          className={`${linkClass} text-dim hover:text-default hover:bg-muted`}>{t('friends')}</Link>
            <Link to="/friends/requests" className={`${linkClass} text-dim hover:text-default hover:bg-muted`}>{t('requests')}</Link>
            <Link to="/settings"         className={`${linkClass} text-dim hover:text-default hover:bg-muted`}>{t('settings')}</Link>
            {isMod? <Link to="/admin" className={`${linkClass} text-dim hover:text-default hover:bg-muted`}>Admin</Link> : null }
            <button type="button" onClick={onLogout} className={`text-left ${linkClass} text-danger hover:text-black hover:bg-danger`}>
              {t('logout')}
            </button>
          </>
        ) : (
          <Link to="/signin" className={`${linkClass} text-dim hover:text-default hover:bg-muted`}>{t('sign_in')}</Link>
        )}
      </li>
    </ul>
  );
}

// == NAVBAR ==

export default function Navbar() {
  const { t } = useTranslation('nav');
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const isMod = useIsMod();

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <nav className="w-full bg-black/90 font-mono">
      <div className="relative flex items-center justify-between px-4 h-12">
        <Link to="/" className="text-default font-bold uppercase tracking-[0.3em] text-sm select-none whitespace-nowrap flex items-center gap-2">
          <img src="/favicon.png" className="w-5 h-5 object-contain" alt="" />
          Typerun
        </Link>

        <div className="md:hidden flex items-center gap-1">
          {user? ( <ChatNotif/> ) : null}
          <LanguageSwitcher />
          <button
            type="button"
            className="px-2 py-1 text-xs uppercase tracking-widest text-dim border border-dim hover:text-default hover:border-default transition-colors duration-100"
            onClick={() => setMenuOpen(!menuOpen)}>
            {t('menu')}
          </button>
        </div>

        <ul className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
          {(user ? AUTH_NAV_LINKS : NAV_LINKS).map(({ key, href }) => (
            <li key={key}>
              <NavLink href={href} label={t(key)} pathname={pathname} />
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-1">
          {user? ( <ChatNotif/> ) : null}
          <LanguageSwitcher />
          {user ? (
            <UserMenu username={user.username} onLogout={logout} isMod={isMod}/>
          ) : (
            <Link to="/signin"
              className="px-3 py-1 text-xs uppercase tracking-widest text-dim hover:text-default hover:bg-muted transition-colors duration-100">
              {t('sign_in')}
            </Link>
          )}
        </div>

      </div>

      {menuOpen && <MobileMenu pathname={pathname} user={user} onLogout={logout} isMod={isMod}/>}
    </nav>
  );
}
