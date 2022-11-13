import clsx from "clsx";
import { format, isAfter, isBefore, parse } from "date-fns";
import fetchJsonp from "fetch-jsonp";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useIntl } from "react-intl";

import { SessionContext } from "../../../../components/context/SessionContext";
import { SocketContext } from "../../../../components/context/SocketContext";
import { Spinner } from "../../../../components/Spinner";
import { getTypedFormattedString, TypedFormattedMessage } from "../../../../utils/translation";
import { trpc } from "../../../../utils/trpc";
import { NextPageWithLayout } from "../../../_app";

// ************************************************************************************************

const drawClock = () => {
  if (!document.getElementById("left")) {
    return;
  }

  const maxWidth = document.getElementById("left")!.offsetWidth - 120;
  const maxHeight = window.innerHeight - 120;
  const size = Math.min(maxWidth, maxHeight);
  const center = size / 2;
  const lineWidth = size * 0.01;
  const canvas = document.getElementById("clockface") as HTMLCanvasElement;

  if (canvas) {
    canvas.setAttribute("width", size + "px");
    canvas.setAttribute("height", size + "px");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, size, size);
      const angle = ((360 / 60) * Math.PI) / 180;
      let cAngle = 0;
      ctx.strokeStyle = "#777";
      for (let i = 0; i < 60; i++) {
        ctx.lineWidth = i % 5 === 0 ? lineWidth * 3 : lineWidth;
        ctx.translate(center, center);
        ctx.rotate(cAngle);
        ctx.beginPath();
        ctx.moveTo(0, i % 5 === 0 ? -center * 0.8 : -center * 0.9);
        ctx.lineTo(0, -center * 1);
        ctx.stroke();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        cAngle += angle;
      }

      ctx.strokeStyle = "#eee";

      const now = new Date();
      const hours = (1 / 12) * (now.getHours() % 12) + (1 / 720) * now.getMinutes() + (1 / 43200) * now.getSeconds();
      const minutes = new Date().getMinutes() + (1 / 60) * now.getSeconds();

      cAngle = (360 * hours * Math.PI) / 180;
      ctx.lineWidth = lineWidth * 6;
      ctx.translate(center, center);
      ctx.rotate(cAngle);
      ctx.beginPath();
      ctx.moveTo(0, center * 0.1);
      ctx.lineTo(0, -center * 0.75);
      ctx.stroke();
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      cAngle = (360 * (1 / 60) * minutes * Math.PI) / 180;
      ctx.lineWidth = lineWidth * 4;
      ctx.translate(center, center);
      ctx.rotate(cAngle);
      ctx.beginPath();
      ctx.moveTo(0, center * 0.2);
      ctx.lineTo(0, -center * 0.98);
      ctx.stroke();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }
};

// ************************************************************************************************

