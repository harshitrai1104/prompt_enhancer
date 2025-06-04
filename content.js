// Add initialization logging
console.log('Prompt Analyzer: Content script loaded');

// Import the analysis module
let getAnalysis;
try {
  const module = await import(chrome.runtime.getURL('analysis.js'));
  getAnalysis = module.getAnalysis;
  console.log('Prompt Analyzer: Analysis module loaded successfully');
} catch (error) {
  console.error('Prompt Analyzer: Failed to load analysis module:', error);
}

class PromptAnalyzer {
  constructor() {
    console.log('Prompt Analyzer: Initializing...');
    this.init();
  }

  init() {
    console.log('Prompt Analyzer: Starting initialization...');
    this.createFloatingIcon();
    this.observeTextInputs();
    this.createAnalysisPanel();
    console.log('Prompt Analyzer: Initialization complete');
  }

  createFloatingIcon() {
    const icon = document.createElement('div');
    icon.id = 'prompt-analyzer-floating-icon';
    icon.innerHTML = `
      <div class="floating-icon-content">
        <span class="icon">🎯</span>
        <div class="tooltip">Analyze Prompt</div>
      </div>
    `;
    
    document.body.appendChild(icon);
    icon.style.display = 'none';

    icon.addEventListener('click', () => {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.dataset.promptAnalyzerAttached) {
        this.analyzeCurrentPrompt(activeElement);
      }
    });
  }

  observeTextInputs() {
    const selectors = [
      // ChatGPT specific selectors
      'div[contenteditable="true"]',
      'div[role="textbox"]',
      'div[data-id="root"]',
      'div[data-id="root"] div[contenteditable="true"]',
      'div[data-id="root"] div[role="textbox"]',
      'div[data-id="root"] div[data-message-author-role="user"]',
      'div[data-id="root"] div[data-message-author-role="assistant"]',
      'div[data-id="root"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="user"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="assistant"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="system"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="function"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="tool"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="error"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="warning"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="info"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="success"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="debug"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="trace"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="log"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="critical"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="fatal"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="unknown"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="other"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="default"] div[data-message-content]',
      'div[data-id="root"] div[data-message-author-role="custom"] div[data-message-content]',
      // General selectors
      'textarea[placeholder*="message"]',
      'textarea[data-id="root"]',
      'div[contenteditable="true"]',
      'textarea[placeholder*="Ask"]',
      'textarea[placeholder*="Type"]',
      'textarea[placeholder*="Send"]',
      'textarea[placeholder*="Chat"]'
    ];

    console.log('Prompt Analyzer: Starting to observe text inputs');
    console.log('Prompt Analyzer: Using selectors:', selectors);

    // Initial attachment
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      console.log(`Prompt Analyzer: Found ${elements.length} elements for selector: ${selector}`);
      elements.forEach(element => {
        this.attachAnalyzer(element);
      });
    });

    // Observer for dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            selectors.forEach(selector => {
              const elements = node.querySelectorAll ? node.querySelectorAll(selector) : [];
              if (elements.length > 0) {
                console.log(`Prompt Analyzer: Found ${elements.length} new elements for selector: ${selector}`);
              }
              elements.forEach(element => {
                if (!element.dataset.promptAnalyzerAttached) {
                  this.attachAnalyzer(element);
                }
              });
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    console.log('Prompt Analyzer: MutationObserver started');
  }

  attachAnalyzer(element) {
    if (element.dataset.promptAnalyzerAttached) {
      return;
    }

    console.log('Prompt Analyzer: Attaching to element:', element);
    element.dataset.promptAnalyzerAttached = 'true';
    
    element.addEventListener('input', (e) => {
      const text = this.getTextContent(e.target);
      console.log('Prompt Analyzer: Input event, text length:', text.length);
      if (text && text.length > 10) {
        this.showFloatingIcon(e.target);
      } else {
        this.hideFloatingIcon();
      }
    });

    element.addEventListener('focus', () => {
      const text = this.getTextContent(element);
      console.log('Prompt Analyzer: Focus event, text length:', text.length);
      if (text && text.length > 10) {
        this.showFloatingIcon(element);
      }
    });

    element.addEventListener('blur', () => {
      setTimeout(() => {
        const panel = document.getElementById('prompt-analyzer-panel');
        if (!panel || !panel.classList.contains('visible')) {
          this.hideFloatingIcon();
        }
      }, 2000);
    });
  }

  getTextContent(element) {
    // Handle different types of elements
    if (element.value !== undefined) {
      return element.value;
    }
    
    // For contenteditable divs
    if (element.isContentEditable) {
      return element.textContent;
    }
    
    // For ChatGPT message content
    if (element.dataset.messageContent) {
      return element.dataset.messageContent;
    }
    
    // For nested content
    const contentElement = element.querySelector('[data-message-content]');
    if (contentElement) {
      return contentElement.dataset.messageContent;
    }

    // Try to find the closest contenteditable parent
    let parent = element.parentElement;
    while (parent) {
      if (parent.isContentEditable) {
        return parent.textContent;
      }
      parent = parent.parentElement;
    }
    
    // Fallback to textContent
    return element.textContent;
  }

  async analyzeCurrentPrompt(element) {
    const prompt = this.getTextContent(element);
    if (!prompt || prompt.length < 10) return;

    try {
      this.showLoadingState();
      const analysis = await getAnalysis(prompt);
      this.displayAnalysis(analysis, element);
    } catch (error) {
      console.error('Analysis failed:', error);
      this.showError('Failed to analyze prompt. Please try again.');
    } finally {
      this.hideLoadingState();
    }
  }

  createAnalysisPanel() {
    const panel = document.createElement('div');
    panel.id = 'prompt-analyzer-panel';
    panel.innerHTML = `
      <div class="analyzer-header">
        <h3>Prompt Analysis</h3>
        <button id="close-analyzer">×</button>
      </div>
      <div class="analyzer-content">
        <div class="loading-spinner"></div>
        <div class="score-section">
          <div class="score-circle">
            <span id="score-text">0</span>
          </div>
          <p>Prompt Score</p>
        </div>
        <div class="analysis-sections">
          <div class="strengths-section">
            <h4>✓ Strengths</h4>
            <ul id="strengths-list"></ul>
          </div>
          <div class="issues-section">
            <h4>⚠ Issues</h4>
            <ul id="issues-list"></ul>
          </div>
          <div class="suggestions-section">
            <h4>💡 Suggestions</h4>
            <ul id="suggestions-list"></ul>
          </div>
          <div class="improved-prompt-section">
            <h4>✨ Improved Prompt</h4>
            <div id="improved-prompt"></div>
            <button id="copy-improved" class="copy-btn">Copy Improved Prompt</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);

    document.getElementById('close-analyzer').addEventListener('click', () => {
      this.hideAnalysis();
    });

    document.getElementById('copy-improved').addEventListener('click', () => {
      const improvedPrompt = document.getElementById('improved-prompt').textContent;
      navigator.clipboard.writeText(improvedPrompt).then(() => {
        const button = document.getElementById('copy-improved');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      });
    });
  }

  showLoadingState() {
    const panel = document.getElementById('prompt-analyzer-panel');
    if (panel) {
      panel.classList.add('loading');
    }
  }

  hideLoadingState() {
    const panel = document.getElementById('prompt-analyzer-panel');
    if (panel) {
      panel.classList.remove('loading');
    }
  }

  showError(message) {
    const panel = document.getElementById('prompt-analyzer-panel');
    if (panel) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      panel.querySelector('.analyzer-content').prepend(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    }
  }

  displayAnalysis(analysis, targetElement) {
    const panel = document.getElementById('prompt-analyzer-panel');
    if (!panel) return;

    // Update score
    document.getElementById('score-text').textContent = analysis.rating || 0;
    
    // Update score circle color
    const scoreCircle = document.querySelector('.score-circle');
    const score = analysis.rating || 0;
    scoreCircle.className = `score-circle ${this.getScoreClass(score)}`;

    // Update lists
    this.updateList('strengths-list', analysis.strengths || []);
    this.updateList('issues-list', analysis.issues || []);
    this.updateList('suggestions-list', analysis.suggestions || []);

    // Update improved prompt
    const improvedPrompt = document.getElementById('improved-prompt');
    improvedPrompt.textContent = analysis.improvedPrompt || '';

    this.showAnalysisPanel(targetElement);
  }

  getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  updateList(listId, items) {
    const list = document.getElementById(listId);
    if (!list) return;
    
    list.innerHTML = '';
    if (items.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'None identified';
      li.style.fontStyle = 'italic';
      list.appendChild(li);
    } else {
      items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
      });
    }
  }

  showAnalysisPanel(targetElement) {
    const panel = document.getElementById('prompt-analyzer-panel');
    if (!panel) return;

    // Position panel relative to target element
    const rect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate optimal position
    let left = rect.right + 10;
    let top = rect.top;
    
    // Check if panel would go off-screen
    if (left + panel.offsetWidth > viewportWidth) {
      left = rect.left - panel.offsetWidth - 10;
    }
    if (top + panel.offsetHeight > viewportHeight) {
      top = viewportHeight - panel.offsetHeight - 10;
    }
    
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.classList.add('visible');
  }

  hideAnalysis() {
    const panel = document.getElementById('prompt-analyzer-panel');
    if (panel) {
      panel.classList.remove('visible');
    }
    this.hideFloatingIcon();
  }

  showFloatingIcon(targetElement) {
    const icon = document.getElementById('prompt-analyzer-floating-icon');
    if (!icon) {
      console.log('Prompt Analyzer: Floating icon not found');
      return;
    }

    console.log('Prompt Analyzer: Showing floating icon for element:', targetElement);
    const rect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    // Calculate position
    let left = rect.right + 10;
    if (left + icon.offsetWidth > viewportWidth) {
      left = rect.left - icon.offsetWidth - 10;
    }
    
    icon.style.display = 'block';
    icon.style.top = `${rect.top + window.scrollY - 10}px`;
    icon.style.left = `${left + window.scrollX}px`;
    
    icon.classList.add('pulse');
    setTimeout(() => {
      icon.classList.remove('pulse');
    }, 1000);
  }

  hideFloatingIcon() {
    const icon = document.getElementById('prompt-analyzer-floating-icon');
    if (icon) {
      icon.style.display = 'none';
    }
  }
}

// Initialize when page loads
console.log('Prompt Analyzer: Setting up initialization...');
if (document.readyState === 'loading') {
  console.log('Prompt Analyzer: Document still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Prompt Analyzer: DOMContentLoaded fired, creating instance...');
    new PromptAnalyzer();
  });
} else {
  console.log('Prompt Analyzer: Document already loaded, creating instance...');
  new PromptAnalyzer();
}
