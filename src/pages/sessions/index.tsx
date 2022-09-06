import { clsx } from "clsx";
import type { NextPage } from "next";
import Link from "next/link";
import { useContext } from "react";
import { SessionContext } from "../../components/context/SessionContext";

import { ErrorPanel } from "../../components/ErrorPanel";
import { LocalizedTimespan } from "../../components/LocalizedTimespan";
import { Spinner } from "../../components/Spinner";
import { TypedFormattedMessage } from "../../utils/translation";
import { trpc } from "../../utils/trpc";

const SelectSessionPage: NextPage = () => {
  const session = useContext(SessionContext);
  const sessionsQuery = trpc.useQuery(["course.getSessionsThisWeek"]);

  // Assistant names and languages are shown only in the table
  // if they are defined for at least one session
  const showStaff = sessionsQuery.data && sessionsQuery.data.sessions.some((x) => x.assistants.length > 0);
  const showLanguage = sessionsQuery.data && sessionsQuery.data.sessions.some((x) => x.languages.length > 0);

  if (sessionsQuery.isLoading) {
    return <Spinner />;
  } else if (!sessionsQuery.isError && sessionsQuery.data) {
    return (
      <div>
        <p>
          <TypedFormattedMessage id="sessions-main-text" />
        </p>

        {sessionsQuery.data.url && (
          <p>
            <TypedFormattedMessage
              id="sessions-additional-info"
              values={{
                a: (chunks: any) => (
                  <a target="_blank" href={sessionsQuery.data.url} rel="noreferrer">
                    <span>{chunks}</span>
                  </a>
                ),
              }}
            />
          </p>
        )}

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
            </tr>
          </thead>
          <tbody>
            {sessionsQuery.data.sessions.map((s) => {
              return (
                <tr
                  key={s.id}
                  className={clsx({
                    "table-success": s.isToday,
                  })}
                >
                  <td>{s.name}</td>
                  <td>
                    <LocalizedTimespan startTime={s.startTime} endTime={s.endTime} weekday={s.weekday} />
                  </td>
                  <td>{s.locations.join(", ")}</td>
                  {showStaff && <td>{s.assistants.join(", ")}</td>}
                  {showLanguage && <td>{s.languages.join(", ")}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>

        {session?.role === "teacher" && (
          <p>
            <TypedFormattedMessage
              id="sessions-modify-link"
              values={{
                a: (chunks: any) => (
                  <Link href="/settings">
                    <a>{chunks}</a>
                  </Link>
                ),
              }}
            />
          </p>
        )}
      </div>
    );
  } else {
    return <ErrorPanel />;
  }
};

export default SelectSessionPage;
