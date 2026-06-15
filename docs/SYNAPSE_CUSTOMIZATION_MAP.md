# Synapse Customization Map

> **Purpose:** Every user-visible and deployment-facing location that should be updated to rebrand LibreChat as **Synapse**.  
> **Priority:** Prefer env/YAML/assets changes before code edits. Change hardcoded fallbacks only where env-driven values are unavailable at build time.

---

## Branding

| File path | Purpose | Recommended modification |
|-----------|---------|-------------------------|
| `.env` → `APP_TITLE` | Primary product name; drives API config, emails, and most runtime titles | Set `APP_TITLE=Synapse` |
| `.env` → `CUSTOM_FOOTER` | Markdown footer on chat screen (post-login config) | Set e.g. `[Synapse](https://synapse.example.com) — Your AI workspace` |
| `.env` → `HELP_AND_FAQ_URL` | Help & FAQ link in account menu | Point to Synapse docs URL |
| `.env` → `EMAIL_FROM_NAME` | Display name on outbound email | Set `Synapse` (falls back to `APP_TITLE`) |
| `.env` → `EMAIL_FROM` | Sender address | Use Synapse domain, e.g. `noreply@synapse.example.com` |
| `librechat.yaml` → `interface.customWelcome` | Hero text on new-chat landing | e.g. `Welcome to Synapse!` (supports `{{user.name}}`) |
| `librechat.yaml` → `interface.termsOfService` | Terms URL, modal title, and modal body | Replace LibreChat legal copy with Synapse terms; set `modalTitle` |
| `librechat.yaml` → `interface.privacyPolicy` | Privacy policy link on auth/chat footers | Synapse privacy URL |
| `client/src/locales/en/translation.json` | English UI strings | Update keys that mention LibreChat (see below); adjust tagline keys like `com_ui_latest_footer` |
| `client/src/locales/en/translation.json` → `com_agents_mcp_trust_subtext` | MCP trust disclaimer | e.g. `"Custom connectors are not verified by Synapse"` |
| `client/src/locales/en/translation.json` → `com_ui_admin_access_warning` | Admin UI warning referencing `librechat.yaml` | Reword to reference Synapse config path if you rename the file |
| `client/src/locales/en/translation.json` → `com_ui_latest_footer` | Default footer tagline when `CUSTOM_FOOTER` unset | e.g. `"AI that works for you."` |
| `client/src/locales/en/translation.json` → `com_ui_happy_birthday` | LibreChat birthday easter egg tooltip | Disable via env or rewrite copy for Synapse |
| `client/src/components/Chat/Footer.tsx` | Default footer when `customFooter` is not set | Change hardcoded `[LibreChat …](https://librechat.ai)` fallback to Synapse name/URL, or rely solely on `CUSTOM_FOOTER` |
| `client/src/components/Nav/SettingsTabs/About/About.tsx` | Diagnostics blob copied for support | Change `LibreChat version:` label to `Synapse version:` in `buildDiagnosticsBlob()` |
| `client/src/components/Agents/Marketplace.tsx` | Hardcoded browser title suffix | Change `\| LibreChat` to `\| Synapse` or use `startupConfig.appTitle` |
| `packages/api/src/endpoints/openai/config.ts` | OpenRouter/Vercel HTTP headers (`X-Title`, referer) | Set `'X-Title': 'Synapse'`, `'X-OpenRouter-Title': 'Synapse'`, update `HTTP-Referer` to Synapse site |
| `packages/api/src/mcp/oauth/handler.ts` | OAuth dynamic client registration name | Change `client_name: 'LibreChat MCP Client'` → `'Synapse MCP Client'` |
| `api/server/utils/emails/*.handlebars` | Transactional email HTML (verify, reset, invite) | Uses `{{appName}}` from `APP_TITLE` — no template edit needed if env is set; optionally update button color `#10a37f` to Synapse brand color |
| `api/server/routes/config.js` | Serves `appTitle`, `customFooter`, `helpAndFaqURL` to client | Change default fallbacks `'LibreChat'` / `https://librechat.ai` to Synapse values (or keep env-only) |
| `api/server/services/AuthService.js` | Email `appName` in auth flows | Defaults to `APP_TITLE`; optional: change `\|\| 'LibreChat'` fallbacks to `'Synapse'` |
| `api/server/utils/sendEmail.js` | From-name resolution | Ensure `EMAIL_FROM_NAME` or `APP_TITLE` is Synapse |
| `api/server/controllers/TwoFactorController.js` | 2FA issuer label | Uses `APP_TITLE`; optional fallback `'Synapse'` |
| `config/invite-user.js` | CLI invite email app name | Set `APP_TITLE=Synapse` in env |
| `client/index.html` → `<meta name="description">` | SEO / link preview description | Replace LibreChat marketing copy with Synapse description |
| `client/vite.config.ts` → PWA `manifest.name` / `short_name` | Installable app label | Set both to `Synapse` |
| `package.json` (root) | npm package name & homepage | Optional: rename display metadata; not user-visible in app |
| `client/package.json` | Frontend package metadata | Optional metadata only |
| Non-English locale files (`client/src/locales/*/translation.json`) | Translated strings mentioning LibreChat | Update `com_agents_mcp_trust_subtext` per locale, or rely on automated i18n pipeline |

