"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import TripDetail from "./TripDetail";

import type {
  City,
  Place,
  Trip,
  TripVisit,
  TripSummary,
  ExpenseBreakdown,
  PlaceSearchResult,
  UpdateTripInput,
  CreateVisitInput,
  CreateVisitWithPlaceInput,
  UpdateVisitInput,
  VisitMoveDirection,
  TripOverview,

} from "../types/travel";

import {
  searchPlaces,
  updateTrip,
  deleteTrip,
  createVisit,
  moveVisit,
  moveVisitToDay,
  createVisitWithPlace,
  updateVisit,
  deleteVisit,
} from "../lib/api";

import {
  getErrorMessage,
} from "../lib/getErrorMessage";

type TripPageClientProps = {
  initialTrip:
  Trip;

  city:
  City;

  initialPlaces:
  Place[];

  initialTripVisits:
  TripVisit[];

  initialSummary:
  TripSummary;

  initialBreakdown:
  ExpenseBreakdown;

  initialOverview:
  TripOverview;
};

export default function TripPageClient({
  initialTrip,
  city,
  initialPlaces,
  initialTripVisits,
  initialSummary,
  initialBreakdown,
  initialOverview,
}: TripPageClientProps) {
  const router =
    useRouter();

  /*
  =========================
  Server Data → Client State
  =========================
  */

  const [
    trip,
    setTrip,
  ] =
    useState<Trip>(
      initialTrip
    );

  const [
    places,
    setPlaces,
  ] =
    useState<Place[]>(
      initialPlaces
    );

  const [
    tripVisits,
    setTripVisits,
  ] =
    useState<
      TripVisit[]
    >(
      initialTripVisits
    );

  const [
    summary,
    setSummary,
  ] =
    useState<
      TripSummary
    >(
      initialSummary
    );

  const [
    breakdown,
    setBreakdown,
  ] =
    useState<
      ExpenseBreakdown
    >(
      initialBreakdown
    );

  const [
    overview,
    setOverview,
  ] = useState(
    initialOverview
  );


  /*
  =========================
  Sync Server Props
  =========================
  */

  useEffect(() => {
    setTrip(initialTrip);

    setPlaces(
      initialPlaces
    );

    setTripVisits(
      initialTripVisits
    );

    setSummary(
      initialSummary
    );

    setBreakdown(
      initialBreakdown
    );

    setOverview(
      initialOverview
    );
  }, [
    initialTrip,
    initialPlaces,
    initialTripVisits,
    initialSummary,
    initialBreakdown,
    initialOverview,
  ]);

  /*
  =========================
  UI State
  =========================
  */

  const [
    showEditForm,
    setShowEditForm,
  ] =
    useState(false);

  const [
    showVisitForm,
    setShowVisitForm,
  ] =
    useState(false);

  const [
    editingVisit,
    setEditingVisit,
  ] =
    useState<
      TripVisit | null
    >(null);

  /*
  =========================
  Mutation State
  =========================
  */

  const [
    editingTrip,
    setEditingTrip,
  ] =
    useState(false);

  const [
    creatingVisit,
    setCreatingVisit,
  ] =
    useState(false);

  const [
    updatingVisit,
    setUpdatingVisit,
  ] =
    useState(false);

  const [
    movingVisitId,
    setMovingVisitId,
  ] =
    useState<number | null>(
      null
    );

  const [
    movingDayVisitId,
    setMovingDayVisitId,
  ] =
    useState<number | null>(
      null
    );

  const [
    deletingTrip,
    setDeletingTrip,
  ] =
    useState(false);

  const [
    deletingVisitId,
    setDeletingVisitId,
  ] =
    useState<
      number | null
    >(null);

  const [
    actionError,
    setActionError,
  ] =
    useState<
      string | null
    >(null);

  /*
  =========================
  Visit Sort Helper
  =========================
  */

  function sortVisits(
    visits:
      TripVisit[]
  ) {
    return [
      ...visits,
    ].sort(
      (a, b) => {
        const dayA =
          a.day_number ??
          999;

        const dayB =
          b.day_number ??
          999;

        if (
          dayA !== dayB
        ) {
          return (
            dayA -
            dayB
          );
        }

        return (
          (
            a.order_index ??
            999
          ) -
          (
            b.order_index ??
            999
          )
        );
      }
    );
  }

  function addVisitToState(
    newVisit:
      TripVisit
  ) {
    setTripVisits(
      (
        currentVisits
      ) =>
        sortVisits([
          ...currentVisits,
          newVisit,
        ])
    );
  }

  /*
  =========================
  Update Trip
  =========================
  */

  async function handleUpdateTrip(
    payload:
      UpdateTripInput
  ) {
    try {
      setEditingTrip(
        true
      );

      setActionError(
        null
      );

      const updatedTrip =
        await updateTrip(
          trip.id,
          payload
        );

      setTrip(
        updatedTrip
      );

      setShowEditForm(
        false
      );

      router.refresh();
    } catch (err) {
      console.error(
        err
      );

      setActionError(
        getErrorMessage(
          err
        )
      );
    } finally {
      setEditingTrip(
        false
      );
    }
  }

  /*
  =========================
  Delete Trip
  =========================
  */

  async function handleDeleteTrip() {
    const confirmed =
      window.confirm(
        `确定删除「${trip.title}」吗？这个旅行下的所有 Visit 记录也会删除。`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTrip(
        true
      );

      setActionError(
        null
      );

      await deleteTrip(
        trip.id
      );

      router.push(
        `/cities/${city.id}`
      );

      router.refresh();
    } catch (err) {
      console.error(
        err
      );

      setActionError(
        getErrorMessage(
          err
        )
      );
    } finally {
      setDeletingTrip(
        false
      );
    }
  }

  /*
  =========================
  Search Places
  =========================
  */

  async function handleSearchPlaces(
    query: string
  ): Promise<
    PlaceSearchResult[]
  > {
    return searchPlaces(
      query,
      city.name
    );
  }

  /*
  =========================
  Create Existing Visit
  =========================
  */

  async function handleCreateExistingVisit(
    payload:
      CreateVisitInput
  ) {
    try {
      setCreatingVisit(
        true
      );

      setActionError(
        null
      );

      const newVisit =
        await createVisit(
          payload
        );

      addVisitToState(
        newVisit
      );

      setShowVisitForm(
        false
      );

      router.refresh();
    } catch (err) {
      console.error(
        err
      );

      setActionError(
        getErrorMessage(
          err
        )
      );
    } finally {
      setCreatingVisit(
        false
      );
    }
  }

  /*
  =========================
  Create New Place + Visit
  =========================
  */

  async function handleCreateNewVisit(
    payload:
      CreateVisitWithPlaceInput
  ) {
    try {
      setCreatingVisit(
        true
      );

      setActionError(
        null
      );

      const newVisit =
        await createVisitWithPlace(
          trip.id,
          payload
        );

      addVisitToState(
        newVisit
      );

      setPlaces(
        (
          currentPlaces
        ) => {
          const exists =
            currentPlaces.some(
              (
                place
              ) =>
                place.id ===
                newVisit
                  .place.id
            );

          if (
            exists
          ) {
            return currentPlaces;
          }

          return [
            ...currentPlaces,
            newVisit.place,
          ];
        }
      );

      setShowVisitForm(
        false
      );

      router.refresh();
    } catch (err) {
      console.error(
        err
      );

      setActionError(
        getErrorMessage(
          err
        )
      );
    } finally {
      setCreatingVisit(
        false
      );
    }
  }

  /*
  =========================
  Open Visit Edit
  =========================
  */

  function handleOpenEditVisit(
    visit:
      TripVisit
  ) {
    setActionError(
      null
    );

    setEditingVisit(
      visit
    );

    setShowVisitForm(
      false
    );

    setShowEditForm(
      false
    );
  }

  /*
  =========================
  Update Visit
  =========================
  */

  async function handleUpdateVisit(
    payload:
      UpdateVisitInput
  ) {
    if (
      !editingVisit
    ) {
      return;
    }

    try {
      setUpdatingVisit(
        true
      );

      setActionError(
        null
      );

      const updatedVisit =
        await updateVisit(
          editingVisit.id,
          payload
        );

      setTripVisits(
        (
          currentVisits
        ) =>
          sortVisits(
            currentVisits.map(
              (
                visit
              ) =>
                visit.id ===
                  updatedVisit.id
                  ? updatedVisit
                  : visit
            )
          )
      );

      setEditingVisit(
        null
      );

      router.refresh();
    } catch (err) {
      console.error(
        err
      );

      setActionError(
        getErrorMessage(
          err
        )
      );
    } finally {
      setUpdatingVisit(
        false
      );
    }
  }

  /*
  =========================
  Delete Visit
  =========================
  */

  async function handleDeleteVisit(
    visit:
      TripVisit
  ) {
    const confirmed =
      window.confirm(
        `确定删除「${visit.place.name}」这条旅行记录吗？`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingVisitId(
        visit.id
      );

      setActionError(
        null
      );

      await deleteVisit(
        visit.id
      );

      setTripVisits(
        (
          currentVisits
        ) =>
          currentVisits.filter(
            (
              item
            ) =>
              item.id !==
              visit.id
          )
      );

      if (
        editingVisit?.id ===
        visit.id
      ) {
        setEditingVisit(
          null
        );
      }

      router.refresh();
    } catch (err) {
      console.error(
        err
      );

      setActionError(
        getErrorMessage(
          err
        )
      );
    } finally {
      setDeletingVisitId(
        null
      );
    }
  }

  return (
    <TripDetail
      trip={
        trip
      }
      overview={overview}
      cityName={
        city.name
      }

      places={
        places
      }

      tripVisits={
        tripVisits
      }

      summary={
        summary
      }

      breakdown={
        breakdown
      }

      actionError={
        actionError
      }

      showEditForm={
        showEditForm
      }

      showVisitForm={
        showVisitForm
      }

      editingVisit={
        editingVisit
      }

      editingTrip={
        editingTrip
      }

      creatingVisit={
        creatingVisit
      }

      updatingVisit={
        updatingVisit
      }

      movingVisitId={
        movingVisitId
      }

      movingDayVisitId={
        movingDayVisitId
      }

      onUpdateVisitPhoto={
        handleUpdateVisitPhoto
      }

      onUpdateCoverImage={
        handleUpdateCoverImage
      }

      onMoveVisit={
        handleMoveVisit
      }


      onMoveVisitToDay={
        handleMoveVisitToDay
      }

      deletingTrip={
        deletingTrip
      }

      deletingVisitId={
        deletingVisitId
      }



      onBack={() =>
        router.push(
          `/cities/${city.id}`
        )
      }

      onOpenPlace={(
        place
      ) =>
        router.push(
          `/places/${place.id}?tripId=${trip.id}`
        )
      }

      onOpenEdit={() => {
        setActionError(
          null
        );

        setShowEditForm(
          true
        );

        setShowVisitForm(
          false
        );

        setEditingVisit(
          null
        );
      }}

      onCancelEdit={() =>
        setShowEditForm(
          false
        )
      }

      onUpdateTrip={
        handleUpdateTrip
      }

      onDeleteTrip={
        handleDeleteTrip
      }

      onOpenVisitForm={() => {
        setActionError(
          null
        );

        setShowVisitForm(
          true
        );

        setShowEditForm(
          false
        );

        setEditingVisit(
          null
        );
      }}

      onCancelVisitForm={() =>
        setShowVisitForm(
          false
        )
      }

      onSearchPlaces={
        handleSearchPlaces
      }

      onCreateExistingVisit={
        handleCreateExistingVisit
      }

      onCreateNewVisit={
        handleCreateNewVisit
      }

      onEditVisit={
        handleOpenEditVisit
      }

      onCancelEditVisit={() =>
        setEditingVisit(
          null
        )
      }

      onUpdateVisit={
        handleUpdateVisit
      }

      onDeleteVisit={
        handleDeleteVisit
      }
    />
  );

  /*
    =========================
    Move Visit
    =========================
    */

  async function handleMoveVisit(
    visit: TripVisit,
    direction: VisitMoveDirection
  ) {
    try {
      setMovingVisitId(
        visit.id
      );

      setActionError(
        null
      );

      const updatedDayVisits =
        await moveVisit(
          visit.id,
          direction
        );

      setTripVisits(
        (currentVisits) => {
          const updatedIds =
            new Set(
              updatedDayVisits.map(
                (item) =>
                  item.id
              )
            );

          const otherVisits =
            currentVisits.filter(
              (item) =>
                !updatedIds.has(
                  item.id
                )
            );

          return sortVisits([
            ...otherVisits,
            ...updatedDayVisits,
          ]);
        }
      );

      router.refresh();
    } catch (err) {
      console.error(err);

      setActionError(
        getErrorMessage(err)
      );
    } finally {
      setMovingVisitId(
        null
      );
    }
  }

  async function handleMoveVisitToDay(
    visit: TripVisit,
    targetDay: number
  ) {
    const currentDay =
      visit.day_number ?? 1;

    if (
      currentDay ===
      targetDay
    ) {
      return;
    }

    try {
      setMovingDayVisitId(
        visit.id
      );

      setActionError(
        null
      );

      const updatedVisits =
        await moveVisitToDay(
          visit.id,
          targetDay
        );

      setTripVisits(
        sortVisits(
          updatedVisits
        )
      );

      router.refresh();
    } catch (err) {
      console.error(err);

      setActionError(
        getErrorMessage(
          err
        )
      );
    } finally {
      setMovingDayVisitId(
        null
      );
    }
  }
  async function handleUpdateCoverImage(
    url: string
  ) {
    try {
      setActionError(
        null
      );

      const updatedTrip =
        await updateTrip(
          trip.id,
          {
            cover_image_url:
              url,
          }
        );

      setTrip(
        updatedTrip
      );

      router.refresh();
    } catch (err) {
      console.error(
        err
      );

      setActionError(
        getErrorMessage(
          err
        )
      );
    }
  }

  async function handleUpdateVisitPhoto(
    visit: TripVisit,
    url: string
  ) {
    try {
      setActionError(
        null
      );

      const updated =
        await updateVisit(
          visit.id,
          {
            photo_url:
              url,
          }
        );

      setTripVisits(
        (current) =>
          sortVisits(
            current.map(
              (item) =>
                item.id ===
                  visit.id
                  ? updated
                  : item
            )
          )
      );

      router.refresh();
    } catch (err) {
      console.error(
        err
      );

      setActionError(
        getErrorMessage(
          err
        )
      );
    }
  }

}


