import {cookie, delius} from "@/utils/fonts";
import {Button} from "@heroui/react";
import {LucideSquareArrowRightExit} from "lucide-react";
import Avatar from "@/sections/home/Avatar";
import {logoutUser} from "@/lib/actions/auth.actions";


export default async function Header({name}: {name: string}) {
  return (
    <header className={"flex items-center justify-between p-5 bg-background"}>
      <h1 className={`${cookie.className} text-5xl text-default-foreground`}>OweSome</h1>
      <div className={"flex items-center justify-center gap-3"}>
        <Avatar char={name.charAt(0).toUpperCase()} />
        <Button className={`${delius.className}`} onClick={logoutUser}>
          <LucideSquareArrowRightExit />
          Logout
        </Button>
      </div>
    </header>
  )
}