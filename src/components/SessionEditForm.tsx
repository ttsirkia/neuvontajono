import clsx from "clsx";
import { format, parse } from "date-fns";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { SessionDTO } from "../models/Session";
import { convertTimeStringToInt, getDatesBetween } from "../utils/dates";
import { getTypedFormattedString, TypedFormattedMessage } from "../utils/translation";
import { Stringified } from "../utils/typeUtils";

export type SessionDTOWithDates = Omit<
  Stringified<SessionDTO>,
  "startDate" | "endDate" | "excludedDates" | "id" | "isToday" | "isOpen" | "isOpening"
> & {
  startDate: Date;
  endDate: Date;
  excludedDates: string[];
};

type Props = {
  values: SessionDTOWithDates;
  courseParticipationPolicy: number;
  onSubmit: SubmitHandler<SessionDTOWithDates>;
};

const showLocation = (courseParticipationPolicy: number, participationPolicy: string) => {
  return (
    participationPolicy === "1" ||
    participationPolicy === "3" ||
    (participationPolicy === "0" && courseParticipationPolicy === 1) ||
    (participationPolicy === "0" && courseParticipationPolicy === 3)
  );
};
const showMethod = (courseParticipationPolicy: number, participationPolicy: string) => {
  return (
    participationPolicy === "2" ||
    participationPolicy === "3" ||
    (participationPolicy === "0" && courseParticipationPolicy === 2) ||
    (participationPolicy === "0" && courseParticipationPolicy === 3)
  );
};