---

## Logos

| File path | Purpose | Recommended modification |
|-----------|---------|-------------------------|
| `client/public/assets/logo.svg` | Primary logo on login, register, password-reset screens | Replace with Synapse SVG (preserve similar aspect ratio for `AuthLayout` container) |
| `client/src/components/Auth/AuthLayout.tsx` | Renders logo via `<img src="assets/logo.svg">` | After replacing asset, update `alt` if needed; uses `appTitle` via `com_ui_logo` |
| `client/src/locales/en/translation.json` → `com_ui_logo` | Accessible logo alt text pattern | Keep `"{{0}} Logo"` — `{{0}}` comes from `appTitle` |
| `images/` (repo root, gitignored) | Runtime user/agent avatars served at `/images/...` | Not Synapse brand logo; mount volume in Docker for uploaded avatars |
| `.env` → `OPENID_IMAGE_URL` | Custom icon on OpenID login button | Host Synapse or IdP logo URL |
| `.env` → `SAML_IMAGE_URL` | Custom icon on SAML login button | Same as OpenID |
| `client/src/components/Auth/Login.tsx` | Renders `openidImageUrl` on social login | No change if env URL points to Synapse/IdP asset |
| `packages/client/src/svgs/CustomMinimalIcon.tsx` | Generic bot icon for custom endpoints | Replace paths with Synapse mark if used as default endpoint icon |
| `packages/client/src/svgs/*.tsx` | Provider icons (OpenAI, Google, etc.) | Leave unless Synapse has custom endpoint branding |
| `docker-compose.yml` / `deploy-compose.yml` | Bind `./images` → `/app/client/public/images` | Use for dynamic images, not static logo (logo stays in `client/public/assets`) |

---

## PWA Icons

| File path | Purpose | Recommended modification |
|-----------|---------|-------------------------|
| `client/public/assets/favicon-16x16.png` | Browser tab favicon (16×16) | **Create/add** Synapse favicon PNG |
| `client/public/assets/favicon-32x32.png` | Browser tab favicon (32×32) | **Create/add** Synapse favicon PNG |
| `client/public/assets/apple-touch-icon-180x180.png` | iOS home-screen icon | **Create/add** 180×180 Synapse icon |
| `client/public/assets/icon-192x192.png` | PWA manifest icon (192×192) | **Create/add** Synapse icon |
| `client/public/assets/maskable-icon.png` | Maskable PWA icon (512×512 safe zone) | **Create/add** maskable Synapse icon with padding |
| `client/index.html` | `<link rel="icon">` and `apple-touch-icon` hrefs | Update paths only if filenames change |
| `client/vite.config.ts` → `workbox.globPatterns` | Precache patterns for icons | Ensure new PNG filenames match patterns (`assets/favicon*.png`, etc.) |
| `client/scripts/post-build.cjs` | Copies `public/assets` → `dist/assets` after Vite build | No change; verify Synapse PNGs exist before build |
| `client/dist/assets/` (build output) | Deployed static icons | Regenerate via `npm run build:client` after asset swap |

> **Note:** PNG PWA icons are referenced by the repo but may not be committed. Generate a full icon set from one Synapse master asset.

---

## Manifest

