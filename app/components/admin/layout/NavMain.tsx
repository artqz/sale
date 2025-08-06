import { NavGroup } from "./NavGroup";
import { navigationGroups } from "./Navigation";

export function NavMain() {
  return (
    <>
      {navigationGroups.map((props) => (
        <NavGroup key={props.id} {...props} />
      ))}
    </>
  );
}