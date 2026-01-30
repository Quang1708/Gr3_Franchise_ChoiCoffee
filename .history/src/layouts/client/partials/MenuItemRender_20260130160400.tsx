interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
children?: MenuItem[];
}

const MenuItemRender = (item) => {
  return (
    <div>MenuItemRender</div>
  )
}

MenuItemRender.propTypes = {}

export default MenuItemRender