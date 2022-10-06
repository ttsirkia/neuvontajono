import { FC } from "react";

export const Footer: FC = () => {
  return (
    <footer className="footer mt-auto py-4">
      <div className="container text-center">
        <span>
          <a href="https://www.aalto.fi">Aalto University</a>,{" "}
        </span>
        <a href="https://wiki.aalto.fi/display/EDIT/EDIT">EDIT team</a>
        <br />
        <span className="author">v 3.0.2 | Teemu Sirkiä, 2022</span>
      </div>
    </footer>
  );
};
