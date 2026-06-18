import FifthSection from "./fifth-section/fifth-section";
import FirstSection from "./first-section/first-section";
import FourthSection from "./fourth-section/fourth-section";
import Hero from "./hero";
import IntroSection from "./intro-section";
import SecondSection from "./second-section";
import ThirdSection from "./third-section/third-section";
import ContactSection from "./contact-section";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col gap-[40px] lg:gap-[80px]">
      <Hero />
      <div>
        <IntroSection />
        <FifthSection />
        <FirstSection />
        <SecondSection />
        <ThirdSection />
        <FourthSection />
      </div>
      <ContactSection />
    </div>
  );
};

export default Home;
