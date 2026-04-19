"use-client";
import FifthSection from "./fifth-section/fifth-section";
import FirstSection from "./first-section/first-section";
import FourthSection from "./fourth-section/fourth-section";
import Hero from "./hero";
import SecondSection from "./second-section";
import ThirdSection from "./third-section/third-section";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col gap-[40px] lg:gap-[80px]">
      <Hero />
      <div>
        <FirstSection />
        <SecondSection />
        <ThirdSection />
        <FourthSection />
        <FifthSection />
      </div>
    </div>
  );
};

export default Home;
