console.log('[MCP] click-to-edit.js script loaded and executing!');

let highlightedElement = null;

// Function to generate a unique CSS selector for an element
function getCssSelector(el) {
    if (!(el instanceof Element)) return;
    const path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();
        if (el.id) {
            selector += '#' + el.id;
            path.unshift(selector);
            break;
        } else {
            let sib = el, nth = 1;
            while (sib = sib.previousElementSibling) {
                if (sib.nodeName.toLowerCase() == selector)
                    nth++;
            }
            if (nth != 1)
                selector += `:nth-of-type(${nth})`;
        }
        path.unshift(selector);
        el = el.parentNode;
    }
    return path.join(' > ');
}

// Find the closest element with a data-mcp-id
function findMcpTarget(element) {
    return element.closest('[data-mcp-id]');
}

// Remove any existing chat box
function removeExistingChatBox() {
  const existingChatBox = document.getElementById('mcp-chat-box');
  if (existingChatBox) {
    existingChatBox.remove();
  }
}

// Create and show the chat box
function showChatBox(element) {
  console.log('[MCP] showChatBox called for element:', element);
  removeExistingChatBox();

  const chatBox = document.createElement('div');
  chatBox.id = 'mcp-chat-box';
  chatBox.innerHTML = `
    <div class="mcp-chat-box-header">Edit Element</div>
    <div class="mcp-chat-box-content">
      <textarea class="mcp-chat-box-input" placeholder="Describe the changes you want..."></textarea>
      <button class="mcp-chat-box-submit">Submit</button>
      <div class="mcp-element-details"></div>
    </div>
    <div class="mcp-chat-box-result" style="display: none;">
      <p>Copy the following and send it to your assistant:</p>
      <textarea class="mcp-result-textarea" readonly></textarea>
      <button class="mcp-copy-button">Copy to Clipboard</button>
      <button class="mcp-back-button">Back</button>
    </div>
  `;
  console.log('[MCP] Chat box element created.');

  document.body.appendChild(chatBox);
  console.log('[MCP] Chat box appended to body.');

  // Position the chat box
  const rect = element.getBoundingClientRect();
  console.log('[MCP] Element position:', rect);
  chatBox.style.top = `${window.scrollY + rect.bottom + 5}px`;
  chatBox.style.left = `${window.scrollX + rect.left}px`;
  console.log(`[MCP] Chat box position set to top: ${chatBox.style.top}, left: ${chatBox.style.left}`);

  // Add element details to chatbox
  const mcpTarget = findMcpTarget(element);
  const detailsContainer = chatBox.querySelector('.mcp-element-details');
  if (mcpTarget) {
      detailsContainer.textContent = `ID: ${mcpTarget.dataset.mcpId}`;
  } else {
      detailsContainer.textContent = `Selector: ${getCssSelector(element).substring(0, 50)}...`;
  }


  // Add submit logic
  chatBox.querySelector('.mcp-chat-box-submit').addEventListener('click', () => {
    console.log('[MCP] Submit button clicked.');
    const instructions = chatBox.querySelector('.mcp-chat-box-input').value;
    console.log(`[MCP] Instructions from textarea: "${instructions}"`);

    if (instructions) {
      const mcpTarget = findMcpTarget(element);
      const mcpId = mcpTarget ? mcpTarget.dataset.mcpId : null;

      const elementDetails = {
        mcpId: mcpId,
        selector: getCssSelector(element),
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        textContent: element.textContent.trim().substring(0, 100),
      };
      
      const messageForAssistant = `MCP Request:
- Element ID: ${mcpId || 'Not available'}
- CSS Selector: ${elementDetails.selector}
- Instructions: ${instructions}`;

      const resultTextarea = chatBox.querySelector('.mcp-result-textarea');
      resultTextarea.value = messageForAssistant;

      chatBox.querySelector('.mcp-chat-box-content').style.display = 'none';
      chatBox.querySelector('.mcp-chat-box-result').style.display = 'block';
    } else {
      console.log('[MCP] No instructions entered.');
    }
  });

  // Add copy logic
  chatBox.querySelector('.mcp-copy-button').addEventListener('click', () => {
    const resultTextarea = chatBox.querySelector('.mcp-result-textarea');
    resultTextarea.select();
    document.execCommand('copy');
    const copyButton = chatBox.querySelector('.mcp-copy-button');
    copyButton.textContent = 'Copied!';
    setTimeout(() => {
        copyButton.textContent = 'Copy to Clipboard';
    }, 2000);
  });

  // Add back logic
  chatBox.querySelector('.mcp-back-button').addEventListener('click', () => {
    chatBox.querySelector('.mcp-chat-box-content').style.display = 'block';
    chatBox.querySelector('.mcp-chat-box-result').style.display = 'none';
  });
}

