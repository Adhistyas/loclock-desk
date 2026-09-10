const {
    app,
    BrowserWindow,
    ipcMain
} = require("electron");

const path = require("path");
const { spawn } = require("child_process");

let mainWindow = null;
let browserWindow = null;
let cameraProcess = null;


// ======================================================
// MAIN WINDOW
// ======================================================

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 700,
        resizable: false,

        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile("index.html");
}


// ======================================================
// BROWSER WINDOW
// ======================================================

function createBrowserWindow() {
    if (browserWindow && !browserWindow.isDestroyed()) {
        browserWindow.focus();
        return browserWindow;
    }

    browserWindow = new BrowserWindow({
        width: 1280,
        height: 800,

        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    browserWindow.webContents.session.setPermissionRequestHandler(
        (webContents, permission, callback) => {
            if (permission === "geolocation") {
                callback(true);
                return;
            }

            callback(false);
        }
    );

    browserWindow.loadURL("https://www.google.com/maps");

    browserWindow.on("closed", () => {
        browserWindow = null;
    });

    return browserWindow;
}


// ======================================================
// LOCATION
// ======================================================

async function applyLocation(latitude, longitude) {
    const browser = createBrowserWindow();

    await browser.webContents.executeJavaScript(
        "document.readyState"
    );

    if (!browser.webContents.debugger.isAttached()) {
        browser.webContents.debugger.attach("1.3");
    }

    // Location
    await browser.webContents.debugger.sendCommand(
        "Emulation.setGeolocationOverride",
        {
            latitude: Number(latitude),
            longitude: Number(longitude),
            accuracy: 1
        }
    );

    // Timezone
    await browser.webContents.debugger.sendCommand(
        "Emulation.setTimezoneOverride",
        {
            timezoneId: "Asia/Jakarta"
        }
    );

    // Locale
    await browser.webContents.debugger.sendCommand(
        "Emulation.setLocaleOverride",
        {
            locale: "id-ID"
        }
    );

    return true;
}


ipcMain.handle("apply-location", async (event, data) => {
    try {
        const latitude = Number(data.latitude);
        const longitude = Number(data.longitude);

        if (
            Number.isNaN(latitude) ||
            Number.isNaN(longitude)
        ) {
            return {
                success: false,
                error: "Latitude atau longitude tidak valid."
            };
        }

        await applyLocation(
            latitude,
            longitude
        );

        return {
            success: true
        };

    } catch (error) {
        console.error(
            "Location error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
});


// ======================================================
// OPEN ADDRESS TEST
// ======================================================

ipcMain.handle("open-address", async () => {
    try {
        const browser = createBrowserWindow();

        await browser.loadURL(
            "https://www.google.com/maps"
        );

        return {
            success: true
        };

    } catch (error) {
        console.error(
            "Open address error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
});


// ======================================================
// OPEN CAMERA TEST
// ======================================================

ipcMain.handle("open-camera", async () => {
    try {
        const browser = createBrowserWindow();

        await browser.loadURL(
            "https://webcamtests.com/"
        );

        return {
            success: true
        };

    } catch (error) {
        console.error(
            "Open camera error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
});


// ======================================================
// VIRTUAL CAMERA
// ======================================================

ipcMain.handle("apply-camera", async (event, imagePath) => {
    try {
        // ----------------------------------------------
        // Windows only
        // ----------------------------------------------

        if (process.platform !== "win32") {
            return {
                success: false,
                error:
                    "Virtual Camera hanya tersedia di Windows."
            };
        }


        // ----------------------------------------------
        // Validate image path
        // ----------------------------------------------

        if (
            !imagePath ||
            typeof imagePath !== "string"
        ) {
            return {
                success: false,
                error:
                    "Path foto tidak valid."
            };
        }


        // ----------------------------------------------
        // Stop previous camera process
        // ----------------------------------------------

        if (cameraProcess) {
            console.log(
                "Stopping previous camera process..."
            );

            cameraProcess.kill();

            cameraProcess = null;

            // Beri waktu proses lama benar-benar berhenti
            await new Promise(resolve => {
                setTimeout(resolve, 500);
            });
        }


        // ----------------------------------------------
        // Camera EXE path
        // ----------------------------------------------

        const cameraExe = path.join(
            __dirname,
            "native",
            "windows-camera",
            "loclock-camera-image.exe"
        );


        console.log(
            "======================================"
        );

        console.log(
            "Starting Loclock Virtual Camera"
        );

        console.log(
            "Camera EXE:",
            cameraExe
        );

        console.log(
            "Image:",
            imagePath
        );

        console.log(
            "======================================"
        );


        // ----------------------------------------------
        // Start camera EXE
        // ----------------------------------------------

        cameraProcess = spawn(
            cameraExe,
            [imagePath],
            {
                windowsHide: false
            }
        );


        // ----------------------------------------------
        // STDOUT
        // ----------------------------------------------

        cameraProcess.stdout.on(
            "data",
            data => {
                console.log(
                    "[Loclock Camera]",
                    data.toString()
                );
            }
        );


        // ----------------------------------------------
        // STDERR
        // ----------------------------------------------

        cameraProcess.stderr.on(
            "data",
            data => {
                console.error(
                    "[Loclock Camera ERROR]",
                    data.toString()
                );
            }
        );


        // ----------------------------------------------
        // Process error
        // ----------------------------------------------

        cameraProcess.on(
            "error",
            error => {
                console.error(
                    "Camera process error:",
                    error
                );

                cameraProcess = null;
            }
        );


        // ----------------------------------------------
        // Process exit
        // ----------------------------------------------

        cameraProcess.on(
            "exit",
            (code, signal) => {

                console.log(
                    "Camera process exited:",
                    code,
                    signal
                );

                cameraProcess = null;
            }
        );


        // ----------------------------------------------
        // Success
        // ----------------------------------------------

        return {
            success: true
        };

    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
});


// ======================================================
// STOP VIRTUAL CAMERA
// ======================================================

ipcMain.handle("stop-camera", async () => {
    try {

        if (cameraProcess) {

            console.log(
                "Stopping Loclock Virtual Camera..."
            );

            cameraProcess.kill();

            cameraProcess = null;

            await new Promise(resolve => {
                setTimeout(resolve, 300);
            });
        }

        return {
            success: true
        };

    } catch (error) {

        console.error(
            "Stop camera error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
});


// ======================================================
// APP READY
// ======================================================

app.whenReady().then(() => {

    createWindow();


    app.on("activate", () => {

        if (
            BrowserWindow.getAllWindows().length === 0
        ) {
            createWindow();
        }

    });

});


// ======================================================
// BEFORE QUIT
// ======================================================

app.on("before-quit", () => {

    if (cameraProcess) {

        console.log(
            "Stopping camera before application quit..."
        );

        cameraProcess.kill();

        cameraProcess = null;
    }

});


// ======================================================
// ALL WINDOWS CLOSED
// ======================================================

app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {
        app.quit();
    }

});