| File path | Purpose | Recommended modification |
|-----------|---------|-------------------------|
| `client/vite.config.ts` → `VitePWA({ manifest: { … } })` | Web app manifest source (name, colors, icons) | Set `name: 'Synapse'`, `short_name: 'Synapse'`, `theme_color`, `background_color`, update icon `src` entries if paths change |
| `client/vite.config.ts` → `display: 'standalone'` | Installed app window mode | Keep `standalone` for app-like UX |
| `client/dist/manifest.webmanifest` (generated) | Served PWA manifest | Rebuilt automatically from vite config |
| `api/server/utils/staticCache.js` | Cache headers for `.webmanifest` | No branding change; uses `no-cache` for manifest |
| `api/server/utils/fallback.js` | SPA routing; serves assets not index for static extensions | Ensures manifest is served as file, not HTML |

---

## Splash Screens

LibreChat does **not** ship iOS `apple-touch-startup-image` assets. Splash-like behavior comes from the HTML loading shell and PWA manifest colors.

| File path | Purpose | Recommended modification |
|-----------|---------|-------------------------|
| `client/index.html` → `#loading-container` inline script | Pre-React splash: full-viewport background while JS loads | Update light/dark background hex values (`#ffffff`, `#0d0d0d`) to Synapse brand neutrals |
| `client/index.html` → `<meta name="theme-color">` | Browser chrome color before hydration | Set Synapse primary/dark surface color (currently `#171717`) |
| `client/vite.config.ts` → `manifest.background_color` | PWA launch splash background (Android) | Set Synapse brand color (currently `#000000`) |
| `client/vite.config.ts` → `manifest.theme_color` | PWA status bar / task switcher tint | Set Synapse accent (currently `#009688`) |
| `client/src/style.css` → `--gray-850`, `--gray-900` | Dark theme surfaces matching loading screen | Align with splash background for seamless transition |
| Optional: `client/index.html` | Add `<link rel="apple-touch-startup-image" …>` | Add Synapse-branded startup images per iOS size if native splash is required |

---

## App Name

| File path | Purpose | Recommended modification |
|-----------|---------|-------------------------|
| `.env` → `APP_TITLE` | **Single source of truth** for runtime app name | `APP_TITLE=Synapse` |
| `api/server/routes/config.js` | Exposes `appTitle` on `GET /api/config` | Default fallback `'LibreChat'` → `'Synapse'` (optional if env always set) |
| `client/vite.config.ts` → `manifest.name` | Full PWA install name | `'Synapse'` |
| `client/vite.config.ts` → `manifest.short_name` | Home-screen label under icon | `'Synapse'` (≤12 chars ideal) |
| `package.json` → `"name"` | npm workspace name | Optional: `"Synapse"` for internal consistency |
| `packages/data-provider` → `Constants.VERSION` | Build-time version string (`__LIBRECHAT_VERSION__`) | Version label only; rename in About diagnostics separately |
| `MONGO_URI` database name | Default DB `LibreChat` in `.env.example` | Optional: `mongodb://…/Synapse` for new deployments |
| `helm/librechat/` chart names | Kubernetes deployment identifiers | Rename chart/release when deploying as Synapse |

---

## Browser Titles

| File path | Purpose | Recommended modification |
|-----------|---------|-------------------------|
| `client/index.html` → `<title>` | First-paint title before JS loads | `<title>Synapse</title>` |
| `client/src/hooks/Config/useAppStartup.ts` | Sets `document.title` and `localStorage` `APP_TITLE` on app load | Works automatically when `startupConfig.appTitle` is Synapse |
| `client/src/routes/Layouts/Startup.tsx` | Title on auth pages (login, register, reset) | Fallback `\|\| 'LibreChat'` → `'Synapse'`; prefer `APP_TITLE` |
| `client/src/hooks/useNewConvo.ts` | Resets title to app name on new conversation | Uses cached `APP_TITLE` from localStorage |
| `client/src/components/Conversations/Convo.tsx` | Sets title to conversation name while viewing | No Synapse change (dynamic titles) |
| `client/src/hooks/SSE/useEventHandlers.ts` | Updates title when conversation title streams in | No brand change |
| `client/src/data-provider/SSE/queries.ts` | Title update on SSE events | No brand change |
| `client/src/components/Chat/Messages/SearchButtons.tsx` | Title when navigating search results | No brand change |
| `client/src/hooks/useDocumentTitle.ts` | Hook wrapper for `document.title` | No change |
| `client/src/components/Share/ShareView.tsx` | Share page title: `{conversation} \| {appTitle}` | Works via `config.appTitle` when env set |
| `client/src/components/Agents/Marketplace.tsx` | Marketplace tab title | Replace hardcoded `\| LibreChat` with `\| ${appTitle}` or `\| Synapse` |
| `api/server/index.js` | Serves `index.html` (lang cookie injection only) | Does **not** inject title; client-side title wins after load |

