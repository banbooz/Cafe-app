import { menuExperiences } from "../lib/menu";

export default function DrinksCustomerPage() {
  const experience = menuExperiences.drinks;
  return <main style={{ padding: 24, fontFamily: "system-ui" }}><p>{experience.eyebrow}</p><h1>{experience.label}</h1><p>{experience.tagline}</p><p>This is a pub-style layout demo for the prototype.</p></main>;
}
