import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request) {
    try {
        const config = await request.json();
        const timestamp = Date.now();
        const outputPath = path.join(process.cwd(), `AIROC_Plan_${timestamp}.xlsx`);

        // Path to filler script
        const scriptPath = path.join(process.cwd(), 'fill_excel_airoc.js');

        // Pass full config as JSON string
        const fullConfig = { ...config, outputPath };
        const configStr = JSON.stringify(fullConfig).replace(/"/g, '\\"');

        const command = `/usr/local/bin/node \"${scriptPath}\" \"${configStr}\"`;

        await execAsync(command);

        if (!fs.existsSync(outputPath)) {
            throw new Error('Output file was not generated');
        }

        const fileBuffer = fs.readFileSync(outputPath);
        const fileSize = fileBuffer.length;

        // Cleanup temporary file
        fs.unlinkSync(outputPath);

        return new Response(new Uint8Array(fileBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=\"AIROC_Comprehensive_Plan.xlsx\"`,
                'Content-Length': fileSize.toString(),
            },
        });
    } catch (error) {
        console.error("API Error (AIROC):", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
