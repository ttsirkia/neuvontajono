import { FC } from "react";
import { TypedFormattedMessage } from "../utils/translation";

export const ErrorPanel: FC = () => {
  return (
    <div className="alert alert-danger my-4" role="alert">
      <TypedFormattedMessage id="alert-loading-data-failed" />
    </div>
  );
};
