import { Suspense } from "react"
import { BrowserRouter, Routes } from "react-router-dom"
import ClientAuthRoutes from "./routes/client/ClientAuth.route"

function App() {

  return (
    <BrowserRouter>
      <Suspense>
        <Routes>
           {/* Admin */}
           {ClientAuthRoutes}
        </Routs>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
