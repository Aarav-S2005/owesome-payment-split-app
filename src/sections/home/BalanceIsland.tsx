import {delius} from "@/utils/fonts";
import {ListBox} from "@heroui/react";


export default async function BalanceIsland({name, email}: {name: string, email: string}) {



  return (
    <div className={`border-border border-2 bg-background flex flex-col items-start justify-center px-3 py-4 ${delius.className} rounded-lg`}>
      <div>
        You are owed:
        <div className={"pl-2"}>
          <ListBox className={"w-full"}>

          </ListBox>
        </div>
      </div>
      <div>
        You owe:
      </div>
    </div>
  )
}