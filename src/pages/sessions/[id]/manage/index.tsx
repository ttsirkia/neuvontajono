import { clsx } from "clsx";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { FC, useContext, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";

import type { QueueUser } from "../../../../models/Queue";

import Link from "next/link";
import toast from "react-hot-toast";
import { AlertDialog } from "../../../../components/AlertDialog";
import { SocketContext } from "../../../../components/context/SocketContext";
import { ErrorPanel } from "../../../../components/ErrorPanel";
import { LocalizedTimeFromTimestamp } from "../../../../components/LocalizedTimeFromTimestamp";
import { Spinner } from "../../../../components/Spinner";
import { getTypedFormattedString, TypedFormattedMessage } from "../../../../utils/translation";
import { trpc } from "../../../../utils/trpc";

// ************************************************************************************************

const ClearQueue: FC<{ id: string; setPreviousUser?: (u: QueueUser | null) => void }> = (props) => {
  const clearQueueMutation = trpc.useMutation(["manageQueue.clearQueue"]);
  const queryUtils = trpc.useContext();
  const intl = useIntl();

  return (
    <AlertDialog
      title={getTypedFormattedString(intl, "manage-clear-queue")}
      text={getTypedFormattedString(intl, "manage-clear-queue-confirm")}
      cancelText={getTypedFormattedString(intl, "cancel")}
      actionText={getTypedFormattedString(intl, "manage-clear-queue")}
      actionStyle="btn-danger"
      onClick={(e) => {
        clearQueueMutation.mutate(
          { sessionId: props.id },
          {
            onSuccess: () => {
              if (props.setPreviousUser) {
                props.setPreviousUser(null);
              }
              queryUtils.invalidateQueries(["manageQueue.getSessionData", { sessionId: props.id }]);
            },
            onError: () => {
              toast.error(getTypedFormattedString(intl, "alert-clearing-queue-failed"));
            },
          }
        );
      }}
    >
      <button type="button" className="btn btn-danger mt-4">
        <TypedFormattedMessage id="manage-clear-queue" />
      </button>
    </AlertDialog>
  );
};

// ************************************************************************************************

const RemoveFromQueueWithConfirmation: FC<{
  queueId: string;
  sessionId: string;
  setPreviousUser?: (u: QueueUser) => void;
  previousUser: QueueUser;
}> = (props) => {
  const removeFromQueueMutation = trpc.useMutation(["manageQueue.removeFromQueueById"]);
  const queryUtils = trpc.useContext();
  const intl = useIntl();

  return (
    <AlertDialog
      title={getTypedFormattedString(intl, "manage-remove")}
      text={getTypedFormattedString(intl, "manage-confirm-remove-middle")}
      cancelText={getTypedFormattedString(intl, "cancel")}
      actionText={getTypedFormattedString(intl, "manage-remove")}
      actionStyle="btn-primary"
      onClick={(e) => {
        removeFromQueueMutation.mutate(
          { queueId: props.queueId },
          {
            onSuccess: () => {
              if (props.setPreviousUser) {
                props.setPreviousUser(props.previousUser);
              }
              queryUtils.invalidateQueries(["manageQueue.getSessionData", { sessionId: props.sessionId }]);
            },
          }
        );
      }}
    >
      <button type="button" className="btn btn-primary btn-sm">
        <TypedFormattedMessage id="manage-remove" />
      </button>
    </AlertDialog>
  );
};

// ************************************************************************************************

const RemoveFromQueueButton: FC<{
  queueId: string;
  sessionId: string;
  setPreviousUser?: (u: QueueUser) => void;
  previousUser: QueueUser;
}> = (props) => {
  const removeFromQueueMutation = trpc.useMutation(["manageQueue.removeFromQueueById"]);
  const queryUtils = trpc.useContext();

  return (
    <button
      type="button"
      className="btn btn-primary"
      onClick={(e) => {
        removeFromQueueMutation.mutate(
          { queueId: props.queueId },
          {
            onSuccess: () => {
              if (props.setPreviousUser) {
                props.setPreviousUser(props.previousUser);
              }
              queryUtils.invalidateQueries(["manageQueue.getSessionData", { sessionId: props.sessionId }]);
            },
          }
        );
      }}
    >
      <TypedFormattedMessage id="manage-remove" />
    </button>
  );
};

// ************************************************************************************************

const UserTable: FC<{
  users: QueueUser[];
  sessionId: any;
  showPosition: boolean;
  showActions: boolean;
  setPreviousUser?: (u: QueueUser) => void;
  previousUser?: QueueUser | null;
  eventName: string;
}> = (props) => {
  let users = props.users;
  if (props.previousUser) {
    users = [{ ...props.previousUser, position: 0, id: props.previousUser.id + "-old" }, ...users];
  }
  const showLanguage = users.some((x) => x.language);

  return (
    <table className="table">
      <thead>
        <tr>
          {props.showPosition && (
            <th>
              <TypedFormattedMessage id="manage-th-position" />
            </th>
          )}
          <th>
            <TypedFormattedMessage id="manage-th-name" />
          </th>
          <th>{props.eventName}</th>
          <th>
            <TypedFormattedMessage id="manage-th-location" />
          </th>
          {showLanguage && (
            <th>
              <TypedFormattedMessage id="select-th-language" />
            </th>
          )}
          {props.showActions && <th></th>}
        </tr>
      </thead>
      <tbody>
        {users.map((s) => {
          return (
            <React.Fragment key={s.id}>
              <tr
                className={clsx({
                  "first-in-queue": props.showActions && s.position === 1,
                  "table-success": props.showActions && s.position === 1,
                  "previous-user": props.showActions && s.position === 0,
                  "main-row": s.row < 0,
                })}
              >
                {props.showPosition && (
                  <td>
                    {s.position > 0 && <TypedFormattedMessage id="ordinal-value" values={{ position: s.position }} />}
                  </td>
                )}
                <td>{s.name}</td>
                <td>
                  <LocalizedTimeFromTimestamp time={s.eventTime} />
                </td>
                <td>
                  {s.row > 0 && (
                    <TypedFormattedMessage
                      id="manage-user-row-template"
                      values={{ location: s.location, row: s.row }}
                    />
                  )}
                  {s.row < 0 && <span>{s.location}</span>}
                </td>
                {showLanguage && <td>{s.language}</td>}
                {props.showActions && (
                  <td>
                    {s.position === 1 && (
                      <RemoveFromQueueButton
                        queueId={s.id}
                        sessionId={props.sessionId}
                        setPreviousUser={props.setPreviousUser}
                        previousUser={s}
                      />
                    )}
                    {s.position > 1 && (
                      <RemoveFromQueueWithConfirmation
                        queueId={s.id}
                        sessionId={props.sessionId}
                        setPreviousUser={props.setPreviousUser}
                        previousUser={s}
                      />
                    )}
                  </td>
                )}
              </tr>
              {s.row < 0 && (
                <tr
                  className={clsx({
                    "first-in-queue": props.showActions && s.position === 1,
                    "table-success": props.showActions && s.position === 1,
                    "previous-user": props.showActions && s.position === 0,
                    "details-row": true,
                  })}
                >
                  <td colSpan={showLanguage ? 6 : 5} className="py-0 pb-2">
                    {s.callURL ? (
                      <a target="_blank" href={s.callURL} rel="noreferrer">
                        {s.callURL}
                      </a>
                    ) : (
                      s.email
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

// ************************************************************************************************

const ManageSessionPage: NextPage = () => {
  const intl = useIntl();
  const router = useRouter();

  const sessionId = router.query.id!.toString();

  const sessionDataQuery = trpc.useQuery(["manageQueue.getSessionData", { sessionId }], {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
    onSuccess: (data) => {
      if (data) {
        if (data.inQueue.length > 0 && data.inQueue[0] && queueLength.current === 0) {
          const options = {
            body: getTypedFormattedString(
              intl,
              data.inQueue[0].row > 0 ? "notification-joined-queue-local" : "notification-joined-queue-remote",
              {
                name: data.inQueue[0].firstName,
                row: data.inQueue[0].row,
                location: data.inQueue[0].location,
              }
            ),
          };
          const notification = new Notification(getTypedFormattedString(intl, "title"), options);
          setTimeout(notification.close.bind(notification), 4000);
        }

        queueLength.current = data.inQueue.length;
      }
    },
    onError: (data) => {
      if (data && (data.data?.code === "FORBIDDEN" || data.data?.code === "UNAUTHORIZED")) {
        toast.error(getTypedFormattedString(intl, "alert-no-staff"));
        router.replace("/");
      } else if (data && data.data?.code === "NOT_FOUND") {
        toast.error(getTypedFormattedString(intl, "alert-session-not-found"));
        router.replace("/");
      }
    },
  });
  const queryUtils = trpc.useContext();
  const title = getTypedFormattedString(intl, "title");

  const [previousUser, setPreviousUser] = useState<QueueUser | null>(null);
  const queueLength = useRef(0);

  const socketContext = useContext(SocketContext);

  const enteredAtHeader = getTypedFormattedString(intl, "manage-th-entered-at");
  const removedAtHeader = getTypedFormattedString(intl, "manage-th-removed-at");

  // ************************************************************************************************
  const [notificationMode, setNotificationMode] = useState<"no-permission" | "disabled" | "enabled">("no-permission");

  useEffect(() => {
    if (window.Notification && window.Notification.permission === "granted") {
      setNotificationMode("enabled");
    }
  }, []);

  // ************************************************************************************************
  useEffect(() => {
    if (socketContext) {
      socketContext.io.on("reconnect_attempt", () => {
        fetch("/neuvontajono/api/socket");
      });

      socketContext.on("connect", () => {
        socketContext.emit("staffQueueRequest", sessionId);
      });
      socketContext.emit("staffQueueRequest", sessionId);
      socketContext.on("staffQueueResponse", (data) => {
        queryUtils.setQueryData(["manageQueue.getSessionData", { sessionId }], data);
      });
    }

    return () => {
      socketContext?.off();
      socketContext?.emit("staffQueueLeaveRequest", sessionId);
    };
  }, [socketContext, sessionId, queryUtils]);

  if (sessionDataQuery.isLoading) {
    return <Spinner />;
  } else if (sessionDataQuery.data && !sessionDataQuery.isError) {
    return (
      <div>
        <Head>
          <title key="title">{`(${sessionDataQuery.data.inQueue.length}) ${title}`}</title>
        </Head>
        <h2>{sessionDataQuery.data.name}</h2>
        <h4>{sessionDataQuery.data.locations.join(", ")}</h4>

        {notificationMode === "no-permission" && window.Notification && (
          <p>
            <TypedFormattedMessage id="notification-no-permission" />
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();

                function handlePermission(permission: NotificationPermission) {
                  if (permission === "granted") {
                    setNotificationMode("enabled");
                  }
                }

                function checkNotificationPromise() {
                  try {
                    Notification.requestPermission().then((permission) => {
                      handlePermission(permission);
                    });
                  } catch (e) {
                    return false;
                  }

                  return true;
                }

                function askNotificationPermission() {
                  if (!("Notification" in window)) {
                    return;
                  } else if (checkNotificationPromise()) {
                    Notification.requestPermission().then((permission) => {
                      handlePermission(permission);
                    });
                  } else {
                    Notification.requestPermission((permission) => {
                      handlePermission(permission);
                    });
                  }
                }

                askNotificationPermission();
              }}
            >
              <br />
              <TypedFormattedMessage id="notification-request-permission" />
            </a>
          </p>
        )}

        {notificationMode === "enabled" && (
          <p>
            <TypedFormattedMessage id="notification-enabled" />
            <br />
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setNotificationMode("disabled");
              }}
            >
              <TypedFormattedMessage id="notification-disable" />
            </a>
          </p>
        )}

        {notificationMode === "disabled" && (
          <p>
            <TypedFormattedMessage id="notification-disabled" />
            <br />
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setNotificationMode("enabled");
              }}
            >
              <TypedFormattedMessage id="notification-activate" />
            </a>
          </p>
        )}

        <hr />
        <div>
          <Link href={`/sessions/${sessionId}/manage/projector`} target="_blank">
            <a
              className="btn btn-success"
              target="_blank"
              onClick={() => {
                if (notificationMode === "enabled") {
                  setNotificationMode("disabled");
                }
              }}
            >
              <TypedFormattedMessage id="manage-open-projector" />
            </a>
          </Link>
          <p className="mt-4">
            <TypedFormattedMessage id="manage-projector-help" />
          </p>
        </div>
        <hr />

        <p className="fs-5">
          <TypedFormattedMessage id="manage-current-length" values={{ length: sessionDataQuery.data.inQueue.length }} />
        </p>

        {(sessionDataQuery.data.inQueue.length > 0 || previousUser) && (
          <>
            <UserTable
              sessionId={sessionDataQuery.data.id}
              users={sessionDataQuery.data.inQueue}
              showActions={true}
              showPosition={true}
              setPreviousUser={setPreviousUser}
              previousUser={previousUser}
              eventName={enteredAtHeader}
            />

            <ClearQueue id={sessionDataQuery.data.id} setPreviousUser={setPreviousUser} />
          </>
        )}

        {sessionDataQuery.data.recentlyRemoved.length > 0 && (
          <>
            <hr />

            <h5>
              <TypedFormattedMessage id="manage-recently-removed-title" />
            </h5>
            <UserTable
              sessionId={sessionDataQuery.data.id}
              users={sessionDataQuery.data.recentlyRemoved}
              showActions={false}
              showPosition={false}
              eventName={removedAtHeader}
            />
          </>
        )}
      </div>
    );
  } else {
    return <ErrorPanel />;
  }
};

export default ManageSessionPage;