---

## Theme Colors

| File path | Purpose | Recommended modification |
|-----------|---------|-------------------------|
| `client/src/style.css` | Global CSS variables (`--gray-*`, `--green-*`, surfaces, presentation) | Replace green accent scale and neutrals with Synapse palette |
| `client/tailwind.config.cjs` → `theme.extend.colors` | Tailwind color tokens (`gray`, `green`, etc.) | Mirror Synapse palette; keep key names for minimal diff |
| `client/index.html` → loading script | Pre-hydration background colors | Match Synapse light/dark base colors |
| `client/index.html` → `theme-color` meta | Mobile browser UI tint | Synapse primary dark color |
| `client/vite.config.ts` → `manifest.theme_color` | PWA UI tint | Synapse accent |
| `client/vite.config.ts` → `manifest.background_color` | PWA splash background | Synapse dark/light brand base |
| `packages/client/src/theme/context/ThemeProvider.tsx` | Light/dark/system theme + optional custom RGB | Optional: pass Synapse `themeRGB` for programmatic overrides |
| `packages/client/src/theme/atoms/themeAtoms.ts` | Persists custom theme colors in `localStorage` | Optional Synapse preset via admin config |
| `packages/client/src/theme/utils/applyTheme.ts` | Applies CSS variables from theme RGB | Used if custom theme colors are injected |
| `client/src/components/Nav/SettingsTabs/General/General.tsx` → `ThemeSelector` | User theme picker (light/dark/system) | No rename needed; colors come from CSS |
| `packages/client/src/components/ThemeSelector.tsx` | Auth-page theme toggle | Same as above |
| `client/src/components/Auth/AuthLayout.tsx` | Auth page `bg-white dark:bg-gray-900` | Update Tailwind classes if gray scale changes |
| `api/server/utils/emails/*.handlebars` | Email CTA button `#10a37f` | Replace with Synapse primary hex |
| `librechat.example.yaml` | No built-in theme block | Add custom CSS injection only if you introduce a Synapse theme plugin |

---

## Login Page

| File path | Purpose | Recommended modification |
|-----------|---------|-------------------------|
| `client/src/routes/Layouts/Startup.tsx` | Wraps auth routes; sets title; provides startup config context | Ensure `APP_TITLE` loaded; map headers in `headerMap` if copy changes |
| `client/src/routes/Layouts/Login.tsx` | Login-specific wrapper reusing `StartupLayout` | No change unless login flow diverges |
| `client/src/components/Auth/AuthLayout.tsx` | Login shell: logo, theme toggle, footer, banner slot | Swap logo asset; verify dark/light backgrounds |
| `client/src/components/Auth/Login.tsx` | Login form + OpenID auto-redirect | Update social button labels via env (`OPENID_BUTTON_LABEL`) |
| `client/src/components/Auth/LoginForm.tsx` | Email/password fields | Localize strings in `en/translation.json` if needed |
| `client/src/components/Auth/Registration.tsx` | Register form | Same |
| `client/src/components/Auth/RequestPasswordReset.tsx` | Forgot password | Same |
| `client/src/components/Auth/ResetPassword.tsx` | Password reset | Same |
| `client/src/components/Auth/TwoFactorScreen.tsx` | 2FA verification | Same |
| `client/src/components/Auth/VerifyEmail.tsx` | Email verification landing | Same |
| `client/src/components/Auth/SocialLoginRender.tsx` | Renders OAuth provider buttons | Configure providers in `.env` |
| `client/src/components/Auth/SocialButton.tsx` | Individual social login button styling | Optional Synapse button styling |
| `client/src/components/Auth/Footer.tsx` | Privacy/terms links on auth pages | Driven by `librechat.yaml` interface config |
| `client/src/components/Auth/Footer.tsx` + `AuthLayout` | Layout spacing, `w-authPageWidth` | Adjust width in `tailwind.config.cjs` if needed |
| `client/src/components/Banners/Banner.tsx` | Admin-configurable banner on auth + app | Set Synapse announcement via `config/update-banner.js` |
| `client/src/routes/index.tsx` | Route table for `/login`, `/register`, etc. | No change for rebrand |
| `client/src/hooks/AuthContext.tsx` | Login/logout state | No visual change |
| `api/server/routes/auth.js` | Login/register API | No visual change |
| `.env` → `ALLOW_*`, `OPENID_AUTO_REDIRECT` | Which login methods appear | Configure for Synapse auth policy |

