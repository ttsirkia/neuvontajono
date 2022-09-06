import * as RAD from "@radix-ui/react-alert-dialog";
import { FC } from "react";

type AlertProps = {
  title: string;
  text: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: JSX.Element;
  cancelText: string;
  actionText: string;
  actionStyle: "btn-primary" | "btn-danger" | "btn-success";
};

export const AlertDialog: FC<AlertProps> = (props) => {
  return (
    <RAD.Root>
      <RAD.Trigger asChild>{props.children}</RAD.Trigger>
      <RAD.AlertDialogOverlay className="alert-overlay"></RAD.AlertDialogOverlay>
      <RAD.AlertDialogContent className="alert-dialog">
        <RAD.AlertDialogTitle>{props.title}</RAD.AlertDialogTitle>
        <RAD.AlertDialogDescription>{props.text}</RAD.AlertDialogDescription>
        <div className="mt-4">
          <RAD.AlertDialogAction asChild>
            <button autoFocus type="button" className={`btn ${props.actionStyle} me-2`} onClick={props.onClick}>
              {props.actionText}
            </button>
          </RAD.AlertDialogAction>
          <RAD.AlertDialogCancel asChild>
            <button type="button" className={`btn btn-outline-secondary`}>
              {props.cancelText}
            </button>
          </RAD.AlertDialogCancel>
        </div>
      </RAD.AlertDialogContent>
    </RAD.Root>
  );
};
