import { add, differenceInMinutes, eachDayOfInterval, format, parse, startOfDay } from "date-fns";

// ************************************************************************************************

export const getDatesBetween = function (start: Date, end: Date, weekday: number) {
  try {
    return eachDayOfInterval({ start, end })
      .filter((x) => x.getDay() === weekday || weekday < 0)
      .map((x) => format(x, "yyyy-MM-dd"));
  } catch (e) {
    return [];
  }
};

// ************************************************************************************************

export const convertTimeStringToInt = function (time: string, format: string) {
  const today = startOfDay(new Date());
  const dateObject = parse(time, format, new Date());
  if (!isNaN(dateObject.valueOf())) {
    return differenceInMinutes(dateObject, today);
  } else {
    const anotherDateObject = parse(time, "H:mm", today);
    if (!isNaN(anotherDateObject.valueOf())) {
      return differenceInMinutes(anotherDateObject, today);
    }
  }
  return -1;
};

// ************************************************************************************************

export const convertIntToTimeString = function (time: number, timeFormat: string) {
  const today = startOfDay(new Date());
  return format(add(today, { minutes: time }), timeFormat);
};
