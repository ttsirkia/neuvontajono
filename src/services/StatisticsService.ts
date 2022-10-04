import { isDocument } from "@typegoose/typegoose";
import { add, format, max, min, nextDay, previousDay, startOfDay } from "date-fns";
import { Course } from "../models/Course";
import { ParticipantModel, SessionModel, SessionStatsModel } from "../models/modelClasses";
import { Session } from "../models/Session";
import { dbConnect } from "../utils/database";
import { Role } from "../utils/session";
import { QueueService } from "./QueueService";

/**
 * Handles all actions related to the statistics in database level.
 */
export namespace StatisticsService {
  // ************************************************************************************************
  export const saveQueueLength = async (session: Session, course: Course) => {
    await dbConnect();

    const length = await QueueService.getQueueLength(course, session);
    const today = startOfDay(new Date());
    const minutes = new Date().getHours() * 60 + new Date().getMinutes();
    const stats = await SessionStatsModel.findOrCreate({ session: session.id, course: course.id, date: today }, {});
    const newArray = stats.doc.queueLength.slice(0);

    // A new data point only every two minutes but it is the maximum for the period
    if (newArray.length > 0) {
      const lastElement = newArray[newArray.length - 1];
      if (lastElement && +lastElement.split("|")[0]! > minutes - 2) {
        const parts = lastElement.split("|");
        newArray[newArray.length - 1] = parts[0] + "|" + Math.max(+parts[1]!, length);
      } else {
        newArray.push(minutes + "|" + length);
      }
    } else {
      newArray.push(minutes + "|" + length);
    }

    stats.doc.queueLength = newArray;
    await stats.doc.save();
  };
  // ************************************************************************************************
  export const saveQueueLengths = async () => {
    const sessions = await QueueService.getCurrentSessions(undefined);
    sessions.forEach((x) => {
      if (isDocument(x.course)) {
        saveQueueLength(x, x.course);
      }
    });
  };
  // ************************************************************************************************
  export const addQueueDuration = async (session: Session, course: Course, duration: number) => {
    const today = startOfDay(new Date());
    const stats = await SessionStatsModel.findOrCreate({ session: session.id, course: course.id, date: today }, {});
    const newArray = stats.doc.queueDuration.slice(0);
    newArray.push(duration);
    stats.doc.queueDuration = newArray;
    await stats.doc.save();
  };
  // ************************************************************************************************
  export const getStatisticsTable = async (course: Course, role: Role) => {
    const sessions = await SessionModel.find({ course: course.id }).sort({ weekday: 1, startTime: 1 });
    const participants = await ParticipantModel.find({ course: course.id }).populate("session");
    const stats = await SessionStatsModel.find({ course: course.id }).populate("session");

    const selectColor = function (value: number, values: number[]) {
      const filteredValues = values.filter((x) => x > 0).sort();
      if (filteredValues.length < 4 || value < 1) {
        return "green";
      } else if (value < filteredValues[~~(filteredValues.length * 0.75)]!) {
        return "green";
      } else if (value < filteredValues[~~(filteredValues.length * 0.9)]!) {
        return "yellow";
      } else {
        return "red";
      }
    };

    // Find first and last week of all sessions
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    type SessionDate = {
      name: string;
      id: any;
      minDate: Date;
      maxDate: Date;
      excluded: string[];
    };

    const sessionDates: SessionDate[] = [];

    sessions.forEach((x) => {
      // Actual dates, as the first session might be only week later
      const startDate = x.startDate.getDay() === x.weekday ? x.startDate : nextDay(x.startDate, x.weekday as Day);
      const endDate = x.startDate.getDay() === x.weekday ? x.endDate : previousDay(x.endDate, x.weekday);
      minDate = min([startDate, minDate ?? startDate]);
      maxDate = max([endDate, maxDate ?? endDate]);
      sessionDates.push({ name: x.name, minDate, maxDate, id: x.id, excluded: x.excludedDates });
    });

    let weeks = [];

    if (sessions.length > 0) {
      const lastWeek = format(maxDate!, "I/RRRR");
      let curWeek = format(minDate!, "I/RRRR");
      let curDay = minDate!;
      do {
        weeks.push(curWeek);
        curDay = add(curDay, { days: 7 });
        curWeek = format(curDay, "I/RRRR");
      } while (curWeek !== lastWeek);
      weeks.push(lastWeek);
    }

    const weekIndex: Record<string, number> = {};
    weeks.forEach((x, i) => (weekIndex[x] = i));

    type SessionAndColorValues = {
      session: string;
      values: number[];
      stringValues: string[];
      colors: string[];
    };

    type SessionAndStringColorValues = {
      session: string;
      stringValues: string[];
      colors: string[];
    };

    type SessionAndValues = {
      session: string;
      values: string[][];
    };

    const availableStats: { name: string; values: SessionAndStringColorValues[] }[] = [];

    // ************************************************************************************************
    // Participation count

    if (
      course.statisticsLevel === 0 ||
      (course.statisticsLevel >= 1 && role === "teacher") ||
      (course.statisticsLevel === 1 && role === "staff")
    ) {
      const participationCounts: SessionAndColorValues[] = [];
      sessions.forEach((s) => {
        const values: SessionAndColorValues = {
          session: s.name,
          values: [],
          colors: [],
          stringValues: [],
        };
        for (let i = 0; i < weeks.length; i++) {
          values.values.push(0);
          values.stringValues.push("-");
          values.colors.push("black");
        }

        participants
          .filter((x) => x.session?.id === s.id)
          .forEach((x) => {
            const week = format(x.date, "I/RRRR");
            values.values[weekIndex[week] ?? 0] += 1;
            values.stringValues[weekIndex[week] ?? 0] = "x";
          });

        values.values.forEach((x, i) => (values.colors[i] = selectColor(x, values.values)));
        values.values.forEach(
          (x, i) =>
            (values.stringValues[i] =
              values.stringValues[i] === "-" ? "-" : role === "student" && x < 5 ? "<5" : x.toString())
        );

        participationCounts.push({ ...values, values: [] });
      });
      availableStats.push({ name: "statistics-participant-count", values: participationCounts });
    }

    // ************************************************************************************************
    // Maximum queue duration

    if (
      course.statisticsQueueLevel === 0 ||
      (course.statisticsQueueLevel >= 1 && role === "teacher") ||
      (course.statisticsQueueLevel === 1 && role === "staff")
    ) {
      const maximumQueueDuration: SessionAndColorValues[] = [];
      sessions.forEach((s) => {
        const values: SessionAndColorValues = {
          session: s.name,
          values: [],
          colors: [],
          stringValues: [],
        };
        for (let i = 0; i < weeks.length; i++) {
          values.values.push(0);
          values.stringValues.push("-");
          values.colors.push("black");
        }

        stats
          .filter((x) => x.session?.id === s.id)
          .forEach((x) => {
            const week = format(x.date, "I/RRRR");
            values.values[weekIndex[week] ?? 0] = ~~(Math.max(...[0, ...x.queueDuration]) / 60);
            values.stringValues[weekIndex[week] ?? 0] = "x";
          });

        values.values.forEach((x, i) => (values.colors[i] = selectColor(x, values.values)));
        values.values.forEach(
          (x, i) =>
            (values.stringValues[i] =
              values.stringValues[i] === "-" ? "-" : role === "student" && x > 30 ? ">30" : x.toString())
        );

        maximumQueueDuration.push({ ...values, values: [] });
      });
      availableStats.push({ name: "statistics-maximum-queue-duration", values: maximumQueueDuration });
    }

    // ************************************************************************************************
    // Queue count

    if (
      course.statisticsQueueLevel === 0 ||
      (course.statisticsQueueLevel >= 1 && role === "teacher") ||
      (course.statisticsQueueLevel === 1 && role === "staff")
    ) {
      const queueCount: SessionAndColorValues[] = [];
      sessions.forEach((s) => {
        const values: SessionAndColorValues = {
          session: s.name,
          values: [],
          colors: [],
          stringValues: [],
        };
        for (let i = 0; i < weeks.length; i++) {
          values.values.push(0);
          values.stringValues.push("-");
          values.colors.push("black");
        }

        stats
          .filter((x) => x.session?.id === s.id)
          .forEach((x) => {
            const week = format(x.date, "I/RRRR");
            values.values[weekIndex[week] ?? 0] = x.queueDuration.length;
            values.stringValues[weekIndex[week] ?? 0] = "x";
          });

        values.values.forEach((x, i) => (values.colors[i] = selectColor(x, values.values)));
        values.values.forEach(
          (x, i) =>
            (values.stringValues[i] =
              values.stringValues[i] === "-" ? "-" : role === "student" && x < 10 ? "<10" : x.toString())
        );

        queueCount.push({ ...values, values: [] });
      });
      availableStats.push({ name: "statistics-queue-count", values: queueCount });
    }

    // ************************************************************************************************
    // Median queue duration

    if (
      course.statisticsQueueLevel === 0 ||
      (course.statisticsQueueLevel >= 1 && role === "teacher") ||
      (course.statisticsQueueLevel === 1 && role === "staff")
    ) {
      const medianQueueDuration: SessionAndColorValues[] = [];
      sessions.forEach((s) => {
        const values: SessionAndColorValues = {
          session: s.name,
          values: [],
          colors: [],
          stringValues: [],
        };
        for (let i = 0; i < weeks.length; i++) {
          values.values.push(0);
          values.stringValues.push("-");
          values.colors.push("black");
        }

        stats
          .filter((x) => x.session?.id === s.id)
          .forEach((x) => {
            const week = format(x.date, "I/RRRR");

            const numbers = x.queueDuration.slice(0);
            let median = 0;

            if (numbers.length > 0) {
              numbers.sort((a, b) => a - b);
              if (numbers.length % 2 === 0) {
                median = (numbers[numbers.length / 2]! + numbers[numbers.length / 2 - 1]!) / 2;
              } else {
                median = numbers[(numbers.length - 1) / 2]!;
              }
            }

            values.values[weekIndex[week] ?? 0] = ~~(median / 60);
            values.stringValues[weekIndex[week] ?? 0] = "x";
          });

        values.values.forEach((x, i) => (values.colors[i] = selectColor(x, values.values)));
        values.values.forEach(
          (x, i) =>
            (values.stringValues[i] =
              values.stringValues[i] === "-" ? "-" : role === "student" && x > 30 ? ">30" : x.toString())
        );

        medianQueueDuration.push({ ...values, values: [] });
      });
      availableStats.push({ name: "statistics-median-queue-duration", values: medianQueueDuration });
    }

    // ************************************************************************************************
    //  Graph data

    const graphData: SessionAndValues[] = [];
    if (
      course.statisticsGraphLevel === 0 ||
      (course.statisticsGraphLevel >= 1 && role === "teacher") ||
      (course.statisticsGraphLevel === 1 && role === "staff")
    ) {
      sessions.forEach((s) => {
        const values: SessionAndValues = {
          session: s.name,
          values: [],
        };
        for (let i = 0; i < weeks.length; i++) {
          values.values.push([]);
        }

        stats
          .filter((x) => x.session?.id === s.id)
          .forEach((x) => {
            const week = format(x.date, "I/RRRR");
            values.values[weekIndex[week] ?? 0] = x.queueLength;
          });

        graphData.push(values);
      });
    }

    // ************************************************************************************************

    // Remove year if only one year
    if (weeks && weeks[0]?.split("/")[1] === weeks[weeks.length - 1]?.split("/")[1]) {
      weeks = weeks.map((x) => x.split("/")[0]);
    }

    return {
      weeks,
      availableStats,
      graphData,
    };
  };
}
