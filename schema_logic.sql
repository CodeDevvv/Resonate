-- ########## STORAGE CLEANUP FUNCTIONS ##########

-- Deletes audio file from storage when a diary entry is removed
create or replace function delete_file_when_entry_deleted()
returns trigger language plpgsql security definer as $$
begin
  if OLD.audio_path is not null then
      delete from storage.objects where bucket_id = 'audio-recordings' and name = OLD.audio_path;
  end if;
  return OLD;
end;
$$;

-- Deletes audio file from storage when the path is set to null during an update
create or replace function delete_file_on_unlink()
returns trigger language plpgsql security definer as $$
begin
  if OLD.audio_path is not null and NEW.audio_path is null then
      delete from storage.objects where bucket_id = 'audio-recordings' and name = OLD.audio_path;
  end if;
  return NEW;
end;
$$;


-- ########## DATABASE TRIGGERS ##########

-- Fire cleanup on entry deletion
drop trigger if exists on_entry_delete_cleanup on public."DiaryEntry";
create trigger on_entry_delete_cleanup after delete on public."DiaryEntry"
for each row execute function delete_file_when_entry_deleted();

-- Fire cleanup when audio is unlinked from an entry
drop trigger if exists on_audio_unlink on public."DiaryEntry";
create trigger on_audio_unlink after update on public."DiaryEntry"
for each row execute function delete_file_on_unlink();


-- ########## ANALYTICS & INSIGHTS ##########

-- Compiles chart, heatmap, and topic data into a single JSON object
create or replace function get_insights(arg_user_id text, days_to_avg int, loopback_day int)
returns json language plpgsql as $$
declare
    insight_data json;
begin
    select json_build_object(
        -- Chart Data: Mood scores over the loopback period
        'chartData', (
            select coalesce(json_agg(row_to_json(c)), '[]')
            from (
                select mood_scores, created_at
                from "DiaryEntry" d
                where d.user_id = arg_user_id
                and d.created_at >= (current_date - (loopback_day * INTERVAL '1 day'))
                order by created_at asc
            ) c
        ),
        
        -- Heatmap Data: Daily averages for all mood categories
        'heatmapData', (
            select coalesce(json_agg(row_to_json(h)), '[]')
            from (
                select 
                    created_at::date as day, 
                    jsonb_build_object(
                        'joy', round(avg((mood_scores->>'joy')::numeric), 2),
                        'sadness', round(avg((mood_scores->>'sadness')::numeric), 2),
                        'anger', round(avg((mood_scores->>'anger')::numeric), 2),
                        'fear', round(avg((mood_scores->>'fear')::numeric), 2),
                        'surprise', round(avg((mood_scores->>'surprise')::numeric), 2),
                        'love', round(avg((mood_scores->>'love')::numeric), 2),
                        'calm', round(avg((mood_scores->>'calm')::numeric), 2)
                    ) as moods
                from "DiaryEntry" d
                where d.user_id = arg_user_id
                and d.created_at >= (current_date - (days_to_avg * INTERVAL '1 day'))
                group by created_at::date
                order by created_at::date desc
            ) h
        ),
        
        -- Top Topics: Most frequent tags used in the loopback period
        'topics', (
            select coalesce(json_agg(row_to_json(t)), '[]')
            from (
                select tag as topic, count(*) as count
                from "DiaryEntry" d, unnest(d.tags) as tag
                where d.user_id = arg_user_id
                and d.created_at >= (current_date - (loopback_day * INTERVAL '1 day'))
                group by tag
                order by count desc
                limit 5
            ) t
        )
    ) into insight_data;

    return insight_data;
end;
$$;

-- Create the DiaryEntry table with its custom types, schema, and optimized indexes.
DO $$ BEGIN
    CREATE TYPE audio_status AS ENUM ('processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE public."DiaryEntry" (
    entry_id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    user_id text NOT NULL,
    title text,
    transcript text,
    ai_summary text,
    reflections text,
    suggestions text,
    goals text,
    tags text[] DEFAULT '{}'::text[],
    mood_labels text[] DEFAULT '{}'::text[],
    mood_scores jsonb DEFAULT '{}'::jsonb,
    audio_path text NOT NULL,
    status audio_status DEFAULT 'processing'::audio_status,
    "isGoalAdded" boolean DEFAULT false,

    CONSTRAINT "DiaryEntry_pkey" PRIMARY KEY (entry_id),
    CONSTRAINT "DiaryEntry_audio_path_unique" UNIQUE (audio_path)
);

CREATE UNIQUE INDEX IF NOT EXISTS "DiaryEntry_audio_id_key" ON public."DiaryEntry" USING btree (entry_id);
CREATE UNIQUE INDEX IF NOT EXISTS "DiaryEntry_audio_url_key" ON public."DiaryEntry" USING btree (audio_path);
CREATE INDEX IF NOT EXISTS idx_diary_entry_user_recent ON public."DiaryEntry" USING btree (user_id, created_at DESC);


-- Creates the GoalEntry table for tracking user-defined or AI-suggested goals.
CREATE TABLE public."GoalEntry" (
    goal_id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    user_id text NOT NULL,
    title text NOT NULL,
    description text,
    is_completed boolean DEFAULT false NOT NULL,
    target_date date NOT NULL,
    entry_id uuid,

    CONSTRAINT "GoalEntry_pkey" PRIMARY KEY (goal_id),
    CONSTRAINT "GoalEntry_title_key" UNIQUE (title),
    CONSTRAINT "GoalEntry_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES public."DiaryEntry"(entry_id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "GoalEntries_name_key" ON public."GoalEntry" USING btree (title);
CREATE UNIQUE INDEX IF NOT EXISTS "GoalEntries_pkey" ON public."GoalEntry" USING btree (goal_id);