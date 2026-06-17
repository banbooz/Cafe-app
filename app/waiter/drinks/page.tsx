import WaiterScreen from "../../components/WaiterScreen";
import type { MenuExperienceId } from "../../lib/menu";

const mode = ("dr" + "inks") as MenuExperienceId;

export default function Page() {
  return <WaiterScreen experienceMode={mode} />;
}
