# Prism

Минималистичный веб-инструмент для учителя английского: проверка текстов на ИИ, оценка перевода EN↔RU и анализ уровня по CEFR.

## Возможности

| Режим | Описание |
|-------|----------|
| **ИИ-детектор** | Анализ текста на признаки генерации ИИ с объяснением для учителя |
| **Перевод** | Сравнение оригинала и перевода (EN→RU / RU→EN): смысл, грамматика, машинный перевод |
| **Оценка** | Уровень CEFR, ошибки, исправленный текст, заметки для учителя |

## Стек

- **Next.js 15** (App Router) — деплой на [Vercel](https://vercel.com)
- **Tailwind CSS 4** — Liquid Glass UI
- **Google Gemini API** (бесплатный тариф) — анализ текстов

## Быстрый старт

```bash
npm install
cp .env.example .env.local
# Добавьте GEMINI_API_KEY в .env.local
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

### API-ключ Gemini (бесплатно)

1. Перейдите на [Google AI Studio](https://aistudio.google.com/apikey)
2. Создайте API-ключ
3. Добавьте в `.env.local`:

```
GEMINI_API_KEY=ваш_ключ
```

Бесплатный тариф Gemini Flash: ~15 запросов/мин, 1500 запросов/день — достаточно для учебного использования.

## Деплой на Vercel

1. Загрузите репозиторий на GitHub
2. Импортируйте проект в [Vercel](https://vercel.com/new)
3. В **Settings → Environment Variables** добавьте `GEMINI_API_KEY`
4. Deploy

## Приватность

Тексты учеников **не сохраняются** на сервере — только отправляются в Gemini для анализа и сразу отбрасываются.

## Структура

```
src/
  app/
    api/
      detect-ai/          # POST — ИИ-детектор
      check-translation/  # POST — проверка перевода
      assess-text/        # POST — оценка CEFR
    page.tsx
  components/             # UI-компоненты
  lib/                    # Gemini, промпты
  types/                  # TypeScript-типы
```

## Лицензия

MIT
