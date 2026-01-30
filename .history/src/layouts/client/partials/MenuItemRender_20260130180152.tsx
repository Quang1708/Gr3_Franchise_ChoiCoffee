import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

const MenuItemRender = (item) => {
  const navigate = useNavigate();
  const isActive = (path?: string) => {
    if (!path) return false;
  };

  const handleNavigation = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    const [pathOnly, search] = path.split('?');
    const currentPathMatches = location.pathname === pathOnly || location.pathname.startsWith(pathOnly + '/');

    if (search && currentPathMatches) {
      return location.search === `?${search}`;
    }

    return currentPathMatches;
  }

  const itemIsActive = isActive(item.path);
  return (
    <a
      key={item.id}
      onClick={() => handleNavigation(item.path)}
      className=`text-sm font-medium text-slate-600 dark:text-[#b8ad9d] hover:text-primary transition-colors relative py-2`
    >
      {item.label}
    </a>
  );
}

MenuItemRender.propTypes = {}

export default MenuItemRender