document.addEventListener("readystatechange", () => {
    if (document.readyState !== "interactive") return;

    const button = document.querySelector("button");
    const chatInput = document.querySelector("input");
    const messages = document.querySelector("#messages");

    var es = new EventSource("/events");
    es.addEventListener("message", (msg) => {
        var el = document.createElement("code");
        el.innerText = msg.data;
        messages.appendChild(el);
    });

    es.addEventListener("error", (msg) => {
        var el = document.createElement("div");
        el.className = "error";
        el.innerText = "An error has occured";
        messages.appendChild(el);
    });

    es.addEventListener("open", (msg) => {
        var el = document.createElement("div");
        el.className = "info";
        el.innerText = "A connection was created";
        messages.appendChild(el);
    });

    function send() {
        var msg = chatInput.value.trim();
        if (msg.length === 0) return;
        chatInput.value = "";

        fetch("/events", { method: "POST", body: msg });
    }

    chatInput.addEventListener("keyup", (ev) => {
        if (ev.key === "Enter") send();
    });

    button.addEventListener("click", () => {
        send();
    });

});