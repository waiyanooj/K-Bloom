import ProductCollection from '../components/ProductCollection';
import HomeEffects from '../components/HomeEffects';
import CartCount from "../components/CartCount";
import Footer from '../components/Footer';


export default function HomePage() {
  return (
  <>
    <HomeEffects />

    <header>
      <nav>
        <div className="logo">
          <div className="logoImg">
            <img
              src="/K_Bloom Perfume Logo.png"
              alt="K-Bloom Logo"
            />
          </div>
          <h4 >K-Bloom</h4>
        </div>

        <div className="navbar">
          <div className="navA">
            <a href="#home">Home</a>
            <a href="#product">Product</a>
            <a href="#about">About</a>
            <a href="#location">Location</a>
          </div>

          <div className="cardB">
            <a href="#" className='cart-link' aria-label='Cart'><iconify-icon icon="akar-icons:cart"></iconify-icon> <CartCount/> </a>
            <a href="#"
              ><iconify-icon icon="iconamoon:profile-fill"></iconify-icon></a>
          </div>
        </div>
      </nav>
    </header>
    <section id="home" className="home">
      <video autoPlay muted loop playsInline className="bg-video">
        <source src="/video/K-Bloom.mp4" type="video/mp4" />
      </video>

      <div className="container">
        <div className="container-b">
          <div className="textbox">
            <h1>
              <span className="welcome-line" >
                <span >Welcome to K-Bloom ||</span>
                <img
                  className="welcome-logo"
                  src="/K_Bloom Perfume Logo.png"
                  alt="K-Bloom Perfume Store logo"
                />
              </span>
              <span className="welcome-tagline" >Natural Beauty Awaits</span>
            </h1>
            <div className="spanbar">j</div>
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. <br />
              Quidem qui corrupti quos ratione non hic dolores earum cumque,
              <br />
              molestias, voluptates quia eius dignissimos <br />
              odio minus quibusdam aliquam facilis eligendi consectetur!
            </p>
            <a href="#about" className="see-more" >See More<iconify-icon icon="fluent:more-circle-28-regular"></iconify-icon></a>
          </div>

          <div className="icon-box">
            <div className="social-glass">
              <a href="#" aria-label="TikTok" >
                <iconify-icon icon="ic:baseline-tiktok"></iconify-icon>
              </a>

              <a href="#" aria-label="Facebook">
                <iconify-icon icon="ic:baseline-facebook"></iconify-icon>
              </a>

              <a href="#" aria-label="Instagram">
                <iconify-icon icon="mdi:instagram"></iconify-icon>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container-c">
        <div className="scroll-down">
          <a href="#product" aria-label="Explore the new collection for 2026">
            <span className="collection-title">New Collection</span>
            <span className="collection-row">
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
              <span className="collection-year">2026</span>
            </span>
          </a>
        </div>
      </div>
    </section>

    <ProductCollection />
    <section id="about" className="about-section" aria-labelledby="about-title">
      <div className="section-shell about-layout">
        <div className="about-copy">
          <div className="about-eyebrow">
            <p className="products-eyebrow">ABOUT K-BLOOM</p>
            
          </div>
          <h2 id="about-title">Crafted for the moments that bloom beautifully.</h2>
          <p>
            K-Bloom is a modern fragrance house inspired by soft florals,
            glowing botanicals, and the feeling of fresh confidence in every
            season. We curate clean, expressive perfumes designed to feel as
            graceful as they smell — elegant, personal, and unforgettable.
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

    <section id="location" className="location-section" aria-labelledby="location-title">
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
            <iconify-icon icon="mdi:map-marker-radius"></iconify-icon>
            <p>K’Bloom Perfume Store</p>
          </div>

          <div className="location-detail">
            <iconify-icon icon="mdi:clock-time-four-outline"></iconify-icon>
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
      </div>
    </section>
    <Footer />
  </>);
}
