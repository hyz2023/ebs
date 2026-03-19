import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: '今日', end: true },
  { to: '/calendar', label: '日历' },
  { to: '/assets', label: '资产' },
  { to: '/ledger', label: '流水' },
];

export function BottomNav() {
  return (
    <nav aria-label="主导航" className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.label}
          className={({ isActive }) =>
            `bottom-nav__link${isActive ? ' bottom-nav__link--active' : ''}`
          }
          end={item.end}
          to={item.to}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
