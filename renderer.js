// ======================================================
// CONFIGURATION
// ======================================================

const CENTER_LAT = -6.306746;
const CENTER_LON = 106.820456;
const RADIUS_METERS = 10;
const EARTH_RADIUS = 6371000;


// ======================================================
// LOCATION ELEMENTS
// ======================================================

const latitudeInput =
    document.getElementById("latitude");

const longitudeInput =
    document.getElementById("longitude");

const status =
    document.getElementById("status");


// ======================================================
// RANDOM LOCATION
// ======================================================

function generateRandomLocation() {

    const radius =
        RADIUS_METERS *
        Math.sqrt(
            Math.random()
        );

    const angle =
        Math.random() *
        2 *
        Math.PI;

    const offsetY =
        radius *
        Math.sin(angle);

    const offsetX =
        radius *
        Math.cos(angle);

    const latitude =
        CENTER_LAT +
        (
            offsetY /
            EARTH_RADIUS
        ) *
        (
            180 /
            Math.PI
        );

    const longitude =
        CENTER_LON +
        (
            offsetX /
            (
                EARTH_RADIUS *
                Math.cos(
                    CENTER_LAT *
                    Math.PI /
                    180
                )
            )
        ) *
        (
            180 /
            Math.PI
        );

    return {
        latitude:
            Number(
                latitude.toFixed(6)
            ),

        longitude:
            Number(
                longitude.toFixed(6)
            )
    };
}


// ======================================================
// RANDOMIZE BUTTON
// ======================================================

document
    .getElementById("randomizeButton")
    .addEventListener(
        "click",
        () => {

            const location =
                generateRandomLocation();

            latitudeInput.value =
                location.latitude;

            longitudeInput.value =
                location.longitude;

            status.textContent =
                "Status: Location generated";
        }
    );


// ======================================================
// APPLY LOCATION
// ======================================================

document
    .getElementById("applyButton")
    .addEventListener(
        "click",
        async () => {

            const latitude =
                Number(
                    latitudeInput.value
                );

            const longitude =
                Number(
                    longitudeInput.value
                );


            // Validasi latitude

            if (
                Number.isNaN(latitude) ||
                latitude < -90 ||
                latitude > 90
            ) {

                status.textContent =
                    "Status: Latitude tidak valid.";

                return;
            }


            // Validasi longitude

            if (
                Number.isNaN(longitude) ||
                longitude < -180 ||
                longitude > 180
            ) {

                status.textContent =
                    "Status: Longitude tidak valid.";

                return;
            }


            status.textContent =
                "Status: Menerapkan lokasi...";


            try {

                const result =
                    await window.electronAPI
                        .applyLocation(
                            latitude,
                            longitude
                        );


                if (
                    result &&
                    result.success
                ) {

                    status.textContent =
                        `Status: Lokasi diterapkan (${latitude}, ${longitude})`;

                } else {

                    status.textContent =
                        `Status: Gagal - ${result?.error ||
                        "Unknown error"
                        }`;
                }


            } catch (error) {

                console.error(
                    "Apply location error:",
                    error
                );

                status.textContent =
                    `Status: Gagal - ${error.message}`;
            }
        }
    );


// ======================================================
// BROWSER ELEMENTS
// ======================================================

const openAddressButton =
    document.getElementById(
        "openAddressButton"
    );

const openCameraButton =
    document.getElementById(
        "openCameraButton"
    );


// ======================================================
// OPEN ADDRESS TEST
// ======================================================

openAddressButton
    .addEventListener(
        "click",
        async () => {

            status.textContent =
                "Status: Membuka test lokasi...";


            try {

                const result =
                    await window.electronAPI
                        .openAddress();


                if (
                    result &&
                    result.success
                ) {

                    status.textContent =
                        "Status: Test lokasi dibuka.";

                } else {

                    status.textContent =
                        `Status: Gagal - ${result?.error ||
                        "Unknown error"
                        }`;
                }


            } catch (error) {

                console.error(
                    "Open address error:",
                    error
                );

                status.textContent =
                    `Status: Gagal - ${error.message}`;
            }
        }
    );


// ======================================================
// OPEN CAMERA TEST
// ======================================================

openCameraButton
    .addEventListener(
        "click",
        async () => {

            status.textContent =
                "Status: Membuka test camera...";


            try {

                const result =
                    await window.electronAPI
                        .openCamera();


                if (
                    result &&
                    result.success
                ) {

                    status.textContent =
                        "Status: Test camera dibuka.";

                } else {

                    status.textContent =
                        `Status: Gagal - ${result?.error ||
                        "Unknown error"
                        }`;
                }


            } catch (error) {

                console.error(
                    "Open camera error:",
                    error
                );

                status.textContent =
                    `Status: Gagal - ${error.message}`;
            }
        }
    );


