import clsx from "clsx";
import { format, parse } from "date-fns";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useIntl } from "react-intl";
import { AlertDialog } from "../components/AlertDialog";

import { ErrorPanel } from "../components/ErrorPanel";
import { LocalizedDatespan } from "../components/LocalizedDatespan";
import { LocalizedTimespan } from "../components/LocalizedTimespan";
import { Spinner } from "../components/Spinner";
import { CourseDTO } from "../models/Course";
import { getTypedFormattedString, TypedFormattedMessage } from "../utils/translation";
import { trpc } from "../utils/trpc";
import { Stringified } from "../utils/typeUtils";

/**
 * Page for assistants to select the session to work with.
 */
const SettingsPage: NextPage = () => {
  const router = useRouter();
  const intl = useIntl();

  const settingsQuery = trpc.useQuery(["settings.getCourseSettings"], {
    onError: (data) => {
      if (data && (data.data?.code === "FORBIDDEN" || data.data?.code === "UNAUTHORIZED")) {
        toast.error(getTypedFormattedString(intl, "alert-no-staff"));
        router.replace("/");
      }
    },
  });
  const sessionsQuery = trpc.useQuery(["course.getAllSessions"]);
  const settingsMutation = trpc.useMutation(["settings.saveSettings"]);
  const disableAllMutation = trpc.useMutation(["settings.disableAllSessions"]);
  const enableAllMutation = trpc.useMutation(["settings.enableAllSessions"]);
  const deleteSessionMutation = trpc.useMutation(["settings.deleteSession"]);
  const queryUtils = trpc.useContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Stringified<CourseDTO>>();

  useEffect(() => {
    if (settingsQuery.data) {
      reset({
        name: settingsQuery.data.name,
        url: settingsQuery.data.url,
        combined: settingsQuery.data.combined,
        projectorConf: settingsQuery.data.projectorConf,
        defaultLanguage: settingsQuery.data.defaultLanguage,
        statisticsLevel: settingsQuery.data.statisticsLevel.toString(),
        statisticsQueueLevel: settingsQuery.data.statisticsQueueLevel.toString(),
        statisticsGraphLevel: settingsQuery.data.statisticsGraphLevel.toString(),
        participationPolicy: settingsQuery.data.participationPolicy.toString(),
        requireSignUp: settingsQuery.data.requireSignUp ? "true" : undefined,
        remoteHelp: settingsQuery.data.remoteHelp,
      });
    }
  }, [reset, settingsQuery.data]);

  const onSubmit: SubmitHandler<Stringified<CourseDTO>> = (data) => {
    settingsMutation.mutate(
      {
        name: data.name,
        url: data.url,
        combined: data.combined,
        projectorConf: data.projectorConf,
        defaultLanguage: data.defaultLanguage,
        statisticsLevel: +data.statisticsLevel,
        statisticsQueueLevel: +data.statisticsQueueLevel,
        statisticsGraphLevel: +data.statisticsGraphLevel,
        participationPolicy: +data.participationPolicy,
        requireSignUp: data.requireSignUp === "true",
        remoteHelp: data.remoteHelp,
      },
      {
        onSuccess: () => {
          toast.success(getTypedFormattedString(intl, "alert-settings-saved"));
          queryUtils.invalidateQueries(["settings.getCourseSettings"]);
          queryUtils.invalidateQueries(["session.getSessionInfo"]);
        },
        onError: () => {
          toast.error(getTypedFormattedString(intl, "alert-settings-save-failed"));
        },
      }
    );
  };

  const showLanguage = sessionsQuery.data && sessionsQuery.data.some((x) => x.languages.length > 0);

  return (
    <div>
      {/* Course settings */}

      <h3>
        <TypedFormattedMessage id="settings-title" />
      </h3>
      {settingsQuery.isLoading && <Spinner />}
      {settingsQuery.isError && <ErrorPanel />}
      {settingsQuery.data && !settingsQuery.isError && (
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Course name */}
          <div className="row mb-4">
            <label htmlFor="courseName" className="col-sm-2 col-form-label">
              <TypedFormattedMessage id="settings-course-name" />
            </label>
            <div className="col-sm-6">
              <input
                type="text"
                className={clsx("form-control", { "is-invalid": errors.name })}
                id="courseName"
                {...register("name", { required: true, minLength: 1 })}
              />
            </div>
          </div>

          {/* Course id */}
          <div className="row mb-4">
            <label className="col-sm-2 col-form-label">
              <TypedFormattedMessage id="settings-course-id" />
            </label>
            <div className="col-sm-6">
              <input
                type="text"
                readOnly
                className="form-control-plaintext"
                defaultValue={settingsQuery.data.courseId}
              />
            </div>
          </div>

          {/* Course url */}
          <div className="row mb-4">
            <label htmlFor="courseURL" className="col-sm-2 col-form-label">
              <TypedFormattedMessage id="settings-course-url" />
            </label>
            <div className="col-sm-6">
              <input type="text" className="form-control" id="courseURL" {...register("url")} />
              <div className="form-text">
                <TypedFormattedMessage id="settings-course-url-help" />
              </div>
            </div>
          </div>

          {/* Combine with */}
          <div className="row mb-4">
            <label htmlFor="combined" className="col-sm-2 col-form-label">
              <TypedFormattedMessage id="settings-combine" />
            </label>
            <div className="col-sm-6">
              <input type="text" className="form-control" id="combined" {...register("combined")} />
              <div className="form-text">
                <TypedFormattedMessage id="settings-combine-help" />
              </div>
            </div>
          </div>

          {/* Video projector URL */}
          <div className="row mb-4">
            <label htmlFor="projectorConf" className="col-sm-2 col-form-label">
              <TypedFormattedMessage id="settings-projector" />
            </label>
            <div className="col-sm-6">
              <input type="text" className="form-control" id="projectorConf" {...register("projectorConf")} />
              <div className="form-text">
                <TypedFormattedMessage
                  id="settings-projector-help"
                  values={{
                    a: (chunks: any) => (
                      <a
                        target="_blank"
                        href={"https://github.com/ttsirkia/neuvontajono/blob/master/README.md#projector-configuration"}
                        rel="noreferrer"
                      >
                        <span>{chunks}</span>
                      </a>
                    ),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Default UI language */}
          <div className="row mb-4">
            <label htmlFor="defaultLanguage" className="col-sm-2 col-form-label">
              <TypedFormattedMessage id="settings-default-language" />
            </label>
            <div className="col-sm-6">
              <select id="defaultLanguage" {...register("defaultLanguage")}>
                <option value="fi">fi</option>
                <option value="en">en</option>
              </select>
              <div id="defaultLanguageHelp" className="form-text">
                <TypedFormattedMessage id="settings-default-language-help" />
              </div>
            </div>
          </div>

          {/* Default participation policy */}
          <div className="row mb-4">
            <label htmlFor="participationPolicy" className="col-sm-2 col-form-label">
              <TypedFormattedMessage id="settings-participation-policy" />
            </label>
            <div className="col-sm-6">
              <select id="participationPolicy" {...register("participationPolicy")}>
                <option value="1">
                  <TypedFormattedMessage id="settings-participation-policy-1" />
                </option>
                <option value="2">
                  <TypedFormattedMessage id="settings-participation-policy-2" />
                </option>
                <option value="3">
                  <TypedFormattedMessage id="settings-participation-policy-3" />
                </option>
              </select>

              <div id="participationPolicyHelp" className="form-text">
                <TypedFormattedMessage id="settings-participation-policy-help" />
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <label htmlFor="remoteHelp" className="col-sm-2 col-form-label">
              <TypedFormattedMessage id="settings-remote-help" />
            </label>
            <div className="col-sm-6">
              <textarea className="form-control" id="remoteHelp" rows={3} {...register("remoteHelp")} />
              <div className="form-text">
                <TypedFormattedMessage id="settings-remote-course-help" />
              </div>
            </div>
          </div>

          {/* Require sign up */}
          <div className="row mb-4">
            <div className="col-sm-6 offset-sm-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="requireSignUp"
                  value="true"
                  {...register("requireSignUp")}
                />
                <label className="form-check-label" htmlFor="requireSignUp">
                  <TypedFormattedMessage id="settings-require-sign-up" />
                </label>
              </div>
              <div id="requireSignUpHelp" className="form-text">
                <TypedFormattedMessage id="settings-require-sign-up-help" />
              </div>
            </div>
          </div>

          <hr />

          {/* Participants statistics visibility level */}
          <div className="row mb-4">
            <label htmlFor="statisticsLevel" className="col-sm-2 col-form-label">
              <TypedFormattedMessage id="settings-statistics-visibility" />
            </label>
            <div className="col-sm-6">
              <select id="statisticsLevel" {...register("statisticsLevel")}>
                <option value="-1">
                  <TypedFormattedMessage id="settings-statistics--1" />
                </option>
                <option value="0">
                  <TypedFormattedMessage id="settings-statistics-0" />
                </option>
                <option value="1">
                  <TypedFormattedMessage id="settings-statistics-1" />
                </option>
                <option value="2">
                  <TypedFormattedMessage id="settings-statistics-2" />
                </option>
              </select>

              <div id="statisticsLevelHelp" className="form-text">
                <TypedFormattedMessage id="settings-statistics-help" />
              </div>
            </div>
          </div>

          {/* Queueing statistics visibility level */}
          <div className="row mb-4">
            <label htmlFor="statisticsQueueLevel" className="col-sm-2 col-form-label">
              <TypedFormattedMessage id="settings-statistics-queue-visibility" />
            </label>
            <div className="col-sm-6">
              <select id="statisticsQueueLevel" {...register("statisticsQueueLevel")}>
                <option value="0">
                  <TypedFormattedMessage id="settings-statistics-0" />
                </option>
                <option value="1">
                  <TypedFormattedMessage id="settings-statistics-1" />
                </option>
                <option value="2">
                  <TypedFormattedMessage id="settings-statistics-2" />
                </option>
              </select>

              <div id="statisticsQueueLevelHelp" className="form-text">
                <TypedFormattedMessage id="settings-statistics-queue-help" />
              </div>
            </div>
          </div>

          {/* Graph visibility level */}
          <div className="row mb-4">
            <label htmlFor="statisticsGraphLevel" className="col-sm-2 col-form-label">
              <TypedFormattedMessage id="settings-statistics-graph-visibility" />
            </label>
            <div className="col-sm-6">
              <select id="statisticsGraphLevel" {...register("statisticsGraphLevel")}>
                <option value="0">
                  <TypedFormattedMessage id="settings-statistics-0" />
                </option>
                <option value="1">
                  <TypedFormattedMessage id="settings-statistics-1" />
                </option>
                <option value="2">
                  <TypedFormattedMessage id="settings-statistics-2" />
                </option>
              </select>

              <div id="statisticsGraphLevelHelp" className="form-text">
                <TypedFormattedMessage id="settings-statistics-graph-help" />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <TypedFormattedMessage id="save" />
          </button>
        </form>
      )}

      {/* Sessions */}

      <h3 className="mt-5">
        <TypedFormattedMessage id="settings-sessions-title" />
      </h3>
      {sessionsQuery.isLoading && <Spinner />}
      {sessionsQuery.isError && <ErrorPanel />}
      {sessionsQuery.data && !sessionsQuery.isError && (
        <div>
          {/* Sessions table */}

          <table className="table">
            <thead>
              <tr>
                <th>
                  <TypedFormattedMessage id="select-th-name" />
                </th>
                <th>
                  <TypedFormattedMessage id="settings-th-span" />
                </th>
                <th>
                  <TypedFormattedMessage id="select-th-time" />
                </th>
                <th>
                  <TypedFormattedMessage id="select-th-location" />
                </th>
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
                  <React.Fragment key={s.id}>
                    <tr className={clsx({ "main-row": true, "text-decoration-line-through": !s.active })}>
                      <td>{s.name}</td>
                      <td>
                        <LocalizedDatespan start={s.startDate} end={s.endDate} />
                      </td>
                      <td>
                        <LocalizedTimespan
                          weekday={s.weekday}
                          openTime={s.queueOpenTime}
                          startTime={s.startTime}
                          endTime={s.endTime}
                        />
                      </td>
                      <td>{s.locations.join(", ")}</td>
                      {showLanguage && <td>{s.languages.join(", ")}</td>}
                      <td>
                        <a href={`/neuvontajono/sessions/${s.id}/edit`} className="btn btn-sm btn-primary">
                          <TypedFormattedMessage id="edit" />
                        </a>
                        <AlertDialog
                          title={getTypedFormattedString(intl, "delete")}
                          text={getTypedFormattedString(intl, "settings-delete-confirm")}
                          actionText={getTypedFormattedString(intl, "delete")}
                          cancelText={getTypedFormattedString(intl, "cancel")}
                          actionStyle="btn-danger"
                          onClick={() => {
                            deleteSessionMutation.mutate(
                              { sessionId: s.id },
                              {
                                onSuccess: () => {
                                  queryUtils.invalidateQueries(["course.getAllSessions"]);
                                  toast.success(getTypedFormattedString(intl, "alert-session-deleted"));
                                },
                                onError: () => {
                                  toast.error(getTypedFormattedString(intl, "alert-session-delete-failed"));
                                },
                              }
                            );
                          }}
                        >
                          <button className="ms-1 btn btn-sm btn-danger delete-session">
                            <TypedFormattedMessage id="delete" />
                          </button>
                        </AlertDialog>
                      </td>
                    </tr>
                    {s.excludedDates.length > 0 && (
                      <tr>
                        <td className="details-row" colSpan={6}>
                          <TypedFormattedMessage id="settings-excluded-dates" />
                          {s.excludedDates.map((x, i) => (
                            <span key={x}>
                              {i > 0 ? ", " : ""}
                              {format(
                                parse(x, "yyyy-MM-dd", new Date()),
                                getTypedFormattedString(intl, "date-output-format")
                              )}
                            </span>
                          ))}
                        </td>
                      </tr>
                    )}
                    {s.assistants.length > 0 && (
                      <tr>
                        <td className="details-row" colSpan={6}>
                          <TypedFormattedMessage id="select-th-staff" />
                          {": "}
                          {s.assistants.join(", ")}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="details-row" colSpan={6}>
                        <TypedFormattedMessage id="settings-session-participation-policy" />{" "}
                        {intl.formatMessage({ id: "settings-participation-policy-" + s.participationPolicy })}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* Action buttons */}

          <p>
            <a href="/neuvontajono/sessions/create" className="btn btn-success">
              <TypedFormattedMessage id="create" />
            </a>
          </p>
          <p className="mt-4">
            <TypedFormattedMessage id="settings-actions-help" />
          </p>
          <p>
            <button
              className="btn btn-primary"
              onClick={() => {
                disableAllMutation.mutate(null, {
                  onSuccess: () => {
                    queryUtils.invalidateQueries(["course.getAllSessions"]);
                    toast.success(getTypedFormattedString(intl, "alert-sessions-disabled"));
                  },
                  onError: () => {
                    toast.error(getTypedFormattedString(intl, "alert-sessions-disable-failed"));
                  },
                });
              }}
            >
              <TypedFormattedMessage id="disable-all" />
            </button>
            <button
              className="btn btn-primary ms-2"
              onClick={() => {
                enableAllMutation.mutate(null, {
                  onSuccess: () => {
                    queryUtils.invalidateQueries(["course.getAllSessions"]);
                    toast.success(getTypedFormattedString(intl, "alert-sessions-enabled"));
                  },
                  onError: () => {
                    toast.error(getTypedFormattedString(intl, "alert-sessions-enable-failed"));
                  },
                });
              }}
            >
              <TypedFormattedMessage id="enable-all" />
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
