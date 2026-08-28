import styles from "./LandingPage.module.scss";
import { Faq } from "./sections/Faq";
import { FinalCta } from "./sections/FinalCta";
import { Footer } from "./sections/Footer";
import { Hero } from "./sections/Hero";
import { HowItWorks } from "./sections/HowItWorks";
import { Nav } from "./sections/Nav";
import { Values } from "./sections/Values";

export function LandingPage() {
  return (
    <main className={styles.wrapper}>
      <Nav />
      <Hero />
      <HowItWorks />
      <Values />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
