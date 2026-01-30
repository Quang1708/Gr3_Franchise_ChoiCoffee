import { Outlet } from "react-router-dom"
import ClientHeader from "./ClientHeader.layout"


const ClientLayout = () => {
  return (
    <div className = "min-h-screen">
        <ClientHeader />
        <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  )
}

export default ClientLayout