# Metrics

Adds a **Content** card to the admin dashboard with the number of documents per collection (`posts`, `pages`, `terms`, `media`, `users`) and the total. On Firebase it runs `getCountFromServer()` aggregation queries and reminds the free-tier limits (50 K reads / 20 K writes per day, 1 GiB storage) in a footer note.

## Dashboard card hook

This plugin demonstrates the `pluginApi.registerDashboardCard()` hook. Any plugin (regular or must-use) can contribute additional cards:

```ts
api.registerDashboardCard({
  id: "<plugin-id>/<card>",
  priority: 50,        // lower runs first; default 100
  component: MyCard,   // takes no props
});
```

Cards render in a 3-column grid (1 col on mobile, 2 on `md`, 3 on `lg`) below the four built-in stat cards. Each card is responsible for its own loading / error / empty state — the registry passes no props.

## What this plugin does NOT do

- **Real Firestore billing metrics** (daily reads, writes, network egress) are exposed only through Firebase's Cloud Monitoring API, which requires service-account credentials. A browser-only client cannot fetch them safely. For real billing data, open the [Firebase Console → Usage](https://console.firebase.google.com/) directly.
- **Polling** — the card loads once on dashboard mount, with a manual refresh button. It is not a live monitor.

## Configuration

None.
