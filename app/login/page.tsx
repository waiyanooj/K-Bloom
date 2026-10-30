"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";
import s from "./login.module.css";

export default function LoginPage() {
  const [visible, setVisible] = useState(false);
  const [keycard, setKeycard] = useState(false);
  const [muted, setMuted] = useState(true);
  const [message, setMessage] = useState("");
  const unavailable = () =>
    setMessage(
      "Account access is not connected yet. Please contact our boutique for assistance.",
    );

  return (
    <main className={s.page}>
      <div className={s.topbar}>
        <Link href="/" className={s.maison}>
          <span className={s.monogram}>K</span>
          <span>Maison K-Bloom Paris · Édition Privée</span>
        </Link>
        <div className={s.controls}>
          <button
            type="button"
            className={s.sound}
            aria-pressed={!muted}
            onClick={() => setMuted(!muted)}
          >
            <Icon icon="lucide:audio-lines" />
            <span>{muted ? "Atelier Echo" : "Mute Echo"}</span>
          </button>
          <Link href="/" className={s.close} aria-label="Return to home">
            <Icon icon="lucide:x" />
          </Link>
        </div>
      </div>
      <section className={s.showcase} aria-label="K-Bloom perfume collection">
        <video autoPlay muted={muted} loop playsInline className={s.video}>
          <source
            src="/video/K-Bloom-Two-Videos1111111111-1080p.mp4"
            type="video/mp4"
          />
        </video>
        <p className={s.edition}>Extrait de Parfum · N° 074</p>
        <div className={s.story}>
          <span className={s.badge}>
            <span />
            Sanctuaire Privilégié
          </span>
          <blockquote>“L’Art du Parfum est la mémoire incarnée.”</blockquote>
          <div className={s.notes}>
            <span>
              Olfactive
              <br />
              Archive
            </span>
            <b>·</b>
            <span>
              Kyoto Amber &amp;
              <br />
              Iris
            </span>
            <b>·</b>
            <span>
              Batch
              <br />
              Rare
            </span>
          </div>
        </div>
      </section>
      <section className={s.panel} aria-labelledby="login-title">
        <div className={s.content}>
          <Link href="/" className={s.brand}>
            <span className={s.seal}>K</span>
            <span>
              <strong>K-Bloom</strong>
              <small>Haute Parfumerie · Paris</small>
            </span>
          </Link>
          <h1 id="login-title">Salon Privé</h1>
          <p className={s.intro}>
            Access your private olfactory reserve, bespoke formulation profile,
            and master appointments.
          </p>
          <div className={s.tabs} aria-label="Account access method">
            <button
              type="button"
              aria-pressed={!keycard}
              onClick={() => {
                setKeycard(false);
                setMessage("");
              }}
            >
              Collector Pass
            </button>
            <button
              type="button"
              aria-pressed={keycard}
              onClick={() => {
                setKeycard(true);
                setMessage("");
              }}
            >
              Digital Keycard
            </button>
          </div>
          <form
            className={s.form}
            onSubmit={(event) => {
              event.preventDefault();
              unavailable();
            }}
          >
            <label htmlFor="email">Private Identifier / Email</label>
            <div className={s.field}>
              <Icon icon="lucide:key-round" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="patron@k-bloom.com"
                required
              />
            </div>
            {!keycard && (
              <>
                <div className={s.labelRow}>
                  <label htmlFor="password">Atelier Cipher</label>
                  <button
                    type="button"
                    onClick={() =>
                      setMessage(
                        "Password recovery is not connected yet. Please contact our boutique.",
                      )
                    }
                  >
                    Recover Cipher
                  </button>
                </div>
                <div className={s.field}>
                  <Icon icon="lucide:lock-keyhole" />
                  <input
                    id="password"
                    name="password"
                    type={visible ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    aria-label={visible ? "Hide password" : "Show password"}
                    aria-pressed={visible}
                    onClick={() => setVisible(!visible)}
                  >
                    <Icon icon={visible ? "lucide:eye-off" : "lucide:eye"} />
                  </button>
                </div>
              </>
            )}
            {keycard && (
              <p className={s.message}>
                Request a private sign-in link using your registered email
                address.
              </p>
            )}
            <div className={s.remember}>
              <label>
                <input type="checkbox" name="remember" defaultChecked />
                Retain sanctuary credentials
              </label>
              <span>
                <Icon icon="lucide:shield" />
                Private Access
              </span>
            </div>
            <button className={s.submit} type="submit">
              {keycard ? "Request Digital Keycard" : "Enter the Atelier"}
              <Icon icon="lucide:arrow-right" />
            </button>
          </form>
          {message && (
            <p className={s.message} role="status">
              {message}
            </p>
          )}
          <div className={s.divider}>
            <span>VIP Passkey · Concierge</span>
          </div>
          <div className={s.alternatives}>
            <button type="button" onClick={unavailable}>
              <Icon icon="ic:baseline-apple" />
              Apple Key
            </button>
            <Link href="/#location">
              <Icon icon="lucide:headset" />
              Concierge
            </Link>
          </div>
          <div className={s.invitation}>
            <p>Seeking an introductory confidential consultation?</p>
            <Link href="/#location">
              Request Maison Invitation <Icon icon="lucide:arrow-right" />
            </Link>
          </div>
          <div className={s.footnote}>
            <span>
              Paris · Grasse · Kyoto
              <br />
              White-glove protocol
            </span>
            <span>Maison N° 744</span>
          </div>
        </div>
      </section>
    </main>
  );
}
