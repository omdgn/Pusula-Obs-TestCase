const setETrackKey = () => {
    let eTrackKey = localStorage.getItem("e-track-key");
    if (!eTrackKey) {
        localStorage.setItem(
            "e-track-key",
            Date.now() + Math.random().toString(36).substring(2, 22)
        );
    }
};
const getETrackKey = () => {
    return localStorage.getItem("e-track-key") || "";
};
setETrackKey();
