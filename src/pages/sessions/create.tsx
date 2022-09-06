import { format } from "date-fns";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { useIntl } from "react-intl";

import { SessionDTOWithDates, SessionEditForm } from "../../components/SessionEditForm";
import { convertTimeStringToInt } from "../../utils/dates";
import { getSession } from "../../utils/session";
import { getTypedFormattedString, TypedFormattedMessage } from "../../utils/translation";
import { trpc } from "../../utils/trpc";

// ************************************************************************************************

type Props = {
  courseParticipationPolicy: number;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const [_, richSession] = await getSession(ctx.req, ctx.res);

  return {
    props: {
      courseParticipationPolicy: richSession.course?.participationPolicy ?? 1,
    },
  };
};
// ************************************************************************************************

const CreateSessionPage: NextPage<Props> = (props) => {
  const router = useRouter();
  const updateSessionMutation = trpc.useMutation(["settings.createOrUpdateSession"]);
  const queryUtils = trpc.useContext();
  const intl = useIntl();

  const onSubmit: SubmitHandler<SessionDTOWithDates> = (data) => {
    updateSessionMutation.mutate(
      {
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
        <TypedFormattedMessage id="modify-create-title" />
      </h3>
      <SessionEditForm
        values={{
          name: "",
          locations: "",
          languages: "",
          assistants: "",
          weekday: "1",
          startTime: "",
          endTime: "",
          queueOpenTime: "",
          remoteMethod: "",
          participationPolicy: "0",
          startDate: new Date(),
          endDate: new Date(),
          active: "true",
          excludedDates: [],
          remoteHelp: "",
        }}
        courseParticipationPolicy={props.courseParticipationPolicy}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default CreateSessionPage;
