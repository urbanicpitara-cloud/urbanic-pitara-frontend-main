import CollectionEditPage from "./CollectionEditPage";
import { collectionsAPI } from "@/lib/api";
import { Collection } from "@/types/collections";

interface Props {
  params: Promise<{ handle: string }>;
}

export default async function Page({ params }: Props) {
  const {handle} = await params;

  let collection: Collection | null = null;

  try {
    const res = await collectionsAPI.getByHandle(handle);
    collection = res.data;
  } catch (err) {
    console.error("Failed to fetch collection:", err);
  }

  if (!collection) {
    return <p className="p-6 text-center">Collection not found.</p>;
  }

  return <CollectionEditPage initialCollection={collection} />;
}
