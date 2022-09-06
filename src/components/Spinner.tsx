import { FC } from "react";

export const Spinner: FC = () => {
  return (
    <div className="clearfix">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );
};
