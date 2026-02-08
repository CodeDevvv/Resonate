import { createClient } from "@supabase/supabase-js";
import { decrypt_transcription } from "../utils/decryptTranscription";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const handleAiResult = async (req, res) => {
    try {
        const { analysis, status: inputStatus } = req.body
        if (analysis && analysis === 'failed') {
            console.error("Input status is failed. Aborting process."); 
            throw new Error("Analysis failed: The background process reported a failure status.");
        }
        console.log("Received AI Results Callback")

        if (!inputStatus?.userId || !inputStatus?.entryId) {
            console.log("Invalid Webhook Payload");
            return res.status(200).send("OK");
        }
        const userId = inputStatus.userId;
        const entryId = inputStatus.entryId;

        let prepareInsertData = {}
        let socketResult = {}
        let isCompleted = true

        const safeDecrypt = (text) => {
            try { return decrypt_transcription(text); }
            catch (e) { console.error("Socket Decrypt Error:", e); return null; }
        };

        // 1. Transcript
        if (!inputStatus.hasTranscript) {
            if (analysis.transcript) {
                prepareInsertData["transcript"] = analysis.transcript
                socketResult["transcript"] = safeDecrypt(analysis.transcript);
            } else {
                isCompleted = false;
            }
        }

        if (!isCompleted) {
            throw new Error("Transcription failed to generate")
        }

        // 2. Summary
        if (!inputStatus.hasSummary) {
            if (analysis.ai_summary) {
                prepareInsertData["ai_summary"] = analysis.ai_summary;
                socketResult["ai_summary"] = safeDecrypt(analysis.ai_summary);
            } else {
                isCompleted = false;
            }
        }

        // 3. Tags
        if (!inputStatus.hasTags) {
            if (analysis.tags && analysis.tags.length > 0) {
                prepareInsertData["tags"] = analysis.tags;
                socketResult["tags"] = analysis.tags;
            } else {
                isCompleted = false;
            }
        }

        // 4. Mood & Mood Scores
        if (!inputStatus.hasMoodScores) {
            if (analysis.mood_scores) {
                prepareInsertData["mood_scores"] = analysis.mood_scores;
                socketResult["mood_scores"] = analysis.mood_scores;

                const CUTOFF = 0.5;
                const significantMood = Object.entries(analysis.mood_scores)
                    .filter(([_, score]) => typeof score === 'number' && score >= CUTOFF)
                    .map(([moodName]) => moodName);

                prepareInsertData["mood_labels"] = significantMood;
                socketResult["mood_labels"] = significantMood;
            } else {
                isCompleted = false;
            }
        }

        // 5. Reflections
        if (!inputStatus.hasReflections) {
            if (analysis.reflections) {
                prepareInsertData["reflections"] = analysis.reflections;
                socketResult["reflections"] = safeDecrypt(analysis.reflections);
            } else {
                isCompleted = false;
            }
        }

        // 6. Suggestions
        if (!inputStatus.hasSuggestions) {
            if (analysis.suggestions) {
                prepareInsertData["suggestions"] = analysis.suggestions;
                socketResult["suggestions"] = safeDecrypt(analysis.suggestions);
            } else {
                isCompleted = false;
            }
        }

        // 7. Goals
        if (!inputStatus.hasGoals) {
            if (analysis.goals && analysis.goals.length > 0) {
                prepareInsertData["goals"] = analysis.goals;
                socketResult["goals"] = safeDecrypt(analysis.goals);
                socketResult["isGoalAdded"] = false
            } else {
                isCompleted = false;
            }
        }

        prepareInsertData["status"] = isCompleted ? 'completed' : 'failed'
        socketResult["status"] = isCompleted ? 'completed' : 'failed'

        console.log(`Updating DB for Entry ${entryId}`);
        const { data, error: updateDataError } = await supabase
            .from('DiaryEntry')
            .update(prepareInsertData)
            .eq('user_id', userId)
            .eq('entry_id', entryId)
            .select();

        if (updateDataError) throw updateDataError

        if (data.length === 0) {
            console.log(`[INFO] Entry ${entryId} was deleted by user. Discarding AI results.`);
            return res.status(200).send("Discarded");
        }
        req.io.to(entryId).emit('entry_update', {
            status: isCompleted,
            result: socketResult
        })
        return res.status(200).send('OK');

    } catch (error) {
        console.log("SaveAiResults Error: ", error)
        console.log(req.body?.status?.userId + " : " + req.body?.status?.entryId)
        if (req.body?.status?.userId && req.body?.status?.entryId) {
            await supabase
                .from('DiaryEntry')
                .update({ status: 'failed' })
                .eq('user_id', req.body.status.userId)
                .eq('entry_id', req.body.status.entryId);
        }

        req.io.to(req.body.status.entryId).emit('entry_update', {
            status: 'failed'
        })
        return res.status(500).send("Error");
    }
}