import { redirect } from "next/navigation";
import { getAuthenticatedHomeDestination } from "@/lib/auth";

export default async function Home() {
  const destination = await getAuthenticatedHomeDestination();

  redirect(destination ?? "/login");
}
