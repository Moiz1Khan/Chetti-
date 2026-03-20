(function () {
  "use strict";

  var ChatbotWidget = {
    init: function (config) {
      if (!config || !config.chatbot_id) {
        console.error("ChatbotWidget: chatbot_id is required");
        return;
      }

      var chatbotId = config.chatbot_id;
      var position = config.position || "bottom-right";
      var color = config.color || "#4F46E5";
      var baseUrl = config.base_url || window.location.origin;

      // Create styles
      var style = document.createElement("style");
      style.textContent =
        ".chatbot-widget-btn{position:fixed;z-index:99999;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;}" +
        ".chatbot-widget-btn:hover{transform:scale(1.1);box-shadow:0 6px 24px rgba(0,0,0,0.3);}" +
        ".chatbot-widget-btn svg{width:24px;height:24px;fill:white;}" +
        ".chatbot-widget-frame{position:fixed;z-index:99998;width:400px;height:600px;border:none;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);transition:opacity .3s,transform .3s;}" +
        ".chatbot-widget-frame.hidden{opacity:0;transform:translateY(20px);pointer-events:none;}" +
        "@media(max-width:480px){.chatbot-widget-frame{width:100vw;height:100vh;border-radius:0;top:0!important;left:0!important;right:0!important;bottom:0!important;}}";
      document.head.appendChild(style);

      // Position
      var isRight = position.indexOf("right") !== -1;
      var isTop = position.indexOf("top") !== -1;

      // Create button
      var btn = document.createElement("button");
      btn.className = "chatbot-widget-btn";
      btn.style.backgroundColor = color;
      btn.style[isRight ? "right" : "left"] = "20px";
      btn.style[isTop ? "top" : "bottom"] = "20px";
      btn.innerHTML =
        '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';
      btn.setAttribute("aria-label", "Open chat");

      // Create iframe
      var iframe = document.createElement("iframe");
      iframe.className = "chatbot-widget-frame hidden";
      iframe.src = baseUrl + "/chatbot/" + chatbotId;
      iframe.style[isRight ? "right" : "left"] = "20px";
      iframe.style[isTop ? "top" : "bottom"] = "86px";
      iframe.setAttribute("title", "Chat Widget");

      var isOpen = false;

      btn.addEventListener("click", function () {
        isOpen = !isOpen;
        if (isOpen) {
          iframe.classList.remove("hidden");
          btn.innerHTML =
            '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
        } else {
          iframe.classList.add("hidden");
          btn.innerHTML =
            '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';
        }
      });

      document.body.appendChild(iframe);
      document.body.appendChild(btn);
    },
  };

  window.ChatbotWidget = ChatbotWidget;
})();