---

## Navigation

| File path | Purpose | Recommended modification |
|-----------|---------|-------------------------|
| `client/src/components/UnifiedSidebar/UnifiedSidebar.tsx` | Main sidebar: conversations, resize, mobile overlay | Optional Synapse accent on active nav items via CSS |
| `client/src/components/UnifiedSidebar/Sidebar.tsx` | Collapsed icon strip | Same |
| `client/src/components/UnifiedSidebar/ExpandedPanel.tsx` | Expanded nav panel | Same |
| `client/src/components/UnifiedSidebar/ConversationsSection.tsx` | Conversation list in sidebar | Same |
| `client/src/hooks/Nav/useUnifiedSidebarLinks.ts` | Sidebar link definitions (agents, prompts, skills, etc.) | Hide/relabel features via `librechat.yaml` `interface` permissions |
| `client/src/components/Chat/Header.tsx` | Top bar: model selector, mobile menu button | Mobile `OpenSidebar` entry point |
| `client/src/components/Chat/Menus/OpenSidebar.tsx` | Hamburger control for mobile sidebar | No text branding |
| `client/src/components/Nav/AccountSettings.tsx` | User menu: settings, files, help, logout | Point Help to Synapse via `HELP_AND_FAQ_URL` |
| `client/src/components/Nav/Settings.tsx` | Settings dialog shell | Tab labels from i18n |
| `client/src/components/Nav/NavToggle.tsx` | Sidebar collapse control | — |
| `client/src/components/Nav/AgentMarketplaceButton.tsx` | Agents marketplace nav entry | Label via `com_agents_marketplace` |
| `client/src/components/Nav/SearchBar.tsx` | Conversation search | — |
| `client/src/routes/Root.tsx` | App shell: sidebar + outlet + terms modal | Terms content from YAML |
| `client/src/components/ui/TermsAndConditionsModal.tsx` | Terms acceptance modal | Title/body from `librechat.yaml` |
| `client/src/components/Chat/Landing.tsx` | Empty-state welcome on new chat | `interface.customWelcome` for Synapse greeting |

---

## Mobile UX

| File path | Purpose | Recommended modification |
|-----------|---------|-------------------------|
| `client/index.html` → `viewport` meta | Mobile layout + keyboard (`interactive-widget=resizes-content`) | Keep; verify Synapse layouts on iOS/Android |
| `client/index.html` → `apple-mobile-web-app-*` meta | iOS standalone web app behavior | Keep; pair with Synapse icons |
| `packages/client/src/hooks/useMediaQuery.tsx` | Shared breakpoint detection | Adjust breakpoints only if Synapse design requires |
| `client/src/components/Chat/Header.tsx` | Shows `OpenSidebar` at `max-width: 768px` | Verify touch targets meet Synapse design |
| `client/src/components/UnifiedSidebar/UnifiedSidebar.tsx` | Full-screen overlay sidebar on mobile | Test Synapse colors on overlay backdrop |
| `client/src/components/SidePanel/SidePanelGroup.tsx` | Artifacts panel mobile behavior (`767px`) | — |
| `client/src/components/Nav/Settings.tsx` | Full-screen settings on `max-width: 767px` | Optional mobile-specific settings layout |
| `client/src/components/Share/ShareView.tsx` | Shared chat mobile layout | — |
| `client/src/components/Projects/ProjectsView.tsx` | Projects + mobile sidebar button | — |
| `client/src/components/Agents/Marketplace.tsx` | Marketplace responsive layout | — |
| `client/src/components/Prompts/forms/PromptForm.tsx` | Prompt editor mobile toolbar | — |
| `client/src/components/Prompts/forms/CreatePromptForm.tsx` | Create prompt mobile layout | — |
| `client/src/components/Conversations/Conversations.tsx` | Taller convo rows on mobile (`44px` vs `34px`) | — |
| `client/src/hooks/useVirtualGrid.ts` | Grid columns switch at `mobileBreakpoint` | — |
| `packages/client/src/components/DataTable/DataTable*.tsx` | Table column `mobileSize` | — |
| `client/src/hooks/useWakeLock.ts` | Screen Wake Lock API during generation | — |
| `client/src/components/System/WakeLockManager.tsx` | Wires wake lock to submit state | Enable for long mobile sessions |
| `client/src/components/Nav/SettingsTabs/General/General.tsx` → `keepScreenAwake` | User setting for wake lock | — |
| `client/vite.config.ts` → PWA | Installable mobile home-screen app | Complete after icon + manifest rebrand |

