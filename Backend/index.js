const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// CLI args
const args = process.argv.slice(2);
if (args.length < 2) {
    console.error("❌ Usage: node index.js <download-path> <base-file-name>");
    process.exit(1);
}
const downloadPath = path.resolve(args[0]);
const baseFileName = args[1];

// Wait for download
async function waitForDownload(downloadPath, extension, timeout = 60000, filesToIgnore = []) {
    const maxAttempts = timeout / 1000;
    for (let i = 0; i < maxAttempts; i++) {
        const files = fs.readdirSync(downloadPath)
            .filter(f =>
                f.endsWith(`.${extension}`) &&
                !f.endsWith(".crdownload") &&
                !filesToIgnore.includes(f)
            )
            .map(f => ({ name: f, time: fs.statSync(path.join(downloadPath, f)).mtime.getTime() }))
            .sort((a, b) => b.time - a.time);

        if (files.length > 0) return files[0].name;
        await new Promise(res => setTimeout(res, 1000));
    }
    throw new Error(`❌ .${extension} download timed out.`);
}

// Get unique file name
function getUniqueFileName(directory, baseName, extension) {
    let newPath = path.join(directory, `${baseName}.${extension}`);
    let counter = 1;
    while (fs.existsSync(newPath)) {
        newPath = path.join(directory, `${baseName}(${counter}).${extension}`);
        counter++;
    }
    return newPath;
}

function renameDownloadedFile(originalFile, newFileName, extension) {
    const originalPath = path.join(downloadPath, originalFile);
    const uniquePath = getUniqueFileName(downloadPath, newFileName, extension);
    fs.renameSync(originalPath, uniquePath);
    console.log(`✨ Renamed to: ${path.basename(uniquePath)}`);
}

// Puppeteer workflow
(async () => {
    if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath, { recursive: true });

    console.log("🚀 Launching browser...");
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const client = await page.target().createCDPSession();
    await client.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath });

    console.log("🌐 Navigating to Angular app...");
    await page.goto("http://localhost:4200/", { waitUntil: "networkidle0" });

    // Wait for first table’s button to render
    await page.waitForSelector("#export-excel-1", { timeout: 60000 });

    // Detect number of tables dynamically
    const tableCount = await page.$$eval(".tables-wrapper .table-container", tables => tables.length);
    console.log(`ℹ Found ${tableCount} table(s)`);

    for (let tableId = 1; tableId <= tableCount; tableId++) {
        try {
            // Excel export
            console.log(`📥 Exporting Table ${tableId} to Excel...`);
            const filesBeforeExcel = fs.readdirSync(downloadPath);
            await page.click(`#export-excel-${tableId}`);
            const downloadedExcel = await waitForDownload(downloadPath, "xlsx", 60000, filesBeforeExcel);
            renameDownloadedFile(downloadedExcel, `${baseFileName}_Table${tableId}`, "xlsx");

            // PDF export
            console.log(`📥 Exporting Table ${tableId} to PDF...`);
            const filesBeforePdf = fs.readdirSync(downloadPath);
            await page.click(`#export-pdf-${tableId}`);
            const downloadedPdf = await waitForDownload(downloadPath, "pdf", 60000, filesBeforePdf);
            renameDownloadedFile(downloadedPdf, `${baseFileName}_Table${tableId}`, "pdf");

        } catch (error) {
            console.error(`❌ Export failed for Table ${tableId}:`, error);
        }
    }

    await browser.close();
    console.log("🧹 Browser closed. All exports done.");
})();





















// const puppeteer = require("puppeteer");
// const path = require('path');
// const fs = require('fs');

// // Helper function to wait for a download to complete -- a fuction which checks the folder everytime as
// //  per timeout and shows the result if the file is downloaded or else will show an error 


// async function waitForDownload(downloadPath, extension, timeout = 60000) {
//     console.log(`Waiting for .${extension} file to download...`);
//     const maxAttempts = timeout / 1000;
//     for (let attempts = 0; attempts < maxAttempts; attempts++) {
//         const files = fs.readdirSync(downloadPath);
//         // Find a file with the correct extension that isn't a temporary download file
//         const fileName = files.find(file => file.endsWith(`.${extension}`) && !file.endsWith('.crdownload'));

//         if (fileName) {
//             console.log(`.${extension} download complete: ${fileName}`);
//             return fileName;
//         }
//         await new Promise(resolve => setTimeout(resolve, 1000));
//     }
//     throw new Error(`Download of .${extension} file did not complete within ${timeout / 1000} seconds.`);
// }

// (async () => {
//     // Set up a 'downloads' directory for the files where the files has to be saved 
//     const downloadPath = path.resolve('./downloads');
//     if (!fs.existsSync(downloadPath)) {
//         fs.mkdirSync(downloadPath, { recursive: true });
//     }
    
//     // setups a headless browser 
//     console.log('Launching browser...');
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     // Tell Puppeteer to allow and save downloads to our specified directory
//     // tells the bowser to accept all the dowload requests and save the to the dowload path
//     const client = await page.target().createCDPSession();
//     await client.send('Page.setDownloadBehavior', {
//         behavior: 'allow',
//         downloadPath: downloadPath,
//     });

//     console.log('Navigating to Angular app...');
//     await page.goto("http://localhost:4200/", { waitUntil: "networkidle0" });

//     try {
//         // --- EXPORT EXCEL ---
//         console.log('Clicking "Export to Excel"...');
//         await page.waitForSelector('#export-excel-button');
//         await page.click('#export-excel-button');
//         await waitForDownload(downloadPath, 'xlsx');

//         // --- EXPORT PDF ---
//         console.log('Clicking "Export to PDF"...');
//         await page.waitForSelector('#export-pdf-button');
//         await page.click('#export-pdf-button');
//         await waitForDownload(downloadPath, 'pdf');

//         console.log('All exports completed successfully!');

//     } catch (error) {
//         console.error('An error occurred during the export process:', error);
//     } finally {
//         await browser.close();
//         console.log('Browser closed.');
//     }
// })();