import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useContext } from "react";
import { FormattedMessage } from "react-intl";
import { SessionContext } from "./context/SessionContext";

type TabProps = {
  name: string;
  href: string;
  activationRule?: RegExp;
};

const Tab: FC<TabProps> = (props) => {
  const router = useRouter();
  let cName = "nav-link";
  if (router.pathname === props.href || (props.activationRule && props.activationRule?.test(router.pathname))) {
    cName += " active";
  }
  return (
    <li className="nav-item">
      <Link href={props.href}>
        <a className={cName}>
          <FormattedMessage id={props.name} />
        </a>
      </Link>
    </li>
  );
};

export const Tabs: FC = () => {
  const sessionContext = useContext(SessionContext);

  if (!sessionContext?.userName) {
    return null;
  }

  const tabs = [
    {
      href: "/queue",
      name: "tabs-queue",
      show: true,
    },
    {
      href: "/sessions",
      name: "tabs-sessions",
      show: true,
    },
    {
      href: "/statistics",
      name: "tabs-statistics",
      show:
        sessionContext.role === "teacher" ||
        ((sessionContext.role === "student" || sessionContext.role === "staff") &&
          (sessionContext.statisticsLevel === 0 || sessionContext.statisticsQueueLevel === 0)) ||
        (sessionContext.role === "staff" &&
          (sessionContext.statisticsLevel === 1 || sessionContext.statisticsQueueLevel === 1)),
    },
    {
      href: "/selectSession",
      name: "tabs-selectSession",
      role: ["staff", "teacher"],
      activationRule: /sessions\/(.*?)\/manage/,
      show: true,
    },
    {
      href: "/settings",
      name: "tabs-settings",
      role: ["staff", "teacher"],
      activationRule: /(sessions\/(.*?)\/edit)|(sessions\/create)/,
      show: true,
    },
  ];

  return (
    <div className="mb-4">
      <ul className="nav nav-tabs">
        {tabs.map((tab) => {
          if ((tab.role && tab.role.indexOf(sessionContext.role) < 0) || !tab.show) {
            return null;
          } else {
            return <Tab key={tab.name} name={tab.name} href={tab.href} activationRule={tab.activationRule} />;
          }
        })}
      </ul>
    </div>
  );
};
