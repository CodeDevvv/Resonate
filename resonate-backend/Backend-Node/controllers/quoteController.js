import path from 'path';
import { promises as fs } from 'fs'; 

export const getDailyQuote = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'Utils', 'daily_thoughts.json');
        const fileData = await fs.readFile(filePath, 'utf8')

        const thoughts = JSON.parse(fileData)

        const todayIndex = Math.floor(new Date() / (1000 * 60 * 60 * 24));

        const thought_index = todayIndex % thoughts.length;
        const thought = thoughts[thought_index]
        console.log("Fetched thought index : " + thought_index)
        return res.json(thought)

    } catch (error) {
        console.error("Error reading thoughts file:", error);
        res.status(500).json({ error: "Could not load thoughts" });
    }
};