---

## Settings Pages

| File path | Purpose | Recommended modification |
|-----------|---------|-------------------------|
| `client/src/components/Nav/Settings.tsx` | Settings modal with tab navigation | — |
| `client/src/components/Nav/SettingsTabs/General/General.tsx` | Theme, language, archived chats, toggles | Theme colors via global CSS; language via i18n |
| `client/src/components/Nav/SettingsTabs/Chat/Chat.tsx` | Chat behavior settings | — |
| `client/src/components/Nav/SettingsTabs/Commands/Commands.tsx` | Slash command settings | — |
| `client/src/components/Nav/SettingsTabs/Speech/Speech.tsx` | STT/TTS settings | — |
| `client/src/components/Nav/SettingsTabs/Personalization.tsx` | Memory / personalization | — |
| `client/src/components/Nav/SettingsTabs/Data/Data.tsx` | Import/export, shared links, cache | — |
| `client/src/components/Nav/SettingsTabs/Balance/Balance.tsx` | Token credits (if enabled) | — |
| `client/src/components/Nav/SettingsTabs/Account/Account.tsx` | Profile, 2FA, delete account | — |
| `client/src/components/Nav/SettingsTabs/About/About.tsx` | Version, commit, diagnostics | Rename `LibreChat version` string; hide via `librechat.yaml` → `interface.buildInfo: false` if desired |
| `librechat.yaml` → `interface.buildInfo` | Toggle About tab visibility | Set `false` to hide upstream build info |
| `client/src/locales/en/translation.json` → `com_nav_setting_about` | About tab label | Rename to `"About Synapse"` if desired |
| `client/src/locales/en/translation.json` → `com_nav_help_faq` | Help menu item label | e.g. `"Synapse Help"` |
| `client/src/components/Nav/AccountSettings.tsx` | Opens settings; Help & FAQ link | Set `HELP_AND_FAQ_URL` |
| `client/src/components/Nav/SettingsTabs/Account/Avatar.tsx` | User avatar upload | — |
| `client/src/components/SidePanel/Memories/` | Memory panel (related to personalization) | Copy in i18n if Synapse-specific memory UX |

---

## Recommended Rebrand Sequence

1. **Environment:** `APP_TITLE`, `CUSTOM_FOOTER`, `HELP_AND_FAQ_URL`, email vars  
2. **Assets:** `logo.svg` + full PWA PNG set  
3. **Build-time UI shell:** `index.html`, `vite.config.ts` manifest/colors  
4. **Config:** `librechat.yaml` welcome, terms, privacy  
5. **Copy:** `client/src/locales/en/translation.json`  
6. **Hardcoded fallbacks:** `Chat/Footer.tsx`, `Marketplace.tsx`, `About.tsx`, OpenRouter headers, MCP client name  
7. **Verify:** login, installed PWA, mobile sidebar, settings About, share links, transactional email  

---

## Related Docs

- [SYNAPSE_REPOSITORY_ANALYSIS.md](./SYNAPSE_REPOSITORY_ANALYSIS.md) — architecture and stack overview  
- [LibreChat dotenv docs](https://www.librechat.ai/docs/configuration/dotenv)  
- [LibreChat YAML interface docs](https://www.librechat.ai/docs/configuration/librechat_yaml)
