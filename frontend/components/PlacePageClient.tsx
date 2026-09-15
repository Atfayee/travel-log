"use client";

import {
    useRouter,
} from "next/navigation";

import PlaceDetail from "./PlaceDetail";

import type {
    City,
    Place,
    Visit,
} from "../types/travel";

type PlacePageClientProps = {
    place: Place;

    city: City;

    visits: Visit[];

    fromTripId?: string | null;
};

export default function PlacePageClient({
    place,
    city,
    visits,
    fromTripId,
}: PlacePageClientProps) {
    const router =
        useRouter();

    function handleBack() {
        /*
          如果 URL 是：
    
          /places/3?tripId=1
    
          说明用户是从 Trip 页面进来的。
        */
        if (fromTripId) {
            router.push(
                `/trips/${fromTripId}`
            );

            return;
        }

        /*
          否则默认回到所属 City。
        */
        router.push(
            `/cities/${city.id}`
        );
    }

    return (
        <PlaceDetail
            place={place}
            cityName={city.name}
            visits={visits}
            onBack={handleBack}
        />
    );
}