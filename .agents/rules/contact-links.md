# Contact & Email Guidelines for Portfolios

## Rule: Never Use 'mailto:' Scheme in Portfolio Templates or Buttons
1. **No OS Mail Client Prompts**: In portfolios and templates, never create links using the `mailto:` scheme (e.g. `<a href="mailto:...">` or `window.location.href = "mailto:..."`). This triggers the disruptive operating system prompt *"Select an app to open this 'mailto' link"*.
2. **Webmail First**:
   - For email links and "Get in touch" buttons, link directly to webmail providers using [getGmailComposeUrl](file:///c:/Users/Anushka%20Garg/OneDrive/Desktop/PortfolioAI/client/src/utils/contactUtils.js) (`https://mail.google.com/mail/?view=cm&fs=1&to=...`) with `target="_blank"` and `rel="noopener noreferrer"`.
   - Optionally offer Outlook Web compose (`https://outlook.live.com/mail/0/deeplink/compose?to=...`) or 1-click clipboard copy.
3. **Contact Modals & Overlays**:
   - Message forms must open webmail or copy the message to clipboard rather than executing `window.location.href = "mailto:..."`.
   - The global capture interceptor in [InteractivePortfolioOverlay.jsx](file:///c:/Users/Anushka%20Garg/OneDrive/Desktop/PortfolioAI/client/src/features/portfolio/components/interactive/InteractivePortfolioOverlay.jsx) automatically prevents any residual or dynamically injected `mailto:` links from opening the OS prompt.
