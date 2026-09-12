import {redirect} from "next/navigation";
import {getUser} from "@/lib/actions/auth.actions";
import Header from "@/sections/home/Header";
import BalanceIsland from "@/sections/home/BalanceIsland";
import GroupsIsland from "@/sections/home/GroupsIsland";

export default async function Home() {

  try {
    const {name, email} = await getUser();

    return (
      <div className={"bg-surface min-h-screen"}>
        <Header name={name} />
        <div className={"flex items-center justify-center px-5 py-4 flex-col md:flex-row"}>
          <div className={"basis-1/3"}>
            <BalanceIsland name={name} email={email} />
          </div>
          <div className={"basis-2/3"}>
            <GroupsIsland />
          </div>
        </div>
      </div>

    );
  } catch (e) {
    redirect("/auth");
  }
}
