"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { GET_COLLECTIONS_QUERY } from "@/graphql/collections";
import { useStorefrontQuery } from "@/hooks/useStorefront";
import { GetCollectionsQuery } from "@/types/shopify-graphql";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
const AllCollections = () => {
  const router = useRouter();
  const { data, isLoading } = useStorefrontQuery<GetCollectionsQuery>(
    ["collections"],
    {
      query: GET_COLLECTIONS_QUERY,
    }
  );

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
      {data?.collections.edges.map((collection) => (
        <button
          onClick={() => router.push(`/collections/${collection.node.handle}`)}
          key={collection.node.id}
        >
          <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
            <Image
              src={collection.node.image?.url ?? ""}
              alt={collection.node.image?.altText ?? ""}
              layout="fill"
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
          <h1>{collection.node.title}</h1>
          <p>{collection.node.description}</p>
        </button>
      ))}
    </div>
  );
};

export default AllCollections;
