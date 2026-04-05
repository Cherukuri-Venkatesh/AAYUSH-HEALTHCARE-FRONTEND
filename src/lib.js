// Backend Base URL
export const BACKENDURL = "https://aayush-healthcare-backend.onrender.com/api/";
export function callApi(reqMethod, url, data, responseHandler)
{
    let options;

    if (reqMethod === "GET" || reqMethod === "DELETE") {
        options = {
            method: reqMethod,
            headers: { 'Content-Type': 'application/json' }
        };
    } else {
        options = {
            method: reqMethod,
            headers: { 'Content-Type': 'application/json' },
            body: data
        };
    }

    fetch(url, options)
        .then(async (response) => {

            // Read as text first, then parse if JSON so we can always report a useful message.
            const text = await response.text();
            let parsedBody = null;

            try {
                parsedBody = text ? JSON.parse(text) : null;
            } catch (e) {
                parsedBody = null;
            }

            // 🔴 If error → show backend message
            if (!response.ok) {
                const backendMessage =
                    (parsedBody && (parsedBody.message || parsedBody.error)) ||
                    text ||
                    response.statusText ||
                    `Request failed with status ${response.status}`;

                throw new Error(backendMessage);
            }

            // ✅ If success → pass data
            return parsedBody ?? text;
        })
        .then((data) => responseHandler(data))

        // 🔥 EXACT faculty-style error handling
        .catch((err) => {
            alert("AAYUSH HEALTH CARE says:\n" + err.message);
        });
}