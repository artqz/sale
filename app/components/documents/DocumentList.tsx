import { DOCUMENT_TYPE_ORD, type DocumentType } from "~/utils/types";
import { Table } from "../ui/Table";

type Params = {
  documents: {
    id: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    type: DocumentType;
    title: string;
    registrationNumber: string | null;
    content: string | null;
    userId: string | null;
  }[]
}
export function DocumentList(params: Params) {
  const { documents } = params
  return <div><Table />{documents.map(document => <div key={document.id}>[{DOCUMENT_TYPE_ORD[document.type]}] {document.title}</div>)}</div>
}