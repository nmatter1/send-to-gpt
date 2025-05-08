chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "sendToChatGPT",
        title: "Send to ChatGPT",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "sendToChatGPT") {
        const selectedText = info.selectionText;

        if (tab.url.includes("chat.openai.com")) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: sendToChatGPTInput,
                args: [selectedText]
            });
        } else {
            chrome.tabs.create({
                url: "https://chat.openai.com/",
                active: true
            }, (newTab) => {

                chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                    if (tabId === newTab.id && info.status === "complete") {
                        chrome.tabs.onUpdated.removeListener(listener);
                        chrome.scripting.executeScript({
                            target: { tabId: newTab.id },
                            function: sendToChatGPTInput,
                            args: [selectedText]
                        });
                    }
                });
            });
        }
    }
});

function sendToChatGPTInput(text) {
    let textarea = document.querySelector('textarea.text-token-text-primary[placeholder="Ask anything"]');
    if (textarea) {
        textarea.focus();
        textarea.value = text;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
        alert('Could not find ChatGPT input box!');
    }
} 