export const SessionEditForm: FC<Props> = (props) => {
  const [showFields, setShowFields] = useState({
    location: showLocation(props.courseParticipationPolicy, props.values.participationPolicy),
    method: showMethod(props.courseParticipationPolicy, props.values.participationPolicy),
  });
  const [datesBetween, setDatesBetween] = useState({ dates: [] as string[], selected: [] as string[] });
  const intl = useIntl();

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SessionDTOWithDates>({
    defaultValues: props.values,
  });

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "startDate" || name === "endDate" || name === "weekday") {
        setDatesBetween((old) => {
          return {
            dates: getDatesBetween(getValues("startDate"), getValues("endDate"), +getValues("weekday")),
            selected: { ...old.selected },
          };
        });
      }

      if (name === "participationPolicy") {
        setShowFields({
          location: showLocation(props.courseParticipationPolicy, getValues("participationPolicy")),
          method: showMethod(props.courseParticipationPolicy, getValues("participationPolicy")),
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, getValues, props.courseParticipationPolicy]);

  useEffect(() => {
    setDatesBetween({
      dates: getDatesBetween(props.values.startDate, props.values.endDate, +props.values.weekday),
      selected: [...props.values.excludedDates],
    });
  }, [props.values.endDate, props.values.excludedDates, props.values.startDate, props.values.weekday]);

  // ************************************************************************************************

  return (
    <form onSubmit={handleSubmit(props.onSubmit)}>
      {/* Session name */}
      <div className="row mb-4">
        <label htmlFor="name" className="col-sm-2 col-form-label">
          <TypedFormattedMessage id="modify-name" />
        </label>
        <div className="col-sm-6">
          <input
            type="text"
            className={clsx("form-control", { "is-invalid": errors.name })}
            id="name"
            {...register("name", { required: true, minLength: 1 })}
          />
          <div className="form-text">
            <TypedFormattedMessage id="modify-name-help" />
          </div>
        </div>
      </div>

      {/* Participation policy */}
      <div className="row mb-4">
        <label htmlFor="participationPolicy" className="col-sm-2 col-form-label">
          <TypedFormattedMessage id="settings-participation-policy" />
        </label>
        <div className="col-sm-6">
          <select id="participationPolicy" {...register("participationPolicy")}>
            <option value="0">
              <TypedFormattedMessage id="settings-participation-policy-0" />
            </option>
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
        </div>
      </div>

      {/* Location */}
      {showFields.location && (
        <div className="row mb-4">
          <label htmlFor="locations" className="col-sm-2 col-form-label">
            <TypedFormattedMessage id="modify-location" />
          </label>
          <div className="col-sm-6">
            <input
              type="text"
              className={clsx("form-control", { "is-invalid": errors.locations })}
              id="locations"
              {...register("locations", {
                validate: (val) => {
                  return showFields.location && val.length > 0;
                },
              })}
            />
            <div className="form-text">
              <TypedFormattedMessage id="modify-location-help" />
            </div>
          </div>
        </div>
      )}

      {/* Method for remote participation */}
      {showFields.method && (
        <div className="row mb-4">
          <label htmlFor="remoteMethod" className="col-sm-2 col-form-label">
            <TypedFormattedMessage id="modify-remote-method" />
          </label>
          <div className="col-sm-6">
            <input
              type="text"
              className={clsx("form-control", { "is-invalid": errors.remoteMethod })}
              id="locations"
              {...register("remoteMethod", {
                validate: (val) => {
                  return showFields.method && val.length > 0;
                },
              })}
            />
            <div className="form-text">
              <TypedFormattedMessage id="modify-remote-method-help" />
            </div>
          </div>
        </div>
      )}

      <div className="row mb-4">
        <label htmlFor="remoteHelp" className="col-sm-2 col-form-label">
          <TypedFormattedMessage id="settings-remote-help" />
        </label>
        <div className="col-sm-6">
          <textarea className="form-control" id="remoteHelp" rows={3} {...register("remoteHelp")} />
          <div className="form-text">
            <TypedFormattedMessage id="settings-remote-help-help" />
          </div>
        </div>
      </div>

      {/* Staff members */}
      <div className="row mb-4">
        <label htmlFor="assistants" className="col-sm-2 col-form-label">
          <TypedFormattedMessage id="modify-staff" />
        </label>
        <div className="col-sm-6">
          <input type="text" className="form-control" id="locations" {...register("assistants")} />
          <div className="form-text">
            <TypedFormattedMessage id="modify-staff-help" />
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="row mb-4">
        <label htmlFor="language" className="col-sm-2 col-form-label">
          <TypedFormattedMessage id="modify-language" />
        </label>
        <div className="col-sm-6">
          <input type="text" className="form-control" id="language" {...register("languages")} />
          <div className="form-text">
            <TypedFormattedMessage id="modify-language-help" />
          </div>
        </div>
      </div>

      <hr />

      {/* Weekday */}
      <div className="row mb-4">
        <label htmlFor="weekday" className="col-sm-2 col-form-label">
          <TypedFormattedMessage id="modify-weekday" />
        </label>
        <div className="col-sm-6">
          <select id="weekday" {...register("weekday")}>
            {getTypedFormattedString(intl, "weekdays-order")
              .split(",")
              .map((x) => {
                return (
                  <option key={x} value={x}>
                    {getTypedFormattedString(intl, "weekdays-long").split(",")[+x]}
                  </option>
                );
              })}
          </select>
        </div>
      </div>

      {/* Start date */}
      <div className="row mb-4">
        <label htmlFor="startDate" className="col-sm-2 col-form-label">
          <TypedFormattedMessage id="modify-start-date" />
        </label>
        <div className="col-sm-6">
          <Controller
            control={control}
            name="startDate"
            rules={{ validate: (x) => x !== null && !isNaN(x.valueOf()) }}
            render={({ field }) => (
              <DatePicker
                className={clsx("form-control", { "is-invalid": errors.startDate })}
                dateFormat={getTypedFormattedString(intl, "date-input-format")}
                onChange={(date) => field.onChange(date)}
                selected={field.value}
              />
            )}
          />
          <div className="form-text">
            <TypedFormattedMessage id="modify-date-help" />
          </div>
        </div>
      </div>

      {/* End date */}
      <div className="row mb-4">
        <label htmlFor="endDate" className="col-sm-2 col-form-label">
          <TypedFormattedMessage id="modify-end-date" />
        </label>
        <div className="col-sm-6">
          <Controller
            control={control}
            name="endDate"
            rules={{ validate: (x) => x !== null && !isNaN(x.valueOf()) }}
            render={({ field }) => (
              <DatePicker
                className={clsx("form-control", { "is-invalid": errors.endDate })}
                dateFormat={getTypedFormattedString(intl, "date-input-format")}
                onChange={(date) => field.onChange(date)}
                selected={field.value}
              />
            )}
          />
        </div>
      </div>

      {/* In use */}
      <div className="row mb-4">
        <div className="col-sm-6 offset-sm-2">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="active" value="true" {...register("active")} />
            <label className="form-check-label" htmlFor="active">
              <TypedFormattedMessage id="modify-in-use" />
            </label>
          </div>
          <div id="requireSignUpHelp" className="form-text">
            <TypedFormattedMessage id="modify-in-use-help" />
          </div>
        </div>
      </div>

      {/* Exclude dates */}
      <div className="row mb-4">
        <label htmlFor="excludedDates" className="col-sm-2 col-form-label">
          <TypedFormattedMessage id="settings-excluded-dates" />
        </label>
        <div className="col-sm-6">
          {datesBetween.dates.map((x, i) => {
            return (
              <div className="form-check form-check-inline" key={x} style={{ minWidth: "140px" }}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`excludedDates.${x}`}
                  value={x}
                  {...register("excludedDates")}
                />
                <label className="form-check-label" htmlFor={`excludedDates.${x}`}>
                  {format(parse(x, "yyyy-MM-dd", new Date()), getTypedFormattedString(intl, "date-output-format"))}
                </label>
              </div>
            );
          })}
          <div className="form-text">
            <TypedFormattedMessage id="settings-excluded-dates-help" />
          </div>
        </div>
      </div>

      <hr />

      {/* Start time */}
      <div className="row mb-4">
        <label htmlFor="startTime" className="col-sm-2 col-form-label">
          <TypedFormattedMessage id="modify-start-time" />
        </label>
        <div className="col-sm-6">
          <input
            type="text"
            className={clsx("form-control", { "is-invalid": errors.startTime })}
            id="startTime"
            {...register("startTime", {
              required: true,
              validate: (val) => {
                return convertTimeStringToInt(val, getTypedFormattedString(intl, "time-input-format")) >= 0;
              },
            })}
            onBlur={() => {
              if (!getValues("queueOpenTime")) {
                setValue("queueOpenTime", getValues("startTime"));
              }
            }}
          />
          <div className="form-text">
            <TypedFormattedMessage id="modify-time-help" />
          </div>
        </div>
      </div>

      {/* End time */}
      <div className="row mb-4">
        <label htmlFor="endTime" className="col-sm-2 col-form-label">
          <TypedFormattedMessage id="modify-end-time" />
        </label>
        <div className="col-sm-6">
          <input
            type="text"
            className={clsx("form-control", { "is-invalid": errors.endTime })}
            id="endTime"
            {...register("endTime", {
              required: true,
              validate: (val) => {
                return (
                  convertTimeStringToInt(val, getTypedFormattedString(intl, "time-input-format")) >= 0 &&
                  convertTimeStringToInt(val, getTypedFormattedString(intl, "time-input-format")) >
                    convertTimeStringToInt(getValues("startTime"), getTypedFormattedString(intl, "time-input-format"))
                );
              },
            })}
          />
        </div>
      </div>

      {/* Queue opens */}
      <div className="row mb-4">
        <label htmlFor="queueOpenTime" className="col-sm-2 col-form-label">
          <TypedFormattedMessage id="modify-queue-open-time" />
        </label>
        <div className="col-sm-6">
          <input
            type="text"
            className={clsx("form-control", { "is-invalid": errors.queueOpenTime })}
            id="queueOpenTime"
            {...register("queueOpenTime", {
              required: true,
              validate: (val) => {
                return (
                  convertTimeStringToInt(val, getTypedFormattedString(intl, "time-input-format")) >= 0 &&
                  convertTimeStringToInt(val, getTypedFormattedString(intl, "time-input-format")) <=
                    convertTimeStringToInt(getValues("startTime"), getTypedFormattedString(intl, "time-input-format"))
                );
              },
            })}
          />
          <div className="form-text">
            <TypedFormattedMessage id="modify-queue-open-help" />
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        <TypedFormattedMessage id="save" />
      </button>
      <Link href="/settings">
        <a className="btn btn-outline-secondary ms-2">
          <TypedFormattedMessage id="cancel" />
        </a>
      </Link>
    </form>
  );
};
