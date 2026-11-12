import Icon from "../components/Icon";
import ProductCollection from "../components/ProductCollection";
import HomeEffects from "../components/HomeEffects";
import HomeHeader from "../components/HomeHeader";
import Footer from "../components/Footer";
import DeliveryInfo from "../components/DeliveryInfo";

export default function HomePage() {
  return (
    <>
      <HomeEffects />

      <HomeHeader />
      <section id="home" className="home">
        <video autoPlay muted loop playsInline className="bg-video">
          <source src="/video/K-Bloom.mp4" type="video/mp4" />
        </video>

        <div className="container">
          <div className="container-b">
            <div className="textbox">
              <h1>
                <span className="welcome-line">
                  <span>Welcome to K-Bloom</span>
                  <img
                    className="welcome-logo"
                    src="/K_Bloom Perfume Logo.png"
                    alt="K-Bloom Perfume Store logo"
                  />
                </span>
                <span className="welcome-tagline">Natural Beauty Awaits</span>
              </h1>
              <p>
                Soft florals. Fresh beginnings. Discover your signature scent
                and make every day a little more you.
              </p>
              <a href="#about" className="see-more">
                Our story
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </a>
            </div>

            <div className="icon-box">
              <span className="social-label">Follow along</span>
              <div className="social-glass">
                <a
                  href="https://www.tiktok.com/@k_bloom_2026?is_from_webapp=1&sender_device=pc"
                  aria-label="TikTok"
                >
                  <Icon icon="ic:baseline-tiktok" />
                </a>

                <a href="ဋ" aria-label="Facebook">
                  <Icon icon="ic:baseline-tiktok" />
                </a>

                <a
                  href="https://www.facebook.com/share/1Gv7npto3o/"
                  aria-label="Instagram"
                >
                  <Icon icon="ic:baseline-facebook" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="container-c">
          <div className="scroll-down">
            <a href="#product" aria-label="Explore the new collection for 2026">
              <span className="collection-title">
                New Collection <span className="collection-year">2026</span>
              </span>
              <span className="collection-arrow" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path
                    d="M18 4V31M6 19L18 31L30 19"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </section>

      <ProductCollection />
      <section
        id="about"
        className="about-section"
        aria-labelledby="about-title"
      >
        <div className="section-shell about-layout">
          <div className="about-copy">
            <div className="about-eyebrow">
              <p className="products-eyebrow">ABOUT K-BLOOM</p>
            </div>
            <h2 id="about-title">
              Crafted for the moments that bloom beautifully.
            </h2>
            <p>
              Every fragrance tells a story. From delicate florals and bright
              citrus to warm, lingering woods, K-Bloom brings together scents to
              complement your mood and make everyday moments feel special. Find
              the notes that feel like you, and leave a beautiful impression
              wherever you go.
            </p>
            <div className="about-features" aria-label="Brand highlights">
              <div className="feature-item">
                <strong>01</strong>
                <span>Botanical ingredients</span>
              </div>
              <div className="feature-item">
                <strong>02</strong>
                <span>Long-lasting blends</span>
              </div>
              <div className="feature-item">
                <strong>03</strong>
                <span>Luxury in every note</span>
              </div>
            </div>
          </div>

          <div className="about-media" aria-label="Brand film">
            <video
              className="about-video"
              src="/hailuo-03_A_premium_perfume_bottle_on_a_clean_light_pink_background_soft_studio_lighting_e-0 (1).mp4"
              autoPlay
              muted
              loop
              playsInline
              poster="/img/dff1e28e5d8071ba56159d70ac7642ef.jpg"
            ></video>
            <div className="video-overlay">
              <span className="video-tag">Hailuo-3 Inspired</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="location"
        className="location-section"
        aria-labelledby="location-title"
      >
        <div className="section-shell location-shell">
          <div className="location-card">
            <p className="products-eyebrow">FIND US</p>
            <h3 id="location-title">Visit our boutique.</h3>

            <div className="location-map">
              <iframe
                title="K’Bloom Perfume Store location on Google Maps"
                src="https://www.google.com/maps?q=16.8693203,96.1129924&z=17&output=embed"
                width="640"
                height="240"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="location-detail">
              <Icon icon="mdi:map-marker-radius" />
              <p>K’Bloom Perfume Store</p>
            </div>

            <div className="location-detail">
              <Icon icon="mdi:clock-time-four-outline" />
              <p>Mon - Sun: 10:00 AM - 8:00 PM</p>
            </div>

            <a
              className="location-link"
              href="https://maps.app.goo.gl/GtJ4YMjKrFDTGovk7"
              target="_blank"
              rel="noreferrer"
            >
              Get directions
            </a>
          </div>
          <DeliveryInfo />
        </div>
      </section>
      <Footer />
    </>
  );
}
