const {
    contextBridge,
    ipcRenderer,
    webUtils
} = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {

    // ================================================
    // LOCATION
    // ================================================

    applyLocation: (latitude, longitude) => {
        return ipcRenderer.invoke(
            "apply-location",
            {
                latitude,
                longitude
            }
        );
    },


    // ================================================
    // BROWSER
    // ================================================

    openAddress: () => {
        return ipcRenderer.invoke(
            "open-address"
        );
    },

    openCamera: () => {
        return ipcRenderer.invoke(
            "open-camera"
        );
    },


    // ================================================
    // VIRTUAL CAMERA
    // ================================================

    getFilePath: (file) => {
        return webUtils.getPathForFile(file);
    },

    applyCamera: (imagePath) => {
        return ipcRenderer.invoke(
            "apply-camera",
            imagePath
        );
    },

    stopCamera: () => {
        return ipcRenderer.invoke(
            "stop-camera"
        );
    }

});