// ======================================================
// VIRTUAL CAMERA ELEMENTS
// ======================================================

const photoInput =
    document.getElementById(
        "photoInput"
    );

const uploadButton =
    document.getElementById(
        "uploadButton"
    );

const imagePreview =
    document.getElementById(
        "imagePreview"
    );

const emptyPreview =
    document.getElementById(
        "emptyPreview"
    );

const applyCameraButton =
    document.getElementById(
        "applyCameraButton"
    );

const cameraStatus =
    document.getElementById(
        "cameraStatus"
    );


// ======================================================
// SELECT PHOTO
// ======================================================

uploadButton
    .addEventListener(
        "click",
        () => {

            photoInput.click();

        }
    );


// ======================================================
// PHOTO SELECTED
// ======================================================

photoInput
    .addEventListener(
        "change",
        () => {

            const file =
                photoInput.files[0];


            // Tidak ada file

            if (!file) {
                return;
            }


            // Validasi tipe file

            const allowedTypes = [
                "image/png",
                "image/jpeg",
                "image/webp"
            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                cameraStatus.textContent =
                    "Camera: Format foto tidak didukung.";

                photoInput.value = "";

                return;
            }


            // Buat preview

            const imageURL =
                URL.createObjectURL(
                    file
                );


            imagePreview.src =
                imageURL;


            imagePreview.style.display =
                "block";


            emptyPreview.style.display =
                "none";


            // Aktifkan tombol Apply

            applyCameraButton.disabled =
                false;


            cameraStatus.textContent =
                `Camera: Foto siap digunakan (${file.name})`;
        }
    );


// ======================================================
// APPLY VIRTUAL CAMERA
// ======================================================

applyCameraButton
    .addEventListener(
        "click",
        async () => {

            const file =
                photoInput.files[0];


            // Pastikan ada foto

            if (!file) {

                cameraStatus.textContent =
                    "Camera: Pilih foto terlebih dahulu.";

                return;
            }


            cameraStatus.textContent =
                "Camera: Menyiapkan foto...";


            // Disable tombol sementara

            applyCameraButton.disabled =
                true;


            try {

                // ==========================================
                // Ambil PATH asli file
                // ==========================================

                const imagePath =
                    window.electronAPI
                        .getFilePath(file);


                console.log(
                    "Selected image:",
                    imagePath
                );


                // Validasi path

                if (
                    !imagePath ||
                    typeof imagePath !== "string"
                ) {

                    throw new Error(
                        "Path foto tidak dapat diperoleh."
                    );
                }


                cameraStatus.textContent =
                    "Camera: Mengaktifkan virtual camera...";


                // ==========================================
                // Kirim PATH ke Electron Main
                // ==========================================

                const result =
                    await window.electronAPI
                        .applyCamera(
                            imagePath
                        );


                // ==========================================
                // RESULT
                // ==========================================

                if (
                    result &&
                    result.success
                ) {

                    cameraStatus.textContent =
                        "Camera: Active";

                } else {

                    cameraStatus.textContent =
                        `Camera: ${result?.error ||
                        "Gagal mengaktifkan virtual camera."
                        }`;
                }


            } catch (error) {

                console.error(
                    "Apply camera error:",
                    error
                );

                cameraStatus.textContent =
                    `Camera: Gagal - ${error.message}`;

            } finally {

                // Aktifkan kembali tombol

                applyCameraButton.disabled =
                    false;
            }
        }
    );


// ======================================================
// STOP VIRTUAL CAMERA
// ======================================================

const stopCameraButton =
    document.getElementById(
        "stopCameraButton"
    );


if (stopCameraButton) {

    stopCameraButton.addEventListener(
        "click",
        async () => {

            cameraStatus.textContent =
                "Camera: Menghentikan...";


            try {

                const result =
                    await window.electronAPI
                        .stopCamera();


                if (
                    result &&
                    result.success
                ) {

                    cameraStatus.textContent =
                        "Camera: Inactive";

                } else {

                    cameraStatus.textContent =
                        `Camera: ${result?.error ||
                        "Gagal menghentikan camera."
                        }`;
                }


            } catch (error) {

                console.error(
                    "Stop camera error:",
                    error
                );

                cameraStatus.textContent =
                    `Camera: Gagal - ${error.message}`;
            }
        }
    );
}