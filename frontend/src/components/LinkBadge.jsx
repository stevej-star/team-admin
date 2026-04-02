const LINK_STYLES = {
  Jira: 'bg-blue-100 text-blue-700',
  Confluence: 'bg-teal-100 text-teal-700',
  Atlas: 'bg-purple-100 text-purple-700',
  Slack: 'bg-pink-100 text-pink-700',
};

const SLACK_TEAM_ID = 'E093G8A21F0';

/**
 * Convert a Slack https URL to a slack:// deep link so the Mac app opens directly.
 *   https://app.slack.com/client/T12345678/C12345678  → slack://channel?team=T12345678&id=C12345678
 *   https://workspace.slack.com/archives/C12345678    → slack://channel?team=SLACK_TEAM_ID&id=C12345678
 * Already-valid slack:// URLs are passed through unchanged.
 */
function toSlackDeepLink(url) {
  if (!url || url.startsWith('slack://')) return url;

  // app.slack.com/client/TEAM_ID/CHANNEL_ID
  const clientMatch = url.match(/app\.slack\.com\/client\/([A-Z0-9]+)\/([A-Z0-9]+)/);
  if (clientMatch) {
    return `slack://channel?team=${clientMatch[1]}&id=${clientMatch[2]}`;
  }

  // workspace.slack.com/archives/CHANNEL_ID — use hardcoded team ID
  const archivesMatch = url.match(/slack\.com\/archives\/([A-Z0-9]+)/);
  if (archivesMatch) {
    return `slack://channel?team=${SLACK_TEAM_ID}&id=${archivesMatch[1]}`;
  }

  return url;
}

export default function LinkBadge({ label, url }) {
  const style = LINK_STYLES[label] || 'bg-gray-100 text-gray-700';
  const href = label === 'Slack' ? toSlackDeepLink(url) : url;
  return (
    <a
      href={href}
      // Slack deep links shouldn't use _blank — the OS handles the protocol
      target={label === 'Slack' ? '_self' : '_blank'}
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium hover:opacity-80 transition-opacity ${style}`}
    >
      🔗 {label}
    </a>
  );
}

