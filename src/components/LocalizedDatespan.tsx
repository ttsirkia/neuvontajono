import { FC } from "react";
import { LocalizedDate } from "./LocalizedDate";

type Props = {
  start: string;
  end: string;
};

export const LocalizedDatespan: FC<Props> = (props) => {
  return (
    <span>
      <LocalizedDate date={props.start} /> {" - "}
      <LocalizedDate date={props.end} />
    </span>
  );
};
