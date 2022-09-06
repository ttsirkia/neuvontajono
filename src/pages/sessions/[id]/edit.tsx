import { add, format, parse, startOfDay } from "date-fns";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { useIntl } from "react-intl";

import { ErrorPanel } from "../../../components/ErrorPanel";
import { SessionDTOWithDates, SessionEditForm } from "../../../components/SessionEditForm";
import { Spinner } from "../../../components/Spinner";
import { convertTimeStringToInt } from "../../../utils/dates";
import { getTypedFormattedString, TypedFormattedMessage } from "../../../utils/translation";
import { trpc } from "../../../utils/trpc";

// ************************************************************************************************

const SessionEditPage: NextPage = () => {
  const router = useRouter();
  const sessionId = router.query.id!.toString();
  const singleSessionQuery = trpc.useQuery(["settings.getSingleSession", { sessionId }], {
    onSuccess: (data) => {
      if (data) {
        setValues({
          name: data.name,
          locations: data.locations.join(", "),
          languages: data.languages.join(", "),
          assistants: data.assistants.join(", "),
          weekday: data.weekday.toString(),
          startTime: format(
            add(startOfDay(new Date()), { minutes: data.startTime }),
            getTypedFormattedString(intl, "time-input-format")
          ),
          endTime: format(
            add(startOfDay(new Date()), { minutes: data.endTime }),
            getTypedFormattedString(intl, "time-input-format")
          ),
          queueOpenTime: format(
            add(startOfDay(new Date()), { minutes: data.queueOpenTime }),
            getTypedFormattedString(intl, "time-input-format")
          ),
          remoteMethod: data.remoteMethod,
          participationPolicy: data.participationPolicy.toString(),
          startDate: parse(data.startDate, "yyyy-MM-dd", new Date()),
          endDate: parse(data.endDate, "yyyy-MM-dd", new Date()),
          active: data.active ? "true" : "",
          excludedDates: [...data.excludedDates],
          remoteHelp: data.remoteHelp,
        });
      }
    },
    onError: (data) => {
      if (data && (data.data?.code === "FORBIDDEN" || data.data?.code === "UNAUTHORIZED")) {
        toast.error(getTypedFormattedString(intl, "alert-no-teacher"));
        router.replace("/");
      }
    },
  });

  const updateSessionMutation = trpc.useMutation(["settings.createOrUpdateSession"]);
  const queryUtils = trpc.useContext();
  const intl = useIntl();
  const [values, setValues] = useState<SessionDTOWithDates | null>(null);

  const onSubmit: SubmitHandler<SessionDTOWithDates> = (data) => {
    updateSessionMutation.mutate(
      {
        sessionId,
        name: data.name,
        locations: data.locations,
        languages: data.languages,
        assistants: data.assistants,
        weekday: +data.weekday,
        startTime: convertTimeStringToInt(data.startTime, getTypedFormattedString(intl, "time-input-format")),
        endTime: convertTimeStringToInt(data.endTime, getTypedFormattedString(intl, "time-input-format")),
        queueOpenTime: convertTimeStringToInt(data.queueOpenTime, getTypedFormattedString(intl, "time-input-format")),
        remoteMethod: data.remoteMethod,
        participationPolicy: +data.participationPolicy,
        startDate: format(data.startDate, "yyyy-MM-dd"),
        endDate: format(data.endDate, "yyyy-MM-dd"),
        active: data.active === "true",
        excludedDates: data.excludedDates,
        remoteHelp: data.remoteHelp,
      },
      {
        onSuccess: () => {
          toast.success(getTypedFormattedString(intl, "alert-session-saved"));
          queryUtils.invalidateQueries(["course.getAllSessions"]);
          queryUtils.invalidateQueries(["settings.getSingleSession", { sessionId }]);
          router.push("/settings");
        },
        onError: () => {
          toast.error(getTypedFormattedString(intl, "alert-session-save-failed"));
        },
      }
    );
  };

  return (
    <div>
      <h3>
        <TypedFormattedMessage id="modify-edit-title" />
      </h3>
      {singleSessionQuery.isLoading && <Spinner />}
      {singleSessionQuery.isError && <ErrorPanel />}
      {singleSessionQuery.data && !singleSessionQuery.isError && values && singleSessionQuery.data && (
        <SessionEditForm
          values={values}
          courseParticipationPolicy={singleSessionQuery.data.courseParticipationPolicy}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
};

export default SessionEditPage;
