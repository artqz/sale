# Миграция базы данных для универсальной системы комментариев

## Обзор изменений

Мы создали универсальную систему комментариев, которая может работать с любыми сущностями в приложении.

## Новая структура

### Таблица `comment`
```sql
CREATE TABLE "comment" (
  "id" serial PRIMARY KEY NOT NULL,
  "entityId" text NOT NULL,           -- ID сущности (может быть число или строка)
  "entityType" text NOT NULL,         -- Тип сущности ('deal', 'forum_topic', etc.)
  "userId" text NOT NULL,             -- ID пользователя
  "parentId" integer,                 -- ID родительского комментария (для ответов)
  "text" text NOT NULL,               -- Текст комментария
  "isDeleted" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
```

### Таблица `commentRating`
```sql
CREATE TABLE "commentRating" (
  "id" serial PRIMARY KEY NOT NULL,
  "commentId" integer NOT NULL,       -- ID комментария
  "userId" text NOT NULL,             -- ID пользователя
  "rating" integer NOT NULL,          -- 1 для лайка, -1 для дизлайка
  "createdAt" timestamp with time zone NOT NULL
);
```

## Индексы

- `comment_entityId_entityType_idx` - для быстрого поиска комментариев по сущности
- `comment_userId_idx` - для поиска комментариев пользователя
- `comment_parentId_idx` - для поиска ответов
- `comment_createdAt_idx` - для сортировки по дате
- `commentRating_commentId_userId_idx` - уникальный индекс для предотвращения повторных голосов

## Преимущества новой структуры

1. **Универсальность** - одна система для всех типов контента
2. **Масштабируемость** - легко добавить новые типы сущностей
3. **Производительность** - оптимизированные индексы
4. **Гибкость** - поддержка вложенных комментариев и рейтингов

## Статус системы

### Текущее состояние

- ✅ **Новые таблицы** созданы и готовы к использованию
- ✅ **Старые таблицы** сохранены для обратной совместимости
- ✅ **Таблицы очищены** и готовы к работе

## Использование

### Получение комментариев
```typescript
import { getComments } from "~/utils/comments";

// Для скидок
const dealComments = await getComments(dealId, "deal");

// Для форума
const forumComments = await getComments(topicId, "forum_topic");

// Для блога
const blogComments = await getComments(postId, "blog_post");
```

### Добавление комментария
```typescript
import { addComment } from "~/utils/comments";

const result = await addComment(
  entityId,    // ID сущности
  entityType,  // Тип сущности
  userId,      // ID пользователя
  text,        // Текст комментария
  parentId     // ID родительского комментария (опционально)
);
```

### Рейтинг комментария
```typescript
import { rateComment } from "~/utils/comments";

const result = await rateComment(
  commentId,  // ID комментария
  userId,     // ID пользователя
  rating      // 1 для лайка, -1 для дизлайка
);
```

## Обратная совместимость

Старые таблицы (`dealComment`, `dealCommentRating`) оставлены для обратной совместимости. Их можно удалить после полной миграции данных.

## Планы на будущее

1. **Добавление новых типов сущностей** - форум, блог, отзывы и т.д.
2. **Оптимизация запросов** - кэширование, пагинация
3. **Удаление старых таблиц** - после полного перехода на новую систему 