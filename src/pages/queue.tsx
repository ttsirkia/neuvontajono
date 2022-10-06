import clsx from "clsx";
import type { NextPage } from "next";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useIntl } from "react-intl";
import { AlertDialog } from "../components/AlertDialog";
import { SessionContext } from "../components/context/SessionContext";
import { SocketContext } from "../components/context/SocketContext";
import { ErrorPanel } from "../components/ErrorPanel";
import { Spinner } from "../components/Spinner";
import { SessionDTOWithLengthAndLocalRemote } from "../models/Session";
import { getTypedFormattedString, TypedFormattedMessage } from "../utils/translation";
import { trpc } from "../utils/trpc";

const selectBestSession = (
  currentSession: SessionDTOWithLengthAndLocalRemote | undefined,
  selectedName: string,
  previousLocation: string,
  previousInLocal: boolean,
  sessions: SessionDTOWithLengthAndLocalRemote[]
) => {
  let selected: SessionDTOWithLengthAndLocalRemote | undefined = undefined;
  if (sessions.length === 1) {
    selected = sessions[0];
  } else if (previousInLocal && sessions.some((x) => x.local)) {
    const options = sessions.filter((x) => x.local && x.location === previousLocation);
    const byId = options.filter((x) => x.id === currentSession?.id);
    const byName = options.filter((x) => x.name === selectedName);

    if (byName.length > 0) {
      selected = byName[0];
    } else if (byId.length === 1) {
      selected = byId[0];
    } else if (options.length > 0) {
      selected = options[0];
    } else {
      selected = sessions.find((x) => x.local);
    }
  } else if (!previousInLocal && sessions.some((x) => x.remote)) {
    const options = sessions.filter((x) => x.remote && x.location === previousLocation);
    const byId = options.filter((x) => x.id === currentSession?.id);
    const byName = options.filter((x) => x.name === selectedName);

    if (byName.length > 0) {
      selected = byName[0];
    } else if (byId.length === 1) {
      selected = byId[0];
    } else if (options.length > 0) {
      selected = options[0];
    } else {
      selected = sessions.find((x) => x.remote);
    }
  } else if (sessions.length > 0) {
    selected = sessions[0];
  }
  return selected;
};

// ************************************************************************************************

