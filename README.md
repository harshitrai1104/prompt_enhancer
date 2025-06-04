
# Prompt Analyzer Chrome Extension

A Chrome extension that analyzes AI chat prompts in real-time and provides suggestions for improvement, similar to how Grammarly works for grammar.

## Features

- **Real-time Analysis**: Analyzes prompts as you type in AI chat interfaces
- **Scoring System**: Provides a score from 0-100 based on prompt quality
- **Smart Suggestions**: Offers specific recommendations to improve your prompts
- **Multi-platform Support**: Works with ChatGPT, Claude, Bard, and other AI platforms
- **Non-intrusive**: Appears as a side panel that you can show/hide

## Installation

1. Download or clone this project
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension will now be active

## How It Works

The extension analyzes your prompts based on several criteria:

### Scoring Criteria

- **Length**: Optimal length (20-500 characters)
- **Clarity**: Clear questions and instructions
- **Specificity**: Avoids vague language
- **Context**: Provides background information
- **Tone**: Polite and professional language

### Analysis Features

- **Strengths**: Shows what's working well in your prompt
- **Issues**: Identifies potential problems
- **Suggestions**: Provides actionable improvements

## Supported Platforms

- ChatGPT (chat.openai.com, chatgpt.com)
- Claude (claude.ai)
- Google Bard (bard.google.com)
- And other AI chat platforms with similar interfaces

## Usage

1. Visit any supported AI chat platform
2. Start typing in the chat input field
3. The analyzer panel will appear on the right side
4. Review the score, strengths, issues, and suggestions
5. Modify your prompt based on the recommendations

## Privacy

This extension:
- Only analyzes text locally in your browser
- Does not send any data to external servers
- Does not store or track your prompts
- Only activates on AI chat platforms

## Development

To modify or enhance the extension:

1. Edit the relevant files:
   - `content.js`: Main analysis logic
   - `styles.css`: Visual styling
   - `manifest.json`: Extension configuration
   - `popup.html`: Extension popup interface

2. Reload the extension in Chrome's extensions page to see changes

## License

MIT License - feel free to modify and distribute as needed.