// Inject CSS for the chat box and hover effect
function injectStyles() {
    try {
        const styleId = 'mcp-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .mcp-highlight {
                outline: 2px dashed #007bff !important;
                box-shadow: 0 0 10px rgba(0,123,255,0.5) !important;
                cursor: pointer !important;
            }
            #mcp-chat-box {
                position: absolute !important;
                z-index: 2147483647 !important; /* Max z-index */
                background-color: white !important;
                border: 1px solid #ccc !important;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                padding: 12px;
                width: 300px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                display: block !important;
                visibility: visible !important;
                transition: opacity 0.2s ease-in-out;
            }
            .mcp-result-textarea {
                width: 100%;
                height: 100px;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 5px;
                margin-bottom: 8px;
                box-sizing: border-box;
                font-size: 12px;
                background-color: #f9f9f9;
            }
            .mcp-copy-button, .mcp-back-button {
                width: calc(50% - 4px);
                padding: 8px;
                border: none;
                background-color: #007bff;
                color: white;
                border-radius: 4px;
                cursor: pointer;
                display: inline-block;
            }
            .mcp-back-button {
                background-color: #6c757d;
            }
            .mcp-copy-button:hover {
                background-color: #0056b3;
            }
            .mcp-back-button:hover {
                background-color: #5a6268;
            }
            .mcp-element-details {
                font-size: 10px;
                color: #666;
                margin-top: 8px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .mcp-chat-box-header {
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 16px;
                color: #111 !important;
            }
            .mcp-chat-box-input {
                width: 100%;
                height: 80px;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 5px;
                margin-bottom: 8px;
                box-sizing: border-box; /* Important */
            }
            .mcp-chat-box-submit {
                width: 100%;
                padding: 8px;
                border: none;
                background-color: #007bff;
                color: white;
                border-radius: 4px;
                cursor: pointer;
            }
            .mcp-chat-box-submit:hover {
                background-color: #0056b3;
            }
        `;
        document.head.appendChild(style);
        console.log('[MCP] Styles injected successfully.');
    } catch (error) {
        console.error('[MCP] Error injecting styles:', error);
    }
}

function handleMouseOver(event) {
    const target = event.target;
    if (target.closest('#mcp-chat-box')) return;
    
    if (highlightedElement) {
        highlightedElement.classList.remove('mcp-highlight');
    }
    highlightedElement = target;
    highlightedElement.classList.add('mcp-highlight');
}

function handleMouseOut(event) {
    if (highlightedElement) {
        highlightedElement.classList.remove('mcp-highlight');
        highlightedElement = null;
    }
}

try {
    document.addEventListener('click', (event) => {
        console.log('[MCP] Click event captured.');
        const rawTarget = event.target;

        if (rawTarget.closest('#mcp-chat-box')) return;

        event.preventDefault();
        event.stopPropagation();

        // Use the currently highlighted element if available, otherwise use the click target
        const finalElement = highlightedElement || rawTarget;
        
        if (highlightedElement) {
            highlightedElement.classList.remove('mcp-highlight');
        }

        console.log('[MCP] Attaching to significant element:', finalElement);
        showChatBox(finalElement);

    }, true);

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);

    console.log('[MCP] Event listeners (click, mouseover, mouseout) added successfully.');
} catch (error) {
    console.error('[MCP] Error adding event listeners:', error);
}

injectStyles();
