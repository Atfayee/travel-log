import HomePageClient from "../components/HomePageClient";

import {
  getCitiesServer,
} from "../lib/server-api";

export default async function HomePage() {
  const cities =
    await getCitiesServer();

  return (
    <HomePageClient
      cities={
        cities
      }
    />
  );
}