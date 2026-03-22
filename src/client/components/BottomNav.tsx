import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: '首页', end: true },
  { to: '/assets', label: '资产', center: true },
  { to: '/ledger', label: '流水' },
  { to: '/rules', label: '规则' },
];

export function BottomNav() {
  return (
    <nav aria-label="主导航" className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.label}
          className={({ isActive }) =>
            `bottom-nav__link${isActive ? ' bottom-nav__link--active' : ''}${item.center ? ' bottom-nav__link--center' : ''}`
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
