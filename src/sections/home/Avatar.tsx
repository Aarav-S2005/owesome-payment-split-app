

export default async function Avatar({char}: {char: string}) {
  return (
    <div className={"rounded-full bg-accent p-2 px-4 text-accent-foreground"}>
      {char}
    </div>
  )
}