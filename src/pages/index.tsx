import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext } from "react";
import { SessionContext } from "../components/context/SessionContext";
import { TypedFormattedMessage } from "../utils/translation";

const Home: NextPage = () => {
  const router = useRouter();
  const session = useContext(SessionContext);

  if (session?.courseName) {
    router.replace("/queue");
    return <div></div>;
  }

  return (
    <div>
      <div className="p-3 bg-light rounded-3">
        <div className="container-fluid py-2">
          <h1 className="display-5 fw-bold">
            <TypedFormattedMessage id="title" />
          </h1>
          <p className="col-md-12 fs-4 mt-4">
            <TypedFormattedMessage id="index-jumbotron-1" />
          </p>
          <p className="col-md-12 fs-4 mt-4">
            <TypedFormattedMessage id="index-jumbotron-2" />
          </p>
          <p className="col-md-12 fs-4">
            <TypedFormattedMessage id="index-jumbotron-3" />
          </p>
        </div>
      </div>
      <p className="mt-5">
        <TypedFormattedMessage id="index-lead" />
      </p>
    </div>
  );
};

export default Home;

