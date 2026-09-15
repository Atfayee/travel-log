"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import CityDetail from "./CityDetail";

import {
  createTrip,
} from "../lib/api";

import {
  getErrorMessage,
} from "../lib/getErrorMessage";

import type {
  City,
  Place,
  TripCard,
  CreateTripInput,
  CityTripFilters,
} from "../types/travel";

type CityPageClientProps = {
  city: City;

  initialPlaces:
  Place[];

  initialTrips:
  TripCard[];

  initialFilters:
  CityTripFilters;
};

export default function CityPageClient({
  city,
  initialPlaces,
  initialTrips,
  initialFilters,
}: CityPageClientProps) {
  const router =
    useRouter();

  /*
  =========================
  Server Data Copy
  =========================
  */

  const [
    trips,
    setTrips,
  ] = useState<
    TripCard[]
  >(initialTrips);

  /*
  =========================
  UI State
  =========================
  */

  const [
    showCreateForm,
    setShowCreateForm,
  ] = useState(
    false
  );

  const [
    creatingTrip,
    setCreatingTrip,
  ] = useState(
    false
  );

  const [
    actionError,
    setActionError,
  ] = useState<
    string | null
  >(null);

  /*
  =========================
  Sync Server Refresh
  =========================

  router.refresh() 后：

  Server Component 会重新请求
  getCityTripCardsServer()

  然后新的 initialTrips
  会传回来。

  useState(initialTrips)
  不会自动重新初始化，

  所以必须手动同步。
  =========================
  */

  useEffect(() => {
    setTrips(
      initialTrips
    );
  }, [
    initialTrips,
  ]);

  /*
  =========================
  Navigation
  =========================
  */

  function handleBack() {
    router.push("/");
  }

  function handleOpenTrip(
    trip: TripCard
  ) {
    router.push(
      `/trips/${trip.id}`
    );
  }

  /*
  =========================
  Create Trip
  =========================
  */

  async function handleCreateTrip(
    data: CreateTripInput
  ) {
    try {
      setCreatingTrip(
        true
      );

      setActionError(
        null
      );

      const createdTrip =
        await createTrip(
          data
        );

      /*
      createTrip 返回的是 Trip。

      但是当前页面 state
      是 TripCard[]。

      新 Trip 还没有 Visit，
      所以可以立即构造：

      day_count = 0
      place_count = 0
      total_cost = 0
      */

      const createdCard:
        TripCard = {
        ...createdTrip,

        day_count: 0,

        place_count: 0,

        total_cost: 0,
      };

      /*
      Immediate UI Update
      */

      setTrips(
        (
          current
        ) => [
            createdCard,
            ...current,
          ]
      );

      setShowCreateForm(
        false
      );

      /*
      Server Reconciliation
      */

      router.refresh();
    } catch (error) {
      console.error(
        error
      );

      setActionError(
        getErrorMessage(
          error
        )
      );

      /*
      注意：
      这里不要 throw error。

      我们已经在这一层
      处理错误了。
      */
    } finally {
      setCreatingTrip(
        false
      );
    }
  }

  /*
  =========================
  Render
  =========================
  */

  return (
    <CityDetail
      city={city}
      places={
        initialPlaces
      }
      trips={
        trips
      }
      actionError={
        actionError
      }
      showCreateForm={
        showCreateForm
      }
      creatingTrip={
        creatingTrip
      }

      initialFilters={
        initialFilters
      }
      onBack={
        handleBack
      }
      onOpenTrip={
        handleOpenTrip
      }
      onOpenPlace={(place) => router.push(`/places/${place.id}`)}
      onOpenCreateTrip={() => {
        setActionError(
          null
        );

        setShowCreateForm(
          true
        );
      }}
      onCancelCreateTrip={() => {
        setShowCreateForm(
          false
        );
      }}
      onCreateTrip={
        handleCreateTrip
      }
    />
  );
}
