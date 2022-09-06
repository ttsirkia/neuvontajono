import { format } from "date-fns";
import { FC } from "react";
import { useIntl } from "react-intl";
import { getTypedFormattedString } from "../utils/translation";

type Props = {
  time: number;
};

export const LocalizedTimeFromTimestamp: FC<Props> = (props) => {
  const intl = useIntl();
  const timeFormat = getTypedFormattedString(intl, "time-output-format");
  const time = new Date(props.time);
  const formattedTime = format(time, timeFormat);
  return <span>{formattedTime}</span>;
};
