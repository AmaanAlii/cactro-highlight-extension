import { useEffect, useState } from "react";

function Popup() {
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    const fetchHighlights = () => {
      chrome.storage.local.get(["highlights"], (result) => {
        if (result.highlights) setHighlights(result.highlights);
        else setHighlights([]);
      });
    };
  
    fetchHighlights();
  
    const handleMessage = (message, sender, sendResponse) => {
      if (message.type === "HIGHLIGHT_ADDED") {
        console.log("[Popup] Received HIGHLIGHT_ADDED event");
        fetchHighlights();
      }
    };
  
    chrome.runtime.onMessage.addListener(handleMessage);
  
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);
  

  const saveHighlight = (text) => {
    chrome.storage.local.get(["highlights"], (result) => {
      const highlights = result.highlights || [];
      highlights.push({ text, date: new Date().toISOString() });
      chrome.storage.local.set({ highlights }, () => {
        setHighlights(highlights);
      });
    });
  };

  const handleSaveHighlight = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: "GET_SELECTION" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          return;
        }
        if (response?.selection) {
          console.log("Selected Text:", response.selection);
          saveHighlight(response.selection);
        }
      });
    });
  };

  const deleteHighlight = (index) => {
    const updated = [...highlights];
    updated.splice(index, 1);
    setHighlights(updated);
    chrome.storage.local.set({ highlights: updated });
  };

  return (
    <div className="p-4 w-80 h-96 overflow-y-auto">
      <h1 className="text-lg font-bold mb-4">Saved Highlights</h1>
      <button 
        onClick={handleSaveHighlight}
        className="bg-indigo-500 text-white px-3 py-1 mb-4 rounded hover:bg-indigo-600 text-sm"
      >
        📋 Save Selected Text
      </button>

      {highlights.length === 0 ? (
        <p>No highlights saved yet!</p>
      ) : (
        highlights.map((h, i) => (
          <div key={i} className="bg-indigo-500 p-2 mb-2 rounded">
            <p className="text-sm">{h.text}</p>
            <button
              onClick={() => deleteHighlight(i)}
              className="text-red-500 text-xs mt-2 border-2 border-transparent hover:border-red-500"
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Popup;
