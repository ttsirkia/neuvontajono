import { format, parse } from "date-fns";
import { FC } from "react";
import { useIntl } from "react-intl";
import { getTypedFormattedString } from "../utils/translation";

type Props = {
  date: string;
};

export const LocalizedDate: FC<Props> = (props) => {
  const intl = useIntl();
  const dateFormat = getTypedFormattedString(intl, "date-output-format");
  const date = parse(props.date, "yyyy-MM-dd", new Date());
  const formattedDate = format(date, dateFormat);
  return <span>{formattedDate}</span>;
};
