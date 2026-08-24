"use client";

import type { ReactNode } from "react";

import styles from "@/app/page.module.css";

export type ShellScreen = "catalog" | "composer" | "sessions";

type AppShellProps = {
  active: ShellScreen;
  onNavigate: (screen: ShellScreen) => void;
  children: ReactNode;
};

export function AppShell({ active, onNavigate, children }: AppShellProps) {
  const isHome = active === "catalog";

  return (
    <main className={styles.dashboard}>
      <aside className={styles.sideMenu}>
        <button className={styles.dashboardBrand} onClick={() => onNavigate("catalog")} type="button">
          <span>JH</span> Just Do HIIT
        </button>
        <nav aria-label="Menu de l'application" className={styles.sideNav}>
          <button className={active === "catalog" ? styles.activeNav : undefined} onClick={() => onNavigate("catalog")} type="button">
            <span>01</span> Aujourd&apos;hui
          </button>
          <button className={active === "composer" ? styles.activeNav : undefined} onClick={() => onNavigate("composer")} type="button">
            <span>02</span> Composer
          </button>
          <button className={active === "sessions" ? styles.activeNav : undefined} onClick={() => onNavigate("sessions")} type="button">
            <span>03</span> Séances
          </button>
        </nav>
        <button className={styles.shellCta} onClick={() => onNavigate("sessions")} type="button">
          Démarrer
        </button>
        <div className={styles.sideNote}>
          <span>MODE MAINS LIBRES</span>
          <p>Le chrono et la voix te guident, même quand tu ne regardes plus l&apos;écran.</p>
        </div>
      </aside>
      <section className={isHome ? styles.dashboardContent : styles.hubContent}>{children}</section>
      <nav aria-label="Navigation mobile" className={styles.bottomMenu}>
        <button className={active === "catalog" ? styles.activeNav : undefined} onClick={() => onNavigate("catalog")} type="button">
          <span>●</span> Aujourd&apos;hui
        </button>
        <button className={active === "composer" ? styles.activeNav : undefined} onClick={() => onNavigate("composer")} type="button">
          <span>＋</span> Composer
        </button>
        <button className={active === "sessions" ? styles.activeNav : undefined} onClick={() => onNavigate("sessions")} type="button">
          <span>□</span> Séances
        </button>
      </nav>
    </main>
  );
}
