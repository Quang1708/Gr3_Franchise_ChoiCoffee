interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

const MenuItemRender = (item) => {
    const isActive = (path?: string) => {
        if (!path) return false;

    }
    const itemIsActive = isActive(item.path);
  return (
    <div>
        
    </div>
  )
}

MenuItemRender.propTypes = {}

export default MenuItemRender