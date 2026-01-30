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

  const itemIsActive = isActive(item.path);
  return (
    <a
      key={item.id}
      href={item.path}
      className="text-sm font-medium text-slate-600 dark:text-[#b8ad9d] hover:text-primary transition-colors relative py-2"
    >
      {item.label}
    </a>
  );
}

MenuItemRender.propTypes = {}

export default MenuItemRender