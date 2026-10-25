import { Composition } from "remotion";
import { Promo } from "./Promo";
import { DigitaiflowPromo } from "./Digitaiflow";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="ExodusPromo"
      component={Promo}
      durationInFrames={600}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="DigitaiflowPromo"
      component={DigitaiflowPromo}
      durationInFrames={600}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
