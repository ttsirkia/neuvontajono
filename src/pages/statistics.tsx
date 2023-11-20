import * as d3 from "d3";
import { add, startOfDay } from "date-fns";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useIntl } from "react-intl";

import { SessionContext } from "../components/context/SessionContext";
import { ErrorPanel } from "../components/ErrorPanel";
import { Spinner } from "../components/Spinner";
import { getFormattedString, getTypedFormattedString, TypedFormattedMessage } from "../utils/translation";
import { trpc } from "../utils/trpc";

const StatisticsPage: NextPage = () => {
  const intl = useIntl();
  const router = useRouter();
  const session = useContext(SessionContext);
  const [selectedStats, setSelectedStats] = useState("");
  const [showTooltip, setShowTooltip] = useState([-1, -1]);
  const [tooltipData, setTooltipData] = useState<any>(null);

  // ************************************************************************************************

  const statisticsTableQuery = trpc.useQuery(["statistics.getStatisticsTableDate"], {
    onError: (data) => {
      if (data && (data.data?.code === "FORBIDDEN" || data.data?.code === "UNAUTHORIZED")) {
        toast.error(getTypedFormattedString(intl, "alert-statistics-no-permission"));
        router.replace("/");
      }
    },
    onSuccess: (data) => {
      if (data && data.availableStats.length > 0) {
        setSelectedStats(data.availableStats[0]!.name);
      }
    },
  });

  const mostFrequentQuery = trpc.useQuery(["statistics.getMostFrequentUsers"], {
    enabled: session?.role === "teacher",
    onError: (data) => {
      if (data && (data.data?.code === "FORBIDDEN" || data.data?.code === "UNAUTHORIZED")) {
        toast.error(getTypedFormattedString(intl, "alert-no-staff"));
        router.replace("/");
      }
    },
  });

  const allSessionsQuery = trpc.useQuery(["statistics.getAllSessionNames"], {
    enabled: session?.role === "teacher",
    onSuccess: (data) => {
      if (data && data[0]) {
        setValue("session", data[0].id);
      }
    },
    onError: (data) => {
      if (data && (data.data?.code === "FORBIDDEN" || data.data?.code === "UNAUTHORIZED")) {
        toast.error(getTypedFormattedString(intl, "alert-no-staff"));
        router.replace("/");
      }
    },
  });

  const getParticipantsMutation = trpc.useMutation(["statistics.getParticipants"]);

  // ************************************************************************************************

  const { register, handleSubmit, control, setValue } = useForm({
    defaultValues: {
      date: new Date(),
      session: "",
    },
  });

  const onSubmit = (data: any) => {
    getParticipantsMutation.mutate({
      date: data["date"].valueOf(),
      session: data["session"],
    });
  };

  // ************************************************************************************************

  type DataPoint = {
    date: Date;
    sinceMidnight: number;
    queueLength: number;
  };

  const Tooltip = (props: any) => {
    useEffect(() => {
      if (!props.data || props.data.length === 0) {
        return;
      }
      const data: DataPoint[] = props.data.map((x: string) => {
        const parts = x.split("|");
        const obj: DataPoint = {
          date: add(startOfDay(new Date()), { minutes: +parts[0]! }),
          sinceMidnight: +parts[0]!,
          queueLength: +parts[1]!,
        };
        return obj;
      });

      const margin = { top: 10, right: 10, bottom: 30, left: 30 },
        width = 400 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

      d3.select("#tooltip-svg").selectAll("g").remove();

      const svg = d3
        .select("#tooltip-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      const x = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => d.date) as [Date, Date])
        .range([0, width]);

      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(
          d3
            .axisBottom(x)
            .ticks(8)
            .tickFormat((x) => d3.timeFormat("%H:%M")(x as Date))
        );

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.queueLength) as number])
        .range([height, 0]);

      svg.append("g").call(d3.axisLeft(y).ticks(5));

      svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#007")
        .attr("stroke-width", 1.5)
        .attr(
          "d",
          d3
            .line<DataPoint>()
            .x((o) => x(o.date))
            .y((o) => y(o.queueLength))
        );
    }, [props, props.data]);

    if (!props.data || props.data.length === 0) {
      return null;
    }

    return (
      <div
        id="tooltip"
        style={{
          top: props.y,
          left: props.x,
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          <TypedFormattedMessage id="statistics-queue-graph" />
        </div>
        <svg id="tooltip-svg" width="400" height="200"></svg>
      </div>
    );
  };

  // ************************************************************************************************

  return (
    <>
      {showTooltip[0] && showTooltip[0] >= 0 && <Tooltip data={tooltipData} x={showTooltip[0]} y={showTooltip[1]} />}

      {/* Statistics table */}
      <div>
        {statisticsTableQuery.isLoading && <Spinner />}
        {statisticsTableQuery.isError && <ErrorPanel />}
        {!statisticsTableQuery.isError && statisticsTableQuery.data && selectedStats && (
          <div>
            {statisticsTableQuery.data.availableStats.length > 1 && (
              <select
                onChange={(e) => {
                  setSelectedStats(e.target.value);
                }}
              >
                {statisticsTableQuery.data.availableStats.map((x, i) => (
                  <option key={i} value={x.name}>
                    {getFormattedString(intl, x.name)}
                  </option>
                ))}
              </select>
            )}
            <h3 className="my-4">{getFormattedString(intl, selectedStats)}</h3>
            <p className="my-4">{getFormattedString(intl, selectedStats + "-lead")}</p>
            <table className="table" style={{ width: "100px" }}>
              <thead>
                <tr>
                  <th></th>
                  {statisticsTableQuery.data.weeks.map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {statisticsTableQuery.data.availableStats
                  .find((x) => x.name === selectedStats)
                  ?.values.map((y, i) => (
                    <tr key={i}>
                      <td>{y.session}</td>
                      {y.stringValues.map((x, i) => (
                        <td
                          onMouseEnter={(e) => {
                            setShowTooltip([e.pageX + 10, e.pageY + 10]);
                            setTooltipData(statisticsTableQuery.data.graphData.find((x) => x.id === y.id)?.values[i]);
                          }}
                          onMouseMove={(e) => {
                            setShowTooltip([e.pageX + 10, e.pageY + 10]);
                          }}
                          onMouseLeave={(e) => {
                            setShowTooltip([-1, -1]);
                            setTooltipData(null);
                          }}
                          key={i}
                          style={{
                            color: x === "-" ? "black" : y.colors[i],
                          }}
                        >
                          {x}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Most frequent participants */}
      {session && session.role === "teacher" && (
        <div>
          <hr className="my-5" />
          <h3>
            <TypedFormattedMessage id="statistics-most-active-title" />
          </h3>
          <div className="alert alert-info">
            <TypedFormattedMessage id="statistics-most-active-info" />
          </div>
          <p>
            <TypedFormattedMessage id="statistics-most-active-main" />
          </p>
          {mostFrequentQuery.isLoading && <Spinner />}
          {mostFrequentQuery.isError && <ErrorPanel />}
          {!mostFrequentQuery.isError && mostFrequentQuery.data && (
            <div>
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <th>
                      <TypedFormattedMessage id="statistics-th-active-position" />
                    </th>
                    <th>
                      <TypedFormattedMessage id="statistics-th-active-name" />
                    </th>
                    <th>
                      <TypedFormattedMessage id="statistics-th-active-visits" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mostFrequentQuery.data.map((participant: any, i: number) => {
                    return (
                      <tr key={i}>
                        <td>
                          <TypedFormattedMessage
                            id="ordinal-value"
                            values={{
                              position: participant[0],
                            }}
                          />
                        </td>
                        <td>{participant[1]}</td>
                        <td>{participant[2]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Participation report */}
      {session && session.role === "teacher" && (
        <div>
          <hr className="my-5" />
          <h3>
            <TypedFormattedMessage id="statistics-session-participants-title" />
          </h3>
          <div className="alert alert-info">
            <TypedFormattedMessage id="statistics-most-active-info" />
          </div>
          <p>
            <TypedFormattedMessage id="statistics-session-participants-main" />
          </p>
          {allSessionsQuery.isLoading && <Spinner />}
          {allSessionsQuery.isError && <ErrorPanel />}
          {!allSessionsQuery.isError && allSessionsQuery.data && (
            <div>
              <form onSubmit={handleSubmit(onSubmit)} className="my-4">
                {/* Session */}
                <div className="row mb-4">
                  <label htmlFor="session" className="col-md-2 col-form-label">
                    <TypedFormattedMessage id="queue-group" />
                  </label>
                  <div className="col-md-3">
                    <select id="session" className="form-select" {...register("session")}>
                      {allSessionsQuery.data.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date */}
                <div className="row mb-4">
                  <label htmlFor="date" className="col-sm-2 col-form-label">
                    <TypedFormattedMessage id="statistics-session-date" />
                  </label>
                  <div className="col-md-3">
                    <Controller
                      control={control}
                      name="date"
                      render={({ field }) => (
                        <DatePicker
                          className="form-control"
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

                <button type="submit" className="btn btn-primary">
                  <TypedFormattedMessage id="search" />
                </button>
              </form>

              {getParticipantsMutation.isLoading && <Spinner />}
              {getParticipantsMutation.isError && <ErrorPanel />}

              {!getParticipantsMutation.isLoading &&
                getParticipantsMutation.data &&
                getParticipantsMutation.data.length === 0 && (
                  <p>
                    <TypedFormattedMessage id="statistics-no-search-results" />
                  </p>
                )}

              {!getParticipantsMutation.isLoading &&
                getParticipantsMutation.data &&
                getParticipantsMutation.data.length > 0 && (
                  <div>
                    <table className="table table-condensed">
                      <thead>
                        <tr>
                          <th>
                            <TypedFormattedMessage id="statistics-th-active-name" />
                          </th>
                          <th>
                            <TypedFormattedMessage id="manage-th-location" />
                          </th>
                          <th>
                            <TypedFormattedMessage id="email" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getParticipantsMutation.data.map((participant, i) => {
                          return (
                            <tr key={i}>
                              <td>{participant.name}</td>
                              <td>{participant.locations}</td>
                              <td>
                                <a href={`mailto:${participant.email}`}>{participant.email}</a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default StatisticsPage;
