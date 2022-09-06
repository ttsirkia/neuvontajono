import { FC } from "react";
import { useIntl } from "react-intl";
import { convertIntToTimeString } from "../utils/dates";
import { getTypedFormattedString } from "../utils/translation";

type Props = {
  time: number;
};

export const LocalizedTime: FC<Props> = (props) => {
  const intl = useIntl();
  const timeFormat = getTypedFormattedString(intl, "time-output-format");
  return <span>{convertIntToTimeString(props.time, timeFormat)}</span>;
};
