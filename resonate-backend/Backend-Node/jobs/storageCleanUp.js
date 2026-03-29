import { supabase } from "../utils/config";

export const storageCleanUp = async () => {
    try {
        console.log("[Cron Job] Starting Storge Clean Up Cron Job")
        // 1. fetch all audio_paths from "DiaryEntry" table
        const { data: dbEntries, error: fetchError } = await supabase
            .from("DiaryEntry")
            .select("audio_path")
            .not('audio_path', 'is', null)

        if (fetchError) {
            console.log("[CRON JOB] Error when fetching audio paths: ", fetchError.message)
            return;
        }

        // 2. Using set for fast_lookups
        const helperSet = new Set(dbEntries.map(entry => entry.audio_path));

        // 3. Fetch Audio Folders from Db
        const { data: folders, error: folderError } = await supabase
            .storage
            .from("audio-recordings")
            .list('');

        if (folderError) {
            console.log("[CRON JOB] Error fetching folders: ", folderError.message);
            return;
        }

        const storageFiles = [];
        for (const folder of folders) {
            // If it has metadata, it's a file in the root. If not, it's a folder.
            if (folder.metadata) {
                storageFiles.push(folder.name);
            } else {
                // It's a folder, now list files inside it
                const { data: filesInFolder, error: fileError } = await supabase
                    .storage
                    .from("audio-recordings")
                    .list(folder.name);

                if (!fileError && filesInFolder) {
                    // Prepend folder name so it matches DB path: "userId/filename.wav"
                    const fullPaths = filesInFolder.map(f => `${folder.name}/${f.name}`);
                    storageFiles.push(...fullPaths);
                }
            }
        }

        // 4. Find Orphaned Audio Files
        const orphansToDelete = []
        for (const filePath of storageFiles) {
            // Supabase sometimes creates a hidden placeholder file for empty folders.
            if (filePath.endsWith('.emptyFolderPlaceholder')) continue;

            // If the file in storage is NOT in our table Set, it's an orphan
            if (!helperSet.has(filePath)) {
                orphansToDelete.push(filePath);
            }
        }

        // 5. Delete the orphans
        if (orphansToDelete.length === 0) {
            console.log("[CRON JOB] Audit complete. No orphaned files found! 🎉");
            return;
        }

        console.log(`[CRON JOB] Found ${orphansToDelete.length} orphaned files. Deleting...`);

        const { error: deleteError } = await supabase
            .storage
            .from('audio-recordings')
            .remove(orphansToDelete);

        if (deleteError) {
            console.log("[CRON JOB] Error when deleting audio paths: ", deleteError.message)
            return;
        }
        console.log(`[CRON JOB] Successfully deleted ${orphansToDelete.length} orphaned files! 🗑️`);

    } catch (error) {
        console.error("[CRON JOB] Failed to run Storage Audit:", error);
    }
}