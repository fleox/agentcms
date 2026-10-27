// Runtime stub for "@agent-cms/runtime" — the public API external
// plugins and themes use to register filters, actions, blocks, dashboard
// cards AND to call admin services (publish-target files, data CRUD,
// publishing, slug helpers, markdown utilities, …).
//
// External bundles install @agent-cms/runtime as a dev dependency
// for type definitions and externalize it at build time. The import-map
// in /admin/index.html redirects each `import` here. We read the live
// admin instances off window.__AGENTCMS_RUNTIME__ (populated by
// src/core/cmsRuntime.ts on admin boot) and re-export them so the
// bundle gets the same module instances the admin itself uses —
// required for Firebase / i18next / React state to be coherent.
const R = (typeof window !== "undefined" && window.__AGENTCMS_RUNTIME__)
  ? window.__AGENTCMS_RUNTIME__
  : null;

if (!R) {
  throw new Error(
    "[agentcms] window.__AGENTCMS_RUNTIME__ is not initialised when @agent-cms/runtime was imported.",
  );
}

// API versioning
export const CMS_API_VERSION = R.apiVersion;
export const CMS_API_MIN_VERSION = R.minApiVersion;

// CMS plugin API + registries
export const pluginApi = R.pluginApi;
export const applyFilters = R.applyFilters;
export const applyFiltersSync = R.applyFiltersSync;
export const doAction = R.doAction;
export const registerBlock = R.registerBlock;
export const registerDashboardCard = R.registerDashboardCard;
export const registerInspectorTab = R.registerInspectorTab;
export const registerTermEditorSection = R.registerTermEditorSection;
export const registerEditorVariantProvider = R.registerEditorVariantProvider;
export const registerExternalPlugin = R.registerExternalPlugin;
export const registerExternalTheme = R.registerExternalTheme;

// core/slug
export const slugify = R.slugify;
export const isValidSlug = R.isValidSlug;
export const findAvailableSlug = R.findAvailableSlug;
export const buildPostUrl = R.buildPostUrl;
export const buildTermUrl = R.buildTermUrl;
export const pathToPublicUrl = R.pathToPublicUrl;
export const canonicalPath = R.canonicalPath;
export const canonicalUrl = R.canonicalUrl;
export const detectPathCollision = R.detectPathCollision;
export const detectTermSlugCollision = R.detectTermSlugCollision;
export const normalizeMediaSlug = R.normalizeMediaSlug;
export const basePathFromBaseUrl = R.basePathFromBaseUrl;
export const withBasePath = R.withBasePath;
export const registerStorageConnector = R.registerStorageConnector;

// core/media
export const mediaToView = R.mediaToView;
export const pickFormat = R.pickFormat;
export const pickMediaUrl = R.pickMediaUrl;

// core/markdown
export const markdownToPlainText = R.markdownToPlainText;
export const renderMarkdown = R.renderMarkdown;

// core/socialIcons
export const SocialIcon = R.SocialIcon;
export const socialLabel = R.socialLabel;

// core/postSort
export const postSortMillis = R.postSortMillis;

// core/render
export const renderPageToHtml = R.renderPageToHtml;

// services/siteFiles — files on the active publish target
export const uploadFile = R.uploadFile;
export const deleteFile = R.deleteFile;
export const deleteFolder = R.deleteFolder;
export const renameFile = R.renameFile;
export const renameFolder = R.renameFolder;
export const createFolder = R.createFolder;
export const getFile = R.getFile;
export const listFiles = R.listFiles;
export const publicUrlFor = R.publicUrlFor;
export const fileToBase64 = R.fileToBase64;
export const getStorageCapabilities = R.getStorageCapabilities;
export const withStorageBatch = R.withStorageBatch;
export const StorageError = R.StorageError;

// services/posts — post Firestore CRUD
export const fetchAllPosts = R.fetchAllPosts;
export const createPost = R.createPost;
export const updatePost = R.updatePost;

// services/media — image upload pipeline
export const uploadMedia = R.uploadMedia;

// services/taxonomies — term CRUD
export const createTerm = R.createTerm;
export const updateTerm = R.updateTerm;
export const deleteTerm = R.deleteTerm;

// core/rss — shared RSS 2.0 feed builder
export const buildRssFeedXml = R.buildRssFeedXml;

// services/users — author resolution
export const buildAuthorLookup = R.buildAuthorLookup;

// services/publisher — page rendering / publishing
export const publishPost = R.publishPost;
export const buildPublishContext = R.buildPublishContext;
export const buildSiteContext = R.buildSiteContext;
export const renderHome = R.renderHome;

// services/menuPublisher — /menu.json upload
export const publishMenuJson = R.publishMenuJson;

// services/postsJsonPublisher + authorsJsonPublisher — sidebar data
export const publishPostsJson = R.publishPostsJson;
export const publishAuthorsJson = R.publishAuthorsJson;

// services/catalogPublisher — /data/products.json upload (storefront theme)
export const publishProductsJson = R.publishProductsJson;
export const deleteProductsJson = R.deleteProductsJson;

// services/settings — plugin/theme config storage
export const updatePluginConfig = R.updatePluginConfig;
export const updateThemeConfig = R.updateThemeConfig;

// lib/toast — global notification queue
export const toast = R.toast;

// lib/utils
export const sha256Hex = R.sha256Hex;
export const formatDateTime = R.formatDateTime;
export const cn = R.cn;

// React hooks — context access for plugin / theme settings pages
export const useCmsData = R.useCmsData;
export const useAuth = R.useAuth;

// i18n
export const i18n = R.i18n;
export const pickPublicLocale = R.pickPublicLocale;
export const setActiveLocale = R.setActiveLocale;

// UI components
export const EntityCombobox = R.EntityCombobox;

// Themes registry
export const getActiveTheme = R.getActiveTheme;

// Theme block authoring helpers
export const useAllPosts = R.useAllPosts;
export const getCurrentPublishContext = R.getCurrentPublishContext;
export const FontSelect = R.FontSelect;
export const MediaPicker = R.MediaPicker;

// Theme logo helpers
export const logoPath = R.logoPath;
export const uploadThemeLogo = R.uploadThemeLogo;
export const removeThemeLogo = R.removeThemeLogo;
