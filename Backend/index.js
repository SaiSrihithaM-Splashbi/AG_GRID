const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// -------------------
// ✅ Get CLI arguments
// -------------------
const args = process.argv.slice(2);

if (args.length < 2) {
    console.error("❌ Usage: node index.js <download-path> <file-name>");
    process.exit(1);
}

const downloadPath = path.resolve(args[0]);
const baseFileName = args[1];

// -------------------
// ✅ Wait for download to complete (UPDATED LOGIC)
// -------------------
// CHANGE 1: Added a new parameter 'filesToIgnore' with a default empty array
async function waitForDownload(downloadPath, extension, timeout = 60000, filesToIgnore = []) {
    console.log(`⌛ Waiting for .${extension} file to download...`);

    const maxAttempts = timeout / 1000;
    
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
        const files = fs.readdirSync(downloadPath)
            // CHANGE 2: Added a new condition to the filter to ignore pre-existing files
            .filter(f => 
                f.endsWith(`.${extension}`) && 
                !f.endsWith('.crdownload') &&
                !filesToIgnore.includes(f)
            )
            .map(f => ({
                name: f,
                time: fs.statSync(path.join(downloadPath, f)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);

        if (files.length > 0) {
            const latestFile = files[0].name;
            console.log(`✅ .${extension} download complete: ${latestFile}`);
            return latestFile;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error(`❌ .${extension} file download timed out.`);
}

// -------------------
// ✅ Helper function to find a unique filename
// -------------------
function getUniqueFileName(directory, baseName, extension) {
    let newPath = path.join(directory, `${baseName}.${extension}`);
    let counter = 1;

    while (fs.existsSync(newPath)) {
        const newBaseName = `${baseName}(${counter})`;
        newPath = path.join(directory, `${newBaseName}.${extension}`);
        counter++;
    }
    
    return newPath;
}


// -------------------
// ✅ Rename downloaded file to desired name
// -------------------
function renameDownloadedFile(originalFile, newFileName, extension) {
    const originalPath = path.join(downloadPath, originalFile);
    const uniquePath = getUniqueFileName(downloadPath, newFileName, extension);

    fs.renameSync(originalPath, uniquePath);
    console.log(`✨ Renamed to: ${path.basename(uniquePath)}`);
}

// -------------------
// ✅ Puppeteer Workflow
// -------------------
(async () => {
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
    }

    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath,
    });

    console.log('🌐 Navigating to Angular app...');
    await page.goto("http://localhost:4200/", { waitUntil: "networkidle0" });

    try {
        // --- EXCEL EXPORT ---
        console.log('📥 Clicking "Export to Excel"...');
        // CHANGE 3: Get a list of files *before* clicking download
        const filesBeforeExcel = fs.readdirSync(downloadPath);
        await page.waitForSelector('#export-excel-button');
        await page.click('#export-excel-button');

        const downloadedExcel = await waitForDownload(downloadPath, 'xlsx', 60000, filesBeforeExcel);
        renameDownloadedFile(downloadedExcel, baseFileName, 'xlsx');

        // --- PDF EXPORT ---
        console.log('📥 Clicking "Export to PDF"...');
        const filesBeforePdf = fs.readdirSync(downloadPath);
        await page.waitForSelector('#export-pdf-button');
        await page.click('#export-pdf-button');

        const downloadedPdf = await waitForDownload(downloadPath, 'pdf', 60000, filesBeforePdf);
        renameDownloadedFile(downloadedPdf, baseFileName, 'pdf');

        console.log(`✅ All exports completed and saved in: ${downloadPath}`);

    } catch (error) {
        console.error('❌ Export failed:', error);
    } finally {
        await browser.close();
        console.log('🧹 Browser closed.');
    }
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