import { FC } from "react";
import { useIntl } from "react-intl";
import { getTypedFormattedString } from "../utils/translation";
import { LocalizedTime } from "./LocalizedTime";

type Props = {
  openTime?: number;
  startTime: number;
  endTime: number;
  weekday?: number;
};

const Weekday: FC<{ weekday: number }> = ({ weekday }) => {
  const intl = useIntl();
  const weekdays = getTypedFormattedString(intl, "weekdays-short").split(",");
  return <span>{weekdays[weekday]}</span>;
};

export const LocalizedTimespan: FC<Props> = (props) => {
  if ((typeof props.openTime === "number" && props.openTime === props.startTime) || !props.openTime) {
    return (
      <span>
        {typeof props.weekday === "number" && <Weekday weekday={props.weekday} />}{" "}
        <LocalizedTime time={props.startTime} />
        {" - "}
        <LocalizedTime time={props.endTime} />
      </span>
    );
  } else if (typeof props.openTime === "number") {
    return (
      <span>
        {typeof props.weekday === "number" && <Weekday weekday={props.weekday} />} {"("}
        <LocalizedTime time={props.openTime} />
        {")"}
        {" - "}
        <LocalizedTime time={props.startTime} />
        {" - "}
        <LocalizedTime time={props.endTime} />
      </span>
    );
  } else {
    return null;
  }
};