const ManageSessionProjectorPage: NextPageWithLayout = () => {
  const intl = useIntl();
  const router = useRouter();
  const session = useContext(SessionContext);

  const projectorConf: any = useRef(null);
  const projectorConfLoaded = useRef(false);
  const [isProjectorConf, setProjectorConf] = useState(false);
  const [currentPicture, setCurrentPicture] = useState("");
  const [currentShownPicture, setCurrentShownPicture] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [imgBounds, setImgBounds] = useState([window.innerWidth - 100, window.innerHeight - 120]);
  const [imgClass, setImgClass] = useState("");

  const sessionId = router.query.id!.toString();

  const sessionDataQuery = trpc.useQuery(["manageQueue.getSessionData", { sessionId }], {
    refetchInterval: 30000,
    onError(data) {
      if (data && (data.data?.code === "FORBIDDEN" || data.data?.code === "UNAUTHORIZED")) {
        toast.error(getTypedFormattedString(intl, "alert-no-staff"));
        router.replace("/");
        return;
      } else if (data && data.data?.code === "NOT_FOUND") {
        toast.error(getTypedFormattedString(intl, "alert-session-not-found"));
        router.replace("/");
        return;
      }

      toast.error(getTypedFormattedString(intl, "alert-page-update-failed"));
    },
    onSuccess(data) {
      if (data && data.projectorConf && !projectorConfLoaded.current) {
        projectorConfLoaded.current = true;
        fetchJsonp(data.projectorConf, {
          jsonpCallbackFunction: "projector",
          nonce: "",
          referrerPolicy: "no-referrer",
        })
          .then(function (response: any) {
            return response.json();
          })
          .then(function (json) {
            projectorConf.current = json;
            setProjectorConf(true);
            setCurrentPicture(json.course);
            setCurrentShownPicture(json.course);
          })
          .catch(function (ex) {
            toast.error(getTypedFormattedString(intl, "manage-projector-conf-fail"));
          });
      }
    },
  });
  const removeFromQueueMutation = trpc.useMutation(["manageQueue.removeFromQueueById"]);
  const queryUtils = trpc.useContext();
  const title = getTypedFormattedString(intl, "title");

  const socketContext = useContext(SocketContext);

  // ************************************************************************************************

  const removeFromQueue = useCallback(() => {
    if (sessionDataQuery.data && sessionDataQuery.data.inQueue.length > 0) {
      removeFromQueueMutation.mutate(
        { queueId: sessionDataQuery.data.inQueue[0]?.id },
        {
          onSuccess() {
            queryUtils.invalidateQueries(["manageQueue.getSessionData", { sessionId }]);
          },
          onError() {
            toast.error(getTypedFormattedString(intl, "manage-remove-queue-failed"));
          },
        }
      );
    }
  }, [intl, queryUtils, removeFromQueueMutation, sessionDataQuery.data, sessionId]);

  // ************************************************************************************************

  useEffect(() => {
    if (socketContext) {
      socketContext.io.on("reconnect_attempt", () => {
        fetch("/neuvontajono/api/socket");
      });

      socketContext.on("connect", () => {
        socketContext.emit("staffQueueRequest", sessionId);
      });
      socketContext.emit("staffQueueRequest", sessionId);
      socketContext.on("staffQueueResponse", (data) => {
        queryUtils.setQueryData(["manageQueue.getSessionData", { sessionId }], data);
      });
    }

    return () => {
      socketContext?.off();
      socketContext?.emit("staffQueueLeaveRequest", sessionId);
    };
  }, [socketContext, sessionId, queryUtils]);

  // ************************************************************************************************

  useEffect(() => {
    const clockInterval = setInterval(() => {
      if (!isProjectorConf) {
        drawClock();
      }
      setCurrentTime(format(new Date(), getTypedFormattedString(intl, "time-output-format")));
    }, 500);

    return () => {
      clearInterval(clockInterval);
    };
  }, [intl, isProjectorConf]);

  // ************************************************************************************************

  useEffect(() => {
    const clockInterval = setInterval(() => {
      if (isProjectorConf && sessionDataQuery.data) {
        setImgBounds([window.innerWidth - 100, window.innerHeight - 120]);

        // Course-specific picture
        let imageSrc = projectorConf.current.course;

        // Session-specific picture
        if (
          sessionDataQuery.data.queueOpen &&
          projectorConf.current.sessions &&
          projectorConf.current.sessions[sessionDataQuery.data.openQueueName]
        ) {
          imageSrc = projectorConf.current.sessions[sessionDataQuery.data.openQueueName];
        }

        // Time-specific picture
        if (
          sessionDataQuery.data.queueOpen &&
          projectorConf.current.pictures &&
          !(new Date().getMinutes() % 15 === 0 && (new Date().getHours() % 2 !== 0 || new Date().getMinutes() !== 0))
        ) {
          const foundImages: string[] = [];
          projectorConf.current.pictures.forEach((picture: any) => {
            if (
              isAfter(new Date(), parse(picture.start, "yyyy-MM-dd HH:mm", new Date())) &&
              isBefore(new Date(), parse(picture.end, "yyyy-MM-dd HH:mm", new Date()))
            ) {
              foundImages.push(picture.picture);
            }
          });
          if (foundImages.length > 0) {
            imageSrc = foundImages[new Date().getMinutes() % foundImages.length];
          }
        }

        if (imageSrc !== currentPicture) {
          setImgClass("fade-out");
          setCurrentPicture(imageSrc);
          setTimeout(() => {
            setCurrentShownPicture(imageSrc);
            setTimeout(() => {
              setImgClass("fade-in");
            }, 100);
          }, 400);
        }
      }
    }, 2000);

    return () => {
      clearInterval(clockInterval);
    };
  }, [currentPicture, isProjectorConf, sessionDataQuery.data]);

  // ************************************************************************************************

  const handleUserKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " ") {
        removeFromQueue();
      }
    },
    [removeFromQueue]
  );

  useEffect(() => {
    window.addEventListener("keyup", handleUserKeyPress);
    return () => {
      window.removeEventListener("keyup", handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  // ************************************************************************************************

  const NextInQueue = (props: any) => {
    if (!sessionDataQuery.data || sessionDataQuery.data.inQueue.length < 1 || !sessionDataQuery.data.inQueue[0])
      return <div></div>;
    return (
      <div>
        <div className={props.inline ? "d-inline-block" : "d-block"}>
          <TypedFormattedMessage id="manage-projector-next-in-queue" />
        </div>
        {props.inline && <span> </span>}
        <div
          className={props.inline ? "d-inline-block cursor-pointer" : "d-block cursor-pointer"}
          onClick={() => {
            removeFromQueue();
          }}
        >
          <span className="fw-bold">{sessionDataQuery.data.inQueue[0].firstName}</span>
          <span>
            {" ("}
            {sessionDataQuery.data.locations.length > 1 && (
              <>
                {sessionDataQuery.data.inQueue[0].location}
                {sessionDataQuery.data.inQueue[0].row > 0 && <span>{", "}</span>}
              </>
            )}
            {sessionDataQuery.data.inQueue[0].row > 0 && (
              <>
                <TypedFormattedMessage id="manage-projector-row" /> {sessionDataQuery.data.inQueue[0]?.row}
              </>
            )}
            {")"}
          </span>
        </div>
      </div>
    );
  };

  // ************************************************************************************************

  if (sessionDataQuery.data && !sessionDataQuery.isError) {
    return (
      <div className="projector text-light h-100 p-3 d-flex flex-column">
        <Head>
          <title key="title">{`${title} (${sessionDataQuery.data.inQueue.length})`}</title>
        </Head>
        {isProjectorConf && (
          <>
            <div className="d-flex flex-row pb-3 justify-content-between fs-4 px-3 pt-2 pb-4">
              <div>
                <TypedFormattedMessage id="manage-projector-in-queue" />{" "}
                <span className="fw-bold">{sessionDataQuery.data.inQueue.length}</span>
              </div>
              <div className="flex-grow-1 text-center">
                <div
                  className={clsx({
                    "fade-in": sessionDataQuery.data.inQueue.length > 0,
                    "fade-out": sessionDataQuery.data.inQueue.length === 0,
                  })}
                >
                  <NextInQueue inline={true} />
                </div>
              </div>
              <div>
                {currentTime}
                {!sessionDataQuery.data.queueOpen && (
                  <>
                    <span>{" - "}</span>
                    <TypedFormattedMessage id="manage-projector-queue-closed" />
                  </>
                )}
              </div>
            </div>
            <div className="d-flex flex-row flex-grow-1 justify-content-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentShownPicture}
                className={imgClass}
                id="picture"
                alt="picture"
                style={{
                  maxWidth: imgBounds[0] + "px",
                  maxHeight: imgBounds[1] + "px",
                }}
              />
            </div>
          </>
        )}
        {!isProjectorConf && (
          <div className="d-flex flex-row flex-grow-1">
            <div className="w-50 p-3 justify-content-center d-flex flex-row" id="left">
              <canvas className="my-auto" id="clockface"></canvas>
            </div>
            <div className="w-50 p-3 justify-content-between d-flex flex-column text-center" id="right">
              <div>
                <p className="fs-2 mt-5">{session?.courseName}</p>
                <p className="fs-1 mt-5">
                  <TypedFormattedMessage id="manage-projector-in-queue" />
                  <span className="fw-bold">{sessionDataQuery.data.inQueue.length}</span>
                </p>
              </div>
              {sessionDataQuery.data.inQueue.length > 0 && sessionDataQuery.data.inQueue[0] && (
                <div className="fs-2">
                  <div
                    className={clsx({
                      "fade-in": sessionDataQuery.data.inQueue.length > 0,
                      "fade-out": sessionDataQuery.data.inQueue.length === 0,
                    })}
                  >
                    <NextInQueue />
                  </div>
                </div>
              )}
              <p className="fs-5">
                <TypedFormattedMessage id="queue-lead" />
              </p>
            </div>
          </div>
        )}
      </div>
    );
  } else if (!sessionDataQuery.data) {
    return <Spinner />;
  } else {
    return <></>;
  }
};

ManageSessionProjectorPage.fullScreenPage = true;

export default ManageSessionProjectorPage;
