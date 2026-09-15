"use client";

import {
  useRouter,
} from "next/navigation";

import HomeView from "./HomeView";

import type {
  City,
} from "../types/travel";

type HomePageClientProps = {
  cities: City[];
};

export default function HomePageClient({
  cities,
}: HomePageClientProps) {
  const router =
    useRouter();

  return (
    <HomeView
      cities={cities}

      onSelectCity={(
        city
      ) =>
        router.push(
          `/cities/${city.id}`
        )
      }
    />
  );
}