const QueuePage: NextPage = () => {
  const userAndSessionStatusQuery = trpc.useQuery(["course.getCurrentSessionsAndUserStatus"], {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
  const addToQueueMutation = trpc.useMutation(["queue.addMeToQueue"]);
  const removeFromQueueMutation = trpc.useMutation(["queue.removeMeFromQueue"]);
  const signUpMutation = trpc.useMutation(["queue.signUp"]);
  const queryUtils = trpc.useContext();
  const intl = useIntl();

  const socketContext = useContext(SocketContext);
  const session = useContext(SessionContext);

  const [selectedSession, setSelectedSession] = useState<SessionDTOWithLengthAndLocalRemote | undefined>(undefined);
  const [filteredSessions, setFilteredSessions] = useState<SessionDTOWithLengthAndLocalRemote[] | undefined>(undefined);
  const [forceForm, setForceForm] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const participationMode = watch("participationMode");
  const location = watch("location");

  // ************************************************************************************************

  useEffect(() => {
    // initial search for the best suitable session
    if (userAndSessionStatusQuery.data && userAndSessionStatusQuery.data.sessions.length > 0 && !selectedSession) {
      setValue("participationMode", userAndSessionStatusQuery.data.previousParticipationLocal ? "local" : "remote");
      setValue("row", userAndSessionStatusQuery.data.previousRow.toString());

      const best = selectBestSession(
        undefined,
        "",
        userAndSessionStatusQuery.data.previousLocation,
        userAndSessionStatusQuery.data.previousParticipationLocal,
        userAndSessionStatusQuery.data.sessions
      );

      if (best) {
        setSelectedSession(best);
        setFilteredSessions(
          userAndSessionStatusQuery.data.sessions.filter((x) => (x.local && best.local) || (x.remote && best.remote))
        );
        setValue("participationMode", best.local ? "local" : "remote");
        setValue("location", `${best.id}|${best.location}|${best.name}`);
        setValue("row", userAndSessionStatusQuery.data.previousRow.toString());
        setValue("callURL", userAndSessionStatusQuery.data.previousCallURL);
        if (best.languages.indexOf(userAndSessionStatusQuery.data.previousLanguage) >= 0) {
          setValue("language", userAndSessionStatusQuery.data.previousLanguage);
        }
      }
    } else if (userAndSessionStatusQuery.data && userAndSessionStatusQuery.data.sessions.length === 0) {
      setSelectedSession(undefined);
    }
  }, [selectedSession, setValue, userAndSessionStatusQuery.data]);

  // ************************************************************************************************

  useEffect(() => {
    if (!userAndSessionStatusQuery.data) return;

    const pMode = getValues("participationMode");
    const best = selectBestSession(
      selectedSession,
      (getValues("location") ?? "").split("|")[2],
      (getValues("location") ?? "").split("|")[1],
      pMode === "local",
      userAndSessionStatusQuery.data.sessions
    );

    if (best) {
      const filtered = userAndSessionStatusQuery.data.sessions.filter(
        (x) => (x.local && best.local) || (x.remote && best.remote)
      );
      setSelectedSession(best);
      setFilteredSessions(filtered);
      setValue("participationMode", best.local ? "local" : "remote");
      if (best.local || filtered.length > 1) {
        setValue("location", `${best.id}|${best.location}|${best.name}`);
      }
    }
  }, [getValues, selectedSession, setValue, userAndSessionStatusQuery.data, location, participationMode]);

  // ************************************************************************************************

  useEffect(() => {
    if (session && session.courseId) {
      const courseId = session.courseId;
      if (socketContext) {
        socketContext.io.on("reconnect_attempt", () => {
          fetch("/neuvontajono/api/socket");
        });

        socketContext.on("connect", () => {
          socketContext.emit("userQueueRequest", courseId);
        });
        socketContext.emit("userQueueRequest", courseId);
        socketContext.on("userQueueResponse", (data) => {
          queryUtils.setQueryData(["course.getCurrentSessionsAndUserStatus"], data);
        });
      }
    }

    return () => {
      socketContext?.off();
      if (session && session.courseId) {
        socketContext?.emit("userQueueLeaveRequest", session.courseId);
      }
    };
  }, [socketContext, session, queryUtils]);

  // ************************************************************************************************

  const onSubmit = (data: any) => {
    if (selectedSession) {
      addToQueueMutation.mutate(
        {
          sessionId: selectedSession.id,
          row: participationMode === "local" ? +data.row : -1,
          location: selectedSession.location,
          language: data.language ?? "",
          callURL: data.callURL ?? "",
        },
        {
          onSuccess: () => {
            toast.success(getTypedFormattedString(intl, forceForm ? "queue-position-updated" : "queue-joined"));
            queryUtils.invalidateQueries(["course.getCurrentSessionsAndUserStatus"]);
            setForceForm(false);
          },
          onError: () => {
            toast.error(getTypedFormattedString(intl, forceForm ? "queue-position-failed" : "queue-join-failed"));
            queryUtils.invalidateQueries(["course.getCurrentSessionsAndUserStatus"]);
            setForceForm(false);
          },
        }
      );
    }
  };

  // ************************************************************************************************

  const localSessions = userAndSessionStatusQuery.data?.sessions.some((x) => x.local);
  const remoteSessions = userAndSessionStatusQuery.data?.sessions.some((x) => x.remote);

  return (
    <div>
      <p className="lead mb-4">
        <TypedFormattedMessage id="queue-lead" />
      </p>
      {userAndSessionStatusQuery.isError && <ErrorPanel />}
      {userAndSessionStatusQuery.isLoading && <Spinner />}

      {/* Queue not open */}
      {userAndSessionStatusQuery.data &&
        !userAndSessionStatusQuery.isError &&
        userAndSessionStatusQuery.data.sessions.length === 0 && (
          <div className="alert alert-primary">
            <TypedFormattedMessage id="queue-not-open" />
          </div>
        )}

      {/* Queue status */}
      {!userAndSessionStatusQuery.isError &&
        userAndSessionStatusQuery.data &&
        userAndSessionStatusQuery.data.userPosition >= 1 && (
          <div className="mb-5">
            {userAndSessionStatusQuery.data.userPosition > 1 && (
              <div className="alert alert-primary" role="alert">
                <TypedFormattedMessage
                  id="queue-current-position"
                  values={{ position: userAndSessionStatusQuery.data.userPosition }}
                />
              </div>
            )}
            {userAndSessionStatusQuery.data.userPosition === 1 && (
              <div className="alert alert-success" role="alert">
                <TypedFormattedMessage id="queue-next-in-queue" />
              </div>
            )}
            <p className="mt-4">
              <TypedFormattedMessage id="queue-leave-reminder" />
            </p>
            <AlertDialog
              title={getTypedFormattedString(intl, "queue-leave")}
              text={getTypedFormattedString(intl, "queue-leave-confirm")}
              cancelText={getTypedFormattedString(intl, "cancel")}
              actionText={getTypedFormattedString(intl, "queue-leave")}
              actionStyle="btn-primary"
              onClick={(e) => {
                removeFromQueueMutation.mutate(undefined, {
                  onSuccess: () => {
                    toast.success(getTypedFormattedString(intl, "queue-leave-confirmed"));
                    queryUtils.invalidateQueries(["course.getCurrentSessionsAndUserStatus"]);
                  },
                  onError: () => {
                    toast.error(getTypedFormattedString(intl, "queue-leave-failed"));
                    queryUtils.invalidateQueries(["course.getCurrentSessionsAndUserStatus"]);
                  },
                });
              }}
            >
              <button type="button" className="btn btn-primary">
                <TypedFormattedMessage id="queue-leave" />
              </button>
            </AlertDialog>
          </div>
        )}

      {/* Form */}
      {userAndSessionStatusQuery.data &&
        !userAndSessionStatusQuery.isError &&
        userAndSessionStatusQuery.data.sessions.length > 0 &&
        (userAndSessionStatusQuery.data.userPosition < 1 || forceForm) &&
        selectedSession &&
        filteredSessions && (
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              {localSessions && remoteSessions && (
                <div className="fs-5 my-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      value="local"
                      id="localRadio"
                      {...register("participationMode")}
                    />
                    <label className="form-check-label" htmlFor="localRadio">
                      <TypedFormattedMessage id="queue-local-participation" />
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      value="remote"
                      id="remoteRadio"
                      {...register("participationMode")}
                    />
                    <label className="form-check-label" htmlFor="remoteRadio">
                      <TypedFormattedMessage id="queue-remote-participation" />
                    </label>
                  </div>
                </div>
              )}

              {filteredSessions.length === 1 && (
                <div className="row my-4 align-items-center">
                  <label htmlFor="sessionName" className="col-md-3 col-form-label">
                    <TypedFormattedMessage id="queue-group" />
                  </label>
                  <div className="col-md-9">
                    <span style={{ fontSize: "125%" }}>
                      <input
                        type="text"
                        readOnly={true}
                        className="form-control-plaintext"
                        id="sessionName"
                        value={`${selectedSession.name} (${selectedSession.location})`}
                      />
                    </span>
                    {selectedSession.local && (
                      <input type="hidden" value={selectedSession.location} {...register("location")} />
                    )}
                  </div>
                </div>
              )}

              {filteredSessions.length > 1 && (
                <div className="my-4">
                  <div className="alert alert-warning">
                    <TypedFormattedMessage id="queue-multiple-locations" />
                  </div>
                  <div className="row align-items-center">
                    <label htmlFor="row" className="col-md-3 col-form-label">
                      <TypedFormattedMessage id="queue-group" />
                    </label>
                    <div className="col-md-6">
                      <select style={{ fontSize: "125%" }} id="row" className="form-select" {...register("location")}>
                        {filteredSessions.map((x) => (
                          <option key={`${x.id}|${x.location}|${x.name}`} value={`${x.id}|${x.location}|${x.name}`}>
                            {x.name + " (" + x.location + ")"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <hr />

              {selectedSession.assistants.length > 0 && (
                <div className="row my-4">
                  <label htmlFor="assistants" className="col-md-3 col-form-label">
                    <TypedFormattedMessage id="queue-assistants" />
                  </label>
                  <div className="col-md-6">
                    <input
                      type="text"
                      readOnly={true}
                      className="form-control-plaintext"
                      id="assistants"
                      value={selectedSession.assistants.join(", ")}
                    />
                  </div>
                </div>
              )}

              <div className="row my-4">
                <label htmlFor="queueLength" className="col-md-3 col-form-label">
                  <TypedFormattedMessage id="queue-current-length" />
                </label>
                <div className="col-md-6">
                  <input
                    type="text"
                    readOnly={true}
                    className="form-control-plaintext"
                    id="queueLength"
                    value={selectedSession.queueLength}
                  />
                </div>
              </div>

              <hr />

              {!selectedSession.hasSignedUp && (
                <div>
                  <p className="fw-bold">
                    <TypedFormattedMessage id="queue-sign-up-required" />
                  </p>
                  <p>
                    <button
                      className="btn btn-primary mt-4"
                      onClick={(e) => {
                        e.preventDefault();
                        signUpMutation.mutate(
                          { sessionId: selectedSession.id, location: selectedSession.location },
                          {
                            onSuccess: () => {
                              queryUtils.invalidateQueries(["course.getCurrentSessionsAndUserStatus"]);
                            },
                          }
                        );
                      }}
                    >
                      <TypedFormattedMessage id="queue-sign-up" />
                    </button>
                  </p>
                </div>
              )}

              {selectedSession.hasSignedUp && (
                <>
                  {selectedSession.languages.length > 0 && (
                    <div className="row mb-4">
                      <p className="fw-bold">
                        <TypedFormattedMessage id="queue-multiple-languages" />
                      </p>
                      <label htmlFor="language" className="col-md-3 col-form-label">
                        <TypedFormattedMessage id="queue-language" />
                      </label>
                      <div className="col-md-3">
                        <select id="language" className="form-select" {...register("language")}>
                          {selectedSession.languages.map((x) => (
                            <option key={x} value={x}>
                              {x}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {participationMode === "local" && (
                    <div className="row mb-4">
                      <label htmlFor="row" className="col-md-3 col-form-label">
                        <TypedFormattedMessage id="queue-my-row" />
                      </label>
                      <div className="col-md-3">
                        <select id="row" className="form-select" {...register("row")}>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                          <option value="10">10</option>
                        </select>
                        <div className="form-text">
                          <TypedFormattedMessage id="queue-row-direction-help" />
                        </div>
                      </div>
                    </div>
                  )}

                  {participationMode === "remote" && (
                    <div className="row mb-4">
                      <label htmlFor="callURL" className="col-md-3 col-form-label">
                        <TypedFormattedMessage id="queue-call-url" />
                      </label>
                      <div className="col-md-6">
                        <input
                          type="text"
                          className={clsx("form-control", { "is-invalid": errors.callURL })}
                          id="callURL"
                          {...register("callURL", {
                            validate: (x) => x === "" || x.indexOf("https://") === 0 || x.indexOf("http://") === 0,
                          })}
                        />
                        {errors.callURL && (
                          <div className="invalid-feedback">
                            <TypedFormattedMessage id="queue-wrong-call-url" />
                          </div>
                        )}
                        <div className="form-text">
                          {!userAndSessionStatusQuery.data.remoteHelp && !selectedSession.remoteHelp && (
                            <TypedFormattedMessage id="queue-call-url-help" />
                          )}
                          {userAndSessionStatusQuery.data.remoteHelp}
                          <br />
                          {selectedSession.remoteHelp}
                        </div>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary mt-4">
                    {!forceForm && <TypedFormattedMessage id="queue-join" />}
                    {forceForm && <TypedFormattedMessage id="queue-move" />}
                  </button>
                </>
              )}
            </form>
          </div>
        )}

      {/* Edit button */}
      {!userAndSessionStatusQuery.isError &&
        userAndSessionStatusQuery.data &&
        userAndSessionStatusQuery.data.userPosition >= 1 &&
        !forceForm && (
          <div className="pt-5 fs-6">
            <a
              href="#"
              onClick={() => {
                setForceForm(true);
              }}
            >
              <TypedFormattedMessage id="queue-position-change" />
            </a>
          </div>
        )}
    </div>
  );
};

export default QueuePage;
