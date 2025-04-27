let popup = null;

console.log("[ContentScript] Loaded successfully!");

document.addEventListener('mouseup', (e) => {
    console.log("[ContentScript] Mouseup event fired");

    const selectedText = window.getSelection().toString().trim();
    console.log("[ContentScript] Selected Text:", selectedText);

    if (selectedText.length > 0) {
        showPopup(e.pageX, e.pageY, selectedText);
    } else {
        removePopup();
    }
});

function showPopup(x, y, text) {
    console.log("[ContentScript] Showing popup at:", x, y);

    removePopup();

    popup = document.createElement('div');
    popup.innerText = '💾 Save Highlight?';
    popup.style.position = 'absolute';
    popup.style.top = `${y + 10}px`;
    popup.style.left = `${x + 10}px`;
    popup.style.background = '#6366f1';
    popup.style.color = 'white';
    popup.style.padding = '6px 12px';
    popup.style.borderRadius = '8px';
    popup.style.cursor = 'pointer';
    popup.style.zIndex = 999999;
    popup.style.fontSize = '14px';
    popup.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    popup.style.transition = 'opacity 0.3s ease';
    popup.style.opacity = '0';
    
    document.body.appendChild(popup);

    setTimeout(() => {
        if (popup) popup.style.opacity = '1';
    }, 10);

    popup.addEventListener('click', () => {
        console.log("[ContentScript] Popup clicked - Saving highlight.");
        saveHighlight(text);
        removePopup();
    });
}

function removePopup() {
    if (popup) {
        console.log("[ContentScript] Removing popup.");
        popup.remove();
        popup = null;
    }
}

function saveHighlight(text) {
    console.log("[ContentScript] Saving highlight to chrome.storage:", text);

    chrome.storage.local.get(["highlights"], (result) => {
        if (chrome.runtime.lastError) {
            console.error("[ContentScript] Error getting highlights:", chrome.runtime.lastError.message);
            return;
        }

        const highlights = result.highlights || [];
        highlights.push({ text, date: new Date().toISOString() });

        chrome.storage.local.set({ highlights }, () => {
            if (chrome.runtime.lastError) {
                console.error("[ContentScript] Error saving highlights:", chrome.runtime.lastError.message);
            } else {
                console.log("[ContentScript] Highlight saved successfully!");
                chrome.runtime.sendMessage({ type: "HIGHLIGHT_ADDED" });
            }
        });
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_SELECTION") {
    const selection = window.getSelection().toString();
    sendResponse({ selection });
  }
});
