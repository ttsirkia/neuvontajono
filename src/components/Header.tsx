import { FC, useContext } from "react";
import { FormattedMessage } from "react-intl";
import { SessionContext } from "./context/SessionContext";

export const Header: FC = () => {
  const sessionContext = useContext(SessionContext);

  return (
    <nav className="navbar navbar-light bg-light border-bottom">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">
          <FormattedMessage id="title" />
        </span>
        <span>{sessionContext?.userName}</span>
      </div>
    </nav>
  );
};
