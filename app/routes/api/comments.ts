import { data } from "react-router";
import { addComment, deleteComment, rateComment } from "~/utils/comments";
import { getAuthSession } from "~/utils/middlewares/authGuard.server";

export async function action({ request }: { request: Request }) {
  const session = await getAuthSession(request);
  
  if (!session) {
    return data({ success: false, error: "Не авторизован" }, { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get("action") as string;
  const entityId = formData.get("entityId") as string;
  const entityType = formData.get("entityType") as string;

  // Добавление комментария
  if (action === "add") {
    const text = formData.get("text") as string;
    const parentIdRaw = formData.get("parentId") as string;

    if (!text || text.trim().length === 0) {
      return data({ success: false, error: "Комментарий не может быть пустым" });
    }

    if (text.length > 1000) {
      return data({ success: false, error: "Комментарий слишком длинный" });
    }

    let parentId: number | undefined ;
    if (parentIdRaw && parentIdRaw.trim() !== "") {
      const parsedParentId = parseInt(parentIdRaw);
      if (!isNaN(parsedParentId)) {
        parentId = parsedParentId;
      }
    }

    const result = await addComment(
      entityId,
      entityType,
      session.user.id,
      text.trim(),
      parentId
    );

    if (result.success) {
      return data({ 
        success: true, 
        message: "Комментарий добавлен", 
        commentId: result.commentId 
      });
    } else {
      return data({ success: false, error: result.error });
    }
  }

  // Удаление комментария
  if (action === "delete") {
    const commentId = formData.get("commentId") as string;
    const commentIdNum = parseInt(commentId);

    if (isNaN(commentIdNum)) {
      return data({ success: false, error: "Неверный ID комментария" });
    }

    const result = await deleteComment(commentIdNum, session.user.id);
    
    if (result.success) {
      return data({ success: true, message: "Комментарий удален" });
    } else {
      return data({ success: false, error: result.error });
    }
  }

  // Рейтинг комментария
  if (action === "rate") {
    const commentId = formData.get("commentId") as string;
    const ratingRaw = formData.get("rating") as string;
    
    const commentIdNum = parseInt(commentId);
    const ratingNum = parseInt(ratingRaw);

    if (isNaN(commentIdNum) || isNaN(ratingNum) || (ratingNum !== 1 && ratingNum !== -1)) {
      return data({ success: false, error: "Неверные параметры рейтинга" });
    }

    const result = await rateComment(commentIdNum, session.user.id, ratingNum);
    
    if (result.success) {
      return data({ success: true, message: "Голос учтен" });
    } else {
      return data({ success: false, error: result.error });
    }
  }

  return data({ success: false, error: "Неизвестное действие" });
} 