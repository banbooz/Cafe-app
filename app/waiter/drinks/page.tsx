import WaiterScreen from "../../components/WaiterScreen";

const mode = "dr" + "inks";

export default function Page() {
  return <WaiterScreen experienceMode={mode as any} />;
}
