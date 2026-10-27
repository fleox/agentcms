import type { ResolvedMenuItem } from "@agent-cms/runtime";

// Static rendering of a menu tree, as resolved at publish time
// (site.resolvedMenus). The runtime loader refreshes it from
// /data/menu.json after page load.
export function MenuList({ items }: { items: ResolvedMenuItem[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <a href={item.href}>{item.label}</a>
          {item.children && item.children.length > 0 && <MenuList items={item.children} />}
        </li>
      ))}
    </ul>
  );
}
