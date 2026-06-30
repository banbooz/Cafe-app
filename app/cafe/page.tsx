import { menuExperiences } from "../lib/menu";

export default function CafeCustomerPage() {
  const experience = menuExperiences.cafe;
  return <main style={{ padding: 24, fontFamily: "system-ui" }}><p>{experience.eyebrow}</p><h1>{experience.label}</h1><p>{experience.tagline}</p></main>;
}
