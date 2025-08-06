import { useLocation, useSubmit } from "react-router";

export function useAddDocument() {
  const location = useLocation();
  const submit = useSubmit();

  return () => {
    submit(
      {},
      {
        method: "post",
        action: "/api/docs/add-document",
        preventScrollReset: true,
        replace: true,
      }
    );
  };
}