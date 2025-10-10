"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { collectionsRepository, type Collection } from "@/lib/api/repositories/collections";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
const AllCollections = () => {
  const router = useRouter();
  const [isLoading, setLoading] = React.useState(true);
  const [collections, setCollections] = React.useState<Collection[]>([]);

  React.useEffect(() => {
    let active = true;
    collectionsRepository
      .list()
      .then((items) => {
        if (active) setCollections(items);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6 w-full my-10">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 w-full my-10">
      {collections.map((collection) => (
        <button
          onClick={() => router.push(`/collections/${collection.handle}`)}
          key={collection.id}
        >
          <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
            <Image
              src={collection.image?.url ?? ""}
              alt={collection.image?.altText ?? ""}
              layout="fill"
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
          <h1>{collection.title}</h1>
          <p>{collection.description}</p>
        </button>
      ))}
    </div>
  );
};

export default AllCollections;
