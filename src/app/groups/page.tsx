import { redirect } from "next/navigation";

export default async function GroupsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ groupID?: string }>;
}) {
  const params = await searchParams;
  if (params.groupID) {
    redirect(`/?groupID=${params.groupID}`);
  }
  redirect("/");
}
