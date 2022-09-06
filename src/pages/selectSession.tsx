import { clsx } from "clsx";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useIntl } from "react-intl";

import { ErrorPanel } from "../components/ErrorPanel";
import { LocalizedTimespan } from "../components/LocalizedTimespan";
import { Spinner } from "../components/Spinner";
import { getTypedFormattedString, TypedFormattedMessage } from "../utils/translation";
import { trpc } from "../utils/trpc";

/**
 * Page for assistants to select the session to work with.
 */
const SelectSessionPage: NextPage = () => {
  const intl = useIntl();
  const router = useRouter();

  const sessionsQuery = trpc.useQuery(["course.getSessionsToday"], {
    onError: (data) => {
      if (data && (data.data?.code === "FORBIDDEN" || data.data?.code === "UNAUTHORIZED")) {
        toast.error(getTypedFormattedString(intl, "alert-no-staff"));
        router.replace("/");
      }
    },
  });

  // Assistant names and languages are shown only in the table
  // if they are defined for at least one session
  const showStaff = sessionsQuery.data && sessionsQuery.data.some((x) => x.assistants.length > 0);
  const showLanguage = sessionsQuery.data && sessionsQuery.data.some((x) => x.languages.length > 0);

  if (sessionsQuery.isLoading) {
    return <Spinner />;
  } else if (sessionsQuery.data && sessionsQuery.data.length === 0) {
    return (
      <p>
        <TypedFormattedMessage id="select-no-groups-today" />
      </p>
    );
  } else if (sessionsQuery.data && sessionsQuery.data.length > 0) {
    return (
      <div>
        <p>
          <TypedFormattedMessage id="select-main-text" />
        </p>
        <table className="table">
          <thead>
            <tr>
              <th>
                <TypedFormattedMessage id="select-th-name" />
              </th>
              <th>
                <TypedFormattedMessage id="select-th-time" />
              </th>
              <th>
                <TypedFormattedMessage id="select-th-location" />
              </th>
              {showStaff && (
                <th>
                  <TypedFormattedMessage id="select-th-staff" />
                </th>
              )}
              {showLanguage && (
                <th>
                  <TypedFormattedMessage id="select-th-language" />
                </th>
              )}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sessionsQuery.data.map((s) => {
              return (
                <tr
                  key={s.id}
                  className={clsx({
                    "table-success": s.isOpen,
                    "session-starting": !s.isOpen && s.isOpening,
                  })}
                >
                  <td>{s.name}</td>
                  <td>
                    <LocalizedTimespan startTime={s.startTime} endTime={s.endTime} openTime={s.queueOpenTime} />
                  </td>
                  <td>{s.locations.join(", ")}</td>
                  {showStaff && <td>{s.assistants.join(", ")}</td>}
                  {showLanguage && <td>{s.languages.join(", ")}</td>}
                  <td>
                    <Link href={`/sessions/${s.id}/manage`}>
                      <a className="btn btn-primary btn-sm">
                        <TypedFormattedMessage id="select" />
                      </a>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  } else {
    return <ErrorPanel />;
  }
};

export default SelectSessionPage;
