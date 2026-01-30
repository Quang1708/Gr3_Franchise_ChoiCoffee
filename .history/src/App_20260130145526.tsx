import { Suspense } from "react"
import { BrowserRouter, Routes } from "react-router-dom"
import ClientAuthRoutes from "./routes/client/ClientAuth.route"

function App() {

  return (
    <BrowserRouter>
      <Suspense fallback = {<div>Loading...</div>}>
        <Routes>
           {/* Admin */}

          {/* Client */}
           {ClientAuthRoutes}
            {ClientPublicRoutes}
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
