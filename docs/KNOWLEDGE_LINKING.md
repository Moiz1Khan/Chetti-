# Knowledge base ↔ chatbot (how linking works)

## `knowledge_base.chatbot_id` can be NULL

Uploading a file on **Knowledge Base** creates a row with **`chatbot_id = NULL`**. That is normal.

What matters for RAG is the **`chatbot_knowledge`** table: it links **`chatbot_id`** ↔ **`knowledge_id`**.

## What you must do in the app

1. **Dashboard → My Chatbots → your bot → Know. tab**
2. **Check** the document(s) (status must be **Ready**).
3. Click **Save**.

Until you save, the chatbot **cannot** retrieve chunks for that document.

## Verify in Supabase

**Table Editor → `chatbot_knowledge`** (this is what RAG uses — **not** `knowledge_base.chatbot_id`)

You should see a row like:

| chatbot_id | knowledge_id |
|------------|--------------|
| `<your gpt bot id>` | `8f0bcdf4-...` (your MANUAL_QA_GUIDE id) |

**SQL (SQL Editor):**

```sql
SELECT ck.*, kb.file_name
FROM chatbot_knowledge ck
JOIN knowledge_base kb ON kb.id = ck.knowledge_id;
```

If there is **no row** for your bot + file, open the app **Know.** tab, select the file, **Save** again.

### Manual link (if the UI save failed)

Get IDs from **Table Editor** (`chatbots.id` and `knowledge_base.id`), then:

```sql
INSERT INTO public.chatbot_knowledge (chatbot_id, knowledge_id)
VALUES (
  'PASTE_YOUR_CHATBOT_UUID_HERE',
  'PASTE_YOUR_KNOWLEDGE_BASE_ROW_UUID_HERE'
)
ON CONFLICT DO NOTHING;
```

Run as a user with permission (or use the Supabase SQL Editor as `postgres`).

## After code changes

Redeploy Edge Functions so `chat-preview` / `api-chat` pick up prompt ordering:

```bash
supabase functions deploy chat-preview
supabase functions deploy api-chat
```
