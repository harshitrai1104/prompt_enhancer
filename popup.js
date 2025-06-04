import { getAnalysis } from './analysis.js';

class PopupAnalyzer {
  constructor() {
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    // Get all required elements
    this.promptInput = document.getElementById('prompt-input');
    this.analyzeBtn = document.getElementById('analyze-btn');
    this.resultsDiv = document.getElementById('results');
    this.scoreCircle = document.getElementById('score-circle');
    this.scoreText = document.getElementById('score-text');
    this.strengthsList = document.getElementById('strengths-list');
    this.issuesList = document.getElementById('issues-list');
    this.suggestionsList = document.getElementById('suggestions-list');
    this.enhancedText = document.getElementById('enhanced-text');
    this.copyBtn = document.getElementById('copy-enhanced');

    // Verify all elements exist
    const requiredElements = {
      'prompt-input': this.promptInput,
      'analyze-btn': this.analyzeBtn,
      'results': this.resultsDiv,
      'score-circle': this.scoreCircle,
      'score-text': this.scoreText,
      'strengths-list': this.strengthsList,
      'issues-list': this.issuesList,
      'suggestions-list': this.suggestionsList,
      'enhanced-text': this.enhancedText,
      'copy-enhanced': this.copyBtn
    };

    const missingElements = Object.entries(requiredElements)
      .filter(([_, element]) => !element)
      .map(([id]) => id);

    if (missingElements.length > 0) {
      console.error('Missing required elements:', missingElements);
      throw new Error(`Required elements not found: ${missingElements.join(', ')}`);
    }
  }

  attachEventListeners() {
    if (this.analyzeBtn) {
      this.analyzeBtn.addEventListener('click', () => {
        this.analyzePrompt();
      });
    }

    if (this.promptInput) {
      this.promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
          this.analyzePrompt();
        }
      });

      this.promptInput.addEventListener('input', () => {
        const hasText = this.promptInput.value.trim().length > 0;
        if (this.analyzeBtn) {
          this.analyzeBtn.disabled = !hasText;
        }
      });
    }

    if (this.copyBtn) {
      this.copyBtn.addEventListener('click', () => {
        this.copyEnhancedPrompt();
      });
    }
  }

  async analyzePrompt() {
    const prompt = this.promptInput.value.trim();
    if (!prompt) return;

    try {
      this.analyzeBtn.disabled = true;
      this.analyzeBtn.textContent = 'Analyzing...';

      const analysis = await getAnalysis(prompt);
      this.displayResults(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      this.showError('Failed to analyze prompt. Please try again.');
    } finally {
      this.analyzeBtn.disabled = false;
      this.analyzeBtn.textContent = 'Analyze Prompt';
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    this.resultsDiv.innerHTML = '';
    this.resultsDiv.appendChild(errorDiv);
    this.resultsDiv.classList.remove('hidden');
  }

  displayResults(analysis) {
    // Show results section
    this.resultsDiv.classList.remove('hidden');

    // Update score
    this.scoreText.textContent = analysis.rating || 0;
    
    // Update score circle color
    const score = analysis.rating || 0;
    if (score >= 80) {
      this.scoreCircle.className = 'score-circle excellent';
    } else if (score >= 60) {
      this.scoreCircle.className = 'score-circle good';
    } else if (score >= 40) {
      this.scoreCircle.className = 'score-circle fair';
    } else {
      this.scoreCircle.className = 'score-circle poor';
    }

    // Update lists
    this.updateList(this.strengthsList, analysis.strengths || []);
    this.updateList(this.issuesList, analysis.issues || []);
    this.updateList(this.suggestionsList, analysis.suggestions || []);

    // Display enhanced prompt
    this.enhancedText.textContent = analysis.improvedPrompt || '';

    // Scroll to results
    this.resultsDiv.scrollIntoView({ behavior: 'smooth' });
  }

  updateList(listElement, items) {
    if (!listElement) return;
    
    listElement.innerHTML = '';
    if (items.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'None identified';
      li.style.fontStyle = 'italic';
      listElement.appendChild(li);
    } else {
      items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        listElement.appendChild(li);
      });
    }
  }

  copyEnhancedPrompt() {
    if (!this.enhancedText) return;
    
    const text = this.enhancedText.textContent;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = this.copyBtn.textContent;
      this.copyBtn.textContent = 'Copied!';
      this.copyBtn.style.background = '#10b981';
      
      setTimeout(() => {
        this.copyBtn.textContent = originalText;
        this.copyBtn.style.background = '#0ea5e9';
      }, 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      this.copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        this.copyBtn.textContent = 'Copy Enhanced Prompt';
      }, 2000);
    });
  }
}

// Initialize when popup loads
document.addEventListener('DOMContentLoaded', () => {
  try {
    new PopupAnalyzer();
  } catch (error) {
    console.error('Failed to initialize PopupAnalyzer:', error);
    // Show error message to user
    const container = document.querySelector('.popup-container');
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          Failed to initialize the analyzer. Please try reloading the extension.
        </div>
      `;
    }
